// /anything

import { redis } from "@/lib/redis"
import ClientPage from "./ClientPage"

interface PageProps {
  params: { //params will be object 
    topic: string //the name that you made folder of using [] should be same here
  }
}

const Page = async ({ params }: PageProps) => { //grab params from dynamic page of type PageProps
  const { topic } = params

  //whats the purpose of page -> we need to fecth data from database, what data gonna be?- > array of object each object have one single and a value for how often(text) it is prsent in db
  // [redis, 3, is, 2, great, 6]

  //we will pass data as initial data in CSC(client side...)
  const initialData = await redis.zrange<(string | number)[]>( //zrange allows us to get items from sorted set. I.E grabbing data from sorted set
    `room:${topic}`, //name of the set we want to grab stuff from
    0,
    49, //grab from index 0 to 49
    {
      withScores: true,
    }
  )
/*
This is how the data struture of redis (key, value) pair will look like

  Score(Number of times words was used/present in db)   Member/Word

                    3                                       redis
                    2                                       is
                    6                                       great
*/


//Now lets figure out how often the word will occur. Reformat the initialData to object form as by default its in single array as: [redis, 3, is, 2, great, 6]
  const words: { text: string; value: number }[] = []

  for (let i = 0; i < initialData.length; i++) {
    const [text, value] = initialData.slice(i, i + 2)

    if (typeof text === "string" && typeof value === "number") {
      words.push({ text, value })
    }
  }

  await redis.incr("served-requests") //if any user views a page then we wanna count that as a request that we serve

  //Make ClientPage in [app], not in component as we dont want it to be reusable. Only supposed to be used with page.tsx
  return <ClientPage initialData={words} topicName={topic} />
}

export default Page
