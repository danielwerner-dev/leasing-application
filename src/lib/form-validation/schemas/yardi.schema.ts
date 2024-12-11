import { bool, object, string } from 'yup';

export const applicationForYardi = object({
  applicationId: string().required(),
  property: object({
    puCode: string().required(),
    address1: string().required(),
    city: string().required(),
    state: string().required(),
    zipcode: string().required()
  }).required(),
  customer: object({
    email: string().required()
  }),
  formData: object({
    general: object({
      applicationType: string(),
      firstName: string().required(),
      lastName: string().required(),
      phone: object({
        type: string(),
        digits: string().required()
      }),
      leaseStartDate: string().required(),
      leaseEndDate: string().required()
    }).required(),
    residence: object({
      currentResidence: object({
        addressLine1: string().required(),
        addressLine2: string(),
        city: string(),
        state: string(),
        zipcode: string(),
        startDate: string().required(),
        isInternational: bool().required()
      })
    })
  }).required()
});
