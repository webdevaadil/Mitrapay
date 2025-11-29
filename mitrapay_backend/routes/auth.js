const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const { register, login, SubAdmin_register, isAuthuserSUperadmin, User_register, View_Subadmin, View_user, update_subadmin, edit_subadmin, isAuthuserSUperadminandsubadmin, isAuthenticatedRole, Create_payout, view_payout, edit_user, update_user, dashboard, Create_order, Create_Payment, logout, Search_Subadmin, Search_User, search_Payout, subAdminStatusChange, userStatusChange, payoutStatusChange, Add_Credit_subadmin, Add_Credit_User, View_SubadminPagination, dashboarddata,  raiseclaim, Search_claim, View_claim, ClaimStatusChange, UploadcsvBulkPayment, Create_account, create_BeneficiaryAccount, view_BeneficiaryAccount, update_BeneficiaryAccountStatus, Approve_payout, downloadBulkPaymentFile, viewbulkpaymentfile, UploadBUlkBenificieryaccount, downloadBUlkBenificieryaccount, ViewBUlkBenificieryaccount, changeBUlkBenificieryaccountStatus, processBulkBeneficiaries, UploadBUlkPayoutfile, downloadBUlkPayoutfile, ViewBUlkPayoutfiles, update_Payoutfilestatus, processBulkPayout, UploadBUlkPayoutbankfile, search_benficiery, download_payout_excel, Getutr, DeleteClaim, findUtr, verifyOTP, add_Bulk_utr_Payout } = require("../controllers/auth.js");
const path = require("path");
const { Create_payout_withClientAuth, createApiClient } = require("../controllers/clientauth.js");
const storageBulkbenificiery = multer.diskStorage({
    destination: './bulkbenificieryaccountfiles',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const storageBulkPayout = multer.diskStorage({
    destination: './bulkPayout',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV or Excel files are allowed"), false);
    }
};
// Initialize upload middleware and add file size limit
const upload = multer({
    storage: storageBulkbenificiery, fileFilter: fileFilter,
    limits: { fileSize: 1000000 } // 1MB file size limit
});
const uploadBulkpayout = multer({
    storage: storageBulkPayout, fileFilter: fileFilter,
    limits: { fileSize: 1000000 } // 1MB file size limit
});
// router.post("/upload", , uploadVisa);
router.route("/register").post(register)
router.route("/login").post(login)
router.post("/verifyotp", verifyOTP);
router.route("/logout").get(logout)

// subadmin
router.route("/Create_Subadmin").post(isAuthenticatedRole('Super_Admin'), SubAdmin_register)
router.route("/Search_subadmin").get(isAuthenticatedRole('Super_Admin'), Search_Subadmin)
router.route("/View_subadmin").get(isAuthenticatedRole('Super_Admin'), View_Subadmin)
router.route("/View_subadminPagination").get(isAuthenticatedRole('Super_Admin'), View_SubadminPagination)
router.route("/Edit_subadmin/:id").get(isAuthenticatedRole('Super_Admin'), edit_subadmin)
router.route("/Update_subadmin").put(isAuthenticatedRole('Super_Admin'), update_subadmin)
router.route("/updateSubadminStatus/:id").put(isAuthenticatedRole('Super_Admin'), subAdminStatusChange)
router.route("/Add_Credit_subadmin").put(isAuthenticatedRole('Super_Admin'), Add_Credit_subadmin)

router.route("/Search_claim").get(isAuthenticatedRole('Super_Admin','Sub_Admin','User'), Search_claim);
router.route("/View_claim").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin','User'), View_claim)
router.route("/updateClaimStatus/:id").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), ClaimStatusChange)
router.route("/DeleteClaim").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), DeleteClaim)


// user
router.route("/Create_User").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), User_register)
router.route("/Search_user").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), Search_User);
router.route("/View_user").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), View_user)
router.route("/Edit_user/:id").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), edit_user)
router.route("/Update_user").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), update_user)
router.route("/Add_Credit_User").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), Add_Credit_User)
router.route("/updateUserStatus/:id").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), userStatusChange)

// payout
router.route("/Create_payout").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), Create_payout)
router.route("/Approve_payout").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), Approve_payout)
router.route("/Search_payout").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), search_Payout)
router.route("/View_payout").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), view_payout)
router.route("/Raise_Claim").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), raiseclaim)
router.route("/Find_utr/:transaction_id").get(isAuthenticatedRole( 'Super_Admin', 'Sub_Admin', 'User'), findUtr)
// Bulk Payout 
router.route("/UploadBUlkPayoutfile").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), uploadBulkpayout.single("file"), UploadBUlkPayoutfile);
router.route("/upload-bank-file/:id").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), uploadBulkpayout.single("file"), UploadBUlkPayoutbankfile);
router.route("/downloadBUlkPayoutfile/:id").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), downloadBUlkPayoutfile);
router.route("/ViewBUlkPayoutfiles").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), ViewBUlkPayoutfiles);
router.route("/Bulk-Payout/:id/status").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), update_Payoutfilestatus);
router.route("/bulk-Payout/process/:id").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), processBulkPayout);
router.route("/add_Bulk_utr_Payout").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), uploadBulkpayout.single("file"), add_Bulk_utr_Payout);
//  benificiery account
router.route("/Create_account").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), create_BeneficiaryAccount);
router.route("/View_account").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), view_BeneficiaryAccount);
router.route("/search_benficiery").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), search_benficiery)
// Bulk benificiery account
router.route("/UploadBUlkBenificieryaccount").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), upload.single("file"), UploadBUlkBenificieryaccount);
router.route("/downloadBUlkBenificieryaccount/:id").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), downloadBUlkBenificieryaccount);
router.route("/ViewBUlkBenificieryaccount").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), ViewBUlkBenificieryaccount);
router.route("/beneficiary/:id/status").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), update_BeneficiaryAccountStatus);
router.route("/bulk-beneficiary/:id/status").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), changeBUlkBenificieryaccountStatus);
router.route("/bulk-beneficiaries/process/:id").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), processBulkBeneficiaries);
router.route("/download-excel").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin','User'), download_payout_excel);
router.route("/Getutr").get( Getutr);

// router.route("/beneficiary/:id/status").put(isAuthenticatedRole('Super_Admin', 'Sub_Admin'), update_BeneficiaryAccountStatus);

// auth 
router.route("/me").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), dashboard);
router.route("/dashboard_data").get(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), dashboarddata);

router.route("/Create_payout_app").post( isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'),Create_payout_withClientAuth);
router.route("/createApiClient").post(isAuthenticatedRole('Super_Admin', 'Sub_Admin', 'User'), createApiClient);


// new client payout


// payout
module.exports = router;
