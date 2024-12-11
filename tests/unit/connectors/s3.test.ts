import * as connector from '$lib/connectors/s3';
import * as presigner from '@aws-sdk/s3-request-presigner';
import * as s3 from '@aws-sdk/client-s3';
import {
  commandFixture,
  documentIdFixture,
  fileFixture,
  tagsFixtures
} from '$fixtures/s3.fixtures';
import { DocumentType } from '$lib/types/form-data/documents.types';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockReturnValue({
      send: () => ({
        $metadata: {
          httpStatusCode: 200
        }
      })
    }),
    DeleteObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    GetObjectTaggingCommand: jest.fn(),
    ListObjectsV2Command: jest.fn(),
    PutObjectCommand: jest.fn(),
    HeadObjectCommand: jest.fn().mockImplementation()
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn()
  };
});

jest.mock('@aws-sdk/s3-presigned-post', () => {
  return {
    PresignedPost: jest.fn()
  };
});

jest.useFakeTimers().setSystemTime(Date.now());

const BUCKET_NAME = 'leasing-application-documents-jest-test-invh';

describe('S3 connector tests', () => {
  describe('getDocumentUploadUrl', () => {
    let applicationId: any;
    let documentType: any;
    let documentDisplayName: any;
    let s3Response: any;

    beforeEach(() => {
      applicationId = 'application-id';
      documentType = 'document-type';
      documentDisplayName = 'document-name.pdf';
      s3Response = {
        Contents: ['hello', 'world', 'test']
      };

      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue(s3Response as never);
      jest.spyOn(s3, 'PutObjectCommand').mockReturnValue(commandFixture());
      jest.spyOn(presigner, 'getSignedUrl').mockResolvedValue('signed-url');
    });

    it('returns documentUrl on success', async () => {
      const res = await connector.getDocumentUploadUrl(
        applicationId,
        documentType,
        documentDisplayName
      );

      const now = new Date().toISOString();
      const documentId = `${applicationId}/${documentType}_${now}.pdf`;

      const expectedRes = {
        documentId: documentId,
        documentUrl: 'signed-url'
      };

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Key: documentId,
        Tagging: `document-type=${documentType}&document-display-name=${documentDisplayName}`
      };

      const expectedSignerOptions = {
        expiresIn: 180,
        unhoistableHeaders: new Set(['x-amz-tagging'])
      };

      expect(res).toEqual(expectedRes);
      expect(s3.PutObjectCommand).toHaveBeenCalledWith(expectedBucketParams);
      expect(presigner.getSignedUrl).toHaveBeenCalledWith(
        connector.s3Client,
        { hello: 'world' },
        expectedSignerOptions
      );
    });

    it(`doesn't return a documentUrl if 4 files exist`, async () => {
      jest.spyOn(connector.s3Client, 'send').mockResolvedValue({
        Contents: ['hello', 'world', 'test', 'again']
      } as never);
      await expect(
        connector.getDocumentUploadUrl(
          applicationId,
          documentType,
          documentDisplayName
        )
      ).rejects.toThrow();
    });
  });

  describe('getDocumentDownloadUrl', () => {
    let applicationId: any;
    let documentId: any;
    beforeEach(() => {
      applicationId = 'application-id';
      documentId = 'document-id';

      jest.spyOn(s3, 'GetObjectCommand').mockReturnValue(commandFixture());
      jest.spyOn(presigner, 'getSignedUrl').mockResolvedValue('signed-url');
    });

    it('returns download info on success', async () => {
      const res = await connector.getDocumentDownloadUrl(
        applicationId,
        documentId
      );

      const expectedRes = {
        documentId: documentId,
        documentUrl: 'signed-url'
      };

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Key: `${applicationId}/${documentId}`
      };

      const expectedSignerOptions = {
        expiresIn: 180
      };

      expect(res).toEqual(expectedRes);
      expect(s3.GetObjectCommand).toHaveBeenCalledWith(expectedBucketParams);
      expect(presigner.getSignedUrl).toHaveBeenCalledWith(
        connector.s3Client,
        { hello: 'world' },
        expectedSignerOptions
      );
    });

    it('throws an error if the document does not exist', async () => {
      jest.spyOn(connector.s3Client, 'send').mockResolvedValue({
        $metadata: {
          httpStatusCode: 404
        }
      } as never);

      await expect(
        connector.getDocumentDownloadUrl(applicationId, documentId)
      ).rejects.toThrow();
    });
  });

  describe('listRawApplicationDocuments', () => {
    let applicationId: any;
    let documentType: any;
    let s3Response: any;

    beforeEach(() => {
      applicationId = 'application-id';
      documentType = 'government-issued-id';

      s3Response = {
        Contents: ['hello', 'world', 'test']
      };

      jest.spyOn(s3, 'ListObjectsV2Command').mockReturnValue(commandFixture());
      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue(s3Response as never);
    });

    it('returns the contents', async () => {
      const res = await connector.listRawApplicationDocuments(
        `${applicationId}/${documentType}`
      );

      const expectedRes = ['hello', 'world', 'test'];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: `${applicationId}/${documentType}`
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
    });
  });

  describe('listApplicationDocuments', () => {
    let applicationId: any;
    let s3Response: any;
    let documentTagReturn: any;

    beforeEach(() => {
      applicationId = 'application-id';

      s3Response = {
        Contents: ['hello', 'world', 'test']
      };

      documentTagReturn = {
        documentId: 'test-document-id',
        type: 'test-type',
        tags: ['tag-1', 'tag-2', 'tag-3']
      };

      jest.spyOn(s3, 'ListObjectsV2Command').mockReturnValue(commandFixture());
      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue(s3Response as never);
      jest
        .spyOn(connector, 'getTagCommand')
        .mockReturnValue('command-test' as any);
      jest.spyOn(connector, 'getDocumentId').mockReturnValue('document-id');
      jest
        .spyOn(connector, 'getDocumentTag')
        .mockResolvedValue(documentTagReturn);
    });

    it('returns a list on success', async () => {
      const res = await connector.listApplicationDocuments(applicationId);

      const expectedRes = [
        documentTagReturn,
        documentTagReturn,
        documentTagReturn
      ];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: applicationId
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
      expect(connector.getTagCommand).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentId).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentTag).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
    });

    it('returns empty array if s3Client returns no Contents', async () => {
      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue({ Contents: null } as never);

      const res = await connector.listApplicationDocuments(applicationId);

      const expectedRes = [];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: applicationId
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
      expect(connector.getTagCommand).not.toHaveBeenCalled();
      expect(connector.getDocumentId).not.toHaveBeenCalled();
      expect(connector.getDocumentTag).not.toHaveBeenCalled();
    });

    it('removes `null` values from the list', async () => {
      jest.spyOn(connector, 'getDocumentTag').mockResolvedValueOnce(null);

      const res = await connector.listApplicationDocuments(applicationId);

      const expectedRes = [documentTagReturn, documentTagReturn];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: applicationId
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
      expect(connector.getTagCommand).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentId).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentTag).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
    });

    it('removes item from the list when tagCommand is missing', async () => {
      jest.spyOn(connector, 'getTagCommand').mockReturnValueOnce(null);

      const res = await connector.listApplicationDocuments(applicationId);

      const expectedRes = [documentTagReturn, documentTagReturn];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: applicationId
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
      expect(connector.getTagCommand).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentId).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentTag).toHaveBeenCalledTimes(
        s3Response.Contents.length - 1
      );
    });

    it('removes item from the list when document id is missing', async () => {
      jest.spyOn(connector, 'getDocumentId').mockReturnValueOnce(null);

      const res = await connector.listApplicationDocuments(applicationId);

      const expectedRes = [documentTagReturn, documentTagReturn];

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Prefix: applicationId
      };

      expect(res).toEqual(expectedRes);
      expect(s3.ListObjectsV2Command).toHaveBeenCalledWith(
        expectedBucketParams
      );
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
      expect(connector.getTagCommand).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentId).toHaveBeenCalledTimes(
        s3Response.Contents.length
      );
      expect(connector.getDocumentTag).toHaveBeenCalledTimes(
        s3Response.Contents.length - 1
      );
    });
  });

  describe('getTagCommand', () => {
    let file: any;
    let expectedBucketParams;
    beforeEach(() => {
      file = fileFixture();

      expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Key: file.Key
      };

      jest
        .spyOn(s3, 'GetObjectTaggingCommand')
        .mockReturnValue(commandFixture());
    });

    it('returns command on success', () => {
      const res = connector.getTagCommand(file);

      expect(res).toEqual(commandFixture());
      expect(s3.GetObjectTaggingCommand).toHaveBeenCalledWith(
        expectedBucketParams
      );
    });

    it('returns `null` when file.Key is missing', () => {
      file.Key = null;
      const res = connector.getTagCommand(file);

      expect(res).toEqual(null);
      expect(s3.GetObjectTaggingCommand).not.toHaveBeenCalled();
    });
  });

  describe('getDocumentId', () => {
    let file: any;
    beforeEach(() => {
      file = fileFixture();
    });

    it('returns document id on success', () => {
      const res = connector.getDocumentId(file);

      expect(res).toEqual(documentIdFixture);
    });

    it('returns `null` when file.Key is missing', () => {
      file.Key = null;
      const res = connector.getDocumentId(file);

      expect(res).toEqual(null);
    });

    it('returns `null` when file.Key does not match document id pattern', () => {
      file.Key = 'invalid-file-key';

      const res = connector.getDocumentId(file);

      expect(res).toEqual(null);
    });
  });

  describe('getDocumentType', () => {
    let tags: any;
    beforeEach(() => {
      tags = tagsFixtures();
    });

    it('returns the document type on success', () => {
      const res = connector.getDocumentType(tags);

      expect(res).toEqual('some-document-type');
    });

    it('returns `null` when document-type tag is missing', () => {
      tags[0].Key = 'fake-tag';
      const res = connector.getDocumentType(tags);

      expect(res).toEqual(null);
    });

    it('returns `null` when document-type tag has no value', () => {
      tags[0].Value = null;
      const res = connector.getDocumentType(tags);

      expect(res).toEqual(null);
    });
  });

  describe('getDocumentTag', () => {
    let props;
    beforeEach(() => {
      props = {
        documentId: 'document-id',
        command: 's3-command'
      };

      jest.spyOn(connector, 'getDocumentType').mockReturnValue('document-type');
      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue({ TagSet: tagsFixtures() } as never);
    });

    it('returns document id, type and tags on success', async () => {
      const res = await connector.getDocumentTag(props);

      expect(res).toEqual({
        documentId: props.documentId,
        tags: tagsFixtures(),
        type: 'document-type'
      });
      expect(connector.s3Client.send).toHaveBeenCalledWith(props.command);
      expect(connector.getDocumentType).toHaveBeenCalledWith(tagsFixtures());
    });

    it('returns `null` when tags.TagSet is null', async () => {
      jest
        .spyOn(connector.s3Client, 'send')
        .mockResolvedValue({ TagSet: null } as never);

      const res = await connector.getDocumentTag(props);

      expect(res).toEqual(null);
      expect(connector.getDocumentType).not.toHaveBeenCalled();
      expect(connector.s3Client.send).toHaveBeenCalledWith(props.command);
    });

    it('returns `null` when document type is missing', async () => {
      jest.spyOn(connector, 'getDocumentType').mockReturnValue(null);

      const res = await connector.getDocumentTag(props);

      expect(res).toEqual(null);
      expect(connector.getDocumentType).toHaveBeenCalledWith(tagsFixtures());
      expect(connector.s3Client.send).toHaveBeenCalledWith(props.command);
    });

    it('returns `null` if a getDocumentType throws', async () => {
      jest.spyOn(connector, 'getDocumentType').mockImplementation(() => {
        throw new Error();
      });

      const res = await connector.getDocumentTag(props);

      expect(res).toEqual(null);
      expect(connector.getDocumentType).toHaveBeenCalledWith(tagsFixtures());
      expect(connector.s3Client.send).toHaveBeenCalledWith(props.command);
    });
    it('return `null` if s3Client.send throws', async () => {
      jest
        .spyOn(connector.s3Client, 'send')
        .mockRejectedValue(new Error('Test error') as never);

      const res = await connector.getDocumentTag(props);

      expect(res).toEqual(null);
      expect(connector.s3Client.send).toHaveBeenCalledWith(props.command);
      expect(connector.getDocumentType).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    let applicationId: any;
    let documentId: any;
    beforeEach(() => {
      applicationId = 'application-id';
      documentId = 'document-id';

      jest.spyOn(s3, 'DeleteObjectCommand').mockReturnValue(commandFixture());
      jest.spyOn(connector.s3Client, 'send');
    });

    it('calls s3Client.send on success', async () => {
      await connector.deleteDocument(applicationId, documentId);

      const expectedBucketParams = {
        Bucket: BUCKET_NAME,
        Key: `${applicationId}/${documentId}`
      };

      expect(s3.DeleteObjectCommand).toHaveBeenCalledWith(expectedBucketParams);
      expect(connector.s3Client.send).toHaveBeenCalledWith(commandFixture());
    });
  });

  describe('uploadDocument', () => {
    it('calls s3Client send', async () => {
      jest.spyOn(connector.s3Client, 'send');

      await connector.putDocument(
        'applicationId',
        'documentId',
        DocumentType['application-summary'],
        'displayName',
        Buffer.from('documentContent', 'base64')
      );

      expect(connector.s3Client.send).toHaveBeenCalled();
    });
  });
});
