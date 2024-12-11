import { deleteApplication } from '$lib/repositories/leasing-application/delete-application';

import { ConflictError } from '$lib/types/errors';
import { Application } from '$lib/types/Application.types';

export const deleteApplicationService = async (
  application: Application,
  reason: string
) => {
  const { applicationStatus } = application;
  if (!['created', 'draft'].includes(applicationStatus)) {
    throw new ConflictError(
      `Cannot delete application in current status: ${applicationStatus}`
    );
  }

  await deleteApplication(application, reason);
};
