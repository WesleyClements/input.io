if (typeof window === "undefined")
  throw new Error("input.io only works in the browser");

/**
 * Manages inputs
 * @property {typeof InputMap} InputMap
 */
class InputIO {
  /** @type {Window|Document|Element} */
  #target;
  /** @type {'all'|'action'|'none'} */
  #preventDefault;

  /**
   * @param {Object} [options={}] - InputIO options.
   * @param {Window|Document|Element} [options.target=window] -
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget|EventTarget} on which to listen for input events.
   * @param {'all'|'action'|'none'} [options.preventDefault="action"] -
   * Determines which input events will have preventDefault called on them
   */
  constructor({ target = window, preventDefault = "action" } = {}) {
    this.#target = target;
    this.#preventDefault = preventDefault;
  }

  get target() {
    return this.#target;
  }

  get preventDefault() {
    return this.#preventDefault;
  }
  set preventDefault(value) {
    if (typeof value !== "string")
      throw new TypeError("preventDefault must be a string");
    if (!["all", "action", "none"].includes(value))
      throw new Error("invalid preventDefault value: " + value);
    this.#preventDefault = value;
  }
}

export default InputIO;
