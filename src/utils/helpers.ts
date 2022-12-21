export const isArrayOfType = (test: any, type: any): boolean =>
  Array.isArray(test) && !test.some((value) => typeof value !== type);
