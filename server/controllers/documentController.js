import Document from "../models/Document.js";
import { uploadDocument } from '../utils/firebase-multer.js';
import { uploadFileToFirebase, deleteFileFromFirebase, getFileSignedUrl, streamFileToResponse } from '../config/firebase.js';
import logger from "../utils/logger.js";

const upload = uploadDocument;

// Upload document
const uploadDocuments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const { userId, category, subCategory, title, description, isGlobal } = req.body;

        // Upload file to Firebase Storage
        const fileData = await uploadFileToFirebase(req.file, 'documents');

        const newDocument = new Document({
            userId,
            category,
            subCategory: subCategory || '',
            title,
            description: description || '',
            fileUrl: fileData.url,
            filePath: fileData.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            uploadedBy: req.user._id,
            isGlobal: isGlobal === 'true' || isGlobal === true
        });

        await newDocument.save();
        logger.info(`Document "${title}" uploaded for user ${userId} by admin ${req.user._id}`);

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document: newDocument
        });
    } catch (error) {
        logger.error(`Error uploading document: ${error.message}`);
        return res.status(500).json({ success: false, error: `Server error in uploading document: ${error.message}` });
    }
};

// Get all documents (admin)
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find()
            .populate('userId', 'name email role')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        // Refresh signed URLs if they might be expired
        const refreshedDocuments = await Promise.all(documents.map(async (doc) => {
            const docObj = doc.toObject(); // Convert to plain object
            
            try {
                // Handle documents created before Firebase integration (legacy support)
                if (!doc.filePath) {
                    return docObj; // Return as is
                }
                
                // Generate a new signed URL with a 24-hour expiration
                const newUrl = await getFileSignedUrl(doc.filePath, 24 * 60 * 60);
                
                if (newUrl) {
                    // Update document object with new URL
                    docObj.fileUrl = newUrl;
                    
                    // Save the document if URL was updated (optional, but keeps URLs fresh in DB)
                    if (doc.fileUrl !== newUrl) {
                        await Document.updateOne({ _id: doc._id }, { fileUrl: newUrl });
                    }
                }
                
                return docObj;
            } catch (error) {
                logger.error(`Error refreshing URL for document ${doc._id}: ${error.message}`);
                return docObj; // Return original document if refresh fails
            }
        }));

        return res.status(200).json({
            success: true,
            documents: refreshedDocuments
        });
    } catch (error) {
        logger.error(`Error fetching documents: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching documents" });
    }
};

// Get documents for a specific user - with same fix
const getUserDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if the requesting user is admin or the user themselves
        if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, error: "Access denied. You can only view your own documents" });
        }

        const documents = await Document.find({
            $or: [
                { userId: userId },
                { isGlobal: true }
            ]
        })
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 });

        // Refresh signed URLs
        const refreshedDocuments = await Promise.all(documents.map(async (doc) => {
            const docObj = doc.toObject(); // Convert to plain object
            
            try {
                // Handle documents created before Firebase integration (legacy support)
                if (!doc.filePath) {
                    return docObj; // Return as is
                }
                
                // Generate a new signed URL with a 24-hour expiration
                const newUrl = await getFileSignedUrl(doc.filePath, 24 * 60 * 60);
                
                if (newUrl) {
                    // Update document object with new URL
                    docObj.fileUrl = newUrl;
                }
                
                return docObj;
            } catch (error) {
                logger.error(`Error refreshing URL for document ${doc._id}: ${error.message}`);
                return docObj;
            }
        }));

        return res.status(200).json({
            success: true,
            documents: refreshedDocuments
        });
    } catch (error) {
        logger.error(`Error fetching user documents: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching user documents" });
    }
};

// Apply the same fix to getGlobalDocuments function
const getGlobalDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ isGlobal: true })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        // Refresh signed URLs
        const refreshedDocuments = await Promise.all(documents.map(async (doc) => {
            const docObj = doc.toObject(); // Convert to plain object
            
            try {
                // Handle documents created before Firebase integration (legacy support)
                if (!doc.filePath) {
                    return docObj; // Return as is
                }
                
                // Generate a new signed URL with a 24-hour expiration
                const newUrl = await getFileSignedUrl(doc.filePath, 24 * 60 * 60);
                
                if (newUrl) {
                    docObj.fileUrl = newUrl;
                }
                
                return docObj;
            } catch (error) {
                logger.error(`Error refreshing URL for document ${doc._id}: ${error.message}`);
                return docObj;
            }
        }));

        return res.status(200).json({
            success: true,
            documents: refreshedDocuments
        });
    } catch (error) {
        logger.error(`Error fetching global documents: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching global documents" });
    }
};

// Get a specific document by ID
const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await Document.findById(id)
            .populate('userId', 'name email role')
            .populate('uploadedBy', 'name');
        
        if (!document) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }
        
        // Check access rights - admin can view any document, users can only view their own or global documents
        if (req.user.role !== 'admin') {
            if (document.userId.toString() !== req.user._id.toString() && !document.isGlobal) {
                return res.status(403).json({ success: false, error: "Access denied. You can only view your own documents or global documents" });
            }
        }

        // Refresh the signed URL
        try {
            const newUrl = await getFileSignedUrl(document.filePath, 24 * 60 * 60);
            document.fileUrl = newUrl;
        } catch (error) {
            logger.error(`Error refreshing URL for document ${document._id}: ${error.message}`);
        }

        return res.status(200).json({
            success: true,
            document
        });
    } catch (error) {
        logger.error(`Error fetching document by ID: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching document" });
    }
};

// Update document
const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, subCategory, title, description, isGlobal } = req.body;
        
        const document = await Document.findById(id);
        
        if (!document) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }
        
        // Update document fields
        document.category = category || document.category;
        document.subCategory = subCategory || document.subCategory;
        document.title = title || document.title;
        document.description = description || document.description;
        document.isGlobal = isGlobal === 'true' || isGlobal === true || document.isGlobal;
        
        // If a new file is uploaded, update the file information
        if (req.file) {
            // Delete old file from Firebase if it exists
            if (document.filePath) {
                await deleteFileFromFirebase(document.filePath);
            }
            
            // Upload new file to Firebase
            const fileData = await uploadFileToFirebase(req.file, 'documents');
            
            document.fileUrl = fileData.url;
            document.filePath = fileData.path;
            document.fileType = req.file.mimetype;
            document.fileSize = req.file.size;
        }
        
        document.updatedAt = new Date();
        
        await document.save();
        logger.info(`Document "${document.title}" (ID: ${id}) updated by admin ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: "Document updated successfully",
            document
        });
    } catch (error) {
        logger.error(`Error updating document: ${error.message}`);
        return res.status(500).json({ success: false, error: `Server error in updating document: ${error.message}` });
    }
};

// Delete document
const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await Document.findById(id);
        
        if (!document) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }
        
        // Delete file from Firebase Storage
        if (document.filePath) {
            await deleteFileFromFirebase(document.filePath);
        }
        
        await Document.findByIdAndDelete(id);
        logger.info(`Document "${document.title}" (ID: ${id}) deleted by admin ${req.user._id}`);
        
        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (error) {
        logger.error(`Error deleting document: ${error.message}`);
        return res.status(500).json({ success: false, error: `Server error in deleting document: ${error.message}` });
    }
};

// Download document
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        const document = await Document.findById(id);
        
        if (!document) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }
        
        // Check access rights - admin can download any document, users can only download their own or global documents
        if (req.user.role !== 'admin') {
            if (document.userId.toString() !== req.user._id.toString() && !document.isGlobal) {
                return res.status(403).json({ success: false, error: "Access denied. You can only download your own documents or global documents" });
            }
        }
        
        // Handle legacy documents (before Firebase integration)
        if (!document.filePath && document.fileUrl) {
            // For old documents that only have fileUrl
            return res.redirect(document.fileUrl);
        }
        
        // Get fresh signed URL
        try {
            const signedUrl = await getFileSignedUrl(document.filePath, 15 * 60); // 15 minutes expiry
            
            if (!signedUrl) {
                return res.status(404).json({ success: false, error: "Document file not found in storage" });
            }
            
            // Set filename for download
            const fileExtension = document.fileType ? document.fileType.split('/')[1] || 'file' : 'file';
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodeURIComponent(document.title)}.${fileExtension}"`
            );
            
            // Redirect to the signed URL
            return res.redirect(signedUrl);
        } catch (error) {
            logger.error(`Error getting signed URL for document ${id}: ${error.message}`);
            return res.status(500).json({ success: false, error: "Error generating download link" });
        }
    } catch (error) {
        logger.error(`Error downloading document: ${error.message}`);
        return res.status(500).json({ success: false, error: `Server error in downloading document: ${error.message}` });
    }
};

export { 
    uploadDocuments, 
    getDocuments, 
    getDocumentById, 
    updateDocument,
    deleteDocument,
    getUserDocuments,
    getGlobalDocuments,
    downloadDocument,
    upload
};