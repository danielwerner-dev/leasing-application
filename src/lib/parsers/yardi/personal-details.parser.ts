import { Application } from '$lib/types/Application.types';
import {
  Animal,
  Dependent,
  Vehicle
} from '$lib/types/form-data/personal-details.types';
import { YardiDocument, YardiPersonalDetails } from '$lib/types/yardi.types';
import { getDateOnly } from '$lib/utils/date';
import { concatenateAddress } from '$lib/utils/concatenate-address';
import personalDetailsSchema from '$lib/form-validation/schemas/form-data/personal-details.schema';
import employmentSchema, {
  Employment
} from '$lib/form-validation/schemas/form-data/employment.schema';
import { isPhoneInternational } from '$lib/utils/phone';

export const parsePersonalDetailsToYardi = (
  application: Application,
  documents: YardiDocument[]
): YardiPersonalDetails => {
  const { formData } = application;
  const personalDetailsFormData = personalDetailsSchema.validateSync(
    formData.personalDetails
  );

  const employment = employmentSchema.validateSync(formData.employment);

  const {
    dateOfBirth,
    idDocument,
    driversLicense,
    emergencyContact,
    dependents = [],
    vehicles = [],
    animals = [],
    backgroundInfo,
    bankruptcy,
    evicted,
    felony,
    hasReviewedBackgroundPolicy,
    acceptedTerms,
    reviewedProvidedInfo,
    pendingCharges
  } = personalDetailsFormData;

  const mappedDependents = dependents.map(
    ({ firstName, lastName, dateOfBirth }: Dependent) => ({
      firstName,
      lastName,
      birthDate: getDateOnly(dateOfBirth)
    })
  );

  const mappedVehicles = vehicles.map(
    ({ make, model, color, license }: Vehicle) => ({
      make,
      model,
      color,
      licensePlate: license,
      licenseState: undefined
    })
  );

  const mappedAnimals = animals.map(
    ({ animalType, breed, weight, name, serviceAnimal }: Animal) => ({
      type: animalType,
      breed,
      weight,
      name,
      serviceAnimal: serviceAnimal.toLowerCase() === 'yes'
    })
  );

  const emergencyContactPhone =
    emergencyContact.phone.digits &&
    !isPhoneInternational(emergencyContact.phone.digits)
      ? emergencyContact.phone.digits
      : '0000000000';

  const personalDetails: YardiPersonalDetails = {
    identification: {
      birthDate: getDateOnly(dateOfBirth),
      socialSecurity: idDocument.number || undefined,
      licenseNumber: driversLicense.number || undefined,
      licenseIssuer: driversLicense.state || undefined
    },
    emergencyContact: {
      name: emergencyContact.name,
      contactNumber: emergencyContactPhone,
      contactType: emergencyContact.phone.type || undefined,
      relationship: emergencyContact.relationship
    },
    dependents: mappedDependents,
    vehicles: mappedVehicles,
    animals: mappedAnimals,
    background: {
      felony: felony || Boolean(backgroundInfo),
      bankruptcy: bankruptcy || Boolean(backgroundInfo),
      evictions: evicted || Boolean(backgroundInfo),
      pendingLegal: pendingCharges || Boolean(backgroundInfo)
    },
    hasReadAndUnderstood: hasReviewedBackgroundPolicy,
    hasReadAndAcceptedTerms: acceptedTerms,
    hasConfirmedInformationTruth: reviewedProvidedInfo,
    income: parseIncomeToYardi(employment),
    documents: documents
  };

  return {
    ...personalDetails
  };
};

export const parseIncomeToYardi = (employment: Employment) => {
  const AditionalIncomeAbreviations = {
    retirement: 'R',
    childSupport: 'CS',
    commissionsBonuses: 'CB',
    unemploymentIncome: 'UI',
    socialSecurityVABenefits: 'SSVAB',
    scholarshipGrant: 'SG',
    other: 'O'
  };

  const yardiEmployment = {
    status: 'current',
    monthlyGrossIncome: employment.monthlyGrossIncome,
    activeInMilitary: employment.activeMilitary
  };

  const addititonalIncomeTotal = employment.additionalIncome?.reduce(
    (accumulator, currentValue) => {
      return accumulator + Number(currentValue.monthlyIncome);
    },
    0
  );

  const incomeSourcesAbreviations = employment.additionalIncome?.map(
    ({ source }) => AditionalIncomeAbreviations[source]
  );
  const uniqueIncomeSources = [...new Set(incomeSourcesAbreviations)];
  const uniqueIncomeSourcesString = uniqueIncomeSources.join('/');

  const employerPhone =
    employment.employment.phone &&
    !isPhoneInternational(employment.employment.phone)
      ? employment.employment.phone
      : undefined;

  let employedInfo;
  if (employment.employmentStatus === 'employed') {
    employedInfo = {
      address1: concatenateAddress(
        employment.employment.addressLine1,
        employment.employment.addressLine2,
        80
      ),
      city: employment.employment.city || undefined,
      state: employment.employment.state || undefined,
      postalCode: employment.employment.zipcode || undefined,
      startDate: '1900-01-01',
      country: 'US',
      name: employment.employment.employer || undefined,
      employerPhone: employerPhone,
      jobTitle: employment.employment.jobTitle || undefined
    };
  }

  return {
    employer: [{ ...yardiEmployment, ...employedInfo }],
    additional: {
      incomeSource: uniqueIncomeSourcesString || undefined,
      monthlyIncome: String(addititonalIncomeTotal)
    }
  };
};
