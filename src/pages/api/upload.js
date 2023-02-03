require("dotenv").config();
import formidable from "formidable";
import fs from "fs";
import { join, resolve } from "path";
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  generateFileName,
  logUploadedFiles,
  sendMail,
} from "./upload.utils";

const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFiles: MAX_FILES,
      maxFileSize: MAX_FILE_SIZE,
      uploadDir: UPLOAD_DIR,
      filename: (_name, _ext, part) => {
        return generateFileName(part);
      },
      filter: (part) => {
        return (
          part.name === "media" && (part.mimetype?.includes("image") || false)
        );
      },
    });

    return form.parse(req, async function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function upload(req, res) {
  const formParsed = await parseForm(req);

  const file = formParsed.files.media;

  // fs.writeFileSync(UPLOAD_DIR + file.newFilename, Buffer.from(fileContent));

  const fileContent = fs.readFileSync(join(UPLOAD_DIR, file.newFilename));

  console.log(fileContent);

  // sendMail(formParsed.fields, fileContent, file.newFilename);

  res.status(200);
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

// console.log(
//   "join(uploadDir, file.newFilename) = " +
//     join(UPLOAD_DIR, file.newFilename)
// );

// fs.writeFile(file.newFilename, file, (err) => {
//   console.log("error when writting file:", err);
// });
