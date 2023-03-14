class Configuration {
  constructor(public baseUrl: string) {}
}

class InscriptionsApi {
  constructor(public configuration: Configuration) {}

  async getInscriptionsFromAddresses(addresses: string[]) {
    return fetch(`${this.configuration.baseUrl}/ordinals/v1/inscriptions`);
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
