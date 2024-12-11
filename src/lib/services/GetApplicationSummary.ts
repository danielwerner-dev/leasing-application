import { generateApplicationPdf } from '$lib/pdf/generate-pdf';
import { Application } from '$lib/types/Application.types';

export const getApplicationPDFService = async (application: Application) => {
  return await generateApplicationPdf(application);
};
