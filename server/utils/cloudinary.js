import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engines for different file types
const createCloudinaryStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: allowedFormats,
      transformation: folder.includes('profile-images') ? [{ width: 500, height: 500, crop: 'fill' }] : []
    }
  });
};

// Create multer uploaders for different types of content
const profileImageStorage = createCloudinaryStorage('teamsync/profile-images', ['jpg', 'png', 'jpeg', 'gif']);
const leaveDocumentStorage = createCloudinaryStorage('teamsync/leave-documents', ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx']);
const documentStorage = createCloudinaryStorage('teamsync/documents', ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']);
const payslipStorage = createCloudinaryStorage('teamsync/payslips', ['pdf']);
const ticketStorage = createCloudinaryStorage('teamsync/tickets', ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx']);

// Create multer upload instances
export const uploadProfileImage = multer({ storage: profileImageStorage });
export const uploadLeaveDocument = multer({ storage: leaveDocumentStorage });
export const uploadDocument = multer({ storage: documentStorage });
export const uploadPayslip = multer({ storage: payslipStorage });
export const uploadTicket = multer({ storage: ticketStorage });

// Direct upload function (for programmatic uploads without multer)
export const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `teamsync/${folder}`
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Helper function to delete files from Cloudinary
export const deleteFromCloudinary = async (public_id) => {
  try {
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new Error(`Error deleting from Cloudinary: ${error.message}`);
  }
};

export default cloudinary;