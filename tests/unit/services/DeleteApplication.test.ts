import * as repo from '$lib/repositories/leasing-application/delete-application';
import * as service from '$lib/services/DeleteApplication';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/repositories/leasing-application/delete-application.ts', () => {
  return {
    deleteApplication: jest.fn()
  };
});

describe('Delete Application Service', () => {
  let application;
  let reason;
  beforeEach(() => {
    jest.spyOn(repo, 'deleteApplication');

    application = applicationFixture();
    reason = 'test';
  });
  it('throws an error when deleting application other than `created` or `draft`', async () => {
    application.applicationStatus = 'approved';

    await expect(
      service.deleteApplicationService(application, reason)
    ).rejects.toThrowError(
      `Cannot delete application in current status: approved`
    );

    expect(repo.deleteApplication).not.toHaveBeenCalled();
  });

  it('calls deleteApplication on success', async () => {
    await service.deleteApplicationService(application, reason);

    expect(repo.deleteApplication).toHaveBeenCalledWith(application, reason);
  });
});
