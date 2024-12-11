import { addBankAccount } from '$lib/connectors/yardi-service';

import { createYardiPaymentInfo } from '$lib/services/UpdateIntegrationData';

import { validateGuestcardData } from '$lib/utils/guestcard';

import { type Application, PaymentType } from '$lib/types/Application.types';
import { InternalServerError } from '$lib/types/errors';

interface BankPaymentInfo {
  accountNumber: string;
  routingNumber: string;
  nameOnAccount: string;
  accountType: string;
}

export const createBankPaymentTypeService = async (
  application: Application,
  { accountNumber, routingNumber, nameOnAccount, accountType }: BankPaymentInfo
) => {
  const workingApplication = await validateGuestcardData(application);

  const response = await addBankAccount(
    workingApplication,
    accountNumber,
    routingNumber,
    nameOnAccount,
    accountType
  );

  if (!response || !response.length) {
    const { applicationId } = workingApplication;
    throw new InternalServerError(
      `Error when trying to add bank account to application: ${applicationId}`
    );
  }

  const paymentInfo = {
    paymentType: PaymentType.ACH,
    payerId: response[0].payerId,
    description: response[0].description,
    nameOnAccount,
    accountType
  };

  await createYardiPaymentInfo(application, paymentInfo);

  return response;
};
