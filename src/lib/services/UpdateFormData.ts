import { updateFormData } from '$lib/repositories/leasing-application/update-application';

import { getIntegrationData } from '$lib/services/GetIntegrationData';

import { validateFormData } from '$lib/form-validation/validator';

import { getValidationContext } from '$lib/utils/form-validation';

import { Application } from '$lib/types/Application.types';
import { FormData } from '$lib/types/form-data/types';
import { BadRequestError } from '$lib/types/errors';

export const updateFormDataService = async (
  application: Application,
  formData: FormData,
  ipAddress: string
) => {
  const context = getValidationContext(application);

  if (!validateFormData(formData, context)) {
    throw new BadRequestError('Invalid form data.');
  }

  const udpatedApplication = await updateFormData(
    application.applicationId,
    formData,
    ipAddress
  );
  const integrationData = await getIntegrationData(udpatedApplication);

  return {
    ...udpatedApplication,
    integrationData
  };
};
