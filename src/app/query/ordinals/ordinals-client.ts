import { array, number, object, string } from 'yup';
import type { InferType } from 'yup';

import { fetchData } from '../utils';

class Configuration {
  constructor(public baseUrl: string) {}
}

const responseBaseSchema = object({
  limit: number(),
  offset: number(),
  total: number(),
  results: array(),
});

const inscriptionSchema = object({
  id: string().required(),
  number: number().required(),
  address: string().required(),
  genesis_address: string().required(),
  genesis_block_height: number().required(),
  genesis_block_hash: string().required(),
  genesis_tx_id: string().required(),
  genesis_fee: string().required(),
  genesis_timestamp: number().required(),
  tx_id: string().required(),
  location: string().required(),
  output: string().required(),
  value: string().required(),
  offset: string().required(),
  sat_ordinal: string().required(),
  sat_rarity: string().required(),
  sat_coinbase_height: number().required(),
  mime_type: string().required(),
  content_type: string().required(),
  content_length: number().required(),
  timestamp: number().required(),
});

export type Inscription = InferType<typeof inscriptionSchema>;

const responseInscriptionsSchema = responseBaseSchema.concat(
  object({
    results: array().of(inscriptionSchema.notRequired()).required(),
  }).required()
);

class InscriptionsApi {
  constructor(public configuration: Configuration) {}

  async getInscriptionsFromAddresses(addresses: string[]) {
    const urlParams = new URLSearchParams();
    addresses.forEach(address => urlParams.append('address', address));
    const unvalidatedData = await fetchData({
      errorMsg: 'Failed to retrieve inscriptions',
      url: `${this.configuration.baseUrl}/ordinals/v1/inscriptions?${urlParams.toString()}`,
    });
    console.log('ARY unvalidated data', unvalidatedData);
    return responseInscriptionsSchema.validate(unvalidatedData);
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
