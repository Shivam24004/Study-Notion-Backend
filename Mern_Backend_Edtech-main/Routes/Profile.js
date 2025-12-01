const express = require("express");
const router= express.Router();

const {auth,isInstructor} = require("../Middleware/auth");

const {deleteAccount,updateProfile, getAllUserDetails,updatedDisplayPicture, instructorDashboard,getEnrolledCourses} = require("../Controller/Profile");

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

router.delete("/deleteProfile", auth,deleteAccount);
router.put("/updateProfile", auth , updateProfile);
router.get("/getUserDetails",auth,getAllUserDetails);
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture",auth,updatedDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)


module.exports = router;