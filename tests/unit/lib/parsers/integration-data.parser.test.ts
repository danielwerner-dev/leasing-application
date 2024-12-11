import { parseToDB } from '$lib/parsers/repositories/integration-data.parser';
import { PaymentType } from '$lib/types/Application.types';

describe('Integration-data parser', () => {
  it('should parse integration data and remove guestcard and applicant', () => {
    const integrationData = {
      yardi: {
        guestcardId: '1234',
        applicantId: '5678',
        awaitingPaymentInfo: true,
        paymentInfo: {
          payerId: '1234',
          description: 'Mastercard',
          paymentType: PaymentType.CREDIT
        }
      }
    };
    const parsedIntegrationData = parseToDB(integrationData);

    expect(parsedIntegrationData).toEqual({
      yardi: {
        awaitingPaymentInfo: true,
        paymentInfo: {
          payerId: '1234',
          description: 'Mastercard',
          paymentType: PaymentType.CREDIT
        }
      }
    });
    expect(integrationData.yardi.guestcardId).toBe('1234');
    expect(integrationData.yardi.applicantId).toBe('5678');
  });

  it('Parses if yardi integration data is not provided', () => {
    const integrationData = {};

    const parsedIntegrationData = parseToDB(integrationData);

    expect(parsedIntegrationData).toEqual({});
  });
});
