import { boolean, object } from 'yup';

const schema = object({
  noIncome: boolean().required()
});

export default schema;
