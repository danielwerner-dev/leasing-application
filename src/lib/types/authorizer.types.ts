import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Application } from '$lib/types/Application.types';

export type IdentityAuthorizer = (
  event: APIGatewayProxyEventV2,
  callback: IdentityVerificationCallback
) => Promise<APIGatewayProxyResultV2>;

export interface IdentityVerificationCallback {
  (
    event: APIGatewayProxyEventV2,
    authContext: AuthContext
  ): Promise<APIGatewayProxyResultV2>;
}

export type ApplicationAuthorizer = (
  event: APIGatewayProxyEventV2,
  callback: LeasingApplicationAccessCallback
) => Promise<APIGatewayProxyResultV2>;

export type ApplicationAccess = (
  callback: LeasingApplicationAccessCallback
) => IdentityVerificationCallback;

export interface LeasingApplicationAccessCallback {
  (
    event: APIGatewayProxyEventV2,
    application: Application,
    authContext: AuthContext
  ): Promise<APIGatewayProxyResultV2>;
}

export class AuthContext {
  constructor(public customerId: string, public username: string | null) {
    this.customerId = customerId;
    this.username = username;
  }
}
