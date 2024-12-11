export interface Coapplicant {
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  id: string;
}

export interface Coapplicants {
  coapplicants: Coapplicant[];
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
  confirmedApplicationInfo: boolean;
}
