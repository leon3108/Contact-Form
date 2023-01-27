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
      `/uploads/`
    );

    try {
      await stat(uploadDir);
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log("upload dir not existent")
        await mkdir(uploadDir, { recursive: true })
        .then(function () {
          console.log("Promise Resolved");
        }).catch(function () {
          console.log("Promise Rejected");
        })
        console.log("upload dir should now exist")
      } else {
        console.error("mon erreur = " + e);
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
  var attachment = [];

  if (file != undefined) {
    let url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
    attachment = [{
      filename: file.filename,
      path: file.filepath,
    }];
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: 'contactguillaumemail@gmail.com',
      pass: PASSWORD,
    },
  });

  const mailData = {
    from: 'contactguillaumemail@gmail.com', //l'adresse qui expédiera le mail
    to: 'maxnoelsens@gmail.com', // à mon adresse pour le moment puis celle de guillaume
    text: `${fields.firstName} ${fields.lastName}, ${fields.email} \n\n${fields.subject} \n\n${fields.message}`,
    attachments: attachment
  }

  // await new Promise((resolve, reject) => {
    transporter.sendMail(mailData, function (err, info) {
      if (info) {
        fs.unlink(file.filepath, (err) => {
          if (err) throw err;
          console.log('successfully deleted ' + file.filepath);
        });
      }
      if (err)
        console.log("err = " + err)
    })
  // })


res.status(200);
res.end()

}

export const config = {
  api: {
    bodyParser: false,
  },
};