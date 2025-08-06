let unsubscribe

class Example extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <div id="cgp-google-map-html">
            No information to display
        </div>
        `
  }
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", Example)
}

const render = (data = {}) => {
  console.log("Render function called with data:", data)
  const { context } = data;
  const GOOGLE_MAPS_KEY = context.properties.find(e => e.key === 'GOOGLE_MAPS_KEY')?.value;
  const address = "95 Trần Bá Giao";
  if(address) {
    return `
      <iframe
        width="600"
        height="450"
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}"
          &q=${encodeURI(address)}">
      </iframe>
      `
  }
  
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
  content.innerHTML = render({context})
}

const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!")
  unsubscribe?.()
}

export {
  initialise,
  destroy
}