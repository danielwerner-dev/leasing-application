import {
  mockResidenceSection,
  mockResidence
} from '$fixtures/form-data/residences.fixture';

import schema from '$lib/form-validation/schemas/form-data/residences.schema';

describe('residences schema', () => {
  describe('residences', () => {
    let payload;
    function validate() {
      return schema.isValidSync(payload, { abortEarly: false });
    }
    beforeEach(() => {
      payload = mockResidenceSection();
    });

    describe('national addresses', () => {
      it('accepts valid payload', () => {
        expect(validate()).toBe(true);
      });

      it('rejects payload with no address', () => {
        payload.currentResidence.addressLine1 = '';
        expect(validate()).toBe(false);
      });
      it('rejects payload with no city', () => {
        payload.currentResidence.city = '';
        expect(validate()).toBe(false);
      });
      it('rejects payload with no state', () => {
        payload.currentResidence.state = '';
        expect(validate()).toBe(false);
      });
      it('rejects payload with no zipcode', () => {
        payload.currentResidence.zipcode = '';
        expect(validate()).toBe(false);
      });
    });

    describe('international addresses', () => {
      it('requires only the address', () => {
        payload.currentResidence.isInternational = true;
        payload.currentResidence.addressLine1 = '';
        payload.currentResidence.city = '';
        payload.currentResidence.state = '';
        payload.currentResidence.zipcode = '';
        expect(validate()).toBe(false);

        payload.currentResidence.addressLine1 = '12 Main St';
        expect(validate()).toBe(true);
      });
    });

    describe('required residence period', () => {
      it('rejects period less then 36 month for residence', () => {
        payload.currentResidence.startDate = '09/09/2021';
        expect(validate()).toBe(false);
      });

      it('accepts payload when past residence has minimum period', () => {
        payload.currentResidence.startDate = '09/09/2021';
        payload.pastResidences = [mockResidence()];

        expect(validate()).toBe(true);
      });
    });

    describe('past residences', () => {
      it('rejects payload if past residences is undefined', () => {
        payload.currentResidence.startDate = '09/09/2021';
        payload.pastResidences = null;

        expect(validate()).toBe(false);
      });
    });
  });
});
