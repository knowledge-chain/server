
export const accountVerifyTemplate = (otp: string, firstName?: string) => `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400&family=Nunito:wght@200;300;400;500;600&display=swap');
        body {
          font-family: sans-serif;
          font-size: 13px;
          background-color: #f4f4f4;
        }
        .container {
          margin: 20px auto;
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
        }
        .otp {
          display: inline-block;
          padding: 10px;
          border-radius: 5px;
          background-color: #ddd;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          font-family: 'Inconsolata', monospace;
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          cursor: pointer;
        }
        p{
            color: #333333;
            font-size: 13px;
            display: block
        }
      </style>
    </head>
    <body>
      <div class="container" style="background-color: #f2f2f2; padding: 20px;display:block">
      <h2 style="color: #333333;text-transform:capitalize">Hi ${firstName},</h2>
      <p style="color: #333333;">We have received a request to verify your account.</p>
      <p style="color: #333333;">Please use the following OTP to verify your account:</p>
        <div class="otp">${otp}</div>
        <p>If you did not request this code, please ignore this email.</p>
        <p style="color: #333333;">Best regards,</p>
        <p style="color: #333333;">Knowledge Chain Team</p>
      </div>
    </body>
  </html>
`;


export const messageTemplate = (message: string, firstName: string) => `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400&family=Nunito:wght@200;300;400;500;600&display=swap');
        body {
          font-family: sans-serif;
          font-size: 13px;
          background-color: #f4f4f4;
        }
        .container {
          margin: 20px auto;
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
        }
        .otp {
          display: inline-block;
          padding: 10px;
          border-radius: 5px;
          background-color: #ddd;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          font-family: 'Inconsolata', monospace;
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          cursor: pointer;
        }
        p{
            color: #333333;
            font-size: 13px;
            display: block
        }
      </style>
    </head>
    <body>
      <div class="container" style="background-color: #f2f2f2; padding: 20px;display:block">
      <h2 style="color: #333333;text-transform:capitalize">Dear ${firstName},</h2>
      <p style="color: #333333;">${message}</p>
       
      <p style="color: #333333;">Best regards,</p>
      <p style="color: #333333;">Knowledge Chain Team</p>
      </div>
    </body>
  </html>
`;


export const forgotTemplate = (otp: string) => `
  <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300;400&family=Nunito:wght@200;300;400;500;600&display=swap');
        body {
          font-family: sans-serif;
          font-size: 13px;
          background-color: #f4f4f4;
        }
        .container {
          margin: 20px auto;
          max-width: 600px;
          background-color: #ffffff;
          border-radius: 5px;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
        }
        .otp {
          display: inline-block;
          padding: 10px;
          border-radius: 5px;
          background-color: #ddd;
          box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          font-family: 'Inconsolata', monospace;
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          cursor: pointer;
        }
        p{
            color: #333333;
            font-size: 13px;
            display: block
        }
      </style>
    </head>
    <body>
      ForgotPassword Code for TKC APP,
      <p>Hello there,</p>
      <p>We've sent you a forgotPassword code to complete your reset your password. Please enter the code below to proceed:</p>
      <h2 class="highlight">OTP: ${otp}</h2>
      <p>This code is valid for 15 minutes. If you didn't request this code, please ignore this email.</p>
    </body>
  </html>
`;