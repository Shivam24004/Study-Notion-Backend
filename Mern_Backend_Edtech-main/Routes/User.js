const express = require("express");
const router= express.Router();

const {login,signUp,sendOTP,  changePassword,} =require("../Controller/Auth");
const {resetPasswordToken,resetPassword} = require("../Controller/ResetPassword");

const {auth} = require("../Middleware/auth");


router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
// Route for Changing the password
router.post("/changepassword", auth, changePassword)


// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password",  resetPassword);

module.exports = router;
