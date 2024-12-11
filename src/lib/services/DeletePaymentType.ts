import { deletePaymentType } from '$lib/connectors/yardi-service';
import { Application, PaymentType } from '$lib/types/Application.types';
import { updateIntegrationDataService } from '$lib/services/UpdateIntegrationData';
import { mixed, object, string } from 'yup';

export const deletePaymentTypeService = async (application: Application) => {
  const preconditions = object({
    guestcardId: string().required('Missing guestcard id'),
    applicantId: string().required('Missing applicant id'),
    paymentInfo: object({
      payerId: string().required('Missing payer id'),
      paymentType: mixed<PaymentType>()
        .required('Missing payment type')
        .oneOf(Object.values(PaymentType))
    }).required()
  }).required();

  const {
    guestcardId,
    applicantId,
    paymentInfo: { payerId, paymentType }
  } = preconditions.validateSync(application.integrationData.yardi);

  await deletePaymentType(
    application.property.propertyCode,
    applicantId,
    guestcardId,
    payerId,
    paymentType
  );

  await updateIntegrationDataService(application, {
    yardi: {
      guestcardId,
      applicantId,
      awaitingPaymentInfo: false
    }
  });
};
