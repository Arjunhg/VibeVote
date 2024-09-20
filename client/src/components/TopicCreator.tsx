"use client"

import { useState } from "react"
import { Button } from "./ui/button" // will automatically form using npx shadcn-ui@latest add input button label

import { Input } from "./ui/input"
import { useMutation } from "@tanstack/react-query" //library that makes working with data, fetching and manipulating data really easy and fun.  npm i @tanstack/react-query 
//before using make a provided in provider.tsx
import { createTopic } from "@/app/actions"

const TopicCreator = () => {
  const [input, setInput] = useState<string>("") //generic type string

  const { mutate, error, isPending } = useMutation({ //useMutation made for post request for manipulating data. useQuerry for getting data
    mutationFn: createTopic, 
    //Normally mutationFn would be any fetch request from api but in nextjs its much cooler 
    //That will happen in app folder -> actions.ts
  })

  return (
    <div className="mt-12 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={({ target }) => setInput(target.value)}
          className="bg-white min-w-64"
          placeholder="Enter topic here..."
        />
        <Button
          disabled={isPending}
          onClick={() => mutate({ topicName: input })}
          //mutate function just calls server side function createTopic but in a way we can call it from client side
        >
          Create 
          {/* When hitting create it will create topic inside our db*/}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
    </div>
  )
}

export default TopicCreator
