import logger from '$lib/utils/logger';
import { toYardiDocuments } from '$lib/parsers/yardi/documents.parser';
import { Application } from '$lib/types/Application.types';
import { listAndSignDocumentsService } from './GetDocumentsList';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-node';
import { InternalServerError } from '$lib/types/errors';
import { invokeLambda } from '$lib/connectors/lambda';
import { deleteDocument, putDocument } from '$lib/connectors/s3';
import { DocumentType } from '$lib/types/form-data/documents.types';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';
import { logError } from '$lib/utils/errors';
import { YardiDocument } from '$lib/types/yardi.types';

export const getSubmissionDocuments = async (
  application: Application,
  authorization: string
) => {
  const base64Pdf = await invokeApplicationSummaryLambda(
    application.applicationId,
    authorization
  );

  await uploadApplicationSummaryToS3(application.applicationId, base64Pdf);

  const signedDocuments = await listAndSignDocumentsService(application);

  return toYardiDocuments(signedDocuments);
};

export const invokeApplicationSummaryLambda = async (
  applicationId: string,
  authorization: string
): Promise<string> => {
  logger.info(`Generating application summary pdf for ${applicationId}`);
  try {
    const pathParameters = jsonCasingParser(
      {
        applicationId
      },
      CasingPattern.SNAKE
    );

    const invokeCommand = new InvokeCommand({
      FunctionName: 'LeasingApplicationService_GetApplicationSummary',
      Payload: fromUtf8(
        JSON.stringify({
          headers: { authorization },
          pathParameters
        })
      ),
      InvocationType: 'RequestResponse'
    });

    const lambdaResponse = await invokeLambda(invokeCommand);

    if (lambdaResponse?.StatusCode === 200 && lambdaResponse?.Payload) {
      const parsedResponse = JSON.parse(toUtf8(lambdaResponse.Payload));
      return parsedResponse.body;
    }
  } catch (err) {
    logError(
      'services.YardiDocumentService.invokeApplicationSummaryLambda',
      'Error generating application pdf'
    );

    logError(
      'services.YardiDocumentService.invokeApplicationSummaryLambda',
      err
    );
  }

  throw new InternalServerError('Error generating application pdf');
};

export const uploadApplicationSummaryToS3 = async (
  applicationId: string,
  base64Pdf: string
) => {
  logger.info(`Uploading application summary pdf for ${applicationId}`);
  try {
    await putDocument(
      applicationId,
      `application-summary-${new Date().toISOString()}.pdf`,
      DocumentType['application-summary'],
      'application-summary.pdf',
      Buffer.from(base64Pdf, 'base64')
    );
  } catch (err) {
    logError(
      'services.YardiDocumentService.uploadApplicationSummaryToS3',
      'Error uploading application pdf'
    );
    throw err;
  }
};

export const deleteApplicationSummariesFromS3 = async (
  applicationId: string,
  documents: YardiDocument[]
) => {
  logger.info(`Deleting application summary pdf(s) for ${applicationId}`);
  try {
    const applicationSummaries = documents.filter((yardiDocument) => {
      return yardiDocument.documentType === DocumentType['application-summary'];
    });

    const promises = applicationSummaries.map(async (applicationSummary) => {
      await deleteDocument(applicationId, applicationSummary.documentId);
    });

    await Promise.all(promises);
  } catch (err) {
    logError(
      'services.YardiDocumentService.deleteApplicationSummariesFromS3',
      'Error deleting application pdf'
    );
    throw err;
  }
};
