import express from "express"
import cors from "cors"

const app = express()
const port = 3005

// Configure CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
