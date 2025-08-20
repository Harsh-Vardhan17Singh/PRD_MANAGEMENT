import dotenv from "dotenv"
dotenv.config()

import { sendEmail , forgotpasswordMailContent } from "./mail.js";

const test = async()=>{
    await sendEmail({
        email:"test@example.com",
        subject:"Testing email Service. ",
        mailgenContent:forgotpasswordMailContent(
            "Harsh Vardhan Singh",
            "https://taskmanagelink.com/verify/123"
        )
    })
}

test()