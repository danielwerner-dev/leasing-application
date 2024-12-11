import * as createApplication from '$lib/repositories/leasing-application/create-application';
import * as service from '$lib/services/CreateApplication';
import * as pls from '$lib/connectors/pls';
import * as GetApplicationService from '$lib/services/GetApplication';
import * as ValidateApplication from '$lib/utils/validate-application';

jest.mock('$lib/utils/validate-application', () => {
  return {
    isAllowedToCreateApplication: jest.fn()
  };
});

jest.mock('$lib/connectors/pls', () => {
  return {
    getPropertyBySlug: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/create-application', () => {
  return {
    createPrimaryApplication: jest.fn()
  };
});

jest.mock('$lib/services/GetApplication', () => {
  return {
    getApplicationsByCustomerId: jest.fn()
  };
});

describe('CreateApplication', () => {
  let customer;
  let propertySlug;
  let applicationId;
  let ipAddress;
  beforeEach(() => {
    applicationId = '1234';
    jest
      .spyOn(createApplication, 'createPrimaryApplication')
      .mockResolvedValue(applicationId);
    jest
      .spyOn(GetApplicationService, 'getApplicationsByCustomerId')
      .mockResolvedValue([]);
    jest
      .spyOn(ValidateApplication, 'isAllowedToCreateApplication')
      .mockReturnValue(true);

    customer = {
      customerId: '1234'
    };

    propertySlug = '1234-n-kentucky-ave-chicago-il-60630';

    ipAddress = '127.0.0.1';
  });

  it('calls create and get application with the correct parameters', async () => {
    const property = await pls.getPropertyBySlug(propertySlug);
    await service.createApplicationService(customer, propertySlug, ipAddress);

    expect(pls.getPropertyBySlug).toHaveBeenCalled();
    expect(createApplication.createPrimaryApplication).toHaveBeenCalledWith(
      customer,
      property,
      ipAddress
    );
  });

  it('throws if `isAllowedToCreateApplication` returns `false`', async () => {
    jest
      .spyOn(ValidateApplication, 'isAllowedToCreateApplication')
      .mockReturnValue(false);

    await expect(
      service.createApplicationService(customer, propertySlug, ipAddress)
    ).rejects.toThrow();

    expect(createApplication.createPrimaryApplication).not.toHaveBeenCalled();
  });
});
