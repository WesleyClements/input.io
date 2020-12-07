import { isStringArray } from "./util";

/**
 * Manages all action to
 */
class InputMap {
  /** @type {Set<String>} */
  #actions;
  /** @type {Map<String,Set<String>>} */
  #actionToKeys;
  /** @type {Map<String,Set<String>>} */
  #actionToMouseButtons;
  /** @type {Map<String,Set<String>>} */
  #keyToActions;
  /** @type {Map<String,Set<String>>} */
  #mouseButtonToActions;

  /**
   */
  constructor() {
    this.#actions = new Set();
    this.#actionToKeys = new Map();
    this.#actionToMouseButtons = new Map();
    this.#keyToActions = new Map();
    this.#mouseButtonToActions = new Map();
  }

  /**
   * A set of the names of all actions with mappings
   */
  get actions() {
    return new Set(this.#actions);
  }

  /**
   * Checks to see if this InputMap has a mapping for the given action
   * @param {String} action - The action of interest
   */
  has(action) {
    return this.#actions.has(action);
  }

  /**
   * Adds all provided action to input mappings provided. Appends to input mappings if they exist.
   * @param {Object[]} mappings - The action mappings to add
   * @param {String} mappings[].action - The action name
   * @param {String[]} [mappings[].keys] - All keys associated with this action
   * @param {String[]} [mappings[].mouseButtons] - All mouse buttons associated with this action
   */
  add(...mappings) {
    mappings?.forEach((mapping) => {
      try {
        if (typeof mapping !== "object")
          throw new TypeError("mapping is not an object");
        const { action, keys, mouseButtons } = mapping;
        if (typeof action !== "string")
          throw new TypeError(`action must be a string`);
        if (!(keys == null || isStringArray(keys)))
          throw new TypeError(`keys must be a string[]`);
        if (!(mouseButtons == null || isStringArray(mouseButtons)))
          throw new TypeError(`mouseButtons must be a string[]`);
        if (!(keys?.length || mouseButtons?.length))
          throw new Error(`at least one input must be provided: ${action}`);

        const keyCodes = keys
          // ?.map((key) => Keys.code(key.toLowerCase()) ?? "")
          ?.filter((keyCode, i) => {
            if (!keyCode) throw new Error(`no such key '${keys[i]}'`);
            return keyCode;
          });
        const mouseButtonCodes = mouseButtons
          //?.map((button) => MouseButtons.code(button.toLowerCase()) ?? "")
          ?.filter((buttonCode, i) => {
            if (!buttonCode)
              throw new Error(`no such mouse button '${mouseButtons[i]}'`);
            return buttonCode;
          });

        this.#actions.add(action);
        keyCodes?.forEach((keyCode) => {
          if (!this.#keyToActions.get(keyCode)?.add(action))
            this.#keyToActions.set(keyCode, new Set([action]));
          if (!this.#actionToKeys.get(action)?.add(keyCode))
            this.#actionToKeys.set(keyCode, new Set([keyCode]));
        });
        mouseButtonCodes?.forEach((buttonCode) => {
          if (!this.#mouseButtonToActions.get(buttonCode)?.add(action))
            this.#mouseButtonToActions.set(buttonCode, new Set([action]));
          if (!this.#actionToMouseButtons.get(action)?.add(buttonCode))
            this.#actionToMouseButtons.set(action, new Set([buttonCode]));
        });
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Removes all action input mappings for the given actions, if they exist.
   * @param  {String[]} actions - Actions to be removed
   */
  remove(...actions) {
    actions.forEach((action) => {
      if (!this.#actions.delete(action)) return;
      this.#actionToKeys
        .get(action)
        ?.forEach((key) => this.#keyToActions.get(key)?.delete(action));
      this.#actionToKeys.delete(action);
      this.#actionToMouseButtons
        .get(action)
        ?.forEach((button) =>
          this.#mouseButtonToActions.get(button)?.delete(action)
        );
      this.#actionToMouseButtons.delete(action);
    });
  }

  /**
   * Sets all provided action to input mappings provided. Overwrites input mappings if they exist.
   * @param {Object[]} mappings - The action mappings to add
   * @param {String} mappings[].action - The action name
   * @param {String[]} [mappings[].keys] - All keys associated with this action
   * @param {String[]} [mappings[].mouseButtons] - All mouse buttons associated with this action
   */
  set(...mappings) {
    this.remove(...mappings.map(({ action }) => action));
    this.add(...mappings);
  }
}

export default InputMap;
