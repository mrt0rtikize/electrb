window.electronAPI.receive('set_layout', (layout) => {
  const mainContainer = document.createElement('div');
  mainContainer.id ='main-container';
  mainContainer.className = `main-container ${layout}`;
  document.body.appendChild(mainContainer);
});

window.electronAPI.receive('init_widgets', (widgets) => {
  // FIXME: check if main-container exists, if not - wait a little and try again
  console.log(widgets);
  widgets.forEach((widget) => {
    console.log(`modifying html for widget ${widget.name}`);

    const div = document.createElement('div');
    div.id = widget.name;
    div.className = "widget";

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${widget.path}/index.css`;
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = `${widget.path}/index.js`;
    document.body.appendChild(script);

    const mainContainer = document.getElementById('main-container');
    mainContainer.appendChild(div);
  })
});
