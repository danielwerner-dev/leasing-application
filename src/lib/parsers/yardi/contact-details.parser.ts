import { Application } from '$lib/types/Application.types';
import { YardiContactDetails } from '$lib/types/yardi.types';
import generalSchema from '$lib/form-validation/schemas/form-data/general.schema';
import { getValidationContext } from '$lib/utils/form-validation';
import { isPhoneInternational } from '$lib/utils/phone';

export const parseContactDetailsToYardi = (
  application: Application
): YardiContactDetails => {
  const { formData, customer } = application;

  const validationContext = getValidationContext(application);
  const general = generalSchema.validateSync(formData.general, {
    context: validationContext
  });

  const {
    title,
    firstName,
    lastName,
    middleName,
    maritalStatus,
    methodOfContact,
    phone
  } = general;

  const generalPhone =
    phone.digits && !isPhoneInternational(phone.digits)
      ? phone.digits
      : undefined;

  const contactDetails: YardiContactDetails = {
    title: title || undefined,
    firstName,
    middleName: middleName || undefined,
    lastName,
    email: customer.email,
    maritalStatus: maritalStatus || undefined,
    phoneDigits: generalPhone,
    phoneType: phone.type || undefined,
    methodOfContact: getMethodOfContact(methodOfContact)
  };

  return contactDetails;
};

export const getMethodOfContact = (methodOfContact: string) => {
  if (!methodOfContact) {
    return;
  }

  return methodOfContact === 'email' ? 'home' : 'cell';
};
