import express from "express";
import { verifyUser, verifyRole } from "../middleware/authMiddleware.js";
import { 
    uploadDocument, 
    getDocuments, 
    getDocumentById, 
    updateDocument,
    deleteDocument,
    getUserDocuments,
    getGlobalDocuments,
    downloadDocument,
    upload
} from "../controllers/documentController.js";

const router = express.Router();

// Admin routes
router.post("/upload", verifyUser, verifyRole(["admin"]), upload.single("file"), uploadDocument);
router.put("/:id", verifyUser, verifyRole(["admin"]), upload.single("file"), updateDocument);
router.delete("/:id", verifyUser, verifyRole(["admin"]), deleteDocument);
router.get("/all", verifyUser, verifyRole(["admin"]), getDocuments);

// Routes for all users
router.get("/user/:userId", verifyUser, getUserDocuments);
router.get("/global", verifyUser, getGlobalDocuments);
router.get("/:id", verifyUser, getDocumentById);
router.get("/download/:id", verifyUser, downloadDocument);

export default router;