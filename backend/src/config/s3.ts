import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// Konfigurasi IDCloudHost S3
const s3Config = {
  accessKeyId: process.env.IDCH_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.IDCH_SECRET_ACCESS_KEY || '',
  region: process.env.IDCH_REGION || 'regionOne',
  bucket: process.env.IDCH_BUCKET_NAME || 'isp-inventory-files',
  endpoint: process.env.IDCH_S3_ENDPOINT || 'https://is3.cloudhost.id',
  s3ForcePathStyle: true, // Required for IDCloudHost
  signatureVersion: 'v4'
};

// Initialize S3 dengan konfigurasi IDCloudHost
const s3 = new AWS.S3({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
  endpoint: s3Config.endpoint,
  s3ForcePathStyle: s3Config.s3ForcePathStyle,
  signatureVersion: s3Config.signatureVersion
});

// Check if S3 is configured
export const isS3Configured = () => {
  return !!(s3Config.accessKeyId && s3Config.secretAccessKey && s3Config.bucket);
};

// Create S3 bucket if it doesn't exist
export const createS3Bucket = async (): Promise<void> => {
  try {
    // Check if bucket exists
    await s3.headBucket({ Bucket: s3Config.bucket }).promise();
    console.log(`✅ IDCloudHost S3 Bucket '${s3Config.bucket}' already exists`);
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Bucket doesn't exist, create it
      console.log(`🪣 Creating IDCloudHost S3 bucket: ${s3Config.bucket}`);
      
      const params: AWS.S3.CreateBucketRequest = {
        Bucket: s3Config.bucket,
        ACL: 'private'
      };

      await s3.createBucket(params).promise();
      
      // Set CORS configuration for web access
      const corsConfig = {
        Bucket: s3Config.bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
              MaxAgeSeconds: 3000
            }
          ]
        }
      };

      try {
        await s3.putBucketCors(corsConfig).promise();
        console.log('✅ CORS configuration set for bucket');
      } catch (corsError) {
        console.warn('⚠️ Could not set CORS configuration:', corsError);
      }

      console.log(`✅ IDCloudHost S3 Bucket '${s3Config.bucket}' created successfully`);
    } else {
      console.error('❌ Error checking IDCloudHost S3 bucket:', error.message);
      throw error;
    }
  }
};

// Generate file key for S3
const generateFileKey = (req: any, file: Express.Multer.File): string => {
  const userId = req.user?.id || 'anonymous';
  const timestamp = Date.now();
  const randomSuffix = Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '-');
  
  return `uploads/${userId}/${timestamp}-${randomSuffix}-${baseName}${extension}`;
};

