import { ApplicationType } from '$lib/types/Application.types';

export const applicationSummaryFixture = () => {
  return [
    {
      applicationId: '15959714-8f6d-4088-b84c-1e2ab7fe02be',
      firstName: 'John',
      lastName: 'Doe',
      email: 'a@a.com',
      type: ApplicationType.primary,
      isPaid: true,
      paidById: '15959714-8f6d-4088-b84c-1e2ab7fe02be',
      applicationStatus: 'pending',
      integrationData: {
        yardi: {
          guestcardId: 'p1515548'
        }
      },
      property: {
        propertyCode: '10000784'
      }
    },
    {
      applicationId: 'c32d8b45-92fe-44f6-8b61-42c2107dfe87',
      firstName: 'Rick',
      lastName: 'Morty',
      email: 'rick.morty@rm.com',
      type: ApplicationType.primary,
      isPaid: true,
      paidById: '443b49dc-6e0b-471e-8438-7e4819988726',
      applicationStatus: 'draft',
      integrationData: {
        yardi: {
          guestcardId: 'p1005523'
        }
      },
      property: {
        propertyCode: '10000999'
      }
    }
  ];
};
