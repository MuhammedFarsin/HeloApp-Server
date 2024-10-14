import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from "cors"
import  userRoute from "./src/Routes/userRoute"

dotenv.config()

const app = express()
const port = process.env.PORT||4000
mongoose.connect(process.env.MONGODB_URL as string)
.then(() => console.log('Connected to MongoDB'))
.catch((err : unknown) => console.error('Failed to connect to MongoDB', err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/',userRoute)

app.listen(port, () => {
    console.log(`App is listening on ${port}`)
})

