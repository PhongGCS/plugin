// =======================
// Web Component Definition
// =======================
class GoogleMapElement extends HTMLElement {
      // =======================
  // Constants
  // =======================
  CGP_ADDRESS = "cgp:address";
  CGP_LOCATION_MODE = "cgp:location:mode";
  CGP_ADDRESS_MODIFIED = "cgp:address:modified";
  noMapToDisplay = `No information to display`;

  unsubscribeFn;

  constructor() {
    super();
    this.innerHTML = `
    <div id="cgp-google-map-html" style="border-radius: 4px; border-width: 1px; background-color:rgba(0, 0, 0, 0.06);">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; ">
      No information to display
      </div>
    </div>`;
  }

  // =======================
  // Utility Functions
  // =======================
  validateAddress = (address) =>
    Boolean(address?.lineOne && address?.city && address?.country);

  formatAddress = (address) => {
    if (!this.validateAddress(address)) return "";
    return `${address.lineOne} ${address.city} ${address.region || ""} ${address.country || ""}`.trim();
  };

  getGoogleMapsKey = (context) =>
    context?.properties?.find((prop) => prop.key === "GOOGLE_MAPS_KEY")?.value || "";

  renderMap = ({ apiKey, address, context }) => {

    if (!apiKey || !address) {
      return `<div style="height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; "> ${this.noMapToDisplay} </div>`;
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
  subscribeToAddressEvents = (eventManager, context) => {
    const container = window.document.getElementById("cgp-google-map-html");
    if (!container) return () => { };

    const onAddressChange = ({ data }) => {
      console.log("onAddressChange ", data)
      const address = this.formatAddress(data);

      container.innerHTML = this.renderMap({
        apiKey: this.getGoogleMapsKey(context),
        address,
        context: context
      });
    };

    const subscriptions = [
      eventManager.subscribe(this.CGP_ADDRESS_MODIFIED, onAddressChange),
    ];

    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe?.());
    };
  };

  initialise = async ({ eventManager, root, context }) => {
    console.log("`cgp-google-map` initialised with", { eventManager, root, context });

    const container = root.getElementById("cgp-google-map-html");
    if (!container) return;

    console.log("Initialization ", context?.data)
    container.innerHTML = this.renderMap({
      apiKey: this.getGoogleMapsKey(context),
      address: this.formatAddress(context?.data?.get(CGP_ADDRESS)),
      context: context
    });

    this.unsubscribeFn = this.subscribeToAddressEvents(eventManager, root, context);
  };

  destroy = async () => {
    console.log("`cgp-google-map` is destroyed!")
    this.unsubscribeFn?.();
    this.unsubscribeFn = null;
  };
}

if (!window.customElements.get("cgp-google-map")) {
  customElements.define("cgp-google-map", GoogleMapElement);
}
