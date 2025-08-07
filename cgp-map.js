let unsubscribe;
const CGP_ADDRESS = "cgp:address";
const CGP_LOCATION_MODE = "cgp:location:mode";
const CGP_ADDRESS_MODIFIED = "cgp:address:modified";

// Define the custom element
class GoogleMapElement extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div id="cgp-google-map-html">
       No Information To Display
      </div>
    `;
  }
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMapElement);
}


const renderMap = ({ context, address } = {}) => {
  if (!context || !context.properties || !Array.isArray(context.properties)) return '';

  const apiKey = context.properties.find(prop => prop.key === 'GOOGLE_MAPS_KEY')?.value;
  if (!apiKey || !address) return '<p>Missing Google Maps API key or address.</p>';

  return `
    <iframe
      width="100%"
      height="300"
      style="border:0"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}">
    </iframe>
  `;
};

// Subscribe to address-related events
const subscribeToAddressEvents = (eventManager, root, context) => {
  const eventTypes = [CGP_ADDRESS_MODIFIED];
  const unsubscribeFunctions = [];

  eventTypes.forEach(eventType => {
    const subscription = eventManager.subscribe(eventType, ({ addressObject }) => {
      const container = root.getElementById("cgp-google-map-html");
      if (container) {
        const address = getAddress(addressObject);
        container.innerHTML = renderMap({ context, address });
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
    return;
  }

  container.innerHTML = renderMap({ context, address: getAddress(context.data.get(CGP_ADDRESS)) });
  unsubscribe = subscribeToAddressEvents(eventManager, root, context);
};

const getAddress = (addressObject) => {
  if (!addressObject) {
    return;
  }
  return `${addressObject.lineOne} ${addressObject.city}, ${addressObject.region}, ${addressObject.country}`;
};
const getLocationMode = (context) => {
  const locationMode = context.data.get(CGP_LOCATION_MODE);
  if (!locationMode) {
    return;
  }
  return locationMode;
};

// Clean up any subscriptions
const destroy = async () => {
  unsubscribe?.();
};

export {
  initialise,
  destroy
};
