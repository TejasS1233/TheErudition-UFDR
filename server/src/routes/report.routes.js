import { Router } from "express";
import { uploadAndProcessReport } from "../controllers/report.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/upload").post(upload.single("report"), uploadAndProcessReport);

export default router;
