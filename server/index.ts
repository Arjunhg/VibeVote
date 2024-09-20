// Creating web server

import express from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io" //library used for web socket
import { Redis } from "ioredis"
import "dotenv/config"

const app = express()//create webserver easily
app.use(cors()) //access app via any url like localhost(frontend)

const redis = new Redis(process.env.REDIS_CONNECTION_STRING)
const subRedis = new Redis(process.env.REDIS_CONNECTION_STRING)
//why two connection? see 1:49:00

const server = http.createServer(app)//passing express server i.e app. This will allow us to create a web socket server
const io = new Server(server, { //takes http server that we created //takes options and returns a server //create web socket server, real time communicating server that we can use to connect our frontend
  cors: {
    origin: ["http://localhost:3000"], //default//array if we want to add multiple origin, like while in production
    methods: ["GET", "POST"],
    credentials: true, 
  },
})

//do this after completing the rest of this file code
//It basically does: when u1 sumbit a message to room redis essentially whats gonna happen is that this event is gonna be distributted not only back to user but to all other users actively connected to same room
//One thing we havent set is how the message get distributed from one user to other, like to u2, u3. U1 sent message to server now we need to distibute it to all user ....

subRedis.on("message", (channel, message) => { //whenever there is a message sent to our server.Channel is the current room
  io.to(channel).emit("room-update", message) //we can now redistrubute it to all connected user
}) //this room-update event is triggered first in backend so we can also trigger it in frontend for better functionality. useEffect in CLientPage

subRedis.on("error", (err) => {
  console.error("Redis subscription error", err)
})
//


//WHat will happen when someone will connect to our server from the frontend
io.on("connection", async (socket) => { //what should happen on a connection event //its like an incoming http reqest but from websocket //logic when websocket client connect to server
  const { id } = socket //incoming request from user have a unique ID associated with it

  //any topic user create is a room
  socket.on("join-room", async (room: string) => { //join-room is an event we can fire from frontend and listen on backend. Rest is logic on what will happen when the event is fired or logic when user joins a room. room variable woll come from frontend
    console.log("User joined room:", room)

    //connecting to redis instance on the server. Almost all the logic on server we write is gonna connect us to redis which makes it really scalable as we can outsource the core logic to redis and the server that holds the web socket are insanely scalable
    //even with one above server we can get 10000 request/sec

    // what will hapen when user goes in room
    //we never wanna subscribe to one room more than once
    const subscribedRooms = await redis.smembers("subscribed-rooms")//we are gonna keep track of all room we are subscribed to inside of a set. So, we dont want to subscribe to one room multiple times. If we are already subscribed through redis instance we dont want to subscribe again.

    await socket.join(room)
    await redis.sadd(`rooms:${id}`, room) //add the current room, keeping track of all the rooms this user(curent) is connected to. rooms: my_id gonna contain redis(room)
    // like user  1
    //       redis
    //       nextjs
    
    
    await redis.hincrby("room-connections", room, 1) //hash increment by, hashname: room-connection, field name that we want to incr: room, increment by 1(as we are keeping track of one connection)
    //it will have long list of rooms in our entire application adn number of people connected to ut

    /**Like
     * Room Name    Number of user
     * redis            2
     * nextjs           5
     */

    if (!subscribedRooms.includes(room)) {
      subRedis.subscribe(room, async (err) => { //.subscribe is blocking command and works only on tcp not http
        if (err) {
          console.error("Failed to subscribe:", err)
        } else {
          await redis.sadd("subscribed-rooms", room)

          console.log("Subscribed to room:", room)
        }
      })
    }
  })


  //what happens when user disconnects from their room
  socket.on("disconnect", async () => {
    const { id } = socket

    const joinedRooms = await redis.smembers(`rooms:${id}`) //which room current socket is connected to
    await redis.del(`rooms:${id}`)

    joinedRooms.forEach(async (room) => {
      const remainingConnections = await redis.hincrby(
        `room-connections`, //hashname
        room,
        -1
      )

      if (remainingConnections <= 0) { //no more people in room
        await redis.hdel(`room-connections`, room) //del room from hash

        subRedis.unsubscribe(room, async (err) => { //as no need to make the connection open now as no users
          if (err) {
            console.error("Failed to unsubscribe", err)
          } else {
            await redis.srem("subscribed-rooms", room) //remove item from set

            console.log("Unsubscribed from room:", room)
          }
        })
      }
    })
  })
})

//when we run the above file we want to start the server so: 
const PORT = process.env.PORT || 8080 //env.PORT will be provided by deployement provider

server.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})
