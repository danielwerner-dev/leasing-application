import { string, array, boolean, object } from 'yup';

import { nameValidation, emailValidation } from '../shared.schema';

export const coapplicantSchema = object({
  firstName: nameValidation.required(),
  lastName: nameValidation.required(),
  type: string().required(),
  email: emailValidation.required(),
  id: string().required()
}).test('unique-email', 'E-mail must be unique', function (value) {
  if (!value.email || !Array.isArray(this.parent)) {
    return true;
  }

  const emailCount = this.parent.filter(
    (entry) => entry.email === value.email
  ).length;

  if (emailCount > 1) {
    return this.createError({
      path: `${this.path}.email`
    });
  }

  return true;
});

const schema = object({
  coapplicants: array(coapplicantSchema).when(
    '$applicationType',
    (applicationType, currentSchema) => {
      if (applicationType === 'primary') {
        return currentSchema;
      }

      return array().max(0);
    }
  ),
  confirmedApplicationInfo: boolean().required().oneOf([true])
});

export default schema;
