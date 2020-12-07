/**
 * Checks if a value is an array for strings
 * @param {*} value - value to check type of
 * @returns {Boolean}
 */
export const isStringArray = (value) =>
  Array.isArray(value) && value.every((str) => typeof str === "string");

export { default as Keys } from "./Keys";
export { default as MouseButtons } from "./MouseButtons";