import { applicationFixture } from '$fixtures';
import {
  deleteApplicationSummariesFromS3,
  getSubmissionDocuments
} from '$lib/services/YardiDocumentService';
import * as listApplication from '$lib/services/GetDocumentsList';
import * as parsers from '$lib/parsers/yardi/documents.parser';
import { YardiDocument } from '$lib/types/yardi.types';
import * as lambda from '$lib/connectors/lambda';
import { fromUtf8 } from '@aws-sdk/util-utf8-node';
import { InvokeCommandOutput } from '@aws-sdk/client-lambda';
import * as s3 from '$lib/connectors/s3';
import { DocumentType } from '$lib/types/form-data/documents.types';

jest.mock('$lib/services/GetDocumentsList', () => {
  return {
    listAndSignDocumentsService: jest.fn()
  };
});

jest.mock('$lib/pdf/generate-pdf', () => {
  return {
    generateApplicationPdf: jest.fn()
  };
});

jest.mock('$lib/parsers/yardi/documents.parser', () => {
  return {
    toYardiDocuments: jest.fn()
  };
});

jest.mock('$lib/connectors/s3', () => {
  return {
    putDocument: jest.fn(),
    deleteDocument: jest.fn()
  };
});

jest.mock('@aws-sdk/client-lambda');
jest.mock('$lib/connectors/lambda');

describe('YardiDocumentService', () => {
  const now = new Date();
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });
  describe('getSubmissionDocuments', () => {
    it('should return customer documents', async () => {
      jest
        .spyOn(parsers, 'toYardiDocuments')
        .mockReturnValue([
          { documentId: 'signed-document1' } as unknown as YardiDocument,
          { documentId: 'signed-document2' } as unknown as YardiDocument
        ]);

      jest.spyOn(lambda, 'invokeLambda').mockResolvedValue({
        StatusCode: 200,
        Payload: fromUtf8('{"statusCode": 200, "body": "BASE64PDF"}')
      } as unknown as InvokeCommandOutput);

      const application = applicationFixture();
      const authorization = 'Bearer some-token';

      const response = await getSubmissionDocuments(application, authorization);

      expect(listApplication.listAndSignDocumentsService).toHaveBeenCalled();
      expect(parsers.toYardiDocuments).toHaveBeenCalled();
      expect(s3.putDocument).toHaveBeenCalledWith(
        application.applicationId,
        `application-summary-${now.toISOString()}.pdf`,
        'application-summary',
        'application-summary.pdf',
        Buffer.from('BASE64PDF', 'base64')
      );

      expect(response.length).toBe(2);
      expect(response).toEqual(
        expect.arrayContaining([
          { documentId: 'signed-document1' },
          { documentId: 'signed-document2' }
        ])
      );
    });

    it('should throw when fails to generate application summary', async () => {
      jest.spyOn(lambda, 'invokeLambda').mockRejectedValue(new Error('error'));
      const application = applicationFixture();
      const authorization = 'Bearer some-token';

      await expect(
        getSubmissionDocuments(application, authorization)
      ).rejects.toThrow('Error generating application pdf');

      expect(
        listApplication.listAndSignDocumentsService
      ).not.toHaveBeenCalled();
      expect(parsers.toYardiDocuments).not.toHaveBeenCalled();
    });

    it('should throw when fails to upload application summary', async () => {
      jest.spyOn(lambda, 'invokeLambda').mockResolvedValue({
        StatusCode: 200,
        Payload: fromUtf8('{"statusCode": 200, "body": "BASE64PDF"}')
      } as unknown as InvokeCommandOutput);

      jest.spyOn(s3, 'putDocument').mockRejectedValue(new Error('error'));

      const application = applicationFixture();
      const authorization = 'Bearer some-token';

      await expect(
        getSubmissionDocuments(application, authorization)
      ).rejects.toThrow('error');

      expect(
        listApplication.listAndSignDocumentsService
      ).not.toHaveBeenCalled();
      expect(parsers.toYardiDocuments).not.toHaveBeenCalled();
    });
  });

  describe('deleteApplicationSummariesFromS3', () => {
    it('should filter application summaries and call deleteDocument', async () => {
      jest.spyOn(s3, 'deleteDocument');

      await expect(
        deleteApplicationSummariesFromS3('application-id', [
          {
            documentType: DocumentType['application-summary']
          } as YardiDocument,
          {
            documentType: DocumentType['government-issued-id']
          } as YardiDocument
        ])
      ).resolves.not.toThrow();

      expect(s3.deleteDocument).toHaveBeenCalledTimes(1);
    });

    it('should not call deleteDocument', async () => {
      jest.spyOn(s3, 'deleteDocument');

      await expect(
        deleteApplicationSummariesFromS3('application-id', [])
      ).resolves.not.toThrow();

      expect(s3.deleteDocument).not.toHaveBeenCalled();
    });

    it('should not call deleteDocument', async () => {
      jest.spyOn(s3, 'deleteDocument').mockRejectedValue(new Error('error'));

      await expect(
        deleteApplicationSummariesFromS3('application-id', [
          {
            documentType: DocumentType['application-summary']
          } as YardiDocument
        ])
      ).rejects.toThrow('error');
    });
  });
});
