import { applicationFixture } from '$fixtures';
import * as lambda from '$functions/PostInviteApplicant';
import * as service from '$lib/services/EmailCoapplicantInvite';
import * as repo from '$lib/repositories/leasing-application/read-application';
import { Application } from '$lib/types/Application.types';

jest.mock('$lib/services/EmailCoapplicantInvite', () => {
  return {
    emailCoapplicantInvite: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

describe('PostInviteApplicant lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let primaryApplication: Application;
    let coapplicantApplication: Application;
    let body: any;
    beforeEach(() => {
      primaryApplication = applicationFixture();
      coapplicantApplication = applicationFixture();
      body = {
        coapplicantApplicationId: 'coapplicant-application-id'
      };
      event = {
        body: JSON.stringify(body)
      };
    });

    it('returns 200 on success', async () => {
      coapplicantApplication.primaryApplicationId =
        primaryApplication.applicationId;
      jest
        .spyOn(repo, 'getApplication')
        .mockResolvedValue(coapplicantApplication);
      const res = await lambda.requestHandler(
        event,
        primaryApplication,
        null as any
      );

      const expected = {
        statusCode: 200,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.emailCoapplicantInvite).toHaveBeenCalledWith(
        primaryApplication,
        coapplicantApplication
      );
    });

    it('throws if body is missing', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, primaryApplication, null as any)
      ).rejects.toThrow();
    });

    it('throws if requested application does not bselong to primary', async () => {
      coapplicantApplication.primaryApplicationId = 'other-application-id';
      primaryApplication.applicationId = 'primary-application-id';
      jest
        .spyOn(repo, 'getApplication')
        .mockResolvedValue(coapplicantApplication);

      await expect(
        lambda.requestHandler(event, primaryApplication, null as any)
      ).rejects.toThrow();
    });
  });
});
