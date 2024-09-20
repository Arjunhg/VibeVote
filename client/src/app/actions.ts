"use server" // Functions like createTopic will now run on server as an API route

import { redis } from "@/lib/redis"
import { redirect } from "next/navigation"

//expect any kind of data in ouor server action like topicName
export const createTopic = async ({ topicName }: { topicName: string }) => {

  //server side validation for topic name
  const regex = /^[a-zA-Z-]+$/

  if (!topicName || topicName.length > 50) {
    return { error: "Name must be between 1 and 50 chars" }
  }

  if (!regex.test(topicName)) {
    return { error: "Only letters and hyphens allowed in name" }
  }

  await redis.sadd("existing-topics", topicName) //saving topic name to redis as a set(sadd). Build in data type that doesn't contain duplicates

  // redirect -> localhost:3000/redis
  //will be redirected to topic url
  redirect(`/${topicName}`)
}

//do below after CLientPage
//  hello -> 1
//  world -> 2
//word freq function from airbnb wordcloud
function wordFreq(text: string): { text: string; value: number }[] {
  const words: string[] = text.replace(/\./g, "").split(/\s/)
  const freqMap: Record<string, number> = {}

  for (const w of words) {
    if (!freqMap[w]) freqMap[w] = 0
    freqMap[w] += 1
  }
  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }))
}

export const submitComment = async ({
  comment,
  topicName,
}: {
  comment: string
  topicName: string
}) => {
  const words = wordFreq(comment)

  await Promise.all( //multiple promise at same time
    words.map(async (word) => {
      await redis.zadd( //adding combination of word and freq from comment to our db . Adding sorted set
        `room:${topicName}`,
        { incr: true }, //like if we already have redis -> 3 and user type redis again then it will be 4
        { member: word.text, score: word.value }
      )
    })
  )

  await redis.incr("served-requests")

  await redis.publish(`room:${topicName}`, words) //first interaction with real time functionality
  //where do we read whatever we publish? Currently we dont, thats when we do real time functionality

  return comment
}
