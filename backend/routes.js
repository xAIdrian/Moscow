import { Router } from 'express';
import multer from 'multer';
import { getUser as getCannedOpener } from './controllers/gptController.js';
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

//Sample of how to use exports module with controller
router.get('/opener', getCannedOpener);

// Upload route
router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
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
              res.send({
                  message: 'File Uploaded!',
                  file: `uploads/${req.file.filename}`
              });
              getCannedOpener('uploads/' + req.file.filename, res);
          }
      }
  });
});

export default router;
