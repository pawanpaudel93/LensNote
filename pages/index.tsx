import type { NextPage } from 'next'
import { useEffect } from 'react'
import { APP_NAME } from '@/constants'
import {
  getPublicationsQuery,
  getExplorePublicationsQuery,
} from '@/graphql/queries'
import { useClient } from 'urql'

const Home: NextPage = () => {
  const client = useClient()

  async function getPublications() {
    try {
      const result = await client
        .query(getPublicationsQuery, {
          request: {
            profileId: '0x455f',
            // sortCriteria: 'LATEST',
            publicationTypes: ['POST', 'COMMENT', 'MIRROR'],
            limit: 10,
            sources: [APP_NAME],
          },
        })
        .toPromise()
      console.log(result)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getPublications()
  }, [])
  return <></>
}

export default Home
