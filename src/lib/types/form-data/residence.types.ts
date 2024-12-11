export interface Residence {
  type: string;
  id: string;
  isInternational: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country?: string;
  state: string;
  zipcode: string;
  startDate: string;
}

export interface Residences {
  currentResidence: Residence;
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
  pastResidences: Residence[];
}
