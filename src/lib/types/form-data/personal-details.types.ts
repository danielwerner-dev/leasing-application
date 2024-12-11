export interface Animal {
  animalType: string;
  breed: string;
  weight: string;
  name: string;
  serviceAnimal: string;
  id: string;
}

export interface Dependent {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  id: string;
}

export interface Vehicle {
  make: string;
  model: string;
  color: string;
  license: string;
  id: string;
}

export interface PersonalDetails {
  dateOfBirth: string;
  idDocument: {
    type: string;
    number: string;
  };
  driversLicense: {
    number: string;
    state: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: {
      digits: string;
      type: string;
    };
  };
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
  animals: Animal[];
  dependents: Dependent[];
  vehicles: Vehicle[];
  backgroundInfo: boolean;
  felony?: boolean;
  evicted?: boolean;
  pendingCharges?: boolean;
  bankruptcy?: boolean;
  hasReviewedBackgroundPolicy?: boolean;
  acceptedTerms: boolean;
  reviewedProvidedInfo: boolean;
  metadata: {
    config: {
      isSouthFlorida: boolean;
    };
  };
}
