import { CeramicClient } from '@ceramicnetwork/http-client'
import { Model, ModelDefinition } from '@ceramicnetwork/stream-model'
import { CeramicApi } from '@ceramicnetwork/common'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import * as ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import * as KeyDidResolver from 'key-did-resolver'
import * as PkhDidResolver from 'pkh-did-resolver'
import { Resolver } from 'did-resolver'
import { DID } from 'dids'
import { fromString } from 'uint8arrays'
import { ModelInstanceDocument } from '@ceramicnetwork/stream-model-instance'
import { StreamID } from '@ceramicnetwork/streamid'

export function createDid(ceramic: CeramicApi, seed: string): DID {
  const provider = new Ed25519Provider(fromString(seed, 'base16'))
  const keyDidResolver = KeyDidResolver.getResolver()
  const pkhDidResolver = PkhDidResolver.getResolver()
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolver = new Resolver({
    ...threeIdResolver,
    ...pkhDidResolver,
    ...keyDidResolver,
  })
  return new DID({ provider, resolver })
}

const MODEL_DEFINITION: ModelDefinition = {
  name: 'MyModel',
  version: Model.VERSION,
  accountRelation: { type: 'list' },
  schema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    additionalProperties: false,
    properties: {
      myData: {
        type: 'integer',
        maximum: 10000,
        minimum: 0,
      },
    },
    required: ['myData'],
  },
}

const setupCeramicClient = async (): Promise<CeramicClient> => {
  const apiUrl = process.env.CERAMIC_URL
  const pk = process.env.PRIVATE_KEY || ""

  const ceramicClient = new CeramicClient(apiUrl)
  const did = await createDid(ceramicClient, pk)
  await did.authenticate()
  ceramicClient.did = did

  return ceramicClient
}

const modelIdStr = 'kjzl6hvfrbw6c845kvo6rq3zbv0uin9vo0slxq8aavx5nbvcxtppe2qga7d8abx'

let ceramicClient: CeramicClient
ceramicClient = await setupCeramicClient()
const indexedModels = await ceramicClient.admin.getIndexedModels()
console.log('INDEXED MODELS', indexedModels)
