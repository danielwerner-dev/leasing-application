import {
  employmentMock,
  incomeMock,
  contextMock
} from '$fixtures/form-data/employment.fixture';

import schema from '$lib/form-validation/schemas/form-data/employment.schema';

describe('employment schema', () => {
  let payload;
  let context;
  function validate() {
    return schema.isValidSync(payload, { context });
  }
  beforeEach(() => {
    payload = employmentMock();
    context = contextMock();
  });

  it('accepts valid payload', () => {
    expect(validate()).toBe(true);
  });

  it('rejects invalid payload when employed', () => {
    payload.employmentStatus = 'employed';
    expect(validate()).toBe(false);

    payload.employment.employer = 'Umbrella Inc';
    payload.employment.phone = '1231231122';
    expect(validate()).toBe(true);
  });

  it('accepts international phone numbers', () => {
    payload.employmentStatus = 'employed';

    payload.employment.employer = 'Umbrella Inc. 2-0';
    payload.employment.phone = '+55149994833223';
    expect(validate()).toBe(true);
  });

  it('accepts international address', () => {
    payload.employment.isInternational = true;
    payload.employment.addressLine1 = 'Umbrella Inc.';

    expect(validate()).toBe(true);
  });

  it('rejects international address with more than 80 characters', () => {
    payload.employmentStatus = 'employed';
    payload.employment.isInternational = true;
    payload.employment.addressLine1 =
      'Umbrella Inc. Umbrella Inc. Umbrella Inc. Umbrella Inc. Umbrella Inc. Umbrella Inc. ';

    expect(validate()).toBe(false);
  });

  describe('additional income', () => {
    it('rejects invalid addtional income', () => {
      payload.additionalIncome = [incomeMock()];
      expect(validate()).toBe(true);
      payload.additionalIncome[0].source = '';
      expect(validate()).toBe(false);
    });
  });
});
