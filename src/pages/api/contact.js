require('dotenv').config()
let nodemailer = require('nodemailer')
import * as fs from 'fs';
import * as formidable from 'formidable';
const path = require('path');

const PASSWORD = process.env.password

export default function (req, res) {

  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log("parsing")
  })
    // var oldPath = files.profilePic.filepath;
    // var newPath = path.join(__dirname, 'uploads')
    //         + '/'+files.profilePic.name
    // var rawData = fs.readFileSync(oldPath)

    // fs.writeFile(newPath, rawData, function(err){
    //     if(err) console.log(err)
    //     return res.send("Successfully uploaded")
    // })
  // })

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
      content: req.body,
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