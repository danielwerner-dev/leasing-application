import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  _Object as S3Object,
  Tag,
  GetObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PresignedPost } from '@aws-sdk/s3-presigned-post';

import { File } from '$lib/types/Application.types';
import { ConflictError } from '$lib/types/errors';
import { DocumentType } from '$lib/types/form-data/documents.types';
import { logError } from '$lib/utils/errors';

export type DocumentUrlParams = {
  documentId: string;
  documentUrl: string;
};

export type DocumentUploadPostParams = {
  documentId: string;
  documentRequest: PresignedPost;
};

export interface TagCommand {
  documentId: string;
  command: GetObjectTaggingCommand;
}

const BUCKET_NAME = `leasing-application-documents-${process.env.ENVIRONMENT}-invh`;
const URL_EXPIRATION_TIME = 180; // TODO: Use AWS Parameter

const s3Config = {
  region: 'us-east-1'
};

export const s3Client = new S3Client(s3Config);

export const getDocumentUploadUrl = async (
  applicationId: string,
  documentType: DocumentType,
  documentDisplayName: string
): Promise<DocumentUrlParams> => {
  const documents = await listRawApplicationDocuments(
    `${applicationId}/${documentType}`
  );

  if (documents.length >= 4) {
    throw new ConflictError(`Max documents of type ${documentType} in bucket.`);
  }

  const now = new Date().toISOString();
  const fileType = documentDisplayName.split('.').pop();
  const documentId = `${applicationId}/${documentType}_${now}.${fileType}`;
  const encodedDocumentDisplayName = encodeURIComponent(documentDisplayName);
  const bucketParams = {
    Bucket: BUCKET_NAME,
    Key: documentId,
    Tagging: `document-type=${documentType}&document-display-name=${encodedDocumentDisplayName}`
  };
  const command = new PutObjectCommand(bucketParams);

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: URL_EXPIRATION_TIME,
    unhoistableHeaders: new Set(['x-amz-tagging'])
  });

  const docUploadInfo: DocumentUrlParams = {
    documentId: documentId,
    documentUrl: signedUrl
  };

  return docUploadInfo;
};

export const getDocumentDownloadUrl = async (
  applicationId: string,
  documentId: string,
  expiresIn = URL_EXPIRATION_TIME
): Promise<DocumentUrlParams> => {
  const bucketParams: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: `${applicationId}/${documentId}`
  };

  const headObjectCommand = new HeadObjectCommand(bucketParams);
  const data: HeadObjectCommandOutput = await s3Client.send(headObjectCommand);

  const documentExists = data.$metadata.httpStatusCode === 200;
  if (!documentExists) {
    throw new Error('Document not found');
  }

  const command = new GetObjectCommand(bucketParams);

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn
  });

  const downloadInfo: DocumentUrlParams = {
    documentId: documentId,
    documentUrl: signedUrl
  };

  return downloadInfo;
};

export const listRawApplicationDocuments = async (
  prefix: string
): Promise<S3Object[]> => {
  const bucketParams = {
    Bucket: BUCKET_NAME,
    Prefix: prefix
  };

  const filesCommand = new ListObjectsV2Command(bucketParams);
  const { Contents } = await s3Client.send(filesCommand);

  if (!Contents) {
    return [];
  }

  return Contents;
};

export const listApplicationDocuments = async (
  applicationId: string
): Promise<File[]> => {
  const Contents = await listRawApplicationDocuments(applicationId);

  const tagCommands = Contents.reduce<TagCommand[]>((commands, file) => {
    const tagCommand = getTagCommand(file);
    const documentId = getDocumentId(file);

    if (!tagCommand || !documentId) {
      return commands;
    }

    return [...commands, { documentId: documentId, command: tagCommand }];
  }, []);

  const files = await Promise.all(tagCommands.map(getDocumentTag));

  return files.reduce<File[]>((acc, file) => {
    if (!file) {
      return acc;
    }

    return [...acc, file];
  }, []);
};

export const getTagCommand = (
  file: S3Object
): GetObjectTaggingCommand | null => {
  if (!file.Key) {
    return null;
  }

  const tagsBucket = {
    Bucket: BUCKET_NAME,
    Key: file.Key
  };

  return new GetObjectTaggingCommand(tagsBucket);
};

export const getDocumentId = (file: S3Object): string | null => {
  const DOCUMENT_ID_REGEX = new RegExp(/^[^/]+\/[^/]+$/);

  if (!file.Key || !DOCUMENT_ID_REGEX.test(file.Key)) {
    return null;
  }

  const documentIdStart = file.Key.indexOf('/') + 1;
  const documentId = file.Key.substring(documentIdStart);

  return documentId;
};

export const getDocumentType = (tags: Tag[]): string | null => {
  const documentTypeTag = tags.find((tag) => tag.Key === 'document-type');

  if (!documentTypeTag || !documentTypeTag.Value) {
    return null;
  }

  return documentTypeTag.Value;
};

export const getDocumentTag = async ({
  documentId,
  command
}: TagCommand): Promise<File | null> => {
  try {
    const tags = await s3Client.send(command);

    if (!tags.TagSet) {
      return null;
    }

    const type = getDocumentType(tags.TagSet);

    if (!type) {
      return null;
    }

    return {
      documentId,
      type,
      tags: tags.TagSet
    };
  } catch (err) {
    logError(
      'connectors.s3.getDocumentTag',
      `Cannot fetch tags for document ${documentId}`
    );
    logError('connectors.s3.getDocumentTag', err);
    return null;
  }
};

export const deleteDocument = async (
  applicationId: string,
  documentId: string
) => {
  const bucketParams = {
    Bucket: BUCKET_NAME,
    Key: `${applicationId}/${documentId}`
  };

  const command = new DeleteObjectCommand(bucketParams);
  await s3Client.send(command);
};

export const putDocument = async (
  applicationId: string,
  documentId: string,
  documentType: DocumentType,
  displayName: string,
  data: Buffer
) => {
  const tagging = `document-type=${documentType}&document-display-name=${displayName}`;

  const putObjectParams = {
    Bucket: BUCKET_NAME,
    Key: `${applicationId}/${documentId}`,
    Body: data,
    Tagging: tagging
  };
  const command = new PutObjectCommand(putObjectParams);

  await s3Client.send(command);
};
