import dayjs from 'dayjs';

import schema from '$lib/form-validation/schemas/form-data/personal-details.schema';

import {
  personalDetailsMock,
  getOptions,
  animalMock,
  vehicleMock,
  dependentMock
} from '$fixtures/form-data/personal-details.fixture';

describe('personal details schema', () => {
  let payload;
  let options;
  function validate() {
    return schema.isValidSync(payload, options);
  }

  beforeEach(() => {
    payload = personalDetailsMock();
    options = getOptions();
  });

  it('accepts minimum valid payload', () => {
    expect(validate()).toBe(true);
  });

  describe('date of birth', () => {
    const eighteenAge = dayjs().subtract(18, 'year');
    it('accepts payload with older than 18', () => {
      payload.dateOfBirth = eighteenAge.subtract(1, 'day').format('MM/DD/YYYY');

      expect(validate()).toBe(true);
    });

    it('accespts payload with age exactly 18', () => {
      payload.dateOfBirth = eighteenAge.format('MM/DD/YYYY');

      expect(validate()).toBe(true);
    });

    it('rejects payload with under 18 age', () => {
      payload.dateOfBirth = eighteenAge.add(1, 'day').format('MM/DD/YYYY');

      expect(validate()).toBe(false);
    });
  });

  describe('id document', () => {
    it('accepts ssn with correct format', () => {
      payload.idDocument = { type: 'ssn', number: '123456789' };
      expect(validate()).toBe(true);
    });

    it('rejects ssn without correct format', () => {
      payload.idDocument = { type: 'ssn', number: '1234' };
      expect(validate()).toBe(false);

      payload.idDocument = { type: 'ssn', number: 'abcdefghi' };
      expect(validate()).toBe(false);
    });

    it('accepts ein with correct format', () => {
      payload.idDocument = { type: 'ein', number: '123456789' };
      expect(validate()).toBe(true);
    });

    it('rejects ein without correct format', () => {
      payload.idDocument = { type: 'ein', number: '1234' };
      expect(validate()).toBe(false);

      payload.idDocument = { type: 'ein', number: 'abcdefghi' };
      expect(validate()).toBe(false);
    });
  });

  describe('animals', () => {
    it('accepts animal with value payload', () => {
      const animal = {
        animalType: '',
        breed: '',
        weight: '',
        name: '',
        serviceAnimal: '',
        id: ''
      };

      payload.animals = [animal];
      expect(validate()).toBe(false);

      payload.animals = [animalMock()];
      expect(validate()).toBe(true);
    });
  });

  describe('vehicles', () => {
    it('accepts vehicle with valid payload', () => {
      const vehicle = {
        make: '',
        model: '',
        color: '',
        license: ''
      };

      payload.vehicles = [vehicle];
      expect(validate()).toBe(false);

      payload.vehicles = [vehicleMock()];
      expect(validate()).toBe(true);
    });
  });

  describe('dependents', () => {
    it('accepts dependent with valid payload', () => {
      const dependent = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        id: ''
      };

      payload.dependents = [dependent];
      expect(validate()).toBe(false);

      payload.dependents = [dependentMock()];
      expect(validate()).toBe(true);
    });
  });

  describe('background info', () => {
    it('requires background info when `backgroundInfo` is true', () => {
      payload.backgroundInfo = true;
      expect(validate()).toBe(false);

      payload.felony = false;
      payload.evicted = false;
      payload.bankruptcy = false;
      payload.pendingCharges = false;
      expect(validate()).toBe(true);
    });

    it('requires background info when market is South Florida', () => {
      options.context.market = 'miami-fl';
      const { backgroundInfo, ...rest } = payload;
      payload = { ...rest };
      expect(validate()).toBe(false);

      payload.felony = false;
      payload.evicted = false;
      payload.bankruptcy = false;
      payload.pendingCharges = false;
      expect(validate()).toBe(true);
    });

    it('requires `hasReviewedBackgroundInfo` when one of the info is `true`', () => {
      payload.backgroundInfo = true;
      payload.evicted = true;
      payload.felony = false;
      payload.bankruptcy = false;
      payload.pendingCharges = false;
      expect(validate()).toBe(false);

      payload.hasReviewedBackgroundPolicy = false;
      expect(validate()).toBe(false);

      payload.hasReviewedBackgroundPolicy = true;
      expect(validate()).toBe(true);
    });
  });

  describe('accepted terms and reviewed provided info', () => {
    it('rejects payload without accpted terms or with it as false', () => {
      payload.acceptedTerms = undefined;
      expect(validate()).toBe(false);

      payload.acceptedTerms = false;
      expect(validate()).toBe(false);
    });

    it('rejects payload without reviewedProvidedInfo or with it as false', () => {
      payload.reviewedProvidedInfo = undefined;
      expect(validate()).toBe(false);

      payload.reviewedProvidedInfo = false;
      expect(validate()).toBe(false);
    });
  });
});
