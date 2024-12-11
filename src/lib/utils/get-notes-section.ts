import { Application } from '$lib/types/Application.types';
import personalDetailsSchema from '$lib/form-validation/schemas/form-data/personal-details.schema';
import employmentSchema from '$lib/form-validation/schemas/form-data/employment.schema';
import generalSchema from '$lib/form-validation/schemas/form-data/general.schema';
import { maskPiiInfo } from '$lib/utils/mask-pii-info';
import { methodOfContact } from '$lib/utils/method-of-contact';
import { getValidationContext } from './form-validation';

export const getYardiNotes = (application: Application) => {
  const { formData } = application;
  const personalDetails = personalDetailsSchema.validateSync(
    formData.personalDetails
  );
  const employment = employmentSchema.validateSync(formData.employment);
  const validationContext = getValidationContext(application);
  const general = generalSchema.validateSync(formData.general, {
    context: validationContext
  });

  const getIdentificationNotes = (personalDetails) => {
    if (personalDetails.idDocument.type === 'ein') {
      return `EIN: ${maskPiiInfo(personalDetails.idDocument.number)}`;
    }
    if (personalDetails.idDocument.type === 'ssn') {
      return '';
    }
    return 'Applicant doesn’t have EIN or SSN';
  };

  const identificationNotes = getIdentificationNotes(personalDetails);

  const activeMilitaryNotes = employment.activeMilitary
    ? 'Applicant is currently an active military'
    : 'Applicant isn’t an active military';

  return `Marital Status: ${general.maritalStatus},
Preferred Method of Contact: ${methodOfContact(
    general.methodOfContact,
    general.phone.type
  )},
Identification: ${identificationNotes},
Active Military: ${activeMilitaryNotes}`;
};
