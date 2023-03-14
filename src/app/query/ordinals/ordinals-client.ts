import { fetchData } from '../utils';

class Configuration {
  constructor(public baseUrl: string) {}
}

class InscriptionsApi {
  constructor(public configuration: Configuration) {}

  async getInscriptionsFromAddresses(addresses: string[]) {
    const urlParams = new URLSearchParams();
    addresses.forEach(address => urlParams.append('address', address));
    return fetchData({
      errorMsg: 'Failed to retrieve inscriptions',
      url: `${this.configuration.baseUrl}/ordinals/v1/inscriptions?${urlParams.toString()}`,
    });
  }
}

export class OrdinalsClient {
  configuration: Configuration;
  inscriptionsApi: InscriptionsApi;

  constructor(basePath: string) {
    this.configuration = new Configuration(basePath);
    this.inscriptionsApi = new InscriptionsApi(this.configuration);
  }
}
