import { applicationFixture } from '$fixtures';
import * as lambda from '$functions/PutAddCoapplicant';
import * as service from '$lib/services/AddCoapplicant';
import * as ListLinkedApplicationsService from '$lib/services/ListLinkedApplications';
import { ApplicationType } from '$lib/types/Application.types';

jest.mock('$lib/services/AddCoapplicant', () => {
  return {
    addCoapplicantService: jest.fn()
  };
});

describe('PutAddCoapplicant lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let body: any;
    beforeEach(() => {
      application = applicationFixture();
      body = {
        coapplicant: {
          firstName: 'John',
          lastName: 'Snow',
          email: 'jsnow@westeros.com',
          id: 'john-id',
          type: 'roommate'
        },
        guestcardId: 'guestcard-id'
      };
      event = {
        headers: {
          'client-ip-address': '127.0.0.1'
        },
        body: JSON.stringify(body)
      };

      jest
        .spyOn(service, 'addCoapplicantService')
        .mockResolvedValue(application);

      jest
        .spyOn(ListLinkedApplicationsService, 'listLinkedApplications')
        .mockResolvedValue([]);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify(application),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.addCoapplicantService).toHaveBeenCalledWith(
        application,
        body.coapplicant,
        event.headers['client-ip-address']
      );
    });

    it('throws if body is missing', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });

    it('throws error if no ip address exist in headers', async () => {
      event.headers['client-ip-address'] = undefined;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });

    it('throws error if no ip address exist in headers', async () => {
      event.headers['client-ip-address'] = undefined;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });

    it('throws error if customer is not primary', async () => {
      const application = applicationFixture();
      application.applicationType = ApplicationType.coapplicant;

      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Coapplicants cannot add new coapplicants');
    });

    it('throws error if customer is duplicated', async () => {
      const application = applicationFixture();
      application.customer.email = 'jsnow@westeros.com';

      const { formData, integrationData, ...rest } = application;
      const linkedApplications = [
        {
          ...rest,
          integrationData: {
            yardi: integrationData?.yardi
          }
        }
      ];
      jest
        .spyOn(ListLinkedApplicationsService, 'listLinkedApplications')
        .mockResolvedValue(linkedApplications);

      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrowError('Duplicated coapplicant');
    });
  });
});
