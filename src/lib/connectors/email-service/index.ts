import type { AxiosInstance } from 'axios';
import createIamAxiosClient from '@invitation-homes/iam-axios';
import {
  EmailDeliverySendEmailResponse,
  EmailTemplateParameters
} from '$lib/types/email-delivery-service.types';

import { EmailTemplates } from '$lib/types/email-delivery-service.types';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';

const ORIGINATING_APPLICATION = 'leasing-application-service';

export const iamAxios: AxiosInstance = createIamAxiosClient(
  process.env.EMAIL_DELIVERY_SERVICE_URL
);

export const sendEmail = async (
  templateId: EmailTemplates,
  toAddress: string,
  templateParameters: EmailTemplateParameters[]
): Promise<EmailDeliverySendEmailResponse> => {
  const path = '/send';
  const body = jsonCasingParser(
    {
      originatingApplication: ORIGINATING_APPLICATION,
      templateId,
      toAddress,
      templateParameters
    },
    CasingPattern.SNAKE
  );

  const res = await iamAxios.post(path, body);

  const { messageId } = jsonCasingParser(res.data, CasingPattern.CAMEL);

  return {
    messageId
  };
};
