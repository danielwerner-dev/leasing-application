import { string } from 'yup';

export const getApplicationUrl = (applicationId: string) => {
  const baseUrl = string()
    .required('Leasing Application Base URL is required')
    .validateSync(process.env.LEASING_APPLICATION_BASE_URL);

  return baseUrl + `/applications/${applicationId}`;
};
