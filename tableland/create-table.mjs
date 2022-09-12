// Import `connect` from Tableland plus wallet requirements from `ethers`
import { Wallet, providers } from 'ethers'
import { connect } from '@tableland/sdk'
import 'dotenv/config'
import fetch, {
  Headers,
  Request,
  Response,
} from 'node-fetch'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

(async () => {
  // Since Metamask is not accessible via browser injection,
  // it is required to supply a private key.
  // Do not expose this key directly but load from a `.env` file
  const privateKey = process.env.PRIVATE_KEY
  const wallet = new Wallet(privateKey)

  // An RPC provider must be provided to establish a connection to the chain
  const provider = new providers.AlchemyProvider('maticmum', process.env.NEXT_PUBLIC_ALCHEMY_ID)
  // By default, `connect` uses the Tableland testnet validator;
  // it will sign a message using the associated wallet
  const signer = wallet.connect(provider)
  const tableland = await connect({
    signer,
    network: 'testnet',
    chain: 'polygon-mumbai',
  })

  // Create a new table with a supplied SQL schema and optional `prefix`
  // @return {Connection} Connection object, including the table's `name`
  const { name } = await tableland.create(
    `id INTEGER primary key, title text, description text, content text, contentId text, tags text, lensId text, encryptedSymmetricKey text, accessControlConditions text, createdAt int, updatedAt int`,
    { prefix: `note` } // Optional prefix; used to define a human-readable string
  )

  console.log(name)

  // Perform a read query, requesting all rows from the table
  const readRes = await tableland.read(`SELECT * FROM ${name};`)
  console.log(readRes)
})()
