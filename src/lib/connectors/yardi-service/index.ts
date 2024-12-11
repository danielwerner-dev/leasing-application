import { AxiosInstance } from 'axios';
import createIamAxiosClient from '@invitation-homes/iam-axios';
import { object, string } from 'yup';

import { BadRequestError, ConflictError } from '$lib/types/errors';
import type {
  YardiGuestCard,
  YardiSaveBankAccountResponse,
  YardiGuestCardResponse,
  YardiPaymentTypesResponse,
  YardiDeletePaymentResponse,
  YardiApplicationSubmissionResponse,
  YardiApplicant,
  YardiGuestcardStatus
} from '$lib/types/yardi.types';
import { YardiBankAccountType } from '$lib/types/yardi.types';
import {
  Application,
  ApplicationStatus,
  PaymentType
} from '$lib/types/Application.types';
import { parseAccountTypeToYardi } from '$lib/parsers/yardi/account-type.parser';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';
import { logError } from '$lib/utils/errors';

export const iamAxios: AxiosInstance = createIamAxiosClient(
  process.env.YARDI_SERVICE_URL
);

export const createGuestCard = async (
  propertyCode: string,
  guestCard: YardiGuestCard
): Promise<YardiGuestCardResponse> => {
  const path = `/properties/${propertyCode}/guestcards`;
  const res = await iamAxios.post<YardiGuestCardResponse>(
    path,
    jsonCasingParser(guestCard, CasingPattern.SNAKE)
  );

  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const getPaymentTypes = async (
  application: Application
): Promise<YardiPaymentTypesResponse> => {
  const {
    property,
    integrationData: { yardi }
  } = application;

  if (!yardi) {
    throw new ConflictError(
      `[Application ${application.applicationId}] Missing Yardi info.`
    );
  }

  const path = `/properties/${property.propertyCode}/guestcards/${yardi.guestcardId}/applicants/${yardi.applicantId}/payment-types`;

  const res = await iamAxios.get(path);

  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const postCoapplicant = async (
  propertyCode: string,
  guestCardId: string,
  coapplicant: YardiApplicant
): Promise<YardiGuestCardResponse> => {
  if (!guestCardId || !coapplicant) {
    throw new BadRequestError(
      `Missing guestcard information.\nGuestcard id: ${guestCardId}.\ncoapplicant: ${coapplicant}`
    );
  }

  const path = `/properties/${propertyCode}/guestcards/${guestCardId}/applicants`;

  try {
    const res = await iamAxios.post(
      path,
      jsonCasingParser(coapplicant, CasingPattern.SNAKE)
    );

    return jsonCasingParser(
      res.data,
      CasingPattern.CAMEL
    ) as YardiGuestCardResponse;
  } catch (err) {
    logError(
      'yardi-service.postCoapplicant',
      'Cannot update guestcard at this time'
    );
    throw err;
  }
};

export const getGuestcardStatus = async (
  guestcardId: string,
  propertyCode: string
): Promise<ApplicationStatus> => {
  const preconditions = object({
    guestcardId: string().required(),
    propertyCode: string().required()
  });
  preconditions.validateSync({ guestcardId, propertyCode });

  const path = `/properties/${propertyCode}/guestcards/${guestcardId}`;

  const res = await iamAxios.get<YardiGuestcardStatus>(path);

  const { status } = jsonCasingParser(res.data, CasingPattern.CAMEL);

  const guestcardStatus = ApplicationStatus[status.toLowerCase()];

  if (!guestcardStatus) {
    throw new ConflictError(
      `Invalid status for guescard ${guestcardId}. Status: ${status}`
    );
  }

  return guestcardStatus;
};

export const getCardPaymentForm = async (
  application: Application,
  postbackUrl: string,
  isCreditCard: 'true' | 'false'
) => {
  const {
    applicationId,
    property,
    integrationData: { yardi }
  } = application;

  if (!yardi) {
    throw new ConflictError(
      `Missing Yardi data for application ${applicationId}`
    );
  }

  const { guestcardId, applicantId } = yardi;
  const { propertyCode } = property;

  const path = `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-type-setup-form`;

  const params = jsonCasingParser(
    {
      postbackUrl,
      isCredit: isCreditCard
    },
    CasingPattern.SNAKE
  );

  const res = await iamAxios.get(path, { params });

  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const addBankAccount = async (
  application: Application,
  accountNumber: string,
  routingNumber: string,
  nameOnAccount: string,
  accountType: string
): Promise<YardiSaveBankAccountResponse> => {
  const {
    applicationId,
    property,
    integrationData: { yardi }
  } = application;

  if (!yardi) {
    throw new ConflictError(
      `Missing Yardi data for application ${applicationId}`
    );
  }

  const { guestcardId, applicantId } = yardi;
  const { propertyCode } = property;
  const isSavings = parseAccountTypeToYardi(YardiBankAccountType[accountType]);

  // The postback is not going to be used but still it's required
  const yardiPostbackPlaceholder = 'https://invitationhomes.com';
  const path = `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-types`;

  const body = jsonCasingParser(
    {
      routingNumber,
      accountNumber,
      isSavings,
      accountName: nameOnAccount
    },
    CasingPattern.SNAKE
  );

  const params = jsonCasingParser(
    {
      postbackUrl: yardiPostbackPlaceholder
    },
    CasingPattern.SNAKE
  );

  const res = await iamAxios.post<YardiSaveBankAccountResponse>(path, body, {
    params
  });

  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const submitApplication = async (
  guestCardId: string,
  applicantId: string,
  yardiSubmit: YardiGuestCard
): Promise<YardiApplicationSubmissionResponse> => {
  const path = `/properties/${yardiSubmit.property.propertyCode}/guestcards/${guestCardId}/applicants/${applicantId}/submit`;
  const res = await iamAxios.post(
    path,
    jsonCasingParser(yardiSubmit, CasingPattern.SNAKE)
  );
  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const createApplicant = async (
  propertyCode: string,
  guestCardId: string,
  applicant: YardiApplicant
) => {
  const path = `/properties/${propertyCode}/guestcards/${guestCardId}/applicants`;
  const res = await iamAxios.post(
    path,
    jsonCasingParser(applicant, CasingPattern.SNAKE)
  );
  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const deleteApplicant = async (
  propertyCode: string,
  guestCardId: string,
  applicantId: string
) => {
  const path = `/properties/${propertyCode}/guestcards/${guestCardId}/applicants/${applicantId}`;
  const res = await iamAxios.delete(path);
  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};

export const deletePaymentType = async (
  propertyCode: string,
  applicantId: string,
  guestcardId: string,
  payerId: string,
  paymentType: PaymentType
) => {
  const params = jsonCasingParser(
    {
      paymentType: PaymentType[paymentType]
    },
    CasingPattern.SNAKE
  );

  const path = `/properties/${propertyCode}/guestcards/${guestcardId}/applicants/${applicantId}/payment-types/${payerId}`;

  const res = await iamAxios.delete<YardiDeletePaymentResponse>(path, {
    params
  });

  return jsonCasingParser(res.data, CasingPattern.CAMEL);
};
