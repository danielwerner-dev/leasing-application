import * as deleteApplication from '$lib/repositories/leasing-application/delete-application';
import * as dbClient from '$lib/repositories/leasing-application/dynamo-client';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/repositories/leasing-application/dynamo-client', () => {
  return {
    DBClient: {
      update: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      query: jest.fn()
    }
  };
});

jest.useFakeTimers().setSystemTime(new Date());

describe('delete-application', () => {
  let application;
  let reason;
  beforeEach(() => {
    application = applicationFixture();
    reason = 'unit tests';
  });

  describe('deleteApplication', () => {
    it('calls DBClient.update with the correct arguments', async () => {
      jest.spyOn(dbClient.DBClient, 'update');

      const expectedExpression =
        'SET applicationStatus = :status, formData = :formData, audit.updatedAt = :now';
      const expectedAttributes = {
        ':status': 'deleted',
        ':formData': { reason },
        ':now': new Date().toISOString()
      };

      await deleteApplication.deleteApplication(application, reason);

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        application.applicationId,
        expectedExpression,
        expectedAttributes
      );
    });
  });
});
