import { applicationFixture } from '$fixtures';
import * as schema from '$lib/form-validation/schemas/yardi.schema';

describe('Yardi schema tests', () => {
  describe('applicationForYardi', () => {
    let application: any;
    beforeEach(() => {
      application = applicationFixture();
    });
    it('does not throw for valid application', () => {
      expect(() =>
        schema.applicationForYardi.validateSync(application)
      ).not.toThrow();
    });

    it('throws for invalid application', () => {
      application.customer = null;
      application.property = 'hello world';

      expect(() =>
        schema.applicationForYardi.validateSync(application)
      ).toThrow();
    });
  });
});
