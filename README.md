# What is electrb
Yet another electron-based bar for unix systems - hello r/unixporn, thanks for corrupting my mind with thoughts like "everything should look perfect"


### Why I've made it
There are a lot of great bars - personally I used to use polybar most of the time. But then you see something like eww - and you want more or its beauty

You try eww - and it's fcking nightmare. You want these nice widgets, and you're comfortable with fact that you need to spend several days trying to configure it. I've spent some time - and it was one of the biggest disappointes of my life - thanks to castrated gtk-css you cannot made something like this:  
![no picture? what a shame](https://i.imgur.com/BYNruSR.png "cybercpu widget")

So it is my try to make electron-based bar, that will be:
- hard to configure
- consume a lot of system resources (thanks electron)
- since I'm not a js developer *(and not a developer in general)* - it will piece of shit, probably
But it can do **literally anything**

# Basic principles of electrb
This piece of code opens several electron windows **(aka panels)** with a set of divs **(aka widgets)**, in the background runs a set of user-defined periodical jobs **(aka schedulers)**, that fetches some info and broadcasting it to all panels and widgets through IPC

## Entity by entity
### Scheduler
For now I've implemented only shell executes. You have to set
- **exec**: any command/script/one line bash script
- **interval**: interval between executes
- **type**: for now it is only `shell`
- **transform**: for now it is useless
Every `{interval}` `{exec}` will be launched (if not running already), it's return (stdout) will go through function that will try to determine output type. Priority of types: yaml, json, float/int, string  
Later I'll figure out what can be done to additional transformation of data before type determination, what's why we need `{transform}` in config file  
Data will be stored in `global.schedulers_results[{var}]` and broadcasted to all panels with IPC every time every scheduler finishes  
> So for resources consumption it will be better to do all possible transformations inside scheduler - it runs once. Inside widget data operations runs every time EVERY variable is updated, so you'll have to face higher CPU usage or more memory consumption, if you want to perform actions only if variable changed it's value

### Widget
Basically - a div with everything you want to add  
User widget contains `index.js` and `index.css`. On main html page you have a div with id=`widget.name`, so you'll have to add children in `index.js`, style it with `index.css` and etc. Widget directory can contain more files, but they will not be loaded - you can load them using related or absolute paths. For example:
```css
#cybercpu::before {
    ...
    background-image: url('overlay.svg');
    ...
}
```
Also you have to handle ipc broadcasts of variables from schedulers, like 
```javascript
window.electronAPI.receive('schedulers_results', (schedulersResults) => {
    console.log('Received schedulers results:', schedulersResults);
});
```

### Panel
An electron window, borderless, without any margins/paddings/etc, with hidden scroll borders, etc. Wm class is electron I guess (TBD check, change to electrb of possible), wm name/title = panel.name  
Need a `position` and `dimensions` to be set, have a property `visible` - will be shown if true. For now - useless. Later I'll implement some mechanic to sent messages to main process, to show/hide panels by some actions in widget (also it will be great to have ability to show/hide based on some shortcuts/scripts, I'll think about it later)  
Have a property `transparent` - later I'll add background variable to have an opportunity to set background to some color or maybe image
If panel name ends with `_debug` - electron starts with dev tools opened. It's very useful for widget debug: you can have a normal sized window with ability to go through all of its html, see console, net calls, etc

# Configuring electrb
Here is a sample config file with some comments:
```yaml
panels:
  - name: "main" # name of panel
    resolution:
      w: 311
      h: 65
    position:
      x: 0
      y: 0 # y counts from top to bottom
    visible: true
    transparent: true
    widgets:
      - name: "cybercpu"
        # you can add more widgets here
  - name: "panel_debug" # debug shows chromium dev tools
    resolution: # as it is my debug panel - i made it large, so dev tools can feat
      w: 1000
      h: 800
    position:
      x: 100
      y: 400
    visible: true
    transparent: true # transparency does not work in debug panels
    widgets:
      - name: "cybercpu"


schedulers:
  - var: cpu_stat # a var that will contain all information of this particular scheduler
    exec: "/home/mrt0rtikize/cpu_usage.lua" # script or binary, that will be executed to get data
    transform: "" # not implemented yet, I've left it just in case
    interval: 1s # interval between runs, can be seconds, minutes or hours
    type: shell # the only supported type yet
  - var: load_average
    exec: "uptime | sed 's/^.*load average: //; s/,.*$//'"
    transform: "" 
    interval: 10s
    type: shell
  - var: disk_usage
    exec: "df | grep '/dev/nvme1n1p5' | awk '{print $5}' | grep '%' | sed 's/%.*//' | uniq"
    transform: "" 
    interval: 1m
    type: shell
  - var: memory_usage
    exec: "free | grep Mem | awk '{print $3/$2 * 100.0}'"
    transform: "" 
    interval: 1s
    type: shell
```

# TODO
- [x] make possible to set float as interval
- [ ] test layouts with several widgets and fix what is wrong
- [ ] make a default config, create dirs and etc on first run
- [ ] create a set of default widgets
- [ ] add examples
- [ ] add IPC signals from panels to main process (can be used for things like launching scripts and things like changing workspaces in WM)

