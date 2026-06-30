import SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer";
import { accountVerifyTemplate, forgotTemplate, messageTemplate } from "../templates/emailVerification.template";
import { SendEmailType, SendUserEmailType } from "../types/email.type";


// let transporter: any;

// const transporterInit = () => {
//     // Define the nodemailer transporter
//     // transporter = nodemailer.createTransport({
//     //     service: "gmail",
//     //     secure: true,
//     //     secureConnection: false,
//     //     port: 465,
//     //     auth: {
//     //     user: process.env.GMAIL_USERNAME,
//     //     pass: process.env.GMAIL_PASSWORD,
//     //     },
//     //     tls: {
//     //     rejectUnauthorized: true,
//     //     },
//     // } as SMTPTransport.Options);

//     transporter = nodemailer.createTransport({
//         host: "smtp-relay.brevo.com",
//         port: 587,
//         secure: false,
//         auth: {
//           user: process.env.BREVO_LOGIN, 
//           pass: process.env.BREVO_SMTP_KEY,
//         },
//     } as SMTPTransport.Options);
// };

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {

        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false,
            auth: {
            user: process.env.BREVO_LOGIN, 
            pass: process.env.BREVO_SMTP_KEY,
            },
        });

        await transporter.sendMail({
            from: `"The Knowledgeable Chain" <thekcshows@gmail.com>`,
            to,
            subject,
            html,
        });
        
    } catch (error) {
        console.error("Bravo Email Error:", error);
        throw new Error("Failed to send email");
    }
  
};


export const sendUserAccountVerificationEmail = async ({
    emailTo,
    subject,
    otp,
    firstName,
  }: SendEmailType) => {
    // Init the nodemailer transporter
    // transporterInit();
  
    try {
      // let response = await transporter.sendMail({
      //   from: "Knowledge Chain",
      //   to: emailTo,
      //   subject: subject,
      //   html: accountVerifyTemplate(otp, firstName!),
      // });

      let response = await sendEmail(emailTo, subject, accountVerifyTemplate(otp, firstName!))
      return response;
    } catch (error) {
      throw error;
    }
};


export const sendUserMessageEmail = async ({
    emailTo,
    subject,
    message,
    firstName,
  }: SendUserEmailType) => {
    // Init the nodemailer transporter
    // transporterInit();
  
    try {
      // let response = await transporter.sendMail({
      //   from: "Knowledge Chain",
      //   to: emailTo,
      //   subject: subject,
      //   html: messageTemplate(message, firstName!),
      // });

       let response = await sendEmail(emailTo, subject,  messageTemplate(message, firstName!))
      return response;
    } catch (error) {
      throw error;
    }
};

export const sendForgotEmail = async ({ emailTo, otp,}: {emailTo: string; otp: string}) => {
    // Init the nodemailer transporter
    // transporterInit();
  
    try {
      // let response = await transporter.sendMail({
      //   from: "Knowledge Chain",
      //   to: emailTo,
      //   subject: "Forgot Password Verification Code",
      //   html: forgotTemplate(otp),
      // });

      let response = await sendEmail(emailTo, "Forgot Password Verification Code", forgotTemplate(otp))
      return response;
    } catch (error) {
      throw error;
    }
};


