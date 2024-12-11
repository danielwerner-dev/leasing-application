export type EmailDeliverySendEmailResponse = {
  messageId: string;
};

export enum EmailTemplates {
  COAPPLICANT_INVITATION = 'Co_applicant_Invitation'
}

export interface EmailTemplateParameters {
  key: string;
  value: string;
}
