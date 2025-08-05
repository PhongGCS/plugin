let unsubscribe

class Example extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <div id="inner-html">
            CoverGo Platform
        </div>
        <div id="event"></div>
        <button id="button">Send event to host</button>
        `
  }
}

if (!window.customElements.get("cgp-example")) {
  customElements.define("cgp-example", Example)
}

const initialise = async (args) => {
  console.log("`cgp-example` is initialised with", args)
  const { eventManager, root, context } = args

  const content = root.getElementById("inner-html");
  content.innerHTML = `
    <div>The plugin has been initialized with</div>
    <div>=========</div>
    <pre>${JSON.stringify(context, null, 2)}</pre>
  `

  unsubscribe = eventManager.subscribe("PARTY:CREATED", ({ type, data }) => {
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
  console.log("`cgp-example` is destroyed!")
  unsubscribe?.()
}

export {
  initialise,
  destroy
}