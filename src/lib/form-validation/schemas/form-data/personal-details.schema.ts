import dayjs from 'dayjs';
import { string, object, array, bool } from 'yup';

import {
  dateString,
  nameValidation,
  phoneNumberValidation
} from '../shared.schema';

const animalSchema = object({
  animalType: string().required(),
  breed: string().required().max(40),
  weight: string()
    .required()
    .matches(/^[0-9]+$/)
    .max(16),
  name: nameValidation.required(),
  serviceAnimal: string().required(),
  id: string().required()
});

const vehicleSchema = object({
  make: string().required().max(20),
  model: string().required().max(20),
  color: string().required().max(20),
  license: string()
    .required()
    .max(8)
    .matches(/^[0-9a-zA-z]+$/),
  id: string().required()
});

const dependentSchema = object({
  firstName: nameValidation.required(),
  lastName: nameValidation.required(),
  dateOfBirth: dateString.required(),
  id: string().required()
});

const backgroundQuestionsWhen = {
  is: (backgroundInfo, market) => market === 'miami-fl' || backgroundInfo,
  then: bool().required()
};

const schema = object({
  dateOfBirth: dateString
    .required()
    .test('invalid-date', 'Date of birth is invalid', (value) => {
      const minimumDate = dayjs().subtract(18, 'year');

      return !minimumDate.isBefore(value);
    }),
  idDocument: object({
    type: string().required().oneOf(['ssn', 'ein', 'neither']),
    number: string()
      .defined()
      .when('type', {
        is: (type) => type !== 'neither',
        then: string()
          .required()
          .matches(/^[0-9]+$/)
          .length(9)
      })
  }).required(),
  driversLicense: object({
    number: string().defined(),
    state: string().defined()
  }),
  emergencyContact: object({
    name: nameValidation.required(),
    relationship: string()
      .required()
      .oneOf(['Husband', 'Wife', 'Son', 'Daughter', 'Friend', 'Other']),
    phone: object({
      digits: phoneNumberValidation.required(),
      type: string().required().oneOf(['home', 'cell'])
    }).required()
  }).required(),
  animals: array(animalSchema),
  dependents: array(dependentSchema),
  vehicles: array(vehicleSchema),
  backgroundInfo: bool().when('$market', {
    is: (market) => market !== 'miami-fl',
    then: bool().required()
  }),
  felony: bool().when(['backgroundInfo', '$market'], backgroundQuestionsWhen),
  evicted: bool().when(['backgroundInfo', '$market'], {
    is: (backgroundInfo, market) => market !== 'miami-fl' && backgroundInfo,
    then: bool().required()
  }),
  pendingCharges: bool().when(
    ['backgroundInfo', '$market'],
    backgroundQuestionsWhen
  ),
  bankruptcy: bool().when(
    ['backgroundInfo', '$market'],
    backgroundQuestionsWhen
  ),
  hasReviewedBackgroundPolicy: bool().when(
    ['felony', 'evicted', 'pendingCharges', 'bankruptcy'],
    {
      is: (felony, evicted, pendingCharges, bankruptcy) =>
        felony || evicted || pendingCharges || bankruptcy,
      then: bool().required().oneOf([true])
    }
  ),
  acceptedTerms: bool().required().oneOf([true]),
  reviewedProvidedInfo: bool().required().oneOf([true])
});

export default schema;
