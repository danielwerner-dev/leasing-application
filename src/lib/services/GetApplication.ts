import { getPropertyBySlug } from '$lib/connectors/pls';
import { listApplicationByCustomer } from '$lib/repositories/leasing-application/read-application';
import {
  updateApplicationExternalFields,
  updateApplicationProperty
} from '$lib/repositories/leasing-application/update-application';
import { Application, Property } from '$lib/types/Application.types';
import { logError } from '$lib/utils/errors';
import { getApplicationStatus } from '$lib/services/GetApplicationStatus';
import { getFiles, getYardiInfo } from '$lib/services/GetIntegrationData';
import { getApplicationPermissions } from '$lib/utils/application-permissions';

export const getUpdatedProperty = async (
  applicationId: string,
  property: Property
): Promise<Property> => {
  try {
    const updatedProperty = await getPropertyBySlug(property.slug);

    return updatedProperty;
  } catch (err) {
    logError(
      'services.GetApplication',
      `Couldn't update property "${property.slug}" for application ${applicationId}`
    );

    logError('services.GetApplication', err);

    return property;
  }
};

export const getUpdatedApplication = async (application: Application) => {
  const { applicationId, integrationData, applicationType, promoted } =
    application;

  const propertyPromise = getUpdatedProperty(
    applicationId,
    application.property
  );
  const filesPromise = getFiles(applicationId);
  const yardiPromise = getYardiInfo(application);
  const applicationStatusPromise = getApplicationStatus(application);

  const [property, files, yardi, applicationStatus] = await Promise.all([
    propertyPromise,
    filesPromise,
    yardiPromise,
    applicationStatusPromise
  ]);

  const permissions = getApplicationPermissions({
    applicationStatus,
    applicationType,
    promoted
  });

  await updateApplicationExternalFields(applicationId, { property, yardi });

  const updatedIntegrationData = {
    ...integrationData,
    yardi,
    files
  };

  return {
    ...application,
    applicationStatus,
    property,
    integrationData: updatedIntegrationData,
    permissions
  };
};

export const getApplicationsByCustomerId = async (customerId: string) => {
  const applications = await listApplicationByCustomer(customerId);

  const applicationPromises = applications.map(async (application) => {
    const {
      applicationId,
      property: { slug },
      applicationType,
      promoted
    } = application;

    const propertyPromise = getPropertyBySlug(slug);
    const applicationStatusPromise = getApplicationStatus(application);

    const [property, applicationStatus] = await Promise.all([
      propertyPromise,
      applicationStatusPromise
    ]);

    const permissions = getApplicationPermissions({
      applicationStatus,
      applicationType,
      promoted
    });

    await updateApplicationProperty(applicationId, property);

    return {
      ...application,
      applicationStatus,
      property,
      permissions
    };
  });

  return Promise.all(applicationPromises);
};
