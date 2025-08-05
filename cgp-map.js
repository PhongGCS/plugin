let unsubscribe

class Example extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <div id="cgp-google-map-html">
            CoverGo Platform
        </div>
        <div id="event"></div>
        <button id="button">Send event to host</button>
        `
  }
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", Example)
}

const initialise = async (args) => {
  console.log("`cgp-google-map` is initialised with", args)
  const { eventManager, root, context } = args

  const content = root.getElementById("cgp-google-map-html");
  content.innerHTML = `
    <div>The plugin has been initialized with</div>
    <div>=========</div>
    <pre>${JSON.stringify(context, null, 2)}</pre>
  `

  unsubscribe = eventManager.subscribe("cgp:address:create", ({ type, data }) => {
    root.getElementById("event").innerHTML = `
      <div>=========</div>
      
      <pre>Received event: ${type}</pre>
      <pre>${JSON.stringify(data, null, 2)}</pre>
      <div>=========</div>
    `
  }).unsubscribe;

  root.getElementById("button").addEventListener("click", () => {
    eventManager.publish({
      type: 'wc:message',
      data: "Hello from WebComponent!"
    })
  })
}

const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!")
  unsubscribe?.()
}

export {
  initialise,
  destroy
}