import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"


const app=express()
app.use(cors({
    origin: "https://virtualassistant-frontend-2vyn.onrender.com",
    credentials: true
}))
const port=process.env.PORT || 8000
app.use(express.json())
app.use(cookieParser())

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

app.listen(port,()=>{
    connectDb()
    console.log(`server started on port ${port}`)
})

