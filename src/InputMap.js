import { isStringArray, Keys, MouseButtons } from "./util";

/**
 * @typedef InputMapping
 * @type {Object}
 * @property {string} action
 * @property {string[]} [keys]
 * @property {string[]} [mouseButtons]
 */

/** @ignore */
export const getActions = Symbol("InputMap.getActions");
export const keyHasAction = Symbol("InputMap.keyHasAction");
export const buttonHasAction = Symbol("InputMap.buttonHasAction");

/**
 * Manages all action to input mapping
 */
class InputMap {
  /** @type {Set<string>} */
  #actions;
  /** @type {Map<string,Set<string>>} */
  #actionToKeys;
  /** @type {Map<string,Set<number>>} */
  #actionToMouseButtons;
  /** @type {Map<string,Set<string>>} */
  #keyToActions;
  /** @type {Map<number,Set<string>>} */
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
   * @param {string} action - The action of interest
   */
  has(action) {
    return this.#actions.has(action);
  }

  /**
   * Returns the mapping for the given action if it exists.
   * @param {string} action - The action of interest
   * @returns {InputMapping | null}
   */
  getMapping(action) {
    if (!this.#actions.has(action)) return null;
    /** @type {InputMapping} */
    const result = {
      action,
    };
    if (this.#actionToKeys.has(action)) {
      result.keys = Array.from(this.#actionToKeys.get(action) ?? []).map(
        (code) => Keys.getKeys(code)[0]
      );
    }
    if (this.#actionToMouseButtons.has(action)) {
      result.mouseButtons = Array.from(
        this.#actionToMouseButtons.get(action) ?? []
      ).map((code) => MouseButtons.getButtons(code)[0]);
    }
    return result;
  }

  /**
   * Returns the actions which are mapped to the given inputs if any.
   * @param {Object} inputs
   * @param {string[]} [inputs.keys]
   * @param {string[]} [inputs.mouseButtons]
   * @returns {Set<string>|null}
   */
  getActions({ keys, mouseButtons }) {
    if (!(keys?.length || mouseButtons?.length))
      throw new Error(`at least one input must be provided`);
    return this[getActions](
      keys ? Keys.getAllCodes(...keys) : undefined,
      mouseButtons ? MouseButtons.getAllCodes(...mouseButtons) : undefined
    );
  }
  /**
   *
   * Returns the actions which are mapped to the given raw inputs if any.
   * @param {string[]} [keyCodes]
   * @param {number[]} [mouseButtonCodes]
   * @returns {Set<String>}
   */
  [getActions](keyCodes, mouseButtonCodes) {
    const results = new Set();
    keyCodes?.forEach((key) =>
      InputMap.prototype.#keyToActions
        .get(key)
        ?.forEach((action) => results.add(action))
    );
    mouseButtonCodes?.forEach((mouseButton) =>
      InputMap.prototype.#mouseButtonToActions
        .get(mouseButton)
        ?.forEach((action) => results.add(action))
    );
    return results;
  }

  /**
   * Checks if there is an action mapped to the raw key
   * @param {string} keyCode
   * @returns {boolean}
   */
  [keyHasAction](keyCode) {
    return !!InputMap.prototype.#keyToActions.get(keyCode)?.size;
  }

  /**
   * Checks if there is an action mapped to the raw mouse button
   * @param {number} buttonCode
   * @returns {boolean}
   */
  [buttonHasAction](buttonCode) {
    return !!InputMap.prototype.#mouseButtonToActions.get(buttonCode)?.size;
  }

  /**
   * Adds all provided action to input mappings provided. Appends to input mappings if they exist.
   * @param {...InputMapping} mappings - The input mappings to add
   */
  add(...mappings) {
    mappings
      ?.filter((mapping) => mapping != null)
      ?.map((mapping) => {
        if (typeof mapping !== "object")
          throw new TypeError("mapping is not an object");
        const { action, keys, mouseButtons } = mapping;
        if (action == null) throw new TypeError("action must be defined");
        if (
          !(Array.isArray(keys) && keys?.length) &&
          !(Array.isArray(mouseButtons) && mouseButtons?.length)
        )
          throw new Error(`at least one input must be provided: ${action}`);
        return {
          action: action.toString(),
          keyCodes: keys ? Keys.getAllCodes(...keys) : undefined,
          mouseButtonCodes: mouseButtons
            ? MouseButtons.getAllCodes(...mouseButtons)
            : undefined,
        };
      })
      .forEach(({ action, keyCodes, mouseButtonCodes }) => {
        this.#actions.add(action);
        keyCodes?.forEach((keyCode) => {
          if (!this.#keyToActions.has(keyCode))
            this.#keyToActions.set(keyCode, new Set([action]));
          else this.#keyToActions.get(keyCode)?.add(action);
          if (!this.#actionToKeys.has(action))
            this.#actionToKeys.set(action, new Set([keyCode]));
          else this.#actionToKeys.get(action)?.add(keyCode);
        });
        mouseButtonCodes?.forEach((buttonCode) => {
          if (!this.#mouseButtonToActions.has(buttonCode))
            this.#mouseButtonToActions.set(buttonCode, new Set([action]));
          else this.#mouseButtonToActions.get(buttonCode)?.add(action);
          if (!this.#actionToMouseButtons.has(action))
            this.#actionToMouseButtons.set(action, new Set([buttonCode]));
          else this.#actionToMouseButtons.get(action)?.add(buttonCode);
        });
      });
  }

  /**
   * Removes all action input mappings for the given actions, if they exist.
   * @param  {string[]} actions - Actions to be removed
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
   * @param {...InputMapping} mappings - The action mappings to add
   */
  set(...mappings) {
    this.remove(...mappings.map(({ action }) => action));
    this.add(...mappings);
  }
}

export default InputMap;
