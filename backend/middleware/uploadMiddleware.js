import { upload } from '../config/cloudinary.js';

const localFileUrl = (req, file) => {
  if (!file?.filename) return file?.path;
  return `/uploads/${file.filename}`;
};

const normalizeLocalUploads = (req, res, next) => {
  if (req.file?.filename) {
    req.file.path = localFileUrl(req, req.file);
  }

  if (req.files) {
    Object.values(req.files)
      .flat()
      .forEach((file) => {
        if (file?.filename) file.path = localFileUrl(req, file);
      });
  }

  next();
};

export const uploadSingle = [upload.single('image'), normalizeLocalUploads];

export const uploadProfileMedia = [
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  normalizeLocalUploads,
];
