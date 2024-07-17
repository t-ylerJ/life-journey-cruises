import ExcursionTiles from '../components/ExcursionTiles'
import sql from '~/utils/sql'
import {json} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
//import {supabaseServer} from '~/utils/supabase'
import {Link} from 'react-router-dom'
import {useState, useEffect} from 'react'
/*
export const loader = async ({ request, params}) => {

  const supabase = supabaseServer(request)

  const {data} = await supabase
    .from('excursions')
    .select().eq('voyage_id', 1)

  return json(data)
}
*/

export const loader = async ({ params }) => {
  const voyageId = params.voyage;
  const data = await sql`select
                            vp.day,
                            p.name as portname,
                            p.description AS portdescription,
                            json_agg(distinct jsonb_build_object(
                            'name', e.name,
                            'price', e.price,
                            'time', e.time,
                            'id', e.id,
                            'image', e.photo
                          )) as excursions
                          from voyage_ports as vp
                          join ports as p on vp.port_id = p.id
                          left join excursions as e on vp.voyage_id = e.voyage_id and e.port_id = vp.port_id
                          where vp.voyage_id = ${voyageId}
                          group by vp.day, p.name, p.description
                          order by vp.day`

   return json({data, voyageId})
}

const Plan = () => {
  const [excursions, setExcursions] = useState([]);
  const [selectedExcursions, setSelectedExcursions] = useState([]);

  const handleCheckExcursionChange = (event) => {
    const excursionId = event.target.value;
    if (event.target.checked) {
      for(let i = 0; i < excursions.length; i++){
        excursions[i].excursions.forEach((excursion) => {
          if(parseInt(excursion.id) === parseInt(excursionId)){
            const {id, name, price} = excursion;
            console.log(selectedExcursions);
            setSelectedExcursions([...selectedExcursions, {"id": id, "name": name, "price": price}]);
          }
       })
      }
    } else {
      const updatedExcursions = selectedExcursions.filter((ex) =>{
        return parseInt(ex.id) !== parseInt(excursionId)
      } );
      setSelectedExcursions(updatedExcursions);
    }
  };
  const {data, voyageId}  = useLoaderData()
  useEffect(() => {
    setExcursions([...data.slice(0, data.length - 1)]);
  }, []);

  const clickHandler = () => {
    localStorage.setItem('excursions', JSON.stringify(selectedExcursions));
  }
  return <>
    <Link to={`../${voyageId}/book`}>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  onClick={clickHandler}>Book</button>
    </Link>
    <ExcursionTiles dailyExcursions={excursions} checkChanged={handleCheckExcursionChange}/>
  </>
}
export default Plan
