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
  content.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.319452894563!2d106.68748520000001!3d10.7868269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2d82dfb88f%3A0xc332735006743f3b!2zMjU4IE5hbSBL4buzIEto4bufaSBOZ2jEqWEsIFBoxrDhu51uZyBWw7UgVGjhu4sgU8OhdSwgUXXhuq1uIDMsIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1sen!2s!4v1754391188252!5m2!1sen!2s" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`

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