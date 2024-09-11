import express, { Router } from 'express'
const userRoute : Router =  express.Router()
import userController from "../Controllers/userController"

userRoute.post("/signup",userController.signup)
userRoute.post("/verify-otp",userController.verifyOTP)

export default userRoute
