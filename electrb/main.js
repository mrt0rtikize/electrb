const { app, BrowserWindow } = require('electron');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const fs = require('fs');
const { execSync } = require('child_process');


app.setPath('cache', path.join(os.tmpdir(), 'electrb-cache'));
app.setPath('userData', path.join(os.homedir(), '.cache/electrb'));


global.panels = {};
global.schedulers_results = {};
global.schedulers_states = {};

// function createWindow creates a new window with parameters from panelConfig
function createWindow(panelConfig) {
  global.panels[panelConfig.name] = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'panel/preload.js')
    },
    width: panelConfig.resolution.w, // window width
    height: panelConfig.resolution.h, // window height
    x: panelConfig.position.x, // x coordinate
    y: panelConfig.position.y, // y coordinate
    transparent: panelConfig.transparent, // determines whether the window is transparent or not
    type: 'desktop', // this may or may not create a floating window depending on the environment
    frame: false, // removes the window frame
    resizable: false, // prevents resizing
    skiptaskbar: true, // skips the window appearing in the taskbar
    focusable: false, // prevents the window from taking focus
    alwaysontop: true // keeps the window on top of others
  });

  // add index.html to the window - it is simple and empty html
  global.panels[panelConfig.name].loadFile('./panel/index.html');

  // for all windows with name endsWith '_debug' open devtools
  if (panelConfig.name.endsWith('_debug')) {
    global.panels[panelConfig.name].webContents.openDevTools();
  }

  // set window title
  global.panels[panelConfig.name].setTitle(panelConfig.name);

  global.panels[panelConfig.name].webContents.on('did-finish-load', () => {
    panelConfig.widgets.forEach(widget => {
      widget.path = `${os.homedir()}/.config/electrb/widgets/${widget.name}`;
    })
    global.panels[panelConfig.name].webContents.send('init_widgets', panelConfig.widgets);
  });

  if (!panelConfig.visible) {
    global.panels[panelConfig.name].hide();
  }
}

// function readConfig reads yaml file in $HOME/electrb/config.yaml and returns it as an object
function readConfig() {
  // TODO: add more config locations (like fallback config in /etc/electrb/config.yaml). If config in $HOME doesn't exist, copy config from /etc and load from $HOME
  // TODO: add error handling
  return yaml.load(fs.readFileSync(path.join(os.homedir(), '.config/electrb/config.yaml'), 'utf8'));
}

const config = readConfig();

// function createPanels goes through config.panels and calls createWindow for each panel
function createPanels() {
  config.panels.forEach((panel) => {
    createWindow(panel);
  });
}

// function startSchedulers creates and starts the schedulers for each object in config.schedulers
function startSchedulers() {
  config.schedulers.forEach(scheduler => {
    if (scheduler.type === 'shell') {
      runShellScheduler(scheduler);
      const intervalMs = parseInterval(scheduler.interval);
      setInterval(() => {
        runShellScheduler(scheduler);
      }, intervalMs);
    }
  });
}

function runShellScheduler(scheduler) {
  result = execBash(scheduler);
  // TODO: add transformations of the result
  var parsedResult = parseOutput(result);
  console.debug(`got ${typeof parsedResult} as a result for ${scheduler.var}`);
  global.schedulers_results[scheduler.var] = parsedResult;

  // Send the updated data to all windows
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('schedulers_results', global.schedulers_results);
  });
}

// function execBash executes the bash command specified in the scheduler object and returns the result
function execBash(scheduler) {
  console.debug(`Executing ${scheduler.var}`);
  global.schedulers_states[scheduler.var] = { isExecuting: true, lastRun: new Date() };

  try {
    const stdout = execSync(scheduler.exec);
    const result = stdout.toString().trim();

    global.schedulers_states[scheduler.var].isExecuting = false;
    console.debug(`Executed ${scheduler.var}`);
    return result;
  } catch (error) {
    console.error(`Execution error: ${error}`);
    global.schedulers_states[scheduler.var] = { isExecuting: false, lastError: error.message };
    return null;
  }
}

// function parseInterval parses the interval string and returns the number of milliseconds
function parseInterval(interval) {
  // TODO: handle float inetrvals, not only integers
  const match = interval.match(/(\d+)([smh])/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60000;
    case 'h': return value * 3600000;
    default: return null;
  }
}

function parseOutput(output) {
  // try parsing as JSON
  try {
    return JSON.parse(output);
  } catch (e) {
    pass;
  }
  // try parsing as YAML
  try {
    return yaml.load(output);
  } catch (e) {
    pass;
  }
  // check if it's a float or integer
  const floatVal = parseFloat(output);
  if (!isNaN(floatVal)) {
    return floatVal;
  }
  // default to string
  return output;
}


// create and show windows
app.whenReady().then(createPanels);
// create and start schedulers
startSchedulers();

