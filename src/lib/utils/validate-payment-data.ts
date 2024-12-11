import { string } from 'yup';
import { Application, PaymentType } from '$lib/types/Application.types';
import { BadRequestError } from '$lib/types/errors';

export interface PaymentData {
  applicantsToPay: string[];
}

export const validatePaymentData = (
  application: Application,
  applicantsToPay: string[]
) => {
  const paymentMethodValidation = string()
    .default('')
    .oneOf([...Object.values(PaymentType), '']);

  const paymentMethod = paymentMethodValidation.validateSync(
    application?.integrationData?.yardi?.paymentInfo?.paymentType
  );

  const isApplicantPaidFor = application.paidById;

  const isApplicantPayingForThemselves = applicantsToPay.includes(
    application.customer.email
  );

  if (!isApplicantPaidFor && !isApplicantPayingForThemselves) {
    throw new BadRequestError(
      `Payment data is not valid to process. Applicant must pay for themselves. Application id: ${application.applicationId}`
    );
  }

  if (!isApplicantPaidFor && !paymentMethod) {
    throw new BadRequestError(
      `Payment data is not valid to process. Application id: ${application.applicationId}`
    );
  }

  if (!paymentMethod && applicantsToPay.length > 0) {
    throw new BadRequestError(
      `Payment data is not valid to process. Application id: ${application.applicationId}`
    );
  }
};

export default validatePaymentData;
