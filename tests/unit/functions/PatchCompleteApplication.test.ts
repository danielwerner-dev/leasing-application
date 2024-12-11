import { applicationFixture, eventFixture } from '$fixtures';
import * as lambda from '$functions/PatchCompleteApplication';
import * as service from '$lib/services/ProcessApplication';

jest.mock('$lib/services/ProcessApplication', () => {
  return {
    processApplicationService: jest.fn()
  };
});

jest.mock('$lib/authorizer', () => {
  return {
    applicationHandlerFactory: jest.fn()
  };
});

describe('PatchCompleteApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    let body;
    let ipAddress;
    let authorization;
    beforeEach(() => {
      event = eventFixture();
      authorization = 'Bearer some-token456';
      event.headers.authorization = authorization;
      application = applicationFixture();
      authContext = {};
      body = {
        amountToPay: 50,
        applicantsToPay: ['ultimatewarrior@warrior.com']
      };
      ipAddress = '127.0.0.1';
      jest.spyOn(service, 'processApplicationService');
    });

    it('returns 200 on success', async () => {
      event.body = JSON.stringify(body);
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 200,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.processApplicationService).toHaveBeenCalledWith(
        application,
        body.applicantsToPay,
        body.amountToPay,
        ipAddress,
        authorization
      );
    });
    it('returns 200 on success', async () => {
      event.body = JSON.stringify(body);
      event.headers.authorization = undefined;
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 200,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.processApplicationService).toHaveBeenCalledWith(
        application,
        body.applicantsToPay,
        body.amountToPay,
        ipAddress,
        ''
      );
    });

    it('it throws if `body` is undefined', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, application, authContext)
      ).rejects.toThrow();

      expect(service.processApplicationService).not.toHaveBeenCalled();
    });

    it('throws error if no ip address exist in headers', async () => {
      event.headers['client-ip-address'] = undefined;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Ip Address is missing in headers');
    });

    it('throws when applicants array contains elements other than strings', async () => {
      body.applicantsToPay = [123456];

      event.body = JSON.stringify(body);
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Not a valid email address');
    });

    it('throws when applicants array is not in body', async () => {
      body = { amountToPay: 50 };

      event.body = JSON.stringify(body);
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Applicants to pay is required');
    });

    it('throws when amountToPay is not a number', async () => {
      body.amountToPay = 'string';

      event.body = JSON.stringify(body);
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Not a valid amount');
    });

    it('throws when amountToPay is not in body', async () => {
      body = { applicantsToPay: ['hi@gmail.com'] };

      event.body = JSON.stringify(body);
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Amount paid is required');
    });
  });
});
