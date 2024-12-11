import { applicationFixture } from '$fixtures';
import { validatePaymentData } from '$lib/utils/validate-payment-data';
describe('Validate payment data', () => {
  let application;
  let applicantsToPay;

  beforeEach(() => {
    application = applicationFixture();
    applicantsToPay = [application.customer.email];
  });

  it('throws an error when applicant is paid for, paying for coapplicant, and does not have a paymentMethod', () => {
    application.integrationData.yardi = {
      guestcardId: 'p151515',
      applicantId: 'p151515'
    };
    application.paidById = '1234';
    applicantsToPay = ['somecoapp@gmail.com'];

    expect(() =>
      validatePaymentData(application, applicantsToPay)
    ).toThrowError(
      `Payment data is not valid to process. Application id: ${application.applicationId}`
    );
  });

  it('throws an error when applicant is NOT paid for and does NOT have a paymentMethod', () => {
    application.integrationData.yardi = {
      guestcardId: 'p151515',
      applicantId: 'p151515'
    };
    application.paidById = '';

    expect(() =>
      validatePaymentData(application, applicantsToPay)
    ).toThrowError(
      `Payment data is not valid to process. Application id: ${application.applicationId}`
    );
  });

  it('throws when applicant is NOT paid for and applicantsToPay does not contain applicant email', () => {
    application.paidById = '';
    applicantsToPay = ['me@gmail.com'];
    expect(() =>
      validatePaymentData(application, applicantsToPay)
    ).toThrowError(
      `Payment data is not valid to process. Applicant must pay for themselves. Application id: ${application.applicationId}`
    );
  });

  it('throws when applicant is NOT paid for and applicantsToPay is empty', () => {
    application.paidById = '';
    applicantsToPay = [];
    expect(() =>
      validatePaymentData(application, applicantsToPay)
    ).toThrowError(
      `Payment data is not valid to process. Applicant must pay for themselves. Application id: ${application.applicationId}`
    );
  });
});
