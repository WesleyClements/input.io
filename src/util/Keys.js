const codeToKeys = new Map([
  ["Semicolon", [";"]],
  ["Equal", ["="]],
  ["Comma", [","]],
  ["Minus", ["-"]],
  ["Period", ["."]],
  ["Slash", ["/"]],
  ["Backquote", ["`"]],
  ["BracketLeft", ["["]],
  ["Backslash", ["\\"]],
  ["BracketLeft", ["]"]],
  ["Quote", ["'"]],
  ["Escape", ["escape", "esc"]],
  ["Tab", ["tab"]],
  ["Backspace", ["backspace"]],
  ["Enter", ["enter", "return"]],
  ["ShiftLeft", ["shift", "⇧", "left shift"]],
  ["ShiftRight", ["shift", "⇧", "right shift"]],
  [
    "ControlLeft",
    ["control", "ctrl", "ctl", "left control", "left ctrl", "left ctl"],
  ],
  [
    "ControlRight",
    ["control", "ctrl", "ctl", "right control", "right ctrl", "right ctl"],
  ],
  ["AltLeft", ["alt", "option", "⌥", "left alt", "left option"]],
  ["AltRight", ["alt", "option", "⌥", "right alt", "right option"]],
  ["CapsLock", ["caps lock", "capslock", "capslk", "caps"]],
  ["Space", ["spacebar", "space", "spc"]],
  ["PrintScreen", ["print screen", "prntscr", "prtsc"]],
  ["ScrollLock", ["scroll lock", "scrlk"]],
  ["Pause", ["pause", "break", "pause/break"]],
  ["Insert", ["insert", "ins"]],
  ["Delete", ["delete", "del"]],
  ["Home", ["home"]],
  ["End", ["end"]],
  ["PageUp", ["page up", "pgup"]],
  ["PageDown", ["page down", "pgdn"]],
  ["ArrowUp", ["up"]],
  ["ArrowDown", ["down"]],
  ["ArrowLeft", ["left"]],
  ["ArrowRight", ["right"]],
  ["NumLock", ["num lock"]],
  ["NumpadMultiply", ["numpad *", "num *"]],
  ["NumpadAdd", ["numpad +", "num +"]],
  ["NumpadSubtract", ["numpad -", "num -"]],
  ["NumpadDecimal", ["numpad .", "num ."]],
  ["NumpadDivide", ["numpad /", "num /"]],
  ["NumpadEnter", ["numpad enter", "numpad return", "num enter", "num return"]],
  ["MetaLeft", ["command", "cmd", "⌘", "windows", "left command", "left cmd"]],
  [
    "MetaRight",
    ["command", "cmd", "⌘", "windows", "right command", "right cmd"],
  ],
  ["OSLeft", ["command", "cmd", "⌘", "windows", "left command", "left cmd"]],
  ["OSRight", ["command", "cmd", "⌘", "windows", "right command", "right cmd"]],
  ["ContextMenu", ["context menu", "menu"]],
]);

// lowercase letters
for (let i = 65; i <= 90; i++) {
  const letter = String.fromCharCode(i + 32);
  codeToKeys.set(`Key${letter.toUpperCase()}`, [letter]);
}
// numbers
for (let i = 0; i <= 9; i++) codeToKeys.set(`Digit${i}`, [i.toString()]);
// numpad keys
for (let i = 0; i <= 9; i++)
  codeToKeys.set(`Numpad${i}`, [`numpad ${i}`, `num ${i}`]);
// function keys
for (let i = 1; i <= 24; i++) codeToKeys.set(`F${i}`, [`f${i}`]);

/** @type {Map<String,String[]>} */
const keyToCodes = [...codeToKeys].reduce(
  (map, [code, keys]) =>
    keys.reduce((map, key) => {
      if (!map.has(key)) map.set(key, [code]);
      else map.get(key).push(code);
      return map;
    }, map),
  new Map()
);

export default {
  /**
   * Returns the keys associated with a code
   * @param {String} code
   * @returns {String[]}
   */
  getKeys(code) {
    const keys = codeToKeys.get(code);
    return keys ? Array.from(keys) : [];
  },
  /**
   * Returns the codes associated with a key
   * @param {String} key
   * @returns {String[]}
   */
  getCodes(key) {
    const codes = keyToCodes.get(key);
    return codes ? Array.from(codes) : [];
  },
};
