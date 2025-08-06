let unsubscribe;

// Define the custom element
class GoogleMapElement extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div id="cgp-google-map-html">
        No information to display
      </div>
    `;
  }
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMapElement);
}

// Render Google Map iframe based on context and address
const renderMap = ({ context, address = "95 Trần Bá Giao" } = {}) => {
  if (!context || !context.properties || !Array.isArray(context.properties)) return '';

  const apiKey = context.properties.find(prop => prop.key === 'GOOGLE_MAPS_KEY')?.value;
  if (!apiKey || !address) return '<p>Missing Google Maps API key or address.</p>';

  const encodedAddress = encodeURIComponent(address);

  return `
    <iframe
      width="600"
      height="450"
      style="border:0"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}">
    </iframe>
  `;
};

// Subscribe to address-related events
const subscribeToAddressEvents = (eventManager, root) => {
  const eventTypes = ['cgp:address:create', 'cgp:address:view', 'cgp:address:edit'];
  const unsubscribeFunctions = [];

  eventTypes.forEach(eventType => {
    const subscription = eventManager.subscribe(eventType, ({ data }) => {
      const container = root.getElementById("cgp-google-map-html");
      if (container) {
        container.innerHTML = renderMap(data);
      }
    });

    unsubscribeFunctions.push(subscription?.unsubscribe);
  });

  // Return a cleanup function
  return () => {
    unsubscribeFunctions.forEach(unsub => unsub?.());
  };
};

// Initialize the custom element logic
const initialise = async ({ eventManager, root, context }) => {
  console.log("`cgp-google-map` is initialised with", { eventManager, root, context });

  const container = root.getElementById("cgp-google-map-html");
  if (!container) {
    console.warn("Container for Google Map not found");
    return;
  }

  container.innerHTML = renderMap({ context });
  unsubscribe = subscribeToAddressEvents(eventManager, root);
};

// Clean up any subscriptions
const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!");
  unsubscribe?.();
};

export {
  initialise,
  destroy
};
