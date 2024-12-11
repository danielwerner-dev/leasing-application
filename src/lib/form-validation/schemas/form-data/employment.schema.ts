import { string, object, array, boolean, InferType } from 'yup';
import { phoneNumberValidation } from '../shared.schema';

const incomeSchema = string()
  .max(18)
  .matches(/^\d+(\.\d{1,2})?$/);

export const employedSchema = object({
  employer: string()
    .required()
    .matches(/^[A-Za-z0-9.-\s]+$/)
    .max(40),
  phone: phoneNumberValidation.required(),
  jobTitle: string().max(30),
  addressLine1: string().when('isInternational', {
    is: true,
    then: (schema) => schema.max(80),
    otherwise: (schema) => schema.max(40)
  }),
  addressLine2: string().max(40),
  city: string()
    .max(30)
    .matches(/^(\w+\s?)*$/),
  state: string(),
  zipcode: string().matches(/^(\d{5})?$/),
  isInternational: boolean().required()
});

const schema = object({
  employmentStatus: string().required(),
  monthlyGrossIncome: incomeSchema.required(),
  activeMilitary: boolean().required(),
  employment: object().when('employmentStatus', {
    is: 'employed',
    then: employedSchema
  }),
  additionalIncome: array(
    object({
      source: string().required(),
      monthlyIncome: incomeSchema.required(),
      id: string().required()
    })
  )
});

export type Employment = InferType<typeof schema>;

export default schema;
