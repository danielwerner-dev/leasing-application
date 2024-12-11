import { string } from 'yup';

const preconditions = string()
  .required('pucode is required')
  .matches(/^\w+-\w+$/, { message: 'Invalid pucode' })
  .typeError('pucode must be a string');

export type PropertyParseResult = {
  propertyCode: string;
  unitCode: string;
};

export const parsePuCode = (puCode: string): PropertyParseResult => {
  preconditions.validateSync(puCode);

  const [propertyCode, unitCode] = puCode.split('-');

  return {
    propertyCode,
    unitCode
  };
};
