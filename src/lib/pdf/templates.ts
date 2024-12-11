import { Application } from '$lib/types/Application.types';
import { maskPiiInfo } from '$lib/utils/mask-pii-info';
import lodashTemplate from 'lodash.template';

export const mapDependent = (dependent) => ({
  firstName: dependent.firstName || '-',
  lastName: dependent.lastName || '-',
  dateOfBirth: dependent.dateOfBirth || '-'
});

export const mapVehicle = (vehicle) => ({
  make: vehicle.make || '-',
  model: vehicle.model || '-',
  color: vehicle.color || '-',
  license: vehicle.license || '-'
});

export const mapAnimal = (animal) => ({
  breed: animal.breed || '-',
  weight: animal.weight || '-',
  name: animal.name || '-',
  animalType: animal.animalType || '-',
  serviceAnimal: animal.serviceAnimal === 'yes' ? 'Yes' : 'No'
});

export const mapAdditionalIncome = (additionalIncome) => ({
  monthlyIncome: additionalIncome.monthlyIncome ?? '-',
  source: additionalIncome.source || '-'
});

export const mapCoapplicant = (coapplicant) => ({
  firstName: coapplicant.firstName || '-',
  lastName: coapplicant.lastName || '-',
  type: coapplicant.type || '-',
  email: coapplicant.email || '-'
});

export const mapPastResidence = (pastResidence) => ({
  zipcode: pastResidence.zipcode || '-',
  city: pastResidence.city || '-',
  addressLine1: pastResidence.addressLine1 || '-',
  addressLine2: pastResidence.addressLine2 || '-',
  state: pastResidence.state || '-',
  type: pastResidence.type || '-',
  isInUSA: pastResidence.isInternational ? 'No' : 'Yes',
  startDate: pastResidence.startDate || '-'
});

export const hasBackgroundInfo = (personalDetails) => {
  return (
    personalDetails.backgroundInfo === true &&
    (personalDetails.bankruptcy === true ||
      personalDetails.evicted === true ||
      personalDetails.felony === true ||
      personalDetails.pendingCharges === true)
  );
};

export const personalDetailsIdType = (personalDetails) => {
  if (personalDetails?.idDocument?.type === 'neither') {
    return '-';
  }

  return `${personalDetails?.idDocument?.type.toUpperCase()} number`;
};

