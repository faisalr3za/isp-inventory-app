import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authenticateToken } from '../middleware/auth';
import { getUploadMiddleware, getFileUrl, deleteFile, isS3Configured } from '../config/s3';

const router = express.Router();
const upload = getUploadMiddleware();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route  POST /api/upload/single
// @desc   Upload single file
// @access Private
router.post('/single', upload.single('file'), asyncHandler(async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileData = {
      filename: req.file.filename || req.file.key,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: isS3Configured() ? getFileUrl(req.file.key) : `/uploads/${req.file.filename}`,
      key: req.file.key || req.file.filename,
      location: req.file.location || null
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
}));

// @route  POST /api/upload/multiple
// @desc   Upload multiple files
// @access Private
router.post('/multiple', upload.array('files', 5), asyncHandler(async (req: any, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const filesData = req.files.map((file: any) => ({
      filename: file.filename || file.key,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: isS3Configured() ? getFileUrl(file.key) : `/uploads/${file.filename}`,
      key: file.key || file.filename,
      location: file.location || null
    }));

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: filesData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Upload failed: ' + error.message
    });
  }
}));

// @route  DELETE /api/upload/:fileKey
// @desc   Delete uploaded file
// @access Private
router.delete('/:fileKey', asyncHandler(async (req: any, res) => {
  try {
    const { fileKey } = req.params;
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    // For security, decode the file key if it's URL encoded
    const decodedFileKey = decodeURIComponent(fileKey);
    
    await deleteFile(decodedFileKey);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Delete failed: ' + error.message
    });
  }
}));

// @route  GET /api/upload/url/:fileKey
// @desc   Get file URL (for accessing private files)
// @access Private
router.get('/url/:fileKey', asyncHandler(async (req: any, res) => {
  try {
    const { fileKey } = req.params;
    
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        message: 'File key is required'
      });
    }

    const decodedFileKey = decodeURIComponent(fileKey);
    const fileUrl = getFileUrl(decodedFileKey);

    res.json({
      success: true,
      data: {
        url: fileUrl,
        key: decodedFileKey,
        expires: isS3Configured() ? '1 hour' : 'permanent'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get file URL: ' + error.message
    });
  }
}));

// @route  GET /api/upload/info
// @desc   Get upload configuration info
// @access Private
router.get('/info', asyncHandler(async (req, res) => {
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
  
  res.json({
    success: true,
    data: {
      storage: isS3Configured() ? 'IDCloudHost S3' : 'Local Storage',
      maxFileSize: maxFileSize,
      maxFileSizeMB: (maxFileSize / 1024 / 1024).toFixed(1),
      maxFiles: 5,
      allowedTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ],
      s3Configured: isS3Configured()
    }
  });
}));

export default router;
