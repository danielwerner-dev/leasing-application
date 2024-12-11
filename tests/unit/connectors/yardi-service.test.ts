import { applicationFixture } from '$fixtures';
import {
  yardiApplicantFixture,
  yardiCoapplicantFixture
} from '$fixtures/yardi-service/submission';
import * as connector from '$lib/connectors/yardi-service';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';

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

describe('Yardi Service connector', () => {
  beforeEach(() => {
    jest.spyOn(connector.iamAxios, 'post').mockResolvedValue({ data: 'test' });
    jest.spyOn(connector.iamAxios, 'get').mockResolvedValue({ data: 'test' });
    jest.spyOn(connector.iamAxios, 'put').mockResolvedValue({ data: 'test' });
  });

  describe('createGuestCard', () => {
    it('calls iamAxios post with guestcard', async () => {
      const expectedPath = '/properties/1234/guestcards';
      const expectedReturn = 'test';

      const data = await connector.createGuestCard('1234', 'guestcard' as any);

      expect(data).toEqual(expectedReturn);
      expect(connector.iamAxios.post).toHaveBeenCalledWith(
        expectedPath,
        'guestcard'
      );
    });
  });

  describe('getGuestcardStatus', () => {
    it('calls iamAxios get with guestcard', async () => {
      jest
        .spyOn(connector.iamAxios, 'get')
        .mockResolvedValue({ data: { status: 'pending' } });
      const guestcardId = 'p1515548';
      const propertyCode = '10000784';
      const expectedPath = `/properties/${propertyCode}/guestcards/${guestcardId}`;

      const data = await connector.getGuestcardStatus(
        guestcardId,
        propertyCode
      );

      expect(connector.iamAxios.get).toHaveBeenCalledWith(expectedPath);
      expect(data).toEqual('pending');
    });

    it('throws if received status is invalid', async () => {
      jest
        .spyOn(connector.iamAxios, 'get')
        .mockResolvedValue({ data: { status: 'whatever' } });
      const guestcardId = 'p1515548';
      const propertyCode = '10000784';
      const expectedPath = `/properties/${propertyCode}/guestcards/${guestcardId}`;

      await expect(
        connector.getGuestcardStatus(guestcardId, propertyCode)
      ).rejects.toThrow();

      expect(connector.iamAxios.get).toHaveBeenCalledWith(expectedPath);
    });
  });

  describe('getPaymentTypes', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();
    });

    it('calls yardi-service with correct parameters', async () => {
      application.integrationData.yardi = {
        applicantId: 'applicant-id',
        guestcardId: 'guestcard-id'
      };
      application.property.propertyCode = 'property-code';
      const path = `/properties/${application.property.propertyCode}/guestcards/guestcard-id/applicants/applicant-id/payment-types`;
      const res = await connector.getPaymentTypes(application);

      expect(res).toEqual('test');
      expect(connector.iamAxios.get).toHaveBeenCalledWith(path);
    });

    it("throws if there's no Yardi info", async () => {
      const { applicationId } = application;
      application.integrationData.yardi = null;

      await expect(connector.getPaymentTypes(application)).rejects.toThrowError(
        `[Application ${applicationId}] Missing Yardi info.`
      );
      expect(connector.iamAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('postCoapplicant', () => {
    let guestCardId: any;
    let coapplicant: any;
    beforeEach(() => {
      coapplicant = yardiCoapplicantFixture();
      guestCardId = 'guestcard-test-id';

      jest
        .spyOn(connector.iamAxios, 'post')
        .mockResolvedValue({ data: 'success' } as any);
    });

    it('returns if parameters are correct', async () => {
      coapplicant = jsonCasingParser(coapplicant, CasingPattern.SNAKE);
      const res = await connector.postCoapplicant(
        '1234',
        guestCardId,
        coapplicant
      );

      expect(res).toEqual('success');
      expect(connector.iamAxios.post).toHaveBeenCalledWith(
        `/properties/1234/guestcards/${guestCardId}/applicants`,
        coapplicant
      );
    });

    it('throws if no coapplicant is provided', async () => {
      coapplicant = null;

      await expect(
        connector.postCoapplicant('1234', guestCardId, coapplicant)
      ).rejects.toThrowError(
        `Missing guestcard information.\nGuestcard id: ${guestCardId}.\ncoapplicant: ${coapplicant}`
      );

      expect(connector.iamAxios.put).not.toHaveBeenCalled();
    });

    it('throws if no guestcardId is provided', async () => {
      guestCardId = null;

      await expect(
        connector.postCoapplicant('1234', guestCardId, coapplicant)
      ).rejects.toThrowError(
        `Missing guestcard information.\nGuestcard id: ${guestCardId}.\ncoapplicant: ${coapplicant}`
      );

      expect(connector.iamAxios.put).not.toHaveBeenCalled();
    });

    it('throws if axios request fail', async () => {
      const error = new Error('Testing error');
      jest.spyOn(connector.iamAxios, 'post').mockRejectedValue(error);
      jest.spyOn(console, 'error');

      await expect(
        connector.postCoapplicant('1234', guestCardId, coapplicant)
      ).rejects.toThrowError('Testing error');
    });
  });

  describe('getCardPaymentForm', () => {
    let application: any;
    let postBackUrl: any;
    let isCreditCard: any;
    beforeEach(() => {
      application = applicationFixture();
      postBackUrl = 'postback-test-url';
      isCreditCard = 'true';

      jest
        .spyOn(connector.iamAxios, 'get')
        .mockResolvedValue({ data: 'success' });
    });

    it('returns when parameters correct', async () => {
      const {
        integrationData: {
          yardi: { guestcardId, applicantId }
        },
        property: { propertyCode }
      } = application;

      const path = `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-type-setup-form`;
      const res = await connector.getCardPaymentForm(
        application,
        postBackUrl,
        isCreditCard
      );

      expect(res).toEqual('success');
      expect(connector.iamAxios.get).toHaveBeenCalledWith(path, {
        params: {
          postback_url: postBackUrl,
          is_credit: isCreditCard
        }
      });
    });

    it('throws if Yardi data is missing', async () => {
      application.integrationData.yardi = null;

      await expect(
        connector.getCardPaymentForm(application, postBackUrl, isCreditCard)
      ).rejects.toThrowError(
        `Missing Yardi data for application ${application.applicationId}`
      );

      expect(connector.iamAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('addBankAccount', () => {
    let application: any;
    let accountNumber: any;
    let routingNumber: any;
    let nameOnAccount: any;
    let accountType: any;
    beforeEach(() => {
      application = applicationFixture();
      accountNumber = 'account-number';
      routingNumber = 'routing-number';
      nameOnAccount = 'Billy Idol';
      accountType = 'savings';

      jest
        .spyOn(connector.iamAxios, 'post')
        .mockResolvedValue({ data: 'success' });
    });

    it('returns when parameters are correct', async () => {
      const {
        property: { propertyCode },
        integrationData: {
          yardi: { guestcardId, applicantId }
        }
      } = application;
      const yardiPostbackPlaceholder = 'https://invitationhomes.com';

      const res = await connector.addBankAccount(
        application,
        accountNumber,
        routingNumber,
        nameOnAccount,
        accountType
      );

      expect(res).toEqual('success');
      expect(connector.iamAxios.post).toHaveBeenCalledWith(
        `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-types`,
        {
          routing_number: routingNumber,
          account_number: accountNumber,
          account_name: nameOnAccount,
          is_savings: true
        },
        {
          params: {
            postback_url: yardiPostbackPlaceholder
          }
        }
      );
    });

    it("throws if there's no Yardi info", async () => {
      application.integrationData.yardi = null;
      const { applicationId } = application;

      await expect(
        connector.addBankAccount(
          application,
          accountNumber,
          routingNumber,
          nameOnAccount,
          accountType
        )
      ).rejects.toThrowError(
        `Missing Yardi data for application ${applicationId}`
      );

      expect(connector.iamAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('submitApplication', () => {
    let guestCardId: any;
    let applicantId: any;
    let yardiPayload: any;
    beforeEach(() => {
      guestCardId = 'guestcard-id';
      applicantId = 'applicant-id';
      yardiPayload = {
        hello: 'world',
        property: { propertyCode: 'submitpropertycode' }
      };

      jest
        .spyOn(connector.iamAxios, 'post')
        .mockResolvedValue({ data: 'success' });
    });

    it('returns when all parameters are correct', async () => {
      const path = `/properties/submitpropertycode/guestcards/${guestCardId}/applicants/${applicantId}/submit`;

      const res = await connector.submitApplication(
        guestCardId,
        applicantId,
        yardiPayload
      );

      const expected = {
        ...yardiPayload,
        property: { property_code: 'submitpropertycode' }
      };

      expect(res).toEqual('success');
      expect(connector.iamAxios.post).toHaveBeenCalledWith(path, expected);
    });
  });

  describe('deletePaymentType', () => {
    let applicantId: any;
    let guestcardId: any;
    let payerId: any;
    let paymentType: any;
    let propertyCode: any;
    beforeEach(() => {
      applicantId = 'applicant-id';
      guestcardId = 'guestcard-id';
      payerId = 'payer-id';
      paymentType = 'ACH';
      propertyCode = '23525';

      jest
        .spyOn(connector.iamAxios, 'delete')
        .mockResolvedValue({ data: 'success' });
    });

    it('returns when all parameters are correct', async () => {
      const res = await connector.deletePaymentType(
        propertyCode,
        applicantId,
        guestcardId,
        payerId,
        paymentType
      );

      expect(res).toEqual('success');
      expect(connector.iamAxios.delete).toHaveBeenCalledWith(
        `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-types/${payerId}`,
        {
          params: { payment_type: paymentType }
        }
      );
    });
  });
  describe('createApplicant', () => {
    it('should call createApplicant', async () => {
      jest
        .spyOn(connector.iamAxios, 'post')
        .mockResolvedValue({ data: 'success' });

      const coapplicant = yardiApplicantFixture();
      const res = await connector.createApplicant(
        'propertyId1',
        'guestcardId2',
        coapplicant
      );

      const expectedPayload = jsonCasingParser(
        coapplicant,
        CasingPattern.SNAKE
      );

      expect(connector.iamAxios.post).toHaveBeenCalledWith(
        '/properties/propertyId1/guestcards/guestcardId2/applicants',
        expectedPayload
      );
      expect(res).toEqual('success');
    });
  });
  describe('deleteApplicant', () => {
    it('should call deleteApplicant', async () => {
      jest
        .spyOn(connector.iamAxios, 'delete')
        .mockResolvedValue({ data: 'success' });

      const res = await connector.deleteApplicant(
        'propertyId1',
        'guestcardId2',
        'applicantId3'
      );

      expect(connector.iamAxios.delete).toHaveBeenCalledWith(
        '/properties/propertyId1/guestcards/guestcardId2/applicants/applicantId3'
      );
      expect(res).toEqual('success');
    });
  });
});
