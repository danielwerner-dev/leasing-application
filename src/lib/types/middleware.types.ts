import {
  IdentityVerificationCallback,
  LeasingApplicationAccessCallback
} from './authorizer.types';
import { EventBridgeHandler, Handler } from 'aws-lambda';

export type IdentityHandlerFactory = (
  callback: IdentityVerificationCallback
) => Handler;

export type ApplicationHandlerFactory = (
  callback: LeasingApplicationAccessCallback
) => Handler;

export type EventBridgeHandlerFactory = <DetailType extends string>(
  callback: EventBridgeCallback<DetailType>
) => EventBridgeCallback<DetailType>;

export type EventBridgeCallback<DetailType extends string> = EventBridgeHandler<
  DetailType,
  { data: unknown },
  void
>;
