import InputMap from "../InputMap";
describe("InputMap", () => {
  it("should be constructable", () => {
    expect(new InputMap()).toBeInstanceOf(InputMap);
  });

  describe("this.add()", () => {
    it("throws a TypeError if any argument is not an object", () => {
      const map = new InputMap();
      expect(() => map.add("hey")).toThrow(TypeError);
    });

    it("throws a TypeError if any mapping has an action that is null or undefined", () => {
      const map = new InputMap();
      expect(() => map.add({})).toThrow(TypeError);
      expect(() => map.add({ action: undefined })).toThrow(TypeError);
      expect(() => map.add({ action: null })).toThrow(TypeError);
    });

    it("throws an Error in any mapping does not have any inputs", () => {
      const map = new InputMap();
      expect(() => map.add({ action: "up" })).toThrow(Error);
      [undefined, null, []].forEach((inputs) =>
        expect(() => {
          map.add({ action: "up", inputs });
        }).toThrow(Error)
      );
    });

    it("adding a valid mapping adds it's action to this.actions", () => {
      const map = new InputMap();
      const mapping = {
        action: "up",
        inputs: ["w", "up", "left button"],
      };
      map.add(mapping);
      expect(map.actions.has(mapping.action)).toBe(true);
    });

    it("adding a valid mapping adds is able to be retrieved with this.getMapping", () => {
      const map = new InputMap();
      const mapping = {
        action: "up",
        inputs: ["w", "up", "left button"],
      };
      map.add(mapping);
      const result = map.getMapping(mapping.action);
      expect(result).toHaveProperty("action", mapping.action);
      expect(result).toHaveProperty(
        "inputs",
        expect.arrayContaining(mapping.inputs)
      );
    });
  });
  describe("this.remove()", () => {
    it("removing a mapping action should not be included in the actions property", () => {
      const map = new InputMap();
      map.add({ action: "up", inputs: ["w", "up", "left button"] });
      map.remove("up");
      expect(map.actions.has("up")).toBe(false);
    });
  });
});
