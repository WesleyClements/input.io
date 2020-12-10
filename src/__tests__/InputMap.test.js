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

    it("throws an Error in any mapping does not have any keys or mouseButtons", () => {
      const map = new InputMap();
      expect(() => map.add({ action: "up" })).toThrow(Error);
      const valueGenerators = [() => undefined, () => null, () => []];
      valueGenerators.forEach((generator) =>
        expect(() => {
          map.add({ action: "up", keys: generator() });
        }).toThrow(Error)
      );
      valueGenerators.forEach((generator) =>
        expect(() => {
          map.add({ action: "up", mouseButtons: generator() });
        }).toThrow(Error)
      );
      valueGenerators.forEach((generator1) =>
        valueGenerators.forEach((generator2) =>
          expect(() => {
            map.add({
              action: "up",
              keys: generator1(),
              mouseButtons: generator2(),
            });
          }).toThrow(Error)
        )
      );
    });

    it("throws a TypeError if any mapping has an invalid key or mouseButton", () => {
      const map = new InputMap();
      expect(() => map.add({ action: "up", keys: [20] })).toThrow(TypeError);
      expect(() => map.add({ action: "up", mouseButtons: [20] })).toThrow(
        TypeError
      );
      expect(() =>
        map.add({ action: "up", keys: [20], mouseButtons: [20] })
      ).toThrow(TypeError);
    });
  });

  it("adding a valid mapping adds it's action to this.actions", () => {
    const map = new InputMap();
    const mapping = {
      action: "up",
      keys: ["w", "up"],
      mouseButtons: ["left"],
    };
    map.add(mapping);
    expect(map.actions.has(mapping.action)).toBe(true);
  });

  it("adding a valid mapping adds is able to be retrieved with this.getMapping", () => {
    const map = new InputMap();
    const mapping = {
      action: "up",
      keys: ["w", "up"],
      mouseButtons: ["left"],
    };
    map.add(mapping);
    const result = map.getMapping(mapping.action);
    expect(result).toHaveProperty("keys", expect.arrayContaining(mapping.keys));
    expect(result).toHaveProperty(
      "mouseButtons",
      expect.arrayContaining(mapping.mouseButtons)
    );
  });
  describe("this.remove()", () => {
    it("removing a mapping action should not be included in the actions property", () => {
      const map = new InputMap();
      map.add({ action: "up", keys: ["w", "up"] });
      map.remove("up");
      expect(map.actions.has("up")).toBe(false);
    });
  });
});
