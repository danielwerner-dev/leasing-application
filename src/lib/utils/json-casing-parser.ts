const JSON_VARIABLE_PATTERN = /"\w+":/;
const CAMEL_CASE_PATTERN = /[a-z]+[A-Z0-9]/;
const SNAKE_CASE_PATTERN = /[a-z]_[a-z0-9]/;

export enum CasingPattern {
  SNAKE,
  CAMEL
}

export const toSnakeCase = (camelCased: string) => {
  const replaced = camelCased.replace(
    new RegExp(CAMEL_CASE_PATTERN, 'g'),
    (match) => {
      const arr = match.split('');
      const last = arr.pop();
      const parsed = arr.join('') + '_' + last?.toLowerCase();
      return parsed;
    }
  );

  return replaced;
};

export const toCamelCase = (snakeCased: string) => {
  const replaced = snakeCased.replace(
    new RegExp(SNAKE_CASE_PATTERN, 'g'),
    (match) => {
      const [lastLetter, firstLetter] = match.split('_');
      const capitalize = firstLetter.toUpperCase();
      return lastLetter + capitalize;
    }
  );

  return replaced;
};

export const jsonCasingParser = (
  jsonPayload: unknown,
  targetPattern: CasingPattern
) => {
  const isString = typeof jsonPayload === 'string';
  const stringified = isString ? jsonPayload : JSON.stringify(jsonPayload);

  const replaced = stringified.replace(
    new RegExp(JSON_VARIABLE_PATTERN, 'g'),
    (match) => {
      if (targetPattern === CasingPattern.SNAKE) {
        return toSnakeCase(match);
      }

      if (targetPattern === CasingPattern.CAMEL) {
        return toCamelCase(match);
      }

      return match;
    }
  );

  if (isString) {
    return replaced;
  }

  const parsed = JSON.parse(replaced);

  return parsed;
};
