const codeToButtons = new Map([
  [0, ["button1", "left"]],
  [1, ["button2", "middle"]],
  [2, ["button3", "right"]],
  [3, ["button4"]],
  [4, ["button5"]],
  [5, ["button6"]],
  [6, ["button7"]],
  [7, ["button8"]],
  [8, ["button9"]],
  [9, ["button10"]],
  [10, ["button11"]],
  [11, ["button12"]],
  [12, ["button13"]],
  [13, ["button14"]],
  [14, ["button15"]],
]);

/** @type {Map<String,Number[]>} */
const buttonToCodes = [...codeToButtons].reduce(
  (map, [code, buttons]) =>
    buttons.reduce((map, button) => {
      if (!map.has(button)) map.set(button, [code]);
      else map.get(button).push(code);
      return map;
    }, map),
  new Map()
);

export default {
  /**
   * Returns the buttons associated with a code
   * @param {Number} code
   * @returns {String[]}
   */
  getButtons(code) {
    const buttons = codeToButtons.get(code);
    return buttons ? Array.from(buttons) : [];
  },
  /**
   * Returns the codes associated with a button
   * @param {String} button
   * @returns {Number[]}
   */
  getCodes(button) {
    const codes = buttonToCodes.get(button);
    return codes ? Array.from(codes) : [];
  },
};
