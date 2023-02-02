import mime from "mime";
const sgMail = require("@sendgrid/mail");
import fs from "fs";
import { join } from "path";


export const MAX_FILES = 10
export const MAX_FILE_SIZE = 1024 * 1024 * 10 // 10mb
export const UPLOAD_DIR = join(process.cwd(), `uploads/`)

const generateUniqueSuffix = () => `${Date.now()}-${Math.round(Math.random() * 1e9)}`

export const generateFileName = (part) => `${part.name || "unknown"}-${generateUniqueSuffix()}.${
  mime.getExtension(part.mimetype || "") || "unknown"
}`

export const logUploadedFiles = () => {
  console.log(fs.readdirSync(UPLOAD_DIR))
}

export function sendMail(fields, content, filename) {
  console.log("FILENAME", filename);
  const msg = {
    from: "contactguillaumemail@gmail.com",
    to: "maxnoelsens@gmail.com",
    subject: `${fields.subject}`,
    text: `${fields.firstName} ${fields.lastName}, ${fields.email} \n\n${fields.subject} \n\n${fields.message}`,
    attachments: [
      {
        filename,
        content,
        disposition: "attachment",
      },
    ],
  };

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  sgMail
    .send(msg)
    .then(() => {
      console.log("email sent");
    })
    .catch((err) => {
      console.log("err" + err);
    });
}