import { InferType, object, string } from 'yup';

const yardiBasicInfo = {
  applicantId: string().required(),
  guestcardId: string().required()
};

export const yardiCompleteInfoSchema = object({
  ...yardiBasicInfo,
  paymentInfo: object({
    paymentType: string().required(),
    payerId: string().required()
  }).required()
}).required('Missing Yardi complete information.');

export const yardiBasicInfoSchema = object(yardiBasicInfo).required(
  'Missing Yardi basic information.'
);

export type YardiBasicInfo = InferType<typeof yardiBasicInfoSchema>;

export type YardiCompleteInfo = InferType<typeof yardiCompleteInfoSchema>;
