// window.electronAPI.receive('schedulers_results', (schedulersResults) => {
//   console.log('Received schedulers results:', schedulersResults);
//   document.getElementById('cpuStatDisplay').textContent = schedulersResults.cpu_stat.average_usage;
// });


window.electronAPI.receive('init_widgets', (widgets) => {
  console.log(widgets);
  widgets.forEach((widget) => {
    console.log(`modifying html for widget ${widget.name}`);

    const div = document.createElement('div');
    div.id = widget.name;
    div.className = "widget";
    document.body.appendChild(div);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${widget.path}/index.css`;
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = `${widget.path}/index.js`;
    document.body.appendChild(script);

  })
});
