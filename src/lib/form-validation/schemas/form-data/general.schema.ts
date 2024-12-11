import { ApplicationType } from '$lib/types/Application.types';
import dayjs from 'dayjs';
import { InferType, object, string } from 'yup';

import {
  nameValidation,
  phoneNumberValidation,
  dateString
} from '../shared.schema';

export const californiaMarkets = ['los-angeles-ca', 'sacramento-ca'];

const schema = object({
  applicationType: string().required(),
  title: string().defined(),
  firstName: nameValidation.required(),
  middleName: nameValidation.defined(),
  lastName: nameValidation.required(),
  maritalStatus: string().defined(),
  phone: object({
    digits: phoneNumberValidation.required(),
    type: string().required().oneOf(['home', 'cell'])
  }).required(),
  methodOfContact: string().defined(),
  leaseStartDate: dateString
    .required()
    .test(
      'valid-lease-start',
      'Invalid lease start date',
      (value, { options: { context = {} }, createError }) => {
        if (
          context.applicationType === ApplicationType.coapplicant ||
          context.promoted
        ) {
          return value === context.leaseStartDate;
        }

        if (!context.availableFrom || !context.availableTo) {
          return createError({
            message: 'Missing lease start date context'
          });
        }

        const valueDate = dayjs(value);
        if (valueDate.isBefore(context.availableFrom)) {
          return createError({
            message: 'Date is before available date starts'
          });
        }

        if (valueDate.isAfter(context.availableTo)) {
          return createError({
            message: 'Date is after available date ends'
          });
        }

        return true;
      }
    ),
  leaseEndDate: string()
    .required()
    .test('invalid-end-date', 'invalid-lease-end-date', (value, { parent }) => {
      const { leaseStartDate, leaseTerm } = parent;
      const expectedDate = dayjs(leaseStartDate)
        .add(leaseTerm, 'months')
        .format('MM/DD/YYYY');

      return dayjs(expectedDate).isSame(value, 'day');
    }),
  leaseTerm: string()
    .required()
    .test(
      'invalid-lease-term',
      'Invalid lease term',
      (value = '', { options: { context = {} } }) => {
        const { market, leaseTerm, promoted, applicationType } = context;
        if (promoted || applicationType === ApplicationType.coapplicant) {
          return leaseTerm === value;
        }

        if (californiaMarkets.includes(market)) {
          return ['12', '24'].includes(value);
        }

        return Number(value) >= 12 && Number(value) <= 24;
      }
    )
});

export type General = InferType<typeof schema>;

export default schema;
