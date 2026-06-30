const express = require("express");
const router = express.Router();

import {
    adminSignUpController,
    adminSignInController
} from './../controller/admin.reg.controller'
import { adminAddTestController, getAllTestController, getTestResultControllerTre, getTestResultControllerTwo } from "../controller/test.controller";
import { requestValidation } from "./../middleware/request.validation.middleware";
import { checkAdminRole } from "../middleware/role.checker.middleware";
import { getAllUserController, getAllUserNotPaidController, getSingleUserController, messageAllUsersController, messageSingleUserController } from '../controller/user.controller';
import { changeAmountController, getAllTierAmountController, getAmountController, getTierPriceController, setTierPriceController } from '../controller/amount.controller';
import { addCourseController, AdminTier2Course } from '../controller/admin.tier2Course.controller';
import { singleFileUpload } from '../middleware/fileupload.middleware';
import { tier2PlanController } from '../controller/admin.tier2Plan.controllers';

router.post("/registration", requestValidation.validateSignInParams, requestValidation.validateFormData, adminSignUpController ); 
router.post("/login", requestValidation.validateSignInParams, requestValidation.validateFormData, adminSignInController );

router.post("/add-test", checkAdminRole, requestValidation.validateAddTestParams, requestValidation.validateFormData, adminAddTestController );
router.get("/tests", checkAdminRole, getAllTestController );
router.get("/test/result", checkAdminRole, requestValidation.validateTestResultDetailParams, requestValidation.validateFormData, getTestResultControllerTre );

router.get("/users", checkAdminRole,  getAllUserController );
router.get("/user", checkAdminRole, requestValidation.validateUserDetailParams, requestValidation.validateFormData, getSingleUserController );
router.get("/users-not-paid", checkAdminRole,  getAllUserNotPaidController );
router.post("/message-user", checkAdminRole, requestValidation.validateMessageUserParams, requestValidation.validateFormData, messageSingleUserController );
router.post("/message-users", checkAdminRole, requestValidation.validateMessageUsersParams, requestValidation.validateFormData, messageAllUsersController );

router.post("/change-amount", checkAdminRole, requestValidation.validatChangeAmountParams, requestValidation.validateFormData, changeAmountController );
router.get("/amounts", checkAdminRole, getAllTierAmountController );
router.get("/amount/:tier", checkAdminRole, getAmountController );

router.post("/add-course", checkAdminRole, singleFileUpload('media', ['image',], true), requestValidation.validatAddCourseParams, requestValidation.validateFormData, AdminTier2Course.addCourseController );
router.post("/add-section", checkAdminRole, requestValidation.validatAddSectionParams, requestValidation.validateFormData,  AdminTier2Course.addSectionController );
router.post("/add-lessson", checkAdminRole, singleFileUpload('media', ['video'], true), requestValidation.validatAddLessonParams, requestValidation.validateFormData, AdminTier2Course.addLessonController );

router.post("/edit-tier2_course/:courseId", checkAdminRole, singleFileUpload('media', ['image',], true), AdminTier2Course.updateCourseController );
router.post("/edit-tier2-section/:sectionId", checkAdminRole,  AdminTier2Course.updateSectionController );
router.post("/edit-tier2-lessson/:lessonId", checkAdminRole, singleFileUpload('media', ['video'], true), AdminTier2Course.updateLessonController );

router.get("/courses", checkAdminRole, AdminTier2Course.fetchCoureseController );
router.get("/course/:courseId", checkAdminRole, AdminTier2Course.getSingleCourseController );
router.get("/section/:sectionId", checkAdminRole, AdminTier2Course.getSingleSectionController );
router.get("/lesson/:lessonId", checkAdminRole, AdminTier2Course.getSingleLessonController );

router.post("/add-tier2-plan", checkAdminRole, requestValidation.validatAddTier2PlanParams, requestValidation.validateFormData,  tier2PlanController.createTier2PlanController);
router.post("/edit-tier2-plan/:planId", checkAdminRole, tier2PlanController.editTier2PlanController);
router.get("/tier2-plans", checkAdminRole, tier2PlanController.fetchTier2PlansController );
router.get("/tier2-plan/:planId", checkAdminRole, tier2PlanController.getSingleTier2PlanController );

router.get("/tier-price/:tier", checkAdminRole, getTierPriceController );
router.post("/change/tier-price", checkAdminRole, requestValidation.validatChangeTierPriceParams, requestValidation.validateFormData, setTierPriceController );



export default router;