import { Application } from '$lib/types/Application.types';
import { getDateOnly } from '$lib/utils/date';
import generalSchema from '$lib/form-validation/schemas/form-data/general.schema';
import { getValidationContext } from '$lib/utils/form-validation';

export const parseApplicationDataToYardi = (application: Application) => {
  const { property, formData } = application;

  const validationContext = getValidationContext(application);
  const general = generalSchema.validateSync(formData.general, {
    context: validationContext
  });
  const { marketRent } = property;

  const { leaseStartDate, leaseEndDate } = general;
  const applicationData = {
    quotedRent: Math.trunc(Number(marketRent)).toString(),
    leaseStartDate: getDateOnly(leaseStartDate),
    leaseEndDate: getDateOnly(leaseEndDate)
  };

  return applicationData;
};
