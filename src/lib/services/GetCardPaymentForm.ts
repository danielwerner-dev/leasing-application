import { getCardPaymentForm } from '$lib/connectors/yardi-service';

import { updateAwaitingPaymentInfo } from '$lib/services/UpdateIntegrationData';

import { validateGuestcardData } from '$lib/utils/guestcard';

import { Application } from '$lib/types/Application.types';

export const getCardPaymentFormService = async (
  application: Application,
  postBackUrl: string,
  isCreditCard: 'true' | 'false'
) => {
  const workingApplication = await validateGuestcardData(application);

  const htmlScript = await getCardPaymentForm(
    workingApplication,
    postBackUrl,
    isCreditCard
  );

  const awaitingPaymentInfo = true;
  await updateAwaitingPaymentInfo(workingApplication, awaitingPaymentInfo);

  return htmlScript;
};
