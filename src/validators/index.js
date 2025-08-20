import { body } from "express-validator";

const userRegisterValidators = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is inValid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .isLength({min:3})
            .withMessage("Username mjst be at least 3 character long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required"),
        body("fullname")
            .optional()
            .notEmpty()
            .withMessage("Password is required")
    

    ]
}

const userloginValidator = () =>{
    return [
        body("email")
          .optional()
          .isEmail()
          .withMessage("Email is invalid"),
        body("password")
          .notEmpty()
          .withMessage("Password is required")
    ]
}


export {
    userRegisterValidators,
    userloginValidator

}