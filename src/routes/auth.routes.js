import { Router } from "express"
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, login,logoutUser,refreshAccessToken,registerUser, resendEmailVerification, resetForgotPassword, VerifyEmail } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/vaildator.middelware.js"
import { userChangeCurrentPasswordvalidator, userForgotPasswordvalidator, userRegisterValidators , userResetForgotPasswordvalidator, userloginValidator } from "../validators/index.js"
import {VerifyJWT} from "../middlewares/auth.middleware.js"

const router  =  Router()

// unsecure route
router.route("/register").post(userRegisterValidators(),validate, registerUser)

/*in this line 
1. router() - creates a mini object from Express to define routes like /register.
2.POST API endpoint at /register with three layers
  a) userRegisterValidators() - Runs the validation rules we defined in your validator file like if email is missing it gets  collects error
  b)validate - this is your custom middleware, its job is to check if any error were collected by userRegisterValidators(), if no error - it callsnext so that the request moves to the next handler

  c)registerUser - it only runs if validation passes(email/useranme/password were correct)
*/

// unsecured routes because there is no verify JWT
router.route("/login").post( userloginValidator() , validate,  login )
router.route("/verify-email/:verificationToken").get(   VerifyEmail )

router.route("/refresh-token").post(refreshAccessToken)

router.route("/forgot-password").post( userForgotPasswordvalidator(),validate, forgotPasswordRequest)
router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordvalidator(),validate, resetForgotPassword)



//Secure Route
router.route("/logout").post(VerifyJWT ,  logoutUser)


router.route("/current-user").post(VerifyJWT ,getCurrentUser)


router.route("/change-password").post(VerifyJWT ,userChangeCurrentPasswordvalidator(),
  validate,
  changeCurrentPassword)
router
  .route("/resend-email-verification")
  .post(VerifyJWT,resendEmailVerification)


export  default router