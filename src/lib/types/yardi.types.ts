import { PaymentType } from './Application.types';
import { Coapplicant } from './form-data/coapplicants.types';

export interface YardiGuestCard {
  property: {
    propertyCode: string;
    streetAddress: string;
  };
  applicationData: {
    quotedRent: string;
    leaseStartDate: string;
    leaseEndDate: string;
  };
  applicants: YardiApplicant[];
}

export type YardiGuestCardResponse = {
  guestcardId: string;
  applicants: [
    {
      applicantId: string;
      email: string;
    }
  ];
};

export interface YardiGuestcardStatus {
  status: 'Draft' | 'Pending' | 'Approved' | 'Denied' | 'Canceled';
  guestcardId: string;
}

export type YardiSaveBankAccountResponse = [
  {
    payerId: string;
    description: string;
    paymentType: string;
  }
];

export type YardiPaymentTypesResponse = [
  {
    payerId: string;
    accountHolder: string;
    description: string;
    paymentType: PaymentType;
  }
];

export type YardiDeletePaymentResponse = {
  isSuccess: boolean;
  message: string;
};

export type YardiApplicant = {
  type: string;
  isLessee: boolean;
  applicantId?: string;
  audit: {
    submittedAt: string;
  };
  contactDetails: YardiContactDetails;
  residences: YardiResidence[];
  personalDetails?: YardiPersonalDetails;
  userIpAddress?: string;
  createDate?: string;
  payment?: number;
  paymentType?: string;
  payerId?: string;
  notes?: string;
};

export type YardiContactDetails = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  title?: string;
  maritalStatus?: string;
  phoneDigits?: string;
  phoneType?: string;
  methodOfContact?: string;
};

export type YardiResidence = {
  type: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  startDate: string;
  endDate?: string;
  country?: string;
};

export type YardiIdentification = {
  birthDate: string;
  socialSecurity?: string;
  licenseNumber?: string;
  licenseIssuer?: string;
};

export type YardiEmergencyContact = {
  name: string;
  contactNumber: string;
  contactType?: string;
  relationship: string;
};

export type YardiDependent = {
  firstName: string;
  lastName: string;
  birthDate: string;
};

export type YardiVehicle = {
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  licenseState?: string;
};

export type YardiAnimal = {
  type: string;
  breed: string;
  weight: string;
  name: string;
  serviceAnimal: boolean;
};

export type YardiEmployment = {
  status: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  name?: string;
  startDate?: string;
  country?: string;
  employerPhone?: string;
  jobTitle?: string;
  endDate?: string;
  monthlyGrossIncome: string;
  activeInMilitary?: boolean;
};

export type YardiIncome = {
  employer: YardiEmployment[];
  additional: YardiAdditionalIncome;
};

export type YardiAdditionalIncome = {
  monthlyIncome: string;
  incomeSource?: string;
};

export type YardiPersonalDetails = {
  identification: YardiIdentification;
  emergencyContact: YardiEmergencyContact;
  dependents: YardiDependent[];
  vehicles: YardiVehicle[];
  animals: YardiAnimal[];
  background: {
    felony?: boolean;
    bankruptcy?: boolean;
    evictions?: boolean;
    pendingLegal?: boolean;
  };
  hasReadAndUnderstood?: boolean;
  hasReadAndAcceptedTerms: boolean;
  hasConfirmedInformationTruth: boolean;
  income: YardiIncome;
  documents: YardiDocument[];
  notes?: string;
};

export interface YardiDocument {
  documentId: string;
  documentName?: string;
  documentType?: string;
  dataType: DocumentDataType;
  data: string;
}

export enum DocumentDataType {
  URL = 'url'
}

export enum YardiBankAccountType {
  checking = 'checking',
  savings = 'savings'
}

export interface NewPrimaryPayload {
  originalGuestcardId: string;
  newGuestcardId: string;
  applicants: NewApplicantPayload[];
}

export interface NewApplicantPayload {
  originalApplicantId: string;
  newApplicantId: string;
}

export enum GuestCardType {
  prospect = 'prospect',
  roommate = 'roommate',
  guarantor = 'guarantor',
  spouse = 'spouse',
  other = 'other'
}

export enum YardiPaymentResponse {
  Settled = 'Settled',
  Declined = 'Declined',
  Error = 'Error',
  Pending = 'Pending'
}

export interface YardiApplicationSubmissionResponse {
  prospectCodes: {
    guestcardId: string;
    applicants: {
      applicantId: string;
    }[];
  };
  paymentInfo: {
    isSuccess?: boolean;
    performanceReceipt?: string;
    receiptId?: string;
    paymentReference?: string;
    amount?: string;
    transactionId?: string;
    transactionStatus?: string;
    billingName?: string;
  };
  coapplicants: YardiCoapplicant[];
}

export enum DocumentType {
  GOVERNMENT_ISSUED_ID = 'government-issued-id',
  INCOME_PROOF = 'income-proof',
  RECEIPT = 'receipt',
  SUPPLEMENTARY = 'supplementary',
  APPLICATION_SUMMARY = 'application-summary'
}

export interface YardiCoapplicant extends Coapplicant {
  applicantId: string;
}
