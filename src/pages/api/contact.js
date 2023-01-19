require('dotenv').config()
import * as fs from 'fs';

const PASSWORD = process.env.password

export default function (req, res) {
  let nodemailer = require('nodemailer')

  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    host: "smtp.gmail.com",
    auth: {
      user: 'contactguillaumemail@gmail.com',
      pass: PASSWORD,
    },
    secure: false,
  });
  
  
  const mailData = {
    from: 'contactguillaumemail@gmail.com', //l'adresse qui expédiera le mail
    to: 'maxnoelsens@gmail.com', // à mon adresse pour le moment puis celle de guillaume
    text: `${req.body.firstName} ${req.body.lastName}, ${req.body.email} \n\n${req.body.subject} \n\n${req.body.message}`,
    attachments: [{
      filename: "image.png",
      content: fs.createReadStream(req.body),
      path: "",
      cid: "unique"
  }]
  }

  transporter.sendMail(mailData, function (err, info) {
    if (err)
      console.log("err = " + err)
    else
      console.log("info = " + info)
  })

  res.status(200)
  res.end()
}