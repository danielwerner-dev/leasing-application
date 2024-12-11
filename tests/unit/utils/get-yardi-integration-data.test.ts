import { Application, ApplicationType } from '$lib/types/Application.types';
import getYardiIntegrationData from '$lib/utils/get-yardi-integration-data';
import { applicationFixture } from '../../fixtures';

describe('Get Yardi Integraton Data tests', () => {
  let application: Application;
  const expectedIntegrationData = {
    applicantId: 'p151515',
    guestcardId: 'p151515',
    paymentInfo: {
      description: 'description',
      payerId: '1234',
      paymentType: 'CREDIT'
    }
  };

  beforeAll(() => {
    application = applicationFixture();
  });

  it('gets the yardi integration data for a primary applicant', () => {
    expect(application.applicationType).toBe(ApplicationType.primary);
    const yardiIntegrationData = getYardiIntegrationData(application);
    expect(yardiIntegrationData).toStrictEqual(expectedIntegrationData);
  });

  it('gets the yardi integration data for a coapplicant applicant that has not paid', () => {
    application.applicationType = ApplicationType.coapplicant;
    expect(application.applicationType).toBe(ApplicationType.coapplicant);
    const yardiIntegrationData = getYardiIntegrationData(application);
    expect(yardiIntegrationData).toStrictEqual(expectedIntegrationData);
  });

  it('gets the yardi integration data for a coapplicant applicant that has been paid for and paying for other coapplicant', () => {
    application.applicationType = ApplicationType.coapplicant;
    application.paidById = '1234';
    expect(application.applicationType).toBe(ApplicationType.coapplicant);
    const yardiIntegrationData = getYardiIntegrationData(application);
    expect(yardiIntegrationData).toStrictEqual(expectedIntegrationData);
  });

  it('gets the yardi integration data for a coapplicant applicant that has been paid for', () => {
    application.applicationType = ApplicationType.coapplicant;
    application.paidById = '1234';
    application.integrationData.yardi = {
      guestcardId: 'p151515',
      applicantId: 'p151515'
    };
    const emptyExpectedData = {
      paymentInfo: {
        paymentType: '',
        payerId: ''
      }
    };
    expect(application.applicationType).toBe(ApplicationType.coapplicant);
    const yardiIntegrationData = getYardiIntegrationData(application);
    expect(yardiIntegrationData).toStrictEqual(emptyExpectedData);
  });
});
