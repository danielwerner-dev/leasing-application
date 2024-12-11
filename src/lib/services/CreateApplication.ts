import { createPrimaryApplication } from '$lib/repositories/leasing-application/create-application';
import { Application, Customer } from '$lib/types/Application.types';
import { getPropertyBySlug } from '$lib/connectors/pls';
import { getApplicationsByCustomerId } from '$lib/services/GetApplication';
import { isAllowedToCreateApplication } from '$lib/utils/validate-application';
import { ConflictError } from '$lib/types/errors';

export const createApplicationService = async (
  customer: Customer,
  propertySlug: string,
  ipAddress: string
): Promise<Application> => {
  const customerApplications = await getApplicationsByCustomerId(
    customer.customerId
  );

  const allowedToCreate = isAllowedToCreateApplication(
    customerApplications,
    propertySlug
  );

  if (!allowedToCreate) {
    throw new ConflictError('Application already exists for this property.');
  }

  const property = await getPropertyBySlug(propertySlug);

  return await createPrimaryApplication(customer, property, ipAddress);
};
