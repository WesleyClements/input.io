import { getNow } from "./util";

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
      this.#history[this.#history.length - 2].start + maximumHistoryLength < now
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
