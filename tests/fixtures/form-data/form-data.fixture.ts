import { generalMock, generalContext } from './general.fixture';
import { personalDetailsMock } from './personal-details.fixture';
import { mockResidenceSection } from './residences.fixture';
import { employmentMock } from './employment.fixture';
import { mockCoapplicants } from './coapplicants.fixture';

export function mockFormData() {
  return {
    general: generalMock(),
    personalDetails: personalDetailsMock(),
    residence: mockResidenceSection(),
    employment: employmentMock(),
    coapplicants: mockCoapplicants()
  };
}

export function mockContext() {
  return {
    market: 'dallas-tx',
    availableFrom: generalContext().availableFrom,
    availableTo: generalContext().availableTo,
    applicationType: 'primary'
  };
}
