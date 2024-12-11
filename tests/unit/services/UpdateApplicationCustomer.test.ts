import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as updateApplication from '$lib/repositories/leasing-application/update-application';
import * as emailService from '$lib/services/EmailCoapplicantInvite';
import * as customerService from '$lib/connectors/customer-service';
import * as service from '$lib/services/UpdateApplicationCustomer';
import { applicationFixture } from '$fixtures';

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

jest.mock('$lib/services/EmailCoapplicantInvite', () => {
  return {
    emailCoapplicantInvite: jest.fn()
  };
});

jest.mock('$lib/connectors/customer-service', () => {
  return {
    getCustomerByEmail: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateApplicationExistingCustomer: jest.fn(),
    updateApplicationNewCustomer: jest.fn(),
    updateApplicationStatus: jest.fn()
  };
});

describe('updateApplicationCustomerService', () => {
  let application;
  let coapplicantApplicationId;
  let coapplicantApplication;
  let email;
  beforeEach(() => {
    application = applicationFixture();
    coapplicantApplicationId = 'coapplicantId';
    email = 'test@test.com';

    application.applicationStatus = 'pending';

    coapplicantApplication = applicationFixture();
    coapplicantApplication.applicationId = coapplicantApplicationId;
    coapplicantApplication.email = email;
    coapplicantApplication.primaryApplicationId = application.applicationId;
    coapplicantApplication.applicationType = 'coapplicant';
    coapplicantApplication.applicationStatus = 'created';

    jest
      .spyOn(readApplication, 'getApplication')
      .mockResolvedValue(coapplicantApplication);
    jest.spyOn(updateApplication, 'updateApplicationExistingCustomer');
    jest.spyOn(updateApplication, 'updateApplicationNewCustomer');
    jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue(null);
    jest.spyOn(emailService, 'emailCoapplicantInvite');
    jest.spyOn(updateApplication, 'updateApplicationStatus');
  });

  it("calls updateApplicationNewCustomer when there's no customerId", async () => {
    await service.updateApplicationCustomerService(
      application,
      coapplicantApplicationId,
      email
    );

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
    expect(updateApplication.updateApplicationNewCustomer).toHaveBeenCalledWith(
      coapplicantApplicationId,
      email
    );
    expect(emailService.emailCoapplicantInvite).toHaveBeenCalled();
  });

  it("calls updateApplicationExistingCustomer when there's customerId", async () => {
    jest
      .spyOn(customerService, 'getCustomerByEmail')
      .mockResolvedValue({ customerId: 'customer-id' } as any);

    await service.updateApplicationCustomerService(
      application,
      coapplicantApplicationId,
      email
    );

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).toHaveBeenCalledWith(coapplicantApplicationId, 'customer-id', email);
    expect(emailService.emailCoapplicantInvite).toHaveBeenCalled();
    expect(updateApplication.updateApplicationStatus).toHaveBeenCalled();
  });

  it('throws when no coapplicantApplication is found', async () => {
    jest.spyOn(readApplication, 'getApplication').mockResolvedValue(null);

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Co-applicant application not found');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when no co-applicant does not belong to primary', async () => {
    coapplicantApplication.primaryApplicationId = 'other-primary';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when primary application is not primary', async () => {
    application.applicationType = 'coapplicant';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when primary application status is invalid: draft', async () => {
    application.applicationStatus = 'draft';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when primary application status is invalid: created', async () => {
    application.applicationStatus = 'created';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when primary application status is invalid: deleted', async () => {
    application.applicationStatus = 'deleted';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when co-applicant application does not have coapplicant type', async () => {
    coapplicantApplication.applicationType = 'primary';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError('Forbidden');

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });

  it('throws when co-applicant applicationStatus is not `created`', async () => {
    coapplicantApplication.applicationStatus = 'draft';

    await expect(
      service.updateApplicationCustomerService(
        application,
        coapplicantApplicationId,
        email
      )
    ).rejects.toThrowError(
      `Application ${coapplicantApplication.applicationId} is not a created application`
    );

    expect(readApplication.getApplication).toHaveBeenCalledWith(
      coapplicantApplicationId
    );
    expect(
      updateApplication.updateApplicationNewCustomer
    ).not.toHaveBeenCalled();
    expect(
      updateApplication.updateApplicationExistingCustomer
    ).not.toHaveBeenCalled();
  });
});
