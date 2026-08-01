import fs from 'fs';
import path from 'path';
import multer from 'multer';
import os from 'os';

// On Vercel (read-only filesystem), use /tmp for uploads
// Locally, use public/uploads
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? path.join(os.tmpdir(), 'uploads') : 'public/uploads';

// Ensure uploads folder exists (wrapped in try/catch for serverless safety)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Media] Could not create upload directory:', err.message);
}

// Multer Local Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure dir exists at request time too (for serverless cold starts)
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (e) {
      // Continue anyway — multer will report the error
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File validation filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, WEBP, GIF) are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// @desc    Upload image
// @route   POST /api/media/upload
// @access  Private/Author
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const port = process.env.PORT || 5000;
    const fileUrl = `${req.protocol}://${req.hostname === 'localhost' ? `localhost:${port}` : req.hostname}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: fileUrl,
      fileName: req.file.filename,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all uploaded media assets
// @route   GET /api/media
// @access  Private/Author
export const getMediaAssets = async (req, res, next) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.json({ success: true, media: [] });
    }

    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        return res.json({ success: true, media: [] });
      }

      const port = process.env.PORT || 5000;
      const mediaList = files
        .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map((file) => {
          const filePath = path.join(uploadDir, file);
          try {
            const stats = fs.statSync(filePath);
            return {
              fileName: file,
              url: `${req.protocol}://${req.hostname === 'localhost' ? `localhost:${port}` : req.hostname}/uploads/${file}`,
              size: stats.size,
              createdAt: stats.birthtime
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt);

      res.json({ success: true, media: mediaList });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media asset
// @route   DELETE /api/media/:filename
// @access  Private/Author
export const deleteMediaAsset = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Security check to prevent directory traversal
    if (path.dirname(filePath) !== uploadDir) {
      return res.status(403).json({ success: false, message: 'Unauthorized path traversal' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Media asset deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
};
