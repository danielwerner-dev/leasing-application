import { File } from '$lib/types/Application.types';

export const commandFixture = (): any => {
  return {
    hello: 'world'
  };
};

export const fileFixture = (): any => {
  return {
    Key: 'application-id/document-id_2022-12-12T00:00:00.000Z.pdf'
  };
};

export const documentIdFixture = 'document-id_2022-12-12T00:00:00.000Z.pdf';

export const tagsFixtures = (): any => [
  {
    Key: 'document-type',
    Value: 'some-document-type'
  },
  {
    Key: 'display-name',
    Value: 'my-file.pdf'
  }
];

export const applicationDocumentsFixture = (): File[] => {
  return [
    {
      documentId: 'government-issued-id_2023-01-11T17:21:03.479Z.jpeg',
      type: 'government-issued-id',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'license.jpeg'
        },
        {
          Key: 'document-type',
          Value: 'government-issued-id'
        }
      ]
    },
    {
      documentId: 'government-issued-id_2023-01-12T10:11:03.045Z.jpeg',
      type: 'government-issued-id',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'passport.jpeg'
        },
        {
          Key: 'document-type',
          Value: 'government-issued-id'
        }
      ]
    },
    {
      documentId: 'proof-of-income_2023-01-12T10:15:03.479Z.jpeg',
      type: 'proof-of-income',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'w2.jpeg'
        },
        {
          Key: 'document-type',
          Value: 'proof-of-income'
        }
      ]
    },
    {
      documentId: 'vouchers_2023-01-12T10:22:03.479Z.jpeg',
      type: 'vouchers',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'voucher.jpeg'
        },
        {
          Key: 'document-type',
          Value: 'vouchers'
        }
      ]
    },
    {
      documentId: 'supplemental_2023-01-12T10:25:03.479Z.jpeg',
      type: 'supplemental',
      tags: [
        {
          Key: 'document-display-name',
          Value: 'other.jpeg'
        },
        {
          Key: 'document-type',
          Value: 'supplemental'
        }
      ]
    }
  ];
};
