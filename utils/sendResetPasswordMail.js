const transporter = require('./nodemailer')

const sendResetPasswordMail = (email, url) => {
    return transporter.sendMail({
        to: email,
        from: process.env.EMAIL,
        subject: 'Password reset token',
        text: `You are receiving this email because you (or someone else) has requested the reset of a password. You can do this at: \n\n ${url}`
    })
}
module.exports = sendResetPasswordMail