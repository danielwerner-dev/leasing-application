import { UpdateCoapplicantCustomer } from '$lib/services/UpdateCoapplicantCustomer';
import { applicationFixture } from '$fixtures';
import * as readRepo from '$lib/repositories/leasing-application/read-application';
import * as updateRepo from '$lib/repositories/leasing-application/update-application';
import { ApplicationStatus } from '$lib/types/Application.types';

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn(),
    listApplicationByEmail: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateApplicationExistingCustomer: jest.fn(),
    updateApplicationStatus: jest.fn()
  };
});
describe('Update Application Customer Service', () => {
  let application;
  beforeEach(() => {
    jest.spyOn(readRepo, 'listApplicationByEmail').mockResolvedValue([]);
    jest.spyOn(updateRepo, 'updateApplicationExistingCustomer');
    application = applicationFixture();
  });
  it('return empty array if there is no application for the given e-mail', async () => {
    await UpdateCoapplicantCustomer('test-customer', 'a@a.com');
    expect(readRepo.listApplicationByEmail).toHaveBeenCalledWith('a@a.com');
    expect(updateRepo.updateApplicationExistingCustomer).not.toHaveBeenCalled();
  });
  it('should update customerId for the customer received', async () => {
    jest
      .spyOn(readRepo, 'listApplicationByEmail')
      .mockResolvedValue([application]);

    await UpdateCoapplicantCustomer('test-customer', 'a@a.com');
    expect(readRepo.listApplicationByEmail).toHaveBeenCalledWith('a@a.com');
    expect(updateRepo.updateApplicationExistingCustomer).toHaveBeenCalledWith(
      application.applicationId,
      'test-customer',
      'a@a.com'
    );
    expect(updateRepo.updateApplicationStatus).not.toHaveBeenCalledWith(
      application.applicationId,
      ApplicationStatus.draft
    );
  });
  it('should update the application status if application status equals "created"', async () => {
    jest
      .spyOn(readRepo, 'listApplicationByEmail')
      .mockResolvedValue([
        { ...application, applicationStatus: ApplicationStatus.created }
      ]);

    await UpdateCoapplicantCustomer('test-customer', 'a@a.com');
    expect(updateRepo.updateApplicationStatus).toHaveBeenCalledWith(
      application.applicationId,
      ApplicationStatus.draft
    );
  });
  it('log error trying to update customerId for the customer received', async () => {
    const error = new Error('test error');
    jest
      .spyOn(readRepo, 'listApplicationByEmail')
      .mockResolvedValue([application]);
    jest
      .spyOn(updateRepo, 'updateApplicationExistingCustomer')
      .mockRejectedValue(error);
    jest.spyOn(console, 'error');

    await UpdateCoapplicantCustomer('test-customer', 'a@a.com');
    expect(readRepo.listApplicationByEmail).toHaveBeenCalledWith('a@a.com');
    expect(updateRepo.updateApplicationExistingCustomer).rejects.toThrow();
  });
});
