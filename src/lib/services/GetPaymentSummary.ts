import { listCoapplicantApplications } from '$lib/repositories/leasing-application/read-application';

import { Application, ApplicationType } from '$lib/types/Application.types';

export const parsePaymentSummary = (applications: Application[]) => {
  const paymentSummaries = applications.map((application) => {
    const {
      primaryApplicationData,
      customer: { email },
      formData,
      applicationId,
      paidById
    } = application;

    const firstName =
      formData.general?.firstName || primaryApplicationData?.firstName;
    const lastName =
      formData.general?.lastName || primaryApplicationData?.lastName;
    const applicationType =
      formData.general?.applicationType ||
      primaryApplicationData?.applicationType;

    return {
      applicationId: applicationId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      type: applicationType,
      isPaid: Boolean(paidById),
      paidById: paidById
    };
  });

  return paymentSummaries;
};

export const getPaymentSummaryService = async (application: Application) => {
  const isPrimary = application.applicationType === ApplicationType.primary;

  const primaryApplicationId = isPrimary
    ? application.applicationId
    : application.primaryApplicationId;

  const coapplicantApplications = await listCoapplicantApplications(
    primaryApplicationId,
    { includePrimary: true }
  );

  return parsePaymentSummary(coapplicantApplications);
};
