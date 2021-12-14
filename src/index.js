if (typeof window === "undefined")
  throw new Error("input.io only works in the browser");

import InputMap, {
  keyHasAction,
  buttonHasAction,
  getActions
} from "./InputMap.js";
import InputHistory from "./InputHistory.js";
import { MouseButtons } from "./util/index.js";

/**
 * @readonly
 * @enum {string}
 */
const preventDefaultValues = new Set(["all", "actions", "none"]);
/**
 * @readonly
 * @enum {string}
 */
const mouseCoordinatesValues = new Set(["all", "actions", "none"]);

/**
 * Manages inputs
 * @property {typeof InputMap} InputMap
 */
class InputIO {
  static get InputMap() {
    return InputMap;
  }

  /** @type {Element | null} */
  #target;
  /** @type {'all'|'actions'|'none'} */
  #preventDefault;
  /** @type {'default'|'standard'|'inverted-standard'|'inverted-default'} */
  #mouseCoordinates;

  /** @type {InputMap} */
  #inputMap;

  /** @type {InputHistory} */
  #inputHistory;

  /** @type {function} */
  #cleanup;

  /**
   * @param {Object} [options={}] - InputIO options.
   * @param {Element|string} [options.target] - An {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Element} or css selector to an Element to listen for inputs on.
   * @param {'all'|'actions'|'none'} [options.preventDefault="actions"] -
   * @param {'default'|'standard'|'inverted-standard'|'inverted-default'} [options.mouseCoordinates="default"] -
   * @param {InputMap} [options.inputMap] -
   * Determines which input events will have preventDefault called on them
   */
  constructor({ target, preventDefault, mouseCoordinates, inputMap } = {}) {
    this.#target = ((value) => {
      if (value == null) return null;
      if (value instanceof Element) return value;
      if (typeof value !== "string")
        throw new TypeError("target must be a string or HTMLElement");
      const target = document.querySelector(value);
      if (target == null)
        throw new Error("no element found for selector: " + value);
      return target;
    })(target);

    this.#preventDefault = ((value) => {
      if (typeof value === "undefined") return "actions";
      if (typeof value !== "string")
        throw new TypeError("preventDefault must be a string");
      if (!preventDefaultValues.has(value))
        throw new Error("invalid preventDefault value: " + value);
      return value;
    })(preventDefault);

    this.#mouseCoordinates = ((value) => {
      if (typeof value === "undefined") return "default";
      if (typeof value !== "string")
        throw new TypeError("mouseCoordinates must be a string");
      if (!mouseCoordinatesValues.has(value))
        throw new Error("invalid mouseCoordinates value: " + value);
      return value;
    })(mouseCoordinates);

    this.#inputMap = ((value) => {
      if (inputMap == null) return new InputMap();
      if (value instanceof InputMap) return inputMap;
      throw new TypeError("inputMap must be an InputMap");
    })(inputMap);

    this.#inputHistory = new InputHistory();

    {
      /** @param {boolean} hasAction */
      const shouldPreventDefault = (hasAction) => {
        if (this.#preventDefault === "all") return true;
        return this.#preventDefault === "actions" && hasAction;
      };

      /** @param {KeyboardEvent} e */
      const onKeyDown = (e) => {
        this.#inputHistory.getKeyHistory(e.code).update({ state: true });
        this.#inputMap[getActions]([e.code])
          .forEach((action) =>
            this.#inputHistory
              .getActionHistory(action)
              .update({ input: e.code, state: true })
          );
        if (shouldPreventDefault(this.#inputMap[keyHasAction](e.code))) e.preventDefault();
      };
      /** @param {KeyboardEvent} e */
      const onKeyUp = (e) => {
        this.#inputHistory.getKeyHistory(e.code).update({ state: false });
        this.#inputMap[getActions]([e.code])
          .forEach((action) =>
            this.#inputHistory
              .getActionHistory(action)
              .update({ input: e.code, state: false })
          );
        if (shouldPreventDefault(this.#inputMap[keyHasAction](e.code))) e.preventDefault();
      };
      /** @param {MouseEvent} e */
      const onMouseDown = (e) => {
        const button = MouseButtons.getButtons(e.button)[0];
        this.#inputHistory
          .getMouseButtonHistory(button)
          .update({ state: true });
        this.#inputMap[getActions](undefined, [e.button])
          .forEach((action) =>
            this.#inputHistory
              .getActionHistory(action)
              .update({ input: button, state: true })
          );
        if (shouldPreventDefault(this.#inputMap[buttonHasAction](e.button))) e.preventDefault();
      };
      /** @param {MouseEvent} e */
      const onMouseUp = (e) => {
        const button = MouseButtons.getButtons(e.button)[0];
        this.#inputHistory
          .getMouseButtonHistory(button)
          .update({ state: false });
        this.#inputMap[getActions](undefined, [e.button])
          .forEach((action) =>
            this.#inputHistory
              .getActionHistory(action)
              .update({ input: button, state: false })
          );
        if (shouldPreventDefault(this.#inputMap[buttonHasAction](e.button))) e.preventDefault();
      };
      /** @param {MouseEvent} e */
      const onMouseMove = (e) => {
        const dx = (() => {
          switch (this.#mouseCoordinates) {
          case "inverted-default":
          case "inverted-standard":
            return -e.movementX;
          default:
            return e.movementX;
          }
        })();
        const dy = (() => {
          switch (this.#mouseCoordinates) {
          case "inverted-default":
          case "standard":
            return -e.movementY;
          default:
            return e.movementY;
          }
        })();
        console.log(dx, dy);
        // if (state.config.defaultMouseCoordinates) {
        //   state.newInputFrame.setMousePosition(e.clientX, e.clientY);
        //   state.newInputFrame.addMouseMovement(e.movementX, e.movementY);
        // } else {
        //   state.newInputFrame.setMousePosition(
        //     e.clientX,
        //     innerHeight - e.clientY
        //   );
        //   state.newInputFrame.addMouseMovement(e.movementX, -e.movementY);
        // }
      };
      /** @param {WheelEvent} _e */
      const onMouseWheel = (_e) => {
        //state.newInputFrame.addMouseWheelMovement(-e.deltaY);
      };
      /** @param {MouseEvent} _e */
      const onMouseEnter = (_e) => {
        console.log("mouse enter");
      };
      /** @param {MouseEvent} _e */
      const onMouseLeave = (_e) => {
        console.log("mouse leave");
      };
      /** @param {FocusEvent} _e */
      const onBlur = (_e) => {
        //state.newInputFrame.clearInputs();
      };
      /** @param {FocusEvent} _e */
      const onFocus = (_e) => {
        //state.newInputFrame.clearInputs();
      };
      const onPointerLockChange = () => {
        if (this.#target === null) throw Error("no element to lock on");
        // state.newInputFrame.setMousePointerLocked(
        //   document.pointerLockElement === state.fullscreenLock
        // );
      };
      const onPointerLockError = () => {
        //state.newInputFrame.setMousePointerLocked(false);
      };
      /** @type {*} */
      const target = this.#target ? this.#target : window;
      target.addEventListener("keydown", onKeyDown, false);
      target.addEventListener("keyup", onKeyUp, false);
      target.addEventListener("mousedown", onMouseDown, false);
      target.addEventListener("mouseup", onMouseUp, false);
      target.addEventListener("mousemove", onMouseMove, false);
      target.addEventListener("wheel", onMouseWheel, false);
      target.addEventListener("mouseenter", onMouseEnter);
      target.addEventListener("mouseleave", onMouseLeave);
      target.addEventListener("blur", onBlur);
      target.addEventListener("focus", onFocus);
      document.addEventListener("pointerlockchange", onPointerLockChange);
      document.addEventListener("pointerlockerror", onPointerLockError);
      this.#cleanup = () => {
        target.removeEventListener("keydown", onKeyDown);
        target.removeEventListener("keyup", onKeyUp);
        target.removeEventListener("mousedown", onMouseDown);
        target.removeEventListener("mouseup", onMouseUp);
        target.removeEventListener("mousemove", onMouseMove);
        target.removeEventListener("wheel", onMouseWheel);
        target.removeEventListener("mouseenter", onMouseEnter);
        target.removeEventListener("mouseleave", onMouseLeave);
        target.removeEventListener("blur", onBlur);
        target.removeEventListener("focus", onFocus);
        document.removeEventListener("pointerlockchange", onPointerLockChange);
        document.removeEventListener("pointerlockerror", onPointerLockError);
      };
    }
  }

  get target() {
    return this.#target ?? window;
  }

  get preventDefault() {
    return this.#preventDefault;
  }

  set preventDefault(value) {
    if (typeof value !== "string")
      throw new TypeError("preventDefault must be a string");
    if (!preventDefaultValues.has(value))
      throw new Error("invalid preventDefault value: " + value);
    this.#preventDefault = value;
  }

  get mouseCoordinates() {
    return this.#mouseCoordinates;
  }

  set mouseCoordinates(value) {
    if (typeof value !== "string")
      throw new TypeError("mouseCoordinates must be a string");
    if (!mouseCoordinatesValues.has(value))
      throw new Error("invalid mouseCoordinates value: " + value);
    this.#mouseCoordinates = value;
  }

  get inputMap() {
    return this.#inputMap;
  }

  set inputMap(value) {
    if (!(value instanceof InputMap))
      throw new TypeError("inputMap must be an InputMap");
    this.#inputMap = value;
  }

  dispose() {
    this.#cleanup();
  }
}

export default InputIO;
