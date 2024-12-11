import {
  ApplicationPermission,
  ApplicationStatus,
  ApplicationType,
  Permissions
} from '$lib/types/Application.types';

interface GetPermissionsOptions {
  applicationStatus: ApplicationStatus;
  applicationType: ApplicationType;
  promoted: boolean;
}

type ActiveApplicationStatus =
  | ApplicationStatus.draft
  | ApplicationStatus.pending
  | ApplicationStatus.approved
  | ApplicationStatus.denied
  | ApplicationStatus.canceled;

type PermissionByStatus = {
  [key in ActiveApplicationStatus]: ApplicationPermission[];
};

interface PermissionRules {
  primary: PermissionByStatus;
  coapplicant: PermissionByStatus;
  promoted: PermissionByStatus;
}

const BASE_RULES: PermissionByStatus = {
  draft: [ApplicationPermission.EDIT],
  pending: [ApplicationPermission.DOCUMENTS, ApplicationPermission.DOWNLOAD],
  approved: [
    ApplicationPermission.PAYMENTS,
    ApplicationPermission.DOCUMENTS,
    ApplicationPermission.DOWNLOAD
  ],
  denied: [ApplicationPermission.DOCUMENTS, ApplicationPermission.DOWNLOAD],
  canceled: [
    ApplicationPermission.PAYMENTS,
    ApplicationPermission.DOCUMENTS,
    ApplicationPermission.DOWNLOAD
  ]
};

const PERMISSION_RULES: PermissionRules = {
  primary: {
    draft: [...BASE_RULES.draft, ApplicationPermission.DELETE],
    pending: [...BASE_RULES.pending, ApplicationPermission.MANAGE],
    approved: [...BASE_RULES.approved],
    denied: [...BASE_RULES.denied],
    canceled: [...BASE_RULES.canceled]
  },
  coapplicant: {
    draft: [...BASE_RULES.draft],
    pending: [...BASE_RULES.pending],
    approved: [...BASE_RULES.approved],
    denied: [...BASE_RULES.denied],
    canceled: [...BASE_RULES.canceled]
  },
  promoted: {
    draft: [...BASE_RULES.draft],
    pending: [...BASE_RULES.pending, ApplicationPermission.MANAGE],
    approved: [...BASE_RULES.approved],
    denied: [...BASE_RULES.denied],
    canceled: [...BASE_RULES.canceled]
  }
};

export const getApplicationPermissions = ({
  applicationStatus,
  applicationType,
  promoted
}: GetPermissionsOptions): Permissions => {
  const ruleType = promoted
    ? PERMISSION_RULES.promoted
    : PERMISSION_RULES[applicationType];

  const rules: ApplicationPermission[] = ruleType[applicationStatus];

  return rules.reduce<Permissions>((permissions, currentPermission) => {
    return {
      ...permissions,
      [currentPermission]: true
    };
  }, {});
};
