import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { IncomingForm } from 'formidable'
import { Web3Storage, getFilesFromPath } from 'web3.storage'

type Data = {
  status: string
  message: string
  imageUrl: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN })
  if (req.method === 'POST') {
    // parse form with a Promise wrapper
    try {
      const data: { fields: formidable.Fields; files: formidable.Files } =
        await new Promise((resolve, reject) => {
          const form = new IncomingForm()
          form.parse(req, (err, fields, files) => {
            if (err) {
              console.log(err)
              return reject(err)
            }
            resolve({ fields, files })
          })
        })

      const files = await getFilesFromPath(data?.files?.file?.filepath)
      const cid = await client.put(files, {
        wrapWithDirectory: false,
        maxRetries: 3,
      })
      res.status(200).json({
        status: 'success',
        message: 'Uploaded to Web3.Storage!',
        imageUrl: `https://${cid}.ipfs.w3s.link`,
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        status: 'error',
        message: 'Error uploading to Web3.Storage!',
        imageUrl: '',
      })
    }
  }
}
