import { getNow } from "./util/index.js";

/**
 * @typedef BinaryInput
 * @type {Object}
 * @property {boolean} state;
 * @property {number} start;
 */

/**
 * The maximum number of milliseconds to keep record of
 */
const maximumHistoryLength = 1000;

/**
 *
 */
class BinaryInputHistory {
  /** @type {BinaryInput[]} */
  #history;

  constructor() {
    this.#history = [];
  }

  get currentState() {
    return this.#history[0]?.state ?? false;
  }

  get currentDuration() {
    return getNow() - this.#history[0]?.start ?? 0;
  }

  /**
   * Adds to history if state changed
   * @param {Object} props
   * @param {boolean} props.state
   */
  update({ state }) {
    if (state === this.currentState) return;
    const now = getNow();
    this.#history.unshift({ state, start: now });
    while (
      this.#history.length > 1 &&
      this.#history[this.#history.length - 1].start + maximumHistoryLength < now
    ) {
      this.#history.pop();
    }
  }
}

class ActionInputHistory extends BinaryInputHistory {
  /** @type {Set<string>} */
  #activeInputs;

  constructor() {
    super();
    this.#activeInputs = new Set();
  }

  /**
   * Updated the state of an input this action is dependent on.
   * @param {Object} props
   * @param {string} props.input
   * @param {boolean} props.state
   */
  update({ input, state }) {
    if (state) this.#activeInputs.add(input);
    else this.#activeInputs.delete(input);
    super.update({ state: this.#activeInputs.size > 0 });
  }
}

class InputHistory {
  /** @type {Map<string, BinaryInputHistory>} */
  #keyInputHistories;
  /** @type {Map<string, BinaryInputHistory>} */
  #mouseButtonInputHistories;
  /** @type {Map<string, ActionInputHistory>} */
  #actionInputHistories;

  constructor() {
    this.#keyInputHistories = new Map();
    this.#mouseButtonInputHistories = new Map();
    this.#actionInputHistories = new Map();
  }
  /**
   *
   * @param {string} key
   * @returns {BinaryInputHistory}
   */
  getKeyHistory(key) {
    let history = this.#keyInputHistories.get(key);
    if (!history) {
      this.#keyInputHistories.set(key, (history = new BinaryInputHistory()));
    }
    return history;
  }
  /**
   *
   * @param {string} button
   * @returns {BinaryInputHistory}
   */
  getMouseButtonHistory(button) {
    let history = this.#mouseButtonInputHistories.get(button);
    if (!history) {
      this.#mouseButtonInputHistories.set(
        button,
        (history = new BinaryInputHistory())
      );
    }
    return history;
  }
  /**
   *
   * @param {string} action
   * @returns {ActionInputHistory}
   */
  getActionHistory(action) {
    let history = this.#actionInputHistories.get(action);
    if (!history) {
      this.#actionInputHistories.set(
        action,
        (history = new ActionInputHistory())
      );
    }
    return history;
  }
}

export default InputHistory;
