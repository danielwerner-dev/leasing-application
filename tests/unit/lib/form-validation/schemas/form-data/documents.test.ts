import schema from '$lib/form-validation/schemas/form-data/documents.schema';

describe('documents schema', () => {
  it('accepts a valid payload', () => {
    expect(schema.isValidSync({ noIncome: true })).toBe(true);
    expect(schema.isValidSync({ noIncome: false })).toBe(true);
    expect(schema.isValidSync({ noIncome: null })).toBe(false);
    expect(schema.isValidSync({})).toBe(false);
  });
});
