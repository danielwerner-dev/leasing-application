import { Coapplicants } from './coapplicants.types';
import { Documents } from './documents.types';
import { Employment } from './employment.types';
import { General } from './general.types';
import { PersonalDetails } from './personal-details.types';
import { Residences } from './residence.types';

export interface FormData {
  general?: General;
  personalDetails?: PersonalDetails;
  residence?: Residences;
  employment?: Employment;
  documents?: Documents;
  coapplicants?: Coapplicants;
}

export type {
  General,
  PersonalDetails,
  Residences,
  Employment,
  Documents,
  Coapplicants
};
