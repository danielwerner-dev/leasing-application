import { applicationFixture } from '$fixtures';
import * as utils from '$lib/utils/payment-amount';

describe('Payment amount tests', () => {
  describe('getApplicantFee', () => {
    it('returns 45 when marketSlug is california', () => {
      const res = utils.getApplicantFee('los-angeles-ca');

      expect(res).toEqual(45);

      const res2 = utils.getApplicantFee('sacramento-ca');

      expect(res2).toEqual(45);
    });

    it('returns 50 when marketSlug is not california', () => {
      const res = utils.getApplicantFee('not-california');

      expect(res).toEqual(50);
    });
  });

  describe('calulatePaymentAmount', () => {
    it('returns the product of an array length and applicantFee', () => {
      const res = utils.calculatePaymentAmount(20, ['hello', 'world']);

      expect(res).toEqual(40);
    });
  });

  describe('validatePaymentAmount', () => {
    let applicants: any;
    let amountPaid: any;
    let application: any;
    for (const marketSlug of ['los-angeles-ca', 'sacramento-ca']) {
      beforeEach(() => {
        applicants = ['hello', 'world'];
        amountPaid = 90;
        application = applicationFixture();
      });

      it('does not throw error if amount paid is correct', () => {
        expect(() =>
          utils.validatePaymentAmount(
            marketSlug,
            applicants,
            amountPaid,
            application
          )
        ).not.toThrow();
      });

      it('throws error if applicants is an empty array', () => {
        applicants = [];
        amountPaid = 0;
        application.integrationData.yardi = {
          guestcardId: 'p151515',
          applicantId: 'p151515'
        };
        expect(() =>
          utils.validatePaymentAmount(
            marketSlug,
            applicants,
            amountPaid,
            application
          )
        ).toThrowError(
          `No applicants selected to pay. Application: ${application.applicationId}`
        );
      });

      it('throws error if amount paid is incorrect', () => {
        amountPaid = 50;
        expect(() =>
          utils.validatePaymentAmount(
            marketSlug,
            applicants,
            amountPaid,
            application
          )
        ).toThrowError(
          `Invalid paid amount. Expected: 90. Received: ${amountPaid} Application id: ${application.applicationId}`
        );
      });

      it('returns void if application has defined paidById field', () => {
        application.paidById = '1234';
        const res = utils.validatePaymentAmount(
          marketSlug,
          applicants,
          amountPaid,
          application
        );

        expect(res).toBe(undefined);
      });
    }
  });
});
