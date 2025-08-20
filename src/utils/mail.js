import mailgen from "mailgen"
import nodemailer from "nodemailer"


 const sendEmail = async (options) =>{
    const mailGenerator = new mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagelink.com"
        }
    })
    const emailTexutal = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transpoter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTexutal,
        html:emailHtml
    }


    try {
        await transpoter.sendMail(mail)
    } catch (error) {
        console.log("Email Service failed siliently. Make sure you have filled correct mailtrap credentials in the .env file ");

        console.error("Error: ",error)
        
    }

}


const emailVerificationMailContent=(username,passwordresetUrl) =>{
    return {
        body:
        {
        name:username,
        intro:"We got a request to reset the password of your account",
        action:{
            instructions:"To reset your password click on the following button or link",
          button:{
             color:"#1aafff",
             text:"Reset Password",
             link:passwordresetUrl
               },
            },
            outro:"Need HElp, Or Have Question? Just reply to this email, We'd love to to Help you. "

        }
    }
}

const forgotpasswordMailContent=(username,verificationUrl) =>{
    return {
        body:
        {
        name:username,
        intro:"Welcome To Our App! We are excited to have you on board.",
        action:{
            instructions:"To Verify your Email please click on the following button.",
          button:{
             color:"#1aafff",
             text:"Verify your Email",
             link:verificationUrl
               },
            },
            outro:"Need Help, Or Have Question? Just reply to this email, We'd love to to Help you. "

        }
    }
}

export {
    emailVerificationMailContent,
    forgotpasswordMailContent,sendEmail
}