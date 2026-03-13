"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserTestSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'User',
        required: true,
    },
    test: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'TestQuestion',
        required: true,
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
const UserTestModel = (0, mongoose_1.model)("userTest", UserTestSchema);
exports.default = UserTestModel;
