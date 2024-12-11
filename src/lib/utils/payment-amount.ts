import { californiaMarkets } from '$lib/form-validation/schemas/form-data/general.schema';
import { Application } from '$lib/types/Application.types';
import { BadRequestError } from '$lib/types/errors';

export const getApplicantFee = (marketSlug: string): number => {
  if (californiaMarkets.includes(marketSlug)) {
    return 45;
  }
  return 50;
};

export const calculatePaymentAmount = (
  applicantFee: number,
  applicants: unknown[]
) => {
  return applicantFee * applicants.length;
};

export const validatePaymentAmount = (
  marketSlug: string,
  applicants: unknown[],
  amountToPay: number,
  application: Application
) => {
  const { applicationId, paidById } = application;

  if (paidById) {
    return;
  }

  if (!applicants.length && !application.integrationData.yardi?.paymentInfo) {
    throw new BadRequestError(
      `No applicants selected to pay. Application: ${applicationId}`
    );
  }

  const applicantFee = getApplicantFee(marketSlug);
  const paymentAmount = calculatePaymentAmount(applicantFee, applicants);

  if (paymentAmount !== amountToPay) {
    throw new BadRequestError(
      `Invalid paid amount. Expected: ${paymentAmount}. Received: ${amountToPay} Application id: ${applicationId}`
    );
  }
};
