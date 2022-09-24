import LitJsSdk from '@lit-protocol/sdk-browser'

const chain = 'mumbai'
const client = new LitJsSdk.LitNodeClient({ debug: false })

const hexStringToArrayBuffer = (hexString: string) => {
  hexString = hexString.replace(/^0x/, '')
  if (hexString.length % 2 != 0) {
    // eslint-disable-next-line no-console
    console.log(
      'WARNING: expecting an even number of characters in the hexString'
    )
  }
  const bad = hexString.match(/[G-Z\s]/i)
  if (bad) {
    // eslint-disable-next-line no-console
    console.log('WARNING: found non-hex characters', bad)
  }
  const pairs = hexString.match(/[\dA-F]{2}/gi)
  const integers = (pairs ?? []).map((s) => parseInt(s, 16))
  const array = new Uint8Array(integers)
  return array.buffer
}

function pad(n: string, width: number, z = '0') {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}
function hexdump(buf: ArrayBuffer) {
  const view = new Uint8Array(buf)
  const hex = Array.from(view).map((v) => pad(v.toString(16), 2))
  return hex.join('')
}

class Lit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private litNodeClient: any

  async connect() {
    await client.connect()
    this.litNodeClient = client
  }

  async encrypt(message: string, accessControlConditions: object) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      message
    )

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })

    return {
      encryptedString: hexdump(await encryptedString.arrayBuffer()),
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        'base16'
      ),
    }
  }

  async decrypt(
    encryptedString: string,
    accessControlConditions: object,
    encryptedSymmetricKey: string
  ) {
    if (!this.litNodeClient) {
      await this.connect()
    }

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    })

    const decryptedString = await LitJsSdk.decryptString(
      new Blob([hexStringToArrayBuffer(encryptedString)]),
      symmetricKey
    )

    return { decryptedString }
  }
}

export default new Lit()
