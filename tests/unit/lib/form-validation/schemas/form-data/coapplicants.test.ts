import {
  mockCoapplicant,
  mockCoapplicants,
  mockContext
} from '$fixtures/form-data/coapplicants.fixture';

import schema from '$lib/form-validation/schemas/form-data/coapplicants.schema';

describe('coapplicants schema', () => {
  let payload;
  let context;
  function validate() {
    return schema.isValidSync(payload, { context });
  }
  beforeEach(() => {
    payload = mockCoapplicants();
    context = mockContext();
  });

  it('accepts minimum payload', () => {
    expect(validate()).toBe(true);
  });

  it('rejects coapplicants with same email address', () => {
    payload.coapplicants = [mockCoapplicant(), mockCoapplicant()];
    expect(validate()).toBe(false);

    payload.coapplicants[0].email = 'some-other@email.com';
    expect(validate()).toBe(true);
  });

  it('rejects coapplicants if application type is not primary', () => {
    payload.coapplicants = [mockCoapplicant()];
    context.applicationType = 'coapplicant';
    expect(validate()).toBe(false);

    payload.coapplicants = [];
    expect(validate()).toBe(true);
  });

  it('rejects coapplicants with no e-mail or if not an array', () => {
    payload.coapplicants = null;
    expect(validate()).toBe(false);

    payload.coapplicants = [mockCoapplicant()];
    payload.coapplicants[0].email = undefined;
    expect(validate()).toBe(false);
  });
});
