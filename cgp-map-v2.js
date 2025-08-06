let unsubscribe

class GoogleMap extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
        <div id="cgp-google-map-html">
            CoverGo Platform Map
        </div>
        <div id="event"></div>
        <button id="button">Send event to host</button>
        `
  }
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMap)
}

// Default Google Maps iframe URL
const DEFAULT_MAP_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.319452894563!2d106.68748520000001!3d10.7868269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2d82dfb88f%3A0xc332735006743f3b!2zMjU4IE5hbSBL4buzIEto4bufaSBOZ2jEqWEsIFBoxrDhu51uZyBWw7UgVGjhu4sgU8OhdSwgUXXhuq1uIDMsIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1sen!2s!4v1754391188252!5m2!1sen!2s"

// Render function to generate HTML content based on data
const render = (data = {}) => {
  console.log("Render function called with data:", data)
  
  const { mapUrl, content } = data
  
  // If custom content is provided, use it
  if (content) {
    console.log("Rendering custom content")
    return content
  }
  
  // Otherwise, render Google Maps iframe
  const url = mapUrl || DEFAULT_MAP_URL
  console.log("Rendering Google Maps iframe with URL:", url)
  return `<iframe src="${url}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
}

// Helper function to display event information
const displayEventInfo = (root, type, data) => {
  root.getElementById("event").innerHTML = `
    <div>=========</div>
    <pre>Received event: ${type}</pre>
    <pre>${JSON.stringify(data, null, 2)}</pre>
    <div>=========</div>
  `
}

// Helper function to handle address events
const handleAddressEvent = (root, type, data) => {
  console.log(`Received ${type} event:`, data)
  
  // Render content based on received data
  const content = root.getElementById("cgp-google-map-html")
  content.innerHTML = render(data)
  
  // Display event information
  displayEventInfo(root, type, data)
}

// Subscribe to address events
const subscribeToAddressEvents = (eventManager, root) => {
  const eventTypes = ['cgp:address:create', 'cgp:address:view', 'cgp:address:edit']
  const unsubscribeFunctions = []
  
  eventTypes.forEach(eventType => {
    const unsubscribe = eventManager.subscribe(eventType, ({ type, data }) => {
      handleAddressEvent(root, type, data)
    }).unsubscribe
    
    unsubscribeFunctions.push(unsubscribe)
  })
  
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe?.())
  }
}

// Initialize button event listener
const initializeButton = (root, eventManager) => {
  root.getElementById("button").addEventListener("click", () => {
    eventManager.publish({
      type: 'wc:message',
      data: "Hello from WebComponent!"
    })
  })
}

const initialise = async (args) => {
  console.log("`cgp-google-map` is initialised with", args)
  const { eventManager, root, context } = args

  // Initialize with default content using render function
  const content = root.getElementById("cgp-google-map-html")
  content.innerHTML = render({}) // Explicitly pass empty object for default

  // Subscribe to address events
  unsubscribe = subscribeToAddressEvents(eventManager, root)

  // Initialize button
  initializeButton(root, eventManager)
}

const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!")
  unsubscribe?.()
}

export {
  initialise,
  destroy,
  render
}