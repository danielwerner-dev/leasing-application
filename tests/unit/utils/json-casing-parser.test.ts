import * as util from '$lib/utils/json-casing-parser';

describe('JSON casing parser', () => {
  let camelCased;
  let snakeCased;
  beforeEach(() => {
    camelCased = {
      myProperty: {
        myString: 'hello_world',
        withNumber1: 'helloToo',
        myNestedProperty: [
          {
            myArrayNested: {
              finalField: true,
              theAboveLied: 'hello_worldCamel-one'
            }
          }
        ]
      }
    };

    snakeCased = {
      my_property: {
        my_string: 'hello_world',
        with_number_1: 'helloToo',
        my_nested_property: [
          {
            my_array_nested: {
              final_field: true,
              the_above_lied: 'hello_worldCamel-one'
            }
          }
        ]
      }
    };
  });

  describe('Parse from camelCase to snakeCase', () => {
    it('should convert JSON from camel case to snake case', () => {
      const parsed = util.jsonCasingParser(
        camelCased,
        util.CasingPattern.SNAKE
      );

      expect(parsed).toEqual(snakeCased);
    });
  });

  describe('Parse from snakeCase to camelCase', () => {
    it('should convert JSON from snake case to camel case', () => {
      const parsed = util.jsonCasingParser(
        snakeCased,
        util.CasingPattern.CAMEL
      );

      expect(parsed).toEqual(camelCased);
    });
  });

  describe('Does not parse if casing type does not match', () => {
    it('should not convert JSON is CasingType does not exist', () => {
      const resSnake = util.jsonCasingParser(snakeCased, undefined as any);
      const resCamel = util.jsonCasingParser(camelCased, undefined as any);

      expect(resSnake).toEqual(snakeCased);
      expect(resCamel).toEqual(camelCased);
    });
  });
});
