// =======================
// Constants
// =======================
const CGP_ADDRESS = "cgp:address";
const CGP_LOCATION_MODE = "cgp:location:mode";
const CGP_ADDRESS_MODIFIED = "cgp:address:modified";

let unsubscribeFn;

// =======================
// Web Component Definition
// =======================
class GoogleMapElement extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="cgp-google-map-html" style="height: 240px; border-radius: 4px; border-width: 1px; display: flex; align-items: center; justify-content: center; background-color:rgba(0, 0, 0, 0.06);">
      ${noMapToDisplay}
    </div>`;
  }
}

if (!customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMapElement);
}

// =======================
// Utility Functions
// =======================

const noMapToDisplay = `No Information To Display`;
const validateAddress = (address) =>
  Boolean(address?.lineOne && address?.city && address?.country?.title);

const formatAddress = (address) => {
  if (!validateAddress(address)) return "";
  return `${address.lineOne} ${address.city} ${address.region || ""} ${address.country?.title}`.trim();
};

const getGoogleMapsKey = (context) =>
  context?.properties?.find((prop) => prop.key === "GOOGLE_MAPS_KEY")?.value || "";

const renderMap = ({ apiKey, address }) => {
  if (!apiKey || !address) {
    return noMapToDisplay;
  }
  return `
    <iframe
      width="100%"
      height="240px"
      style="border:0"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(address)}">
    </iframe>
  `;
};

// =======================
// Event Subscription
// =======================
const subscribeToAddressEvents = (eventManager, root, context) => {
  const container = root.getElementById("cgp-google-map-html");
  if (!container) return () => {};

  const onAddressChange = ({ data }) => {
    const address = formatAddress(data);
    container.innerHTML = renderMap({
      apiKey: getGoogleMapsKey(context),
      address
    });
  };

  const subscriptions = [
    eventManager.subscribe(CGP_ADDRESS_MODIFIED, onAddressChange),
  ];

  return () => {
    subscriptions.forEach((sub) => sub?.unsubscribe?.());
  };
};

// =======================
// Lifecycle Methods
// =======================
const initialise = async ({ eventManager, root, context }) => {
  console.log("`cgp-google-map` initialised with", { eventManager, root, context });

  const container = root.getElementById("cgp-google-map-html");
  if (!container) return;

  container.innerHTML = renderMap({
    apiKey: getGoogleMapsKey(context),
    address: formatAddress(context?.data?.get(CGP_ADDRESS))
  });

  unsubscribeFn = subscribeToAddressEvents(eventManager, root, context);
};

const destroy = async () => {
  unsubscribeFn?.();
  unsubscribeFn = null;
};

// =======================
// Exports
// =======================
export { initialise, destroy };
