import dayjs from 'dayjs';
import { string } from 'yup';

const usaPhoneRegex = /(^[0-9]{10}$)/;
const startWithPlusSign = /^\+.*$/;
const internationalPhoneRegex = /(^\+\d{1,15}$)/;

const NAME_REGEX = /^([^0-9!@#$%^&*~()[\]}{,.;?":/\\|<>]+)?$/;
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const emailValidation = string().matches(EMAIL_REGEX);

export const phoneNumberValidation = string().test(
  'phoneNumber',
  'Invalid phone number',
  function (value) {
    if (!value) {
      return true;
    }

    const validUsaPhone = usaPhoneRegex.test(value);
    const validIntlPhone = internationalPhoneRegex.test(value);
    if (validUsaPhone || validIntlPhone) {
      return true;
    }
    if (startWithPlusSign.test(value)) {
      return this.createError({
        message: `Maximum 16 characters, only numbers and "+” allowed`
      });
    } else {
      return this.createError({
        message: 'Must be 10 digits long, only numbers'
      });
    }
  }
);

export const nameValidation = string().max(40).matches(NAME_REGEX);

export const dateString = string()
  .matches(/\d{2}\/\d{2}\/\d{4}/)
  .test('dateFormat', 'Date format must be MM/DD/YYYY', (value) => {
    return dayjs(value).isValid();
  });
