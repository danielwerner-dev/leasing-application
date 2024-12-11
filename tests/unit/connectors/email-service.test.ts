import * as connector from '$lib/connectors/email-service';
import {
  EmailTemplateParameters,
  EmailTemplates
} from '$lib/types/email-delivery-service.types';
jest.mock('@invitation-homes/iam-axios', () => {
  return () => {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
  };
});
describe('Email service connector', () => {
  describe('sendEmail', () => {
    let emailTemplateParameters: EmailTemplateParameters[];
    beforeEach(() => {
      emailTemplateParameters = [
        { key: 'coapplicantName', value: 'Morty Smith' }
      ];
    });

    it('calls iamAxios post with the template parameters', async () => {
      jest
        .spyOn(connector.iamAxios, 'post')
        .mockResolvedValue({ data: { messageId: 'success' } } as any);
      await connector.sendEmail(
        EmailTemplates.COAPPLICANT_INVITATION,
        'rick@rickandmorty.com',
        emailTemplateParameters
      );

      expect(connector.iamAxios.post).toHaveBeenCalled();
    });
  });
});
