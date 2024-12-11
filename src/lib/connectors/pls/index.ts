import { Property } from '$lib/types/Application.types';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';
import axios from 'axios';

export const client = axios.create({
  baseURL: process.env.PLS_URL
});

export const getPropertyBySlug = async (slug: string): Promise<Property> => {
  const res = await client.get<Property>(`/api/properties/${slug}`);
  const {
    address1,
    availableAt,
    unitStatus,
    isSyndicated,
    city,
    state,
    zipcode,
    market,
    propertyUrl,
    propertyCode,
    unitCode,
    beds,
    baths,
    sqft,
    marketRent,
    slug: propertySlug
  } = jsonCasingParser(res.data, CasingPattern.CAMEL);

  const puCode = `${propertyCode}-${unitCode}`;

  const property = {
    address1,
    city,
    state,
    zipcode,
    isSyndicated,
    unitStatus,
    propertyCode,
    unitCode,
    puCode,
    propertyUrl,
    beds,
    baths,
    sqft,
    marketRent,
    slug: propertySlug,
    availableAt,
    market: {
      slug: market.slug
    }
  };

  return property;
};
