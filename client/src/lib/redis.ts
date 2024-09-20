import { Redis } from "@upstash/redis"

//upstash/redis is a wrapper around http calls to upstash redis. Fully type safe
// npm i @upstash/redis
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
