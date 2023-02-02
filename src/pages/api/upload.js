require('dotenv').config()
const sgMail = require('@sendgrid/mail');
import { readFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, path, resolve } from "path";
import formidable from "formidable";
import mime from "mime";
import mv from 'mv';

const parseForm = async (req) => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(process.cwd(), `uploads/`);

    const form = formidable({
      maxFiles: 10,
      maxFileSize: 1024 * 1024 * 10, // 10mb
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${mime.getExtension(part.mimetype || "") || "unknown"
          }`;
        return filename;
      },
      filter: (part) => {
        return (
          part.name === "media" && (part.mimetype?.includes("image") || false)
        );
      },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};


export default async function upload(req, res) {
  const { fields, files } = await parseForm(req);
  const file = files.media;
  const uploadDir = join(process.cwd(), `uploads/`);
  console.log("join(uploadDir, file.newFilename) = " + join(uploadDir, file.newFilename))
  console.log("uploadDir = " + uploadDir)
  
  var tmp = readdirSync('./uploads/');
  console.log(tmp);

  // mv("")

  tmp = readdirSync('./uploads/');
  console.log(tmp);
  
  // const fileContent = readFileSync(join(uploadDir, file.newFilename)).toString("base64")
  const fileContent = readFileSync(join(uploadDir, "media-1675329533874-903875653.png")).toString("base64")
  
  tmp = readdirSync('./uploads/');
  console.log(tmp);
  
  const msg = {
    from: 'contactguillaumemail@gmail.com',
    to: 'maxnoelsens@gmail.com',
    subject: `${fields.subject}`,
    text: `${fields.firstName} ${fields.lastName}, ${fields.email} \n\n${fields.subject} \n\n${fields.message}`,
    attachments: [
      {
        filename: file.newFilename,
        content: fileContent,
        disposition: "attachment"
      }
    ]
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  sgMail.send(msg)
  .then(() => {
    console.log("email sent");
  })
  .catch(err => {
    console.log(err);
  });

  res.status(200);
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
};