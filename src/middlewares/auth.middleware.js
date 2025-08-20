import { User } from "../models/user.models.js";
import { asynchandler } from "../utils/async-handlers.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken"

// Middleware For verfying The Jwt Token
/*
What it does is - 
  Validates the Access token is present or not
  if it is Present it adds the info into the request object that was created.  */

export const VerifyJWT = asynchandler(async(req,res,next)=>{
    const Token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ","")

    if(!Token){
        throw new ApiError(401,"Unauthorized request")

    }
    try {
       const decodedtoken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
       const user = await User.findById(decodedtoken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

       if(!user){
        throw new ApiError(401,"Invalid Access token")
       }
       req.user = user
       next()
    } catch (error) {
        throw new ApiError(401,"Invalid Access Token")
    }

})