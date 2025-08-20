import { Router } from "express"
import { login,logoutUser,registerUser } from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/vaildator.middelware.js"
import { userRegisterValidators , userloginValidator } from "../validators/index.js"
import {VerifyJWT} from "../middlewares/auth.middleware.js"

const router  =  Router()

router.route("/register").post(userRegisterValidators(),validate, registerUser)

/*in this line 
1. router() - creates a mini object from Express to define routes like /register.
2.POST API endpoint at /register with three layers
  a) userRegisterValidators() - Runs the validation rules we defined in your validator file like if email is missing it gets  collects error
  b)validate - this is your custom middleware, its job is to check if any error were collected by userRegisterValidators(), if no error - it callsnext so that the request moves to the next handler

  c)registerUser - it only runs if validation passes(email/useranme/password were correct)
*/

router.route("/login").post( userloginValidator() , validate,  login )


//Secure Route
router.route("/logout").post(VerifyJWT ,  logoutUser)

export  default router