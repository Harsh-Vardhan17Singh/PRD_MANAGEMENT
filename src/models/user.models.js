import mongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"


const userSchema = new Schema(
    {
       avatar : {
        type:{
            url : String,
            localPath : String,

        },
        default:{
            url :`https://placehold.co/200x200`,
            localPath:""

        }

       },
       username:{
        type: String,
        required:true,
        unique: true,
        lowercase: true,
        trim :true,
        index: true,

       },
       email:{
        type:String,
        required:true,
        unique:true,
        lowercase :true,
        trim :true,

       },
       fullname:{
        type:String,
        trim:true
       },
       password:{
        type: String,
        required:[true,"PAssword is Mandatory"]
       },
       isEmailVerified:{
        type:Boolean,
        dafault:false
       },
       refreshToken:{
        type:String
       },
       forgotpassword:{
        type:String
       },
       forgotPasswordExpiry:{
        type:Date
       },
       emailVerificationToken:{
        type:String
       },
       emailVerificationExpiry:{
        type:Date
       }
    },{
        timestamps:true
    }

)

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
// Generating Access Token

userSchema.methods.generateAccessToken = function(){
    return  jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
    
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

// Generating refresh token  

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)

}

userSchema.methods.generateTemporaryToken = function(){
    const unHasedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto.createHash("sha256")
    .update(unHasedToken)
    .digest("hex")


const TokenExpiry = Date.now() + (20*60*1000) //20 min
return {unHasedToken,hashedToken,TokenExpiry}

}

export const User = mongoose.model("User",userSchema)