import { listCoapplicantApplications } from '$lib/repositories/leasing-application/read-application';

import { Application, ApplicationType } from '$lib/types/Application.types';
import { ConflictError } from '$lib/types/errors';

export const removeSensitiveData = (application: Application) => {
  const { formData, integrationData, ...rest } = application;

  return {
    ...rest,
    integrationData: {
      yardi: integrationData?.yardi
    }
  };
};

export const listLinkedApplications = async (
  primaryApplication: Application
) => {
  if (primaryApplication.applicationType !== ApplicationType.primary) {
    throw new ConflictError('Application is not primary');
  }

  const applications = await listCoapplicantApplications(
    primaryApplication.applicationId
  );

  const cleansedApplications = applications.map(removeSensitiveData);

  return cleansedApplications;
};
