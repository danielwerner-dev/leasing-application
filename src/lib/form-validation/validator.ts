import { FormData } from '$lib/types/form-data/types';
import { AnySchema } from 'yup';
import { ValidateOptions } from 'yup/lib/types';
import { ConflictError } from '$lib/types/errors';
import generalSchema from './schemas/form-data/general.schema';
import personalDetailsSchema from './schemas/form-data/personal-details.schema';
import residencesSchema from './schemas/form-data/residences.schema';
import employmentSchema from './schemas/form-data/employment.schema';
import documentsSchema from './schemas/form-data/documents.schema';
import coapplicantsSchema from './schemas/form-data/coapplicants.schema';
import { logError } from '$lib/utils/errors';

const FORM_SCHEMAS: Record<string, AnySchema> = {
  general: generalSchema,
  personalDetails: personalDetailsSchema,
  residence: residencesSchema,
  employment: employmentSchema,
  documents: documentsSchema,
  coapplicants: coapplicantsSchema
};

export function validateSection(
  section: string,
  data: unknown,
  context: Record<string, unknown> = {}
) {
  if (!Object.keys(FORM_SCHEMAS).includes(section)) {
    throw new ConflictError('Form schema does not exist');
  }

  const options: ValidateOptions = {
    context,
    abortEarly: false
  };

  FORM_SCHEMAS[section].validateSync(data, options);
  return true;
}

export function validateFormData(
  formData: FormData,
  context: Record<string, unknown>
) {
  const formEntries = Object.entries(formData);

  let errors = false;
  formEntries.forEach(([section, data]) => {
    try {
      validateSection(section, data, context);
    } catch (err) {
      logError(`validator.validateFormData.${section}`, err);
      errors = true;
    }
  });

  return !errors;
}
