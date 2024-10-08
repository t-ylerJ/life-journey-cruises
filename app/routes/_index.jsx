import BigPicture from '../components/BigPicture'
import Testimonials from '../components/Testimonials'
import VoyageTiles from '../components/VoyageTiles'
import sql from '../utils/sql.js'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/react'
import redirectCookie from '~/utils/redirectCookie'

export const meta = () => {
  return [
    { title: 'Life Journey Cruises' },
    { name: 'description', content: 'Life Journey Cruises' },
  ]
}
export const loader = async ({ request }) => {
  const pathName = new URL(request.url).pathname
  try {
    const data =
      await sql`SELECT * from voyages JOIN voyage_photos ON voyages.id = voyage_photos.voyage_id`
    return json(data, {
      headers:
        pathName === '/'
          ? {
              'Set-Cookie': await redirectCookie.serialize('/'),
            }
          : {},
    })
  } catch {
    console.log('error in loading fleet data')
    return []
  }
}

export default function Index() {
  const data = useLoaderData()
  return (
    <>
      <BigPicture />
      <VoyageTiles voyages={data} />
      <Testimonials />
    </>
  )
}
