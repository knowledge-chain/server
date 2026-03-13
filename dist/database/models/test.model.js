"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TestQuestionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    url: {
        type: String,
        require: true
    },
    spreadSheetUrl: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
const TestQuestionModel = (0, mongoose_1.model)("TestQuestion", TestQuestionSchema);
exports.default = TestQuestionModel;
