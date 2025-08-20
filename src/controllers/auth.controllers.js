// Authentifying the user in website Using Access token and Refresh Token

import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asynchandler } from "../utils/async-handlers.js"
import { emailVerificationMailContent, sendEmail } from "../utils/mail.js"
import jwt from "jsonwebtoken"
//import { sendEmail } from "../utils/mail.js" 


const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        // this gives me two function 
        //1. gets access to all the methods in module.
        //2.Verify same user by same id 
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave:false})
       return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(
            500,
        "Something went wrong while generating accesss and refresh token"
        )
    }
}



const registerUser = asynchandler(async(req,res) =>{
     const {email,username,password,role} = req.body


     const existedUser = await User.findOne({
        $or:[{username},{email}]
     })
     if(existedUser){
        throw new ApiError(409,"User with email or username already exists",[])
     }

     const user = await User.create({
        email,
        password,
        username,
        isEmailVerified:false
     })

     const {unHasedToken,hashedToken,TokenExpiry}=user.generateTemporaryToken()

     user.emailVerificationToken = hashedToken
     user.emailVerificationExpiry = TokenExpiry

     await user.save({validateBeforeSave:false})

     await sendEmail({
        email:user?.email,
        subject:"Please verify you email",
        mailgenContent :emailVerificationMailContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`
        )
        
     })

     const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken  -emailVerificationExpiry")

     if(!createdUser){
        throw new ApiError(500,"Something Went Wrong While Registring a User")
     }

     return res
     .status(201)
     .json(
        new ApiResponse(
            200,
            {user:createdUser},
            "User Registered Successfully and verification Email has been sent on your Email"
        )
     )
})

const login = asynchandler(async(req , res) => {
   const {email,password,username} = req.body

   if(!username || !email){
      throw new ApiError(400,"Usernmae or email is required")
   }

  const user = await User.findOne({email})

  if(!user){
   throw new ApiError(400, "User does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
   throw new ApiError(400,"Please Enter Correct Password")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

// Working About cookies (below)

  const options = {
   httpOnly:true,
   secure:false
  }

  return res
     .status(200)
     .cookie("accessToken",accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
      new ApiResponse(
         200,
         {
            user:loggedInUser,
            accessToken,refreshToken

         },
         "User logged in Successfully"
      )
     )

})

const logoutUser = asynchandler(async(req,res) => {
   // remove refresh token from DB

   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:""
         }
      },
      {
         new:true,
      },
   )
   const options= {
      httpOnly :true,
      secure:true
   }
   return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
         new ApiResponse(200,{},"User logged out")
      )

    

})

const getCurrentUser = asynchandler(async(req,res) =>{
   return res
     .status(200)
     .json(
      new ApiResponse(
         200,
         req.user,
         "Current User fetched succesfully"
      ))
})
const VerifyEmail = asynchandler(async(req,res) =>{
   const {verificationToken} = req.params

   if(!verificationToken){
      throw new ApiError(400,"Email verification token is missing")
   }

   let hashedToken = crypto
     .createHash("sha256")
     .update(verificationToken)
     .digest("hex")

     const user = await User.findOne({
      emailVerificationToken:hashedToken,
      emailVerificationExpiry:{$gt:Date.now()} // ($gt is a mongoDB query means greater than)
      //it means find all user whose field is greater than current time date should be greater than 
     })

     if(!user){
      throw new ApiError(400,"Token is Invalid or expired")
     }

     user.emailVerificationToken =undefined
     user.emailVerificationExpiry = undefined

     user.isEmailVerified = true
     await user.save({validateBeforeSave:false})

     return res
       .status(200)
       .json(
         new ApiResponse(
            200,
            {
            isEmailVerified:true
            },
            "Email is Verified"
         )
       )
})
const resendEmailVerification = asynchandler(async(req,res) =>{
   const user = await User.findById(req.user?._id)

   //req.user?._id in javascript safely checks:
     //1) if req.user exists retuen req.user._id
     //2) if req.user doesn't exists return undefined

     if(!user){
      throw new ApiError(409,"User does not exist")
     }
     if(user.isEmailVerified){
      throw new ApiError(409,"Email is already verified")
     }
     const {unHasedToken,hashedToken,TokenExpiry}=user.generateTemporaryToken()

     user.emailVerificationToken = hashedToken
     user.emailVerificationExpiry = TokenExpiry

     await user.save({validateBeforeSave:false})

     await sendEmail({
        email:user?.email,
        subject:"Please verify you email",
        mailgenContent :emailVerificationMailContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`
        )
        
     })

     return res
       .status(200)
       .json(
         new ApiResponse(
            200,
            {},
            "Mail has been sent to your Email ID"
         )
       )

})


const refreshAccessToken = asynchandler(async(req,res) =>{
   const incomingrefreshToken = req.cookies.refreshToken ||  req.body.refreshToken

   if(!incomingrefreshToken){
      throw new ApiError(401,"Unauthorise Access")
   }
   try {
      const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)

      const user = await User.findById(decodedToken?._id)
      
      if(!user){
         throw new ApiError(401,"Invalid refresh token")
      }

      if(incomingrefreshToken !== user?.refreshToken){
         throw  new ApiError(401,"Refresh Token is Expired")

      }
      const options= {
         httpOnly:true,
         secure:true
      }

      const {accessToken , refreshToken:newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

      user.refreshToken = newRefreshToken
      await user.save()

      return res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
         new ApiResponse
         (
            200,
         {accessToken,refreshToken:newRefreshToken},
         "Access Token refreshed"
      )
        )
   } catch (error) {
      throw new ApiError(401,"Invalid Refresh Token")
   }
})




export{registerUser, login,logoutUser, getCurrentUser,VerifyEmail,resendEmailVerification}