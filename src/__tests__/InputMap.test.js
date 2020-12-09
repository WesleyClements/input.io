import InputMap from "../InputMap";

describe("InputMap", () => {
  it("should be constructable", () => {
    expect(new InputMap()).toBeInstanceOf(InputMap);
  });
  it("should have internal methods", () => {
    const map = new InputMap();
    expect(map).toHaveProperty("__internal");
    expect(map.__internal).toHaveProperty("getActions");
    expect(map.__internal).toHaveProperty("keyHasAction");
    expect(map.__internal).toHaveProperty("buttonHasAction");
  });
});
