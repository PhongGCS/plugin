// =======================
// Constants
// =======================
const CGP_ADDRESS = "cgp:address";
const CGP_LOCATION_MODE = "cgp:location:mode";
const CGP_ADDRESS_MODIFIED = "cgp:address:modified";
const noMapToDisplay = `No information to display`;

let unsubscribeFn;

// =======================
// Web Component Definition
// =======================
class GoogleMapElement extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
    <div id="cgp-google-map-html" style="border-radius: 4px; border-width: 1px; background-color:rgba(0, 0, 0, 0.06);">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; ">
      ${noMapToDisplay}
      </div>
    </div>`;
  }
}

if (!customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMapElement);
}

// =======================
// Utility Functions
// =======================
const validateAddress = (address) =>
  Boolean(address?.lineOne && address?.city && address?.country);

const formatAddress = (address) => {
  if (!validateAddress(address)) return "";
  return `${address.lineOne} ${address.city} ${address.region || ""} ${address.country || ""}`.trim();
};

const getGoogleMapsKey = (context) =>
  context?.properties?.find((prop) => prop.key === "GOOGLE_MAPS_KEY")?.value || "";

const renderMap = ({ apiKey, address, context }) => {
  const dataObject = Object.fromEntries(context.data);
  context.data = dataObject;
  const jsonContext = `<pre style="width: 100%">${JSON.stringify(context, null, 2)} </pre>`
  if (!apiKey || !address) {
    return `<div style="height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; "> ${noMapToDisplay} </div> ${jsonContext}`;
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
    ${jsonContext}
  `;
};

// =======================
// Event Subscription
// =======================
const subscribeToAddressEvents = (eventManager, root, context) => {
  const container = root.getElementById("cgp-google-map-html");
  if (!container) return () => {};

  const onAddressChange = ({ data }) => {
    console.log("onAddressChange ", data)
    const address = formatAddress(data);
    context.data[CGP_ADDRESS] = data;
    container.innerHTML = renderMap({
      apiKey: getGoogleMapsKey(context),
      address,
      context: context
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

  console.log("Initialization ", context?.data)
  container.innerHTML = renderMap({
    apiKey: getGoogleMapsKey(context),
    address: formatAddress(context?.data?.get(CGP_ADDRESS)),
    context: context
  });

  unsubscribeFn = subscribeToAddressEvents(eventManager, root, context);
};

const destroy = async () => {
  console.log("`cgp-google-map` is destroyed!")
  unsubscribeFn?.();
  unsubscribeFn = null;
};

// =======================
// Exports
// =======================
export { initialise, destroy };
