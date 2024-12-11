import logger from '$lib/utils/logger';
import dayjs from 'dayjs';

import { updateIntegrationData } from '$lib/repositories/leasing-application/update-application';

import { createGuestCard as createGuestCardService } from '$lib/connectors/yardi-service';

import { applicationForYardi } from '$lib/form-validation/schemas/yardi.schema';

import { isPhoneInternational } from '$lib/utils/phone';
import { parsePuCode } from '$lib/utils/property';

import { Application } from '$lib/types/Application.types';
import { Coapplicant } from '$lib/types/form-data/coapplicants.types';
import { YardiApplicant, YardiGuestCard } from '$lib/types/yardi.types';
import { concatenateAddress } from '$lib/utils/concatenate-address';

export const parseCoapplicantToYardi = (
  coapplicant: Coapplicant
): YardiApplicant => {
  return {
    type: coapplicant.type,
    isLessee: false,
    audit: {
      submittedAt: new Date().toISOString()
    },
    residences: [],
    contactDetails: {
      firstName: coapplicant.firstName,
      lastName: coapplicant.lastName,
      email: coapplicant.email
    }
  };
};

export const buildPrimaryApplicantGuestcard = (
  application: Application
): YardiGuestCard => {
  const {
    property,
    customer,
    formData: { general, residence }
  } = applicationForYardi.validateSync(application);

  const propertyInfo = {
    propertyCode: parsePuCode(property.puCode).propertyCode,
    streetAddress: property.address1
  };

  const applicationData = {
    quotedRent: '0',
    leaseStartDate: dayjs(general.leaseStartDate).format('YYYY-MM-DD'),
    leaseEndDate: dayjs(general.leaseEndDate).format('YYYY-MM-DD')
  };

  const { isInternational, addressLine1, addressLine2 } =
    residence.currentResidence;

  const parsedAddress1 = isInternational
    ? addressLine1.substring(0, 50)
    : addressLine1;

  const parsedAddress2 = isInternational
    ? addressLine1.substring(50, 100)
    : addressLine2;

  const generalPhone =
    general.phone.digits && !isPhoneInternational(general.phone.digits)
      ? general.phone.digits
      : undefined;

  const applicants = [
    {
      type: 'prospect',
      isLessee: general.applicationType === 'personal',
      audit: {
        submittedAt: dayjs().toISOString()
      },
      contactDetails: {
        firstName: general.firstName,
        lastName: general.lastName,
        email: customer.email,
        phoneDigits: generalPhone,
        phoneType: general.phone.type || 'cell'
      },
      residences: [
        {
          type: 'current',
          address1: concatenateAddress(parsedAddress1, parsedAddress2, 100),
          city: residence.currentResidence.city || undefined,
          state: residence.currentResidence.state || undefined,
          postalCode: residence.currentResidence.zipcode || undefined,
          startDate: dayjs(residence.currentResidence.startDate).format(
            'YYYY-MM-DD'
          )
        }
      ]
    }
  ];

  return {
    property: propertyInfo,
    applicationData,
    applicants
  };
};

export const createGuestCard = async (
  application: Application
): Promise<Application> => {
  const guestcardRequest = buildPrimaryApplicantGuestcard(application);
  const guestcard = await createGuestCardService(
    application.property.propertyCode,
    guestcardRequest
  );

  const integrationData = {
    ...application.integrationData,
    yardi: {
      guestcardId: guestcard.guestcardId,
      applicantId: guestcard.applicants[0].applicantId
    }
  };

  logger.info(`Created guestcard: ${guestcard.guestcardId}`);

  logger.info(
    `Updating integration data for application ${application.applicationId} and guestcard ${guestcard.guestcardId}`
  );
  await updateIntegrationData(application.applicationId, integrationData);

  application.integrationData = integrationData;

  return application;
};

export const validateGuestcardData = async (
  application: Application
): Promise<Application> => {
  const {
    integrationData: { yardi }
  } = application;

  if (yardi?.guestcardId) {
    return application;
  }

  return await createGuestCard(application);
};
