import { Application, ApplicationStatus } from '../../types/Application.types';
import { DBClient } from './dynamo-client';

export const deleteApplication = async (
  { applicationId }: Application,
  reason: string
) => {
  const now = new Date().toISOString();
  const expression =
    'SET applicationStatus = :status, formData = :formData, audit.updatedAt = :now';
  const attributes = {
    ':status': ApplicationStatus.deleted,
    ':formData': { reason },
    ':now': now
  };

  await DBClient.update(applicationId, expression, attributes);
};
