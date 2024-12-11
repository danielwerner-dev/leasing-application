import * as pls from '$lib/connectors/pls';
import { applicationFixture } from '$fixtures/index';

describe('Pls service connector', () => {
  describe('getPropertyBySlug', () => {
    let propertyData: any;
    let propertySlug: any;

    beforeEach(() => {
      propertySlug = '1234-n-kentucky-ave-chicago-il-60630';
      propertyData = applicationFixture().property;
      jest.spyOn(pls.client, 'get').mockResolvedValue({ data: propertyData });
    });

    it('returns property if it exists', async () => {
      const path = `/api/properties/${propertySlug}`;
      const res = await pls.getPropertyBySlug(propertySlug);

      expect(res).toEqual(propertyData);
      expect(pls.client.get).toHaveBeenCalledWith(path);
    });
  });
});
