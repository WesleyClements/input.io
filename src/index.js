if (typeof window === "undefined")
  throw new Error("input.io only works in the browser");

import InputMap, { keyHasAction, buttonHasAction } from "./InputMap";

/**
 * Manages inputs
 * @property {typeof InputMap} InputMap
 */
class InputIO {
  static get InputMap() {
    return InputMap;
  }

  /** @type {HTMLElement | null} */
  #target;
  /** @type {'all'|'action'|'none'} */
  #preventDefault;

  /** @type {InputMap} */
  #inputMap;

  /** @type {function | undefined} */
  #cleanup;

  /**
   * @param {Object} [options={}] - InputIO options.
   * @param {HTMLElement} [options.target] - Determines the {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement|HTMLElement} lo listen for inputs on
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget|EventTarget} on which to listen for input events.
   * @param {'all'|'action'|'none'} [options.preventDefault="action"] -
   * @param {InputMap} [options.inputMap] -
   * Determines which input events will have preventDefault called on them
   */
  constructor({ target, preventDefault, inputMap } = {}) {
    this.#target = target ?? null;
    this.#preventDefault = preventDefault ?? "action";
    this.#inputMap = inputMap ?? new InputMap();
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
    if (!["all", "action", "none"].includes(value))
      throw new Error("invalid preventDefault value: " + value);
    this.#preventDefault = value;
  }

  get inputMap() {
    return this.#inputMap;
  }

  set inputMap(value) {
    if (!(value instanceof InputMap))
      throw new TypeError("inputMap must be an InputMap");
    this.#inputMap = value;
  }

  init() {
    this.#cleanup?.();
    /** @type {*} */
    const state = {};
    /** @param {KeyboardEvent} e */
    const onKeyDown = (e) => {
      state.newInputFrame.setKeyState(e.code, true);
      switch (this.#preventDefault) {
        case "action":
          if (!this.#inputMap[keyHasAction](e.code)) return;
        case "all":
          e.preventDefault();
      }
    };
    /** @param {KeyboardEvent} e */
    const onKeyUp = (e) => {
      state.newInputFrame.setKeyState(e.code, false);
      switch (this.#preventDefault) {
        case "action":
          if (!this.#inputMap[keyHasAction](e.code)) return;
        case "all":
          e.preventDefault();
      }
    };
    /** @param {MouseEvent} e */
    const onMouseDown = (e) => {
      state.newInputFrame.setMouseButtonState(e.button, true);
      switch (this.#preventDefault) {
        case "action":
          if (!this.#inputMap[buttonHasAction](e.button)) return;
        case "all":
          e.preventDefault();
      }
    };
    /** @param {MouseEvent} e */
    const onMouseUp = (e) => {
      state.newInputFrame.setMouseButtonState(e.button, false);
      switch (this.#preventDefault) {
        case "action":
          if (!this.#inputMap[buttonHasAction](e.button)) return;
        case "all":
          e.preventDefault();
      }
    };
    /** @param {MouseEvent} e */
    const onMouseMove = (e) => {
      if (state.config.defaultMouseCoordinates) {
        state.newInputFrame.setMousePosition(e.clientX, e.clientY);
        state.newInputFrame.addMouseMovement(e.movementX, e.movementY);
      } else {
        state.newInputFrame.setMousePosition(
          e.clientX,
          innerHeight - e.clientY
        );
        state.newInputFrame.addMouseMovement(e.movementX, -e.movementY);
      }
    };
    /** @param {WheelEvent} e */
    const onMouseWheel = (e) =>
      state.newInputFrame.addMouseWheelMovement(-e.deltaY);
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
      state.newInputFrame.clearInputs();
    };
    /** @param {FocusEvent} _e */
    const onFocus = (_e) => {
      state.newInputFrame.clearInputs();
    };
    const onPointerLockChange = () => {
      if (this.#target === null) throw Error("no element to lock on");
      state.newInputFrame.setMousePointerLocked(
        document.pointerLockElement === state.fullscreenLock
      );
    };
    const onPointerLockError = () => {
      state.newInputFrame.setMousePointerLocked(false);
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", onMouseWheel);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("pointerlockerror", onPointerLockError);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }

  dispose() {
    this.#cleanup?.();
  }
}

export default InputIO;
