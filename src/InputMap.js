import { isStringArray, Keys, MouseButtons } from "./util";

/**
 * Represents a mapping between an action and some inputs.
 */
class InputMapping {
  /** @type {String} */
  #action;
  /** @type {Set<String>} */
  #keys;
  /** @type {Set<String>} */
  #mouseButtons;

  /**
   *
   * @param {String} action - The name of this action
   * @param {Set<String>} [keys] - The set of key codes associated with this action
   * @param {Set<String>} [mouseButtons] - The set of mouse buttons codes associated with this action
   */
  constructor(action, keys, mouseButtons) {
    this.#action = action;
    this.#keys = new Set(keys);
    this.#mouseButtons = new Set(mouseButtons);
  }

  get action() {
    return this.#action;
  }
  get keys() {
    return this.#keys;
  }
  get mouseButtons() {
    return this.#mouseButtons;
  }
}

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
   * A Set of all actions with mappings
   */
  get actions() {
    return new Set(this.#actions);
  }

  /**
   * Returns true if this InputMap has a mapping for the given action.
   * @param {String} action - The action of interest
   */
  has(action) {
    return this.#actions.has(action);
  }

  /**
   * Returns the mapping for the given action if it exists.
   * @param {String} action - The action of interest
   * @returns {InputMapping | null}
   */
  getMapping(action) {
    if (!this.#actions.has(action)) return null;
    return new InputMapping(
      action,
      this.#actionToKeys.get(action),
      this.#actionToMouseButtons.get(action)
    );
  }

  /**
   * Returns the actions which are mapped to the given inputs if any.
   * @param {Object} inputs
   * @param {String[]} [inputs.keys]
   * @param {String[]} [inputs.mouseButtons]
   * @returns {Set<String>|null}
   */
  getActions({ keys, mouseButtons }) {
    if (!isStringArray(keys) && !isStringArray(mouseButtons))
      throw new Error("at least one input must be provided");
    const results = new Set();
    keys?.forEach((key) =>
      this.#keyToActions.get(key)?.forEach((action) => results.add(action))
    );
    mouseButtons?.forEach((mouseButton) =>
      this.#mouseButtonToActions
        .get(mouseButton)
        ?.forEach((action) => results.add(action))
    );
    return results;
  }

  /**
   * Adds all provided action to input mappings provided. Appends to input mappings if they exist.
   * @param {Object[]} mappings - The action mappings to add
   * @param {String} mappings[].action - The action name
   * @param {String[]} [mappings[].keys] - All keys associated with this action
   * @param {String[]} [mappings[].mouseButtons] - All mouse buttons associated with this action
   */
  add(...mappings) {
    mappings
      ?.map((mapping) => {
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

        const keyCodes = keys?.reduce((flattened, key, i) => {
          const codes = Keys.getCodes(key.toLowerCase());
          if (codes.length === 0) throw new Error(`no such key '${keys[i]}'`);
          flattened.push(...codes);
          return flattened;
        }, Array());
        const mouseButtonCodes = mouseButtons
          ?.map((button) => MouseButtons.getCodes(button.toLowerCase()))
          .reduce((flattened, mouseButtons, i) => {
            if (!mouseButtons.length)
              throw new Error(`no such mouse button '${mouseButtons[i]}'`);
            flattened.push(...mouseButtons);
            return flattened;
          }, []);
        return { action, keyCodes, mouseButtonCodes };
      })
      .forEach(({ action, keyCodes, mouseButtonCodes }) => {
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
      });
  }

  /**
   * Removes all action input mappings for the given actions, if they exist.
   * @param  {String[]} actions - Actions to be removed
   */
  remove(...actions) {
    if (!isStringArray(actions))
      throw new TypeError("actions must be a string[]");
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
