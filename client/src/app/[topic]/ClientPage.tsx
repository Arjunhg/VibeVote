"use client"

import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { useEffect, useState } from "react"
import { Wordcloud } from "@visx/wordcloud" //by airbnb vizx: npm i @visx/wordcloud @visx/test @visx/scale, others are helper
import { scaleLog } from "@visx/scale"
import { Text } from "@visx/text"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { submitComment } from "../actions"
// import { io } from "socket.io-client" //equivalent of socket.io library we use on backend to connect on frontend . npm i socket.io-client . connect to running server from frontend

// const socket = io("http://localhost:8080") //same port as websocket server is running on //connect to web socket server on backend

interface ClientPageProps {
  topicName: string
  initialData: { text: string; value: number }[]
}

const COLORS = ["#143059", "#2F6B9A", "#82a6c2"]

const ClientPage = ({ topicName, initialData }: ClientPageProps) => {
  const [words, setWords] = useState(initialData)
  const [input, setInput] = useState<string>("")

  // useEffect(() => {
  //   socket.emit("join-room", `room:${topicName}`) //thats how we trigger the event on the server we connect to. It basically connects to io.on. the data topicName is automatically going to be received as room in backend as both are now connected
  // }, [])

  // useEffect(() => {
  //   socket.on("room-update", (message: string) => { //message is received from backend
  //     const data = JSON.parse(message) as {
  //       text: string
  //       value: number
  //     }[]

  //     data.map((newWord) => {
  //       const isWordAlreadyIncluded = words.some(
  //         (word) => word.text === newWord.text
  //       )

  //       if (isWordAlreadyIncluded) {
  //         // increment
  //         setWords((prev) => {
  //           const before = prev.find((word) => word.text === newWord.text)
  //           const rest = prev.filter((word) => word.text !== newWord.text)

  //           return [
  //             ...rest,
  //             { text: before!.text, value: before!.value + newWord.value },
  //           ]
  //         })
  //       } else if (words.length < 50) {
  //         // add to state
  //         setWords((prev) => [...prev, newWord])
  //       }
  //     })
  //   })

  //   return () => {
  //     socket.off("room-update") //cleaning up the listener
  //   }
  // }, [words])

  const fontScale = scaleLog({ //how large should each word be
    //suppose we have data in redis as [redis, 3, is, 2, great, 6]
    //Then word with greatest number should be biggest, with least number should be smallest and rest medium
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 100], //font size between 10 to 100
  })

  const { mutate, isPending } = useMutation({
    mutationFn: submitComment, //new action for submitting a comment on page, make new action in actions.ts
  })

  return (
    // MaxWidthWrapper: for even spacing
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-grid-zinc-50 pb-20">
      <MaxWidthWrapper className="flex flex-col items-center gap-6 pt-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tight text-balance">
          What people think about{" "}
          <span className="text-blue-600">{topicName}</span>:
        </h1>

        <p className="text-sm">(updated in real-time)</p>

        <div className="aspect-square max-w-xl flex items-center justify-center">
          <Wordcloud
            words={words}
            width={500}
            height={500}
            fontSize={(data) => fontScale(data.value)}
            font={"Impact"}
            padding={2}
            spiral="archimedean"
            rotate={0}
            random={() => 0.5}
          >
            {(cloudWords) => //each word in cloud, our responsibility to render
              cloudWords.map((w, i) => ( //for each word at index
                <Text //import from @visx
                  key={w.text}
                  fill={COLORS[i % COLORS.length]} //will use 3 different colors
                  textAnchor="middle"
                  transform={`translate(${w.x}, ${w.y})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                >
                  {w.text}
                </Text>
              ))
            }
          </Wordcloud>
        </div>

        <div className="max-w-lg w-full">
          {/* custom ui label */}
          <Label className="font-semibold tracking-tight text-lg pb-2">
            Here's what I think about {topicName}
          </Label> 
          <div className="mt-1 flex gap-2 items-center">
            {/* custom ui library */}
            <Input
              value={input}
              onChange={({ target }) => setInput(target.value)} //destructure rarget and setInput takes it
              placeholder={`${topicName} is absolutely...`}
            />
            {/* custom ui library: @/components/ui/button */}
            <Button
              disabled={isPending}
              onClick={() => mutate({ comment: input, topicName })}
            >
              Share
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

export default ClientPage
