// utils/multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderName = 'uploads';
   console.log('req:', req.client);
    if (req.client) {
      const name = req.client.name.replace(/\s+/g, '_'); // sanitize
      
      folderName = path.join('uploads', `${name}_`);
      console.log('Multer destination folder:', folderName);
    }

    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }

    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    console.log('Multer file name:', file);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
