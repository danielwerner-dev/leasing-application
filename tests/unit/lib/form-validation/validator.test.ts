import {
  mockContext,
  mockFormData
} from '$fixtures/form-data/form-data.fixture';

import {
  validateFormData,
  validateSection
} from '$lib/form-validation/validator';

describe('validator', () => {
  let formData;
  let context;
  beforeEach(() => {
    formData = mockFormData();
    context = mockContext();
  });

  describe('validateFormData', () => {
    it('returns `true` for valid form data', () => {
      const res = validateFormData(formData, context);

      expect(res).toBe(true);
    });

    it('returns `false` when there are invalid sections', () => {
      formData.hello = { hello: 'world' };
      const res = validateFormData(formData, context);

      expect(res).toBe(false);
    });
  });

  describe('validateSection', () => {
    it('throws error for non-existent section', () => {
      expect(() => validateSection('hello', {}, {})).toThrow();
    });

    it('throws error for invalid data', () => {
      formData.general.firstName = '';
      expect(() => validateSection('general', formData.general, {})).toThrow();
    });

    it('throws error when no context is passed', () => {
      expect(() => validateSection('general', formData.general)).toThrow();
    });
  });
});
