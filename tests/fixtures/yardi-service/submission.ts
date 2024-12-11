import { Coapplicant } from '$lib/types/form-data/coapplicants.types';
import {
  YardiApplicant,
  YardiApplicationSubmissionResponse,
  YardiCoapplicant,
  YardiGuestCardResponse
} from '$lib/types/yardi.types';

export const applicationSubmissionResponseFixture =
  (): YardiApplicationSubmissionResponse => {
    return {
      prospectCodes: {
        guestcardId: '123',
        applicants: []
      },
      paymentInfo: {},
      coapplicants: []
    };
  };

export const yardiInfoFixture = () => {
  return {
    guestcardId: '123',
    applicantId: '456'
  };
};

export const guestcardResponseFixture = (): YardiGuestCardResponse => {
  return {
    guestcardId: '123',
    applicants: [
      {
        applicantId: '456',
        email: 'a@a.com'
      }
    ]
  };
};

export const coapplicantFixture = (): Coapplicant => {
  return {
    type: 'roommate',
    firstName: 'John',
    lastName: 'Doe',
    email: 'a@a.com',
    id: '1'
  };
};

export const yardiCoapplicantFixture = (): YardiCoapplicant => {
  return {
    ...coapplicantFixture(),
    applicantId: '123'
  };
};

export const yardiApplicantFixture = (): YardiApplicant => {
  return {
    type: 'primary',
    isLessee: true,
    audit: {
      submittedAt: '2020-01-01T00:00:00.000Z'
    },
    contactDetails: {
      email: 'some@email.com',
      firstName: 'John',
      lastName: 'Doe'
    },
    residences: []
  };
};
