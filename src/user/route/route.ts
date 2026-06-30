const express = require("express");
const router = express.Router();

import {
    userCreateAccountController, 
    checkUserWalletAddressController,
    userProvideEmailController,
    checkUserEmailVerifiedController
} from './../controller/user.registration.controller'
import { 
    userGetTestLinkController,
    userRequestForTestQuestionController,
    checkIfUserHasTestLinkController
 } from "./../controller/test.registration.controller";
 import {  
     uploadImageToIPFS,
     userChangePaymentStatusController,
    userGetAmountController,
    userInitNairaPaymentController,
    userVerifyNairaPaymentController
 } from "./../controller/payment.controller";
import { requestValidation } from "./../middleware/request.validation.middleware";
import { singleFileUpload } from '../../admin/middleware/fileupload.middleware';
import { userAuth } from '../controller/auth.controller';
import { UserCourse } from '../controller/userCourse.controller';
import { checkUserRole } from '../middleware/userRole.checker.middleware';
import { myTier2Course } from '../controller/myTier2Course.controller';
import { tier2Plan } from '../controller/tier2Payment.controller';

router.post("/sign-up", requestValidation.validateSignupParams, requestValidation.validateFormData, userAuth.userSignupController ); 
router.post("/resend-email", requestValidation.validateResendEmailParams, requestValidation.validateFormData, userAuth.userResendEmailController ); 
router.post("/verify-email", requestValidation.validateVerifyEmailParams, requestValidation.validateFormData, userAuth.userVerifyEmailController ); 
router.post("/login", requestValidation.validateSignupParams, requestValidation.validateFormData, userAuth.userLoginController ); 
router.post("/forgot-password", requestValidation.validateResendEmailParams, requestValidation.validateFormData, userAuth.forgotPasswordController ); 
router.post("/reset-password", requestValidation.validateResetPasswordEmailParams, requestValidation.validateFormData, userAuth.resetPasswordController ); 

router.get("/profile", checkUserRole, userAuth.userProfileController ); 
router.post("/edit-profile", checkUserRole, requestValidation.validateEditProfileParams, requestValidation.validateFormData, userAuth.editProfileController ); 

router.post("/create-account", requestValidation.validateCreateAccountParams, requestValidation.validateFormData, userCreateAccountController ); 
router.get("/check-wallet", requestValidation.validateCheckWalletParams, requestValidation.validateFormData, checkUserWalletAddressController );
router.post("/create-profile", requestValidation.validateProfileParams, requestValidation.validateFormData, userProvideEmailController );
// router.post("/verify-email", requestValidation.validateVerifyEmailParams, requestValidation.validateFormData, userVerifyEmailController );
router.get("/check-email", requestValidation.validateCheckEmailParams, requestValidation.validateFormData, checkUserEmailVerifiedController );

router.post("/request-test-question", requestValidation.validateCreateAccountParams, requestValidation.validateFormData, userRequestForTestQuestionController ); 
router.get("/test-link", requestValidation.validateCheckWalletParams, requestValidation.validateFormData, userGetTestLinkController );
router.get("/check-test-link", requestValidation.validateCheckWalletParams, requestValidation.validateFormData, checkIfUserHasTestLinkController );

router.post("/init-payment", requestValidation.validateInitPaymentParams, requestValidation.validateFormData, userInitNairaPaymentController );
router.post("/verify-payment", requestValidation.validateVerifyPaymentParams, requestValidation.validateFormData, userVerifyNairaPaymentController );
router.post("/change-payment-status", requestValidation.validateCreateAccountParams, requestValidation.validateFormData, userChangePaymentStatusController );

router.get("/amount/:tier", userGetAmountController );

router.post("/upload-image",  singleFileUpload('media', ['image', 'video'], true), uploadImageToIPFS );

router.get("/courses", checkUserRole,  UserCourse.fetchCoureseController );
router.get("/course/:courseId",  checkUserRole,  UserCourse.getSingleCourseController );

router.get("/tier2/my-tier2-courses", checkUserRole, myTier2Course.fetchMyTier2CoureseController );
// router.get("/tier2/my-tier2-course/:courseId", checkUserRole, myTier2Course.getMyTier2SingleCourseForUserController );
// router.post("/tier2/complete-lesson", checkUserRole, requestValidation.validateCompletTier2LessontParams, requestValidation.validateFormData, myTier2Course.completeTier2LessonController );

router.get("/tier2/completed-course/:courseId", checkUserRole, myTier2Course.getCompletedLessonsController );
router.get("/tier2/notcompleted-course/:courseId", checkUserRole, myTier2Course.getNotCompletedLessonsController );
router.post("/tier2/complete-lesson", checkUserRole, requestValidation.validateCompletTier2LessontParams, requestValidation.validateFormData, myTier2Course.completeLessonController );
router.get("/tier2/get-next-lesson/:courseId", checkUserRole, myTier2Course.getNextLessonController );
router.post("/tier2/certificate", checkUserRole, requestValidation.validateMintTier2CourseCertificateParams, requestValidation.validateFormData, myTier2Course.mintCertificateController );
router.get("/tier2/certificate/:courseId", checkUserRole, myTier2Course.getCourseCertificateController );

router.get("/tier2/plans", checkUserRole, tier2Plan.fetchTier2PlansController );
router.post("/tier2/subcribe", checkUserRole, requestValidation.validateSubscribeTier2PlanParams, requestValidation.validateFormData, tier2Plan.subcribeToTier2Controller );
router.post("/tier2/verify-payment", checkUserRole, requestValidation.validateVerifyTier2PaymentParams, requestValidation.validateFormData, tier2Plan.verifyTier2Subscription );
router.get("/tier2/outstanding-bill", checkUserRole, tier2Plan.getOutstandingBillController );
router.post("/tier2/pay-bill", checkUserRole, requestValidation.validatePayTier2BillParams, requestValidation.validateFormData, tier2Plan.payTier2Controller );


export default router;