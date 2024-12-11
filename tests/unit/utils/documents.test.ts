import { File } from '$lib/types/Application.types';
import { getTag } from '$lib/utils/documents';
import { Tag } from '@aws-sdk/client-s3';

describe('Documents Utils', () => {
  it('should return the value when present', () => {
    const document: File = {
      documentId: 'documentId',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'SomeDisplayName'
        }
      ],
      type: 'type'
    };

    const res = getTag(document, 'document-display-name');

    expect(res).toBe('SomeDisplayName');
  });
  it('should return undefined when the value is undefined', () => {
    const document: File = {
      documentId: 'documentId',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'SomeDisplayName'
        }
      ],
      type: 'type'
    };

    const res = getTag(document, 'document-type');

    expect(res).toBeUndefined();
  });

  it('should return undefined when the tags are undefined', () => {
    const document: File = {
      documentId: 'documentId',
      tags: undefined as unknown as Tag[],
      type: 'type'
    };

    const res = getTag(document, 'document-type');

    expect(res).toBeUndefined();
  });
});
