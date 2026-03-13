"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleFileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max file size
    },
});
const fileFilter = (fieldname, allowedMimeTypes, isRequired = true) => {
    return (req, res, next) => {
        // if (isRequired && !req.file) {
        //   return res.status(400).json({ message: `${fieldname} is required` });
        // }
        if (req.file &&
            allowedMimeTypes &&
            !allowedMimeTypes.includes(req.file.mimetype.split('/')[0])) {
            return res.status(400).json({
                message: `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
            });
        }
        next();
    };
};
const singleFileUpload = (fieldname, allowedMimeTypes, isRequired = true) => [
    upload.single(fieldname),
    fileFilter(fieldname, allowedMimeTypes, isRequired),
];
exports.singleFileUpload = singleFileUpload;
