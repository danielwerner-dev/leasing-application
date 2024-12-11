import dayjs from 'dayjs';
import { object, string, array, bool, InferType } from 'yup';

import { dateString } from '../shared.schema';

const isInternationalWhen = {
  is: (isInternational) => !isInternational,
  then: string().required()
};

const residenceSchema = object({
  type: string().required(),
  id: string().required(),
  isInternational: bool().required(),
  addressLine1: string()
    .required()
    .when('isInternational', {
      is: (isInternational) => isInternational,
      then: (schema) => schema.max(100),
      otherwise: (schema) => schema.max(40)
    }),
  addressLine2: string(),
  city: string().defined().when('isInternational', isInternationalWhen),
  state: string().defined().when('isInternational', isInternationalWhen),
  zipcode: string().defined().when('isInternational', isInternationalWhen),
  startDate: dateString.required()
});

const schema = object({
  currentResidence: residenceSchema.required(),
  pastResidences: array(residenceSchema).required()
}).test('valid-period', 'Invalid period for residence', (values) => {
  const {
    currentResidence: { startDate },
    pastResidences
  } = values;

  if (hasRequiredMonths(startDate)) {
    return true;
  }

  if (!pastResidences) {
    return false;
  }

  const validDate = pastResidences
    .map((residence) => residence.startDate)
    .find(hasRequiredMonths);

  return Boolean(validDate);
});

const RESIDENCE_REQUIRED_MONTHS = 36;
function hasRequiredMonths(dateString) {
  const minimumDate = dayjs().subtract(RESIDENCE_REQUIRED_MONTHS, 'months');

  return minimumDate.isAfter(dateString);
}

export type ResidenceSection = InferType<typeof schema>;
export type Residence = InferType<typeof residenceSchema>;

export default schema;
