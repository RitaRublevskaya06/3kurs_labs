const nodemailer = require('nodemailer');

const FIXED_TO = 'margouniver@mail.ru';

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: FIXED_TO,
    pass: 'NlJXsaIjTdZKp1YGvMEE'
  }
});


function send(messageText) {
  const mailOptions = {
    from: FIXED_TO,
    to: FIXED_TO,
    subject: 'Письмо из пакета m0603',
    html: `<p>${messageText}</p>`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Ошибка при отправке письма:', err);
    } else {
      console.log('Письмо успешно отправлено:', info.response);
    }
  });
}

module.exports = { send };