// Multer configuration for IDCloudHost S3
export const s3Upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3Config.bucket,
    acl: 'private',
    key: generateFileKey,
    metadata: (req, file, cb) => {
      cb(null, {
        'Content-Type': file.mimetype,
        'Upload-Date': new Date().toISOString(),
        'User-ID': req.user?.id?.toString() || 'anonymous',
        'Original-Name': file.originalname
      });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
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
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type tidak diizinkan: ${file.mimetype}. Hanya gambar, PDF, dan dokumen Office yang diperbolehkan.`));
    }
  }
});

// Fallback local storage untuk development
export const localStorage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'uploads');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9]/g, '-');
      
      cb(null, `${userId}-${timestamp}-${randomSuffix}-${baseName}${extension}`);
    }
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
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
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type tidak diizinkan'));
    }
  }
});

// Get upload middleware based on configuration
export const getUploadMiddleware = () => {
  return isS3Configured() ? s3Upload : localStorage;
};

// Get file URL
export const getFileUrl = (fileKey: string): string => {
  if (isS3Configured()) {
    return s3.getSignedUrl('getObject', {
      Bucket: s3Config.bucket,
      Key: fileKey,
      Expires: 3600 // 1 hour expiration
    });
  } else {
    return `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${path.basename(fileKey)}`;
  }
};

// Get public file URL (untuk file yang bisa diakses publik)
export const getPublicFileUrl = (fileKey: string): string => {
  if (isS3Configured()) {
    return `${s3Config.endpoint}/${s3Config.bucket}/${fileKey}`;
  } else {
    return `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${path.basename(fileKey)}`;
  }
};

// Delete file
export const deleteFile = async (fileKey: string): Promise<void> => {
  if (isS3Configured()) {
    try {
      await s3.deleteObject({
        Bucket: s3Config.bucket,
        Key: fileKey
      }).promise();
      console.log(`✅ File deleted from IDCloudHost S3: ${fileKey}`);
    } catch (error) {
      console.error(`❌ Error deleting file from IDCloudHost S3: ${fileKey}`, error);
      throw error;
    }
  } else {
    const fs = require('fs').promises;
    const filePath = path.join(process.cwd(), 'uploads', path.basename(fileKey));
    try {
      await fs.unlink(filePath);
      console.log(`✅ File deleted from local storage: ${filePath}`);
    } catch (error) {
      console.warn(`⚠️ File not found for deletion: ${filePath}`);
    }
  }
};

// List files in bucket (untuk debugging)
export const listFiles = async (prefix?: string): Promise<AWS.S3.Object[]> => {
  if (!isS3Configured()) {
    throw new Error('S3 not configured');
  }

  const params: AWS.S3.ListObjectsV2Request = {
    Bucket: s3Config.bucket,
    Prefix: prefix
  };

  const result = await s3.listObjectsV2(params).promise();
  return result.Contents || [];
};

// Display S3 setup information
export const displayS3Setup = () => {
  console.log('\n🔧 === IDCLOUDHOST S3 STORAGE SETUP ===');
  console.log('🌐 S3 Endpoint:', s3Config.endpoint);
  console.log('📍 Region:', s3Config.region);
  console.log('🪣 Bucket Name:', s3Config.bucket);
  
  if (!isS3Configured()) {
    console.log('\n⚠️  IDCLOUDHOST S3 NOT CONFIGURED - Using local storage fallback');
    console.log('\n📋 To enable IDCloudHost S3 storage, add these environment variables:');
    console.log('   IDCH_ACCESS_KEY_ID=your_access_key_here');
    console.log('   IDCH_SECRET_ACCESS_KEY=your_secret_key_here');
    console.log('   IDCH_REGION=regionOne (default for IDCloudHost)');
    console.log('   IDCH_BUCKET_NAME=your_bucket_name (default: isp-inventory-files)');
    console.log('   IDCH_S3_ENDPOINT=https://is3.cloudhost.id (default)');
    
    console.log('\n🔑 === IDCLOUDHOST S3 SETUP GUIDE ===');
    console.log('1. Login ke IDCloudHost Panel: https://console.idcloudhost.com');
    console.log('2. Pilih menu "Object Storage" atau "S3 Storage"');
    console.log('3. Buat bucket baru atau gunakan yang sudah ada');
    console.log('4. Generate Access Key & Secret Key di menu API Keys');
    console.log('5. Copy keys ke file .env Anda');
    
    console.log('\n📝 Example .env configuration:');
    console.log(`   IDCH_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`);
    console.log(`   IDCH_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`);
    console.log(`   IDCH_REGION=regionOne`);
    console.log(`   IDCH_BUCKET_NAME=isp-inventory-files`);
    console.log(`   IDCH_S3_ENDPOINT=https://is3.cloudhost.id`);
    
    console.log('\n💡 Tips:');
    console.log('   - Pastikan bucket sudah dibuat di IDCloudHost panel');
    console.log('   - Set bucket permissions sesuai kebutuhan');
    console.log('   - Monitor usage di IDCloudHost dashboard');
    console.log('   - Backup penting data secara berkala');
    
  } else {
    console.log('✅ IDCloudHost S3 Configuration: ACTIVE');
    console.log('🔑 Access Key ID:', s3Config.accessKeyId.substring(0, 8) + '...');
    console.log('🔐 Secret Key: ***configured***');
  }
  
  console.log('\n💾 File Upload Configuration:');
  console.log('   Max File Size:', (parseInt(process.env.MAX_FILE_SIZE || '10485760') / 1024 / 1024).toFixed(1), 'MB');
  console.log('   Max Files per Upload: 5');
  console.log('   Allowed Types: Images (JPEG, PNG, GIF, WebP), PDF, Word, Excel, Text, CSV');
  console.log('   Storage Path: uploads/{user_id}/{timestamp}-{random}-{filename}');
  console.log('\n==========================================\n');
};

// Test connection to IDCloudHost S3
export const testS3Connection = async (): Promise<boolean> => {
  if (!isS3Configured()) {
    console.log('⚠️ S3 not configured, skipping connection test');
    return false;
  }

  try {
    console.log('🔄 Testing IDCloudHost S3 connection...');
    
    // Test dengan list buckets
    await s3.listBuckets().promise();
    console.log('✅ IDCloudHost S3 connection successful');
    
    // Test bucket access
    try {
      await s3.headBucket({ Bucket: s3Config.bucket }).promise();
      console.log(`✅ Bucket '${s3Config.bucket}' is accessible`);
    } catch (bucketError) {
      console.log(`⚠️ Bucket '${s3Config.bucket}' may not exist or not accessible`);
      await createS3Bucket();
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ IDCloudHost S3 connection failed:', error.message);
    console.log('💡 Please check your IDCloudHost S3 credentials and endpoint');
    return false;
  }
};

export { s3, s3Config };
