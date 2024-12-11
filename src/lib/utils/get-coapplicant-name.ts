import { object, string } from 'yup';
import { Application } from '$lib/types/Application.types';

const preconditions = object({
  firstName: string().required(),
  lastName: string().required()
});

export const getCoapplicantName = (application: Application): string => {
  const { firstName, lastName } = preconditions.validateSync(
    application.primaryApplicationData
  );
  return `${firstName} ${lastName}`;
};
