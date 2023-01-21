require('dotenv').config()
let nodemailer = require('nodemailer')
import formidable from "formidable";
import { join } from "path";
import * as dateFn from "date-fns";
import { mkdir, stat } from "fs/promises";
import mime from "mime";
let fs = require('fs');

const PASSWORD = process.env.password

const parseForm = async (req) => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/uploads/${dateFn.format(Date.now(), "dd-MM-Y")}`
    );

    try {
      await stat(uploadDir);
    } catch (e) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

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
  let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;

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
    text: `${fields.firstName} ${fields.lastName}, ${fields.email} \n\n${fields.subject} \n\n${fields.message}`,
    attachments: [{
      filename: "image.png",
      path: file.filepath,
    }]
  }

  transporter.sendMail(mailData, function (err, info) {
    if (err)
      console.log("err = " + err)
  })

  res.status(200);
  res.end()

}

export const config = {
  api: {
    bodyParser: false,
  },
};