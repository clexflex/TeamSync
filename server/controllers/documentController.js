// server/controllers/documentController.js
import Document from "../models/Document.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import logger from "../utils/logger.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        // Allow documents, PDFs, images, etc.
        const filetypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only document files are allowed!"));
    }
});

// Upload document
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }

        const { userId, category, subCategory, title, description, isGlobal } = req.body;

        const newDocument = new Document({
            userId,
            category,
            subCategory: subCategory || '',
            title,
            description: description || '',
            fileUrl: `/uploads/documents/${req.file.filename}`,
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

        return res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        logger.error(`Error fetching documents: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching documents" });
    }
};

// Get documents for a specific user
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

        return res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        logger.error(`Error fetching user documents: ${error.message}`);
        return res.status(500).json({ success: false, error: "Server error in fetching user documents" });
    }
};

// Get global documents
const getGlobalDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ isGlobal: true })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            documents
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
            // Delete old file if it exists
            if (document.fileUrl) {
                const oldFilePath = path.join(__dirname, '../public', document.fileUrl);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            
            document.fileUrl = `/uploads/documents/${req.file.filename}`;
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
        
        // Delete file from storage
        if (document.fileUrl) {
            const filePath = path.join(__dirname, '../public', document.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
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
        
        const filePath = path.join(__dirname, '../public', document.fileUrl);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: "File not found" });
        }
        
        return res.download(filePath, `${document.title}${path.extname(filePath)}`);
    } catch (error) {
        logger.error(`Error downloading document: ${error.message}`);
        return res.status(500).json({ success: false, error: `Server error in downloading document: ${error.message}` });
    }
};

export { 
    uploadDocument, 
    getDocuments, 
    getDocumentById, 
    updateDocument,
    deleteDocument,
    getUserDocuments,
    getGlobalDocuments,
    downloadDocument,
    upload
};