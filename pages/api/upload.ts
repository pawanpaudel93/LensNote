import type { NextApiRequest, NextApiResponse } from 'next'
import { Web3Storage, File } from 'web3.storage'
import { getErrorMessage } from '@/parser'

type Data = {
  status: string
  message: string
  contentID: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'POST') {
    const { metadata, encryptedString } = req.body
    try {
      let files = []
      if (metadata) {
        files = [
          new File([JSON.stringify(metadata)], 'metadata.json', {
            type: 'application/json',
          }),
        ]
      } else {
        files = [
          new File([encryptedString], 'encryptedNote.json', {
            type: 'text/plain',
          }),
        ]
      }
      const client = new Web3Storage({
        token: process.env.WEB3STORAGE_TOKEN as string,
      })
      const contentID = await client.put(files, {
        wrapWithDirectory: false,
        maxRetries: 3,
      })
      return res.status(200).json({
        status: 'success',
        message: 'Uploaded to Web3.Storage!',
        contentID,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        status: 'error',
        message: getErrorMessage(error),
        contentID: '',
      })
    }
  }
}
