import { APIGatewayProxyEventV2 } from 'aws-lambda';
import jwtDecode from 'jwt-decode';
import { CasingPattern, jsonCasingParser } from './json-casing-parser';

export const decodeJwt = (event: APIGatewayProxyEventV2) => {
  let { authorization = '' } = event.headers;

  if (authorization?.startsWith('Bearer ')) {
    authorization = authorization.substring(7);
  }

  return jsonCasingParser(
    jwtDecode<Record<string, string>>(authorization) || {},
    CasingPattern.CAMEL
  );
};
