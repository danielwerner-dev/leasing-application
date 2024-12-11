export interface AdditionalIncome {
  id: string;
  monthlyIncome: string;
  source: string;
}

export interface Employment {
  employmentStatus: string;
  employment: {
    employer: string;
    phone: string;
    isInternational: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipcode: string;
    jobTitle: string;
  };
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
  monthlyGrossIncome: string;
  additionalIncome: Array<AdditionalIncome>;
  activeMilitary: boolean;
  metadata: {
    config: {
      isCalifornia: boolean;
    };
  };
}
