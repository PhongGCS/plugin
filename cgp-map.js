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

const render = (data = {}) => {
  console.log("Render function called with data:", data)
  const { address } = data
  const url = DEFAULT_MAP_URL
  return `
  <h4>Address</h4>
  <p>${address}</p>
  <iframe src="${url}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
}

const subscribeToAddressEvents = (eventManager, root) => {
  const eventTypes = ['cgp:address:create', 'cgp:address:view', 'cgp:address:edit']
  const unsubscribeFunctions = []
  
  eventTypes.forEach(eventType => {
    const unsubscribe = eventManager.subscribe(eventType, ({ type, data }) => {
      const content = root.getElementById("cgp-google-map-html")
      content.innerHTML = render(data)
    }).unsubscribe
    
    unsubscribeFunctions.push(unsubscribe)
  })
  
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe?.())
  }
}

const initialise = async (args) => {
  console.log("`cgp-google-map` is initialised with", args)
  const { eventManager, root, context } = args

  const content = root.getElementById("cgp-google-map-html");

  unsubscribe = subscribeToAddressEvents(eventManager, root)
}

const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!")
  unsubscribe?.()
}

export {
  initialise,
  destroy
}