import { Router } from 'express';
import multer from 'multer';
import { processImageText, extractBioWithGpt, getOpeningLineWithGpt } from './controllers/gptController.js';
import path from 'path';
const router = Router();

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limits file size to 1MB
  fileFilter: function(req, file, cb) {
      checkFileType(file, cb);
  }
}).single('myFile'); // 'myFile' is the name attribute in your HTML file input

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname) {
      return cb(null, true);
  } else {
      cb('Error: Images Only!');
  }
}

// Upload route
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
      if(err) {
          console.log("🚀 ~ upload ~ err:", err)
          res.send({
              message: err
          });
      } else {
          if(req.file == undefined) {
              res.send({ 
                  message: 'Error: No File Selected!'
              });
          } else {
              const rawImageText = await processImageText('uploads/' + req.file.filename, res);
              const profileText = await extractBioWithGpt(rawImageText);
              const openingLine = await getOpeningLineWithGpt(profileText);
              res.send({
                  message: 'success',
                  data: openingLine 
              });
          }
      }
  });
});

export default router;
