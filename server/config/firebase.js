import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import logger from '../utils/logger.js';

const firebaseConfig = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

// Initialize Firebase
let firebaseApp;
let firebaseStorage;

try {
  firebaseApp = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  firebaseStorage = getStorage(firebaseApp);
  logger.info('Firebase initialized successfully');
} catch (error) {
  logger.error(`Error initializing Firebase: ${error.message}`);
}

// Helper function to upload a file to Firebase Storage
export const uploadFileToFirebase = async (file, folder, customFilename = null) => {
    try {
      // Input validation
      if (!file) {
        logger.error('No file provided to uploadFileToFirebase');
        throw new Error('No file provided');
      }
      
      // More detailed debugging of the file object
      logger.info(`File object: ${JSON.stringify({
        originalname: file.originalname || 'unknown',
        mimetype: file.mimetype || 'unknown',
        size: file.size || 'unknown',
        hasBuffer: !!file.buffer,
        bufferLength: file.buffer ? file.buffer.length : 'N/A',
        hasStream: !!file.stream,
        folder: folder
      })}`);
      
      if (!file.buffer) {
        logger.error(`File ${file.originalname || 'unknown'} has no buffer`);
        throw new Error('No file buffer provided');
      }
      
      if (!folder) {
        logger.error('No folder specified for file upload');
        throw new Error('No folder specified for upload');
      }
  
      const bucket = firebaseStorage.bucket();
      
      // Define filename - either use provided custom name or generate from original
      const timestamp = Date.now();
      const originalName = file.originalname || 'file';
      const fileExtension = originalName.split('.').pop() || '';
      const safeFilename = originalName.replace(/[^a-zA-Z0-9.]/g, '_'); // Remove special chars
      const filename = customFilename || `${folder}-${timestamp}-${Math.floor(Math.random() * 1000000)}.${fileExtension}`;
      
      // Full path in storage bucket
      const filePath = `${folder}/${filename}`;
      const fileRef = bucket.file(filePath);
  
      logger.info(`Uploading file to Firebase: ${filePath}, buffer size: ${file.buffer.length}`);
  
      // Upload file buffer
      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalname: file.originalname
          }
        }
      });
  
      logger.info(`File successfully uploaded to path: ${filePath}`);
  
      // Get download URL (expires in 7 days by default)
      const [url] = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      logger.info(`Generated signed URL for ${filePath}: ${url.substring(0, 50)}...`);
  
      // Return file info
      return {
        filename,
        path: filePath,
        url,
        contentType: file.mimetype,
        size: file.size
      };
    } catch (error) {
      logger.error(`Error uploading file to Firebase: ${error.message}`);
      throw error;
    }
  };

// Helper function to delete a file from Firebase Storage
export const deleteFileFromFirebase = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    const bucket = firebaseStorage.bucket();
    const file = bucket.file(filePath);
    
    // Check if file exists before deleting
    const [exists] = await file.exists();
    if (!exists) {
      logger.warn(`File ${filePath} does not exist in Firebase Storage`);
      return false;
    }
    
    await file.delete();
    logger.info(`File ${filePath} deleted from Firebase Storage`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file from Firebase: ${error.message}`);
    throw error;
  }
};

// Helper function to get a signed URL for a file
export const getFileSignedUrl = async (filePath, expiresIn = 60 * 60 * 24) => { // Default 24 hours
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    const bucket = firebaseStorage.bucket();
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      logger.warn(`File ${filePath} does not exist in Firebase Storage`);
      return null;
    }
    
    // Get download URL with specified expiration
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000
    });
    
    return url;
  } catch (error) {
    logger.error(`Error getting signed URL: ${error.message}`);
    throw error;
  }
};

// Helper function to stream a file directly to response
export const streamFileToResponse = async (filePath, res) => {
  try {
    const bucket = firebaseStorage.bucket();
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      logger.warn(`File ${filePath} does not exist in Firebase Storage`);
      return false;
    }
    
    // Get file metadata to set content type header
    const [metadata] = await file.getMetadata();
    res.setHeader('Content-Type', metadata.contentType);
    
    // Create a read stream and pipe to response
    const fileStream = file.createReadStream();
    fileStream.pipe(res);
    
    return true;
  } catch (error) {
    logger.error(`Error streaming file: ${error.message}`);
    throw error;
  }
};

export default firebaseStorage;