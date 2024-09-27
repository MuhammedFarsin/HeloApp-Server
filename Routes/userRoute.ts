import express, { Router } from 'express'
const userRoute : Router =  express.Router()
import userController from "../Controllers/userController"

userRoute.post("/login",userController.login)
userRoute.post("/signup",userController.signup)
userRoute.post("/verify-otp",userController.verifyOTP)
userRoute.post("/verify-email-resetPassword",userController.verifyMailResetPassword)

export default userRoute