export const fillTemplateValues = (
  template: string,
  application: Application
): string => {
  const compiled = lodashTemplate(template);

  const { property, integrationData, customer } = application;
  const { general, personalDetails, residence, employment, coapplicants } =
    application.formData;

  return compiled({
    propertyStreet: property.address1 || '-',
    propertyCity: property.city || '-',
    propertyState: property.state || '-',
    propertyZip: property.zipcode || '-',
    detailsHomeID: property.puCode ?? '-',

    applicationId: integrationData.yardi?.guestcardId || '-',
    detailsBeds: property.beds ?? '-',
    detailsBaths: property.baths ? Number(property.baths) : '-',
    detailsRent: property.marketRent ?? '-',

    customerEmail: customer?.email || '-',

    generalApplicationType: general?.applicationType || '-',
    generalTitle: general?.title || '-',
    generalFirstName: general?.firstName || '-',
    generalMiddleName: general?.middleName || '-',
    generalLastName: general?.lastName || '-',
    generalMaritalStatus: general?.maritalStatus || '-',
    generalPhoneNumber: general?.phone?.digits ?? '-',
    generalPhoneType: general?.phone?.type || '-',
    generalMethodOfContact: general?.methodOfContact || '-',
    generalLeaseStartDate: general?.leaseStartDate || '-',
    generalLeaseTerm: general?.leaseTerm ? `${general.leaseTerm} months` : '-',

    personalDateOfBirth: personalDetails?.dateOfBirth || '-',
    personalIdType: personalDetailsIdType(personalDetails),
    personalIdNumber: personalDetails?.idDocument?.number
      ? maskPiiInfo(personalDetails?.idDocument?.number)
      : '-',
    personalDriversLicenseNumber: personalDetails?.driversLicense?.number
      ? maskPiiInfo(personalDetails?.driversLicense?.number)
      : '-',
    personalDriversLicenseState: personalDetails?.driversLicense?.state || '-',

    personalDetailsAuditUpdatedAt: personalDetails?.audit.updatedAt
      ? new Date(personalDetails?.audit.updatedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      : '-',
    personalDetailsAuditUpdatedByIp: personalDetails?.audit.updatedByIp
      ? personalDetails?.audit.updatedByIp
      : '-',

    personalDetailsBackGroundInfoAuditUpdatedAt:
      hasBackgroundInfo(personalDetails) && personalDetails?.audit.updatedAt
        ? new Date(personalDetails?.audit.updatedAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        : 'N/A',
    personalDetailsBackGroundInfoAuditUpdatedByIp: hasBackgroundInfo(
      personalDetails
    )
      ? personalDetails?.audit.updatedByIp
      : 'N/A',

    emergencyContactName: personalDetails?.emergencyContact?.name || '-',
    emergencyContactRelationship:
      personalDetails?.emergencyContact?.relationship || '-',
    emergencyContactPhoneType:
      personalDetails?.emergencyContact?.phone?.type || '-',
    emergencyContactPhoneNumber:
      personalDetails?.emergencyContact?.phone?.digits ?? '-',

    hasBackgroundInfo: personalDetails?.backgroundInfo ? 'Yes' : 'No',
    felony: personalDetails?.felony ? 'Yes' : 'No',
    evicted: personalDetails?.evicted ? 'Yes' : 'No',
    pendingCharges: personalDetails?.pendingCharges ? 'Yes' : 'No',
    bankruptcy: personalDetails?.bankruptcy ? 'Yes' : 'No',

    personalHasDependents:
      personalDetails?.dependents && personalDetails.dependents.length
        ? 'Yes'
        : 'No',
    personalDependents:
      personalDetails?.dependents && personalDetails.dependents.length
        ? personalDetails?.dependents.map(mapDependent)
        : [],

    personalHasVehicles:
      personalDetails?.vehicles && personalDetails.vehicles.length
        ? 'Yes'
        : 'No',
    personalVehicles:
      personalDetails?.vehicles && personalDetails.vehicles.length
        ? personalDetails?.vehicles.map(mapVehicle)
        : [],

    personalHasAnimals:
      personalDetails?.animals && personalDetails.animals.length ? 'Yes' : 'No',
    personalAnimals:
      personalDetails?.animals && personalDetails.animals.length
        ? personalDetails?.animals.map(mapAnimal)
        : [],

    hasPastResidences:
      residence?.pastResidences && residence.pastResidences.length
        ? 'Yes'
        : 'No',
    pastResidences:
      residence?.pastResidences && residence.pastResidences.length
        ? residence?.pastResidences.map(mapPastResidence)
        : [],

    currentResidence: {
      zipcode: residence?.currentResidence?.zipcode || '-',
      city: residence?.currentResidence?.city || '-',
      addressLine1: residence?.currentResidence?.addressLine1 || '-',
      addressLine2: residence?.currentResidence?.addressLine2 || '-',
      state: residence?.currentResidence?.state || '-',
      type: residence?.currentResidence?.type || '-',
      isInUSA: residence?.currentResidence?.isInternational ? 'No' : 'Yes',
      startDate: residence?.currentResidence?.startDate || '-'
    },

    employmentActiveMilitary: employment?.activeMilitary ? 'Yes' : 'No',
    employmentStatus: employment?.employmentStatus || '-',
    employmentMonthlyGrossIncome: employment?.monthlyGrossIncome || '-',
    employmentJobTitle: employment?.employment?.jobTitle || '-',
    employerName: employment?.employment?.employer || '-',
    employerPhone: employment?.employment?.phone || '-',
    employerAddressLine1: employment?.employment?.addressLine1 || '-',
    employerAddressLine2: employment?.employment?.addressLine2 || '-',
    employerCity: employment?.employment?.city || '-',
    employerState: employment?.employment?.state || '-',
    employerZipcode: employment?.employment?.zipcode || '-',
    employerInUSA: employment?.employment?.isInternational ? 'No' : 'Yes',

    hasAdditionalIncome:
      employment?.additionalIncome && employment.additionalIncome.length
        ? 'Yes'
        : 'No',
    additionalIncomes:
      employment?.additionalIncome && employment.additionalIncome.length
        ? employment?.additionalIncome.map(mapAdditionalIncome)
        : [],

    hasCoapplicants:
      coapplicants?.coapplicants && coapplicants.coapplicants.length
        ? 'Yes'
        : 'No',
    coapplicants:
      coapplicants?.coapplicants && coapplicants.coapplicants.length
        ? coapplicants?.coapplicants.map(mapCoapplicant)
        : [],
    coapplicantsUpdatedAt: coapplicants?.audit.updatedAt
      ? new Date(coapplicants?.audit.updatedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      : '-',
    coapplicantsUpdatedByIp: coapplicants?.audit.updatedByIp || '-',

    auditSubmittedAtLongFormat: application.audit.submittedAt
      ? new Date(application.audit?.submittedAt).toLocaleString()
      : '-',
    auditSubmittedAt: application.audit.submittedAt
      ? new Date(application.audit?.submittedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      : '-',
    auditSubmittedByIp: application.audit.submittedByIp || '-'
  });
};
