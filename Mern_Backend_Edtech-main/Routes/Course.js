const express= require("express");
const router=express.Router();

const {createCourse,getAllCourses,getCourseDetails,deleteCourse, editCourse,getInstructorCourses,getFullCourseDetails} = require("../Controller/Course");

//Section function Import
const {createSection,updateSection,deleteSection}= require("../Controller/Section");
//Now We Import Sub Sections All Function
const {createSubsection,updateSubsection,deleteSubsection}=require("../Controller/Subsection");

//Rating Controller Import 
const {createRating,getAverageRating,getAllRatingReview}=require("../Controller/RatingAndReview");

//importing middlewares
const {auth,isInstructor,isStudent,isAdmin}=require("../Middleware/auth");
//Importing Category
const {createCategory,showAllCategories,categoryPageDetails}=require("../Controller/Category");
const {
    updateCourseProgress,
    getProgressPercentage,
  } = require("../Controller/courseProgress")

//courses can only Created By instructors
router.post("/createCourse", auth,isInstructor,createCourse);
//editCourse
router.post("/editCourse", auth, isInstructor, editCourse);
//add Sections
router.post("/addSection",auth,isInstructor,createSection);
//update Sections
router.post("/updateSection",auth,isInstructor,updateSection);
//update subsections
router.post("/updateSubSection", auth, isInstructor, updateSubsection)
//Deleteing Section
router.post("/deleteSection",auth,isInstructor,deleteSection);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
//Delete SubSection
router.post("/deleteSubSection",auth,isInstructor,deleteSubsection);
//Add SubSection To Section
router.post("/addSubSection",auth,isInstructor,createSubsection);
//Get Details For Specific Courses
router.post("/getCourseDetails",getCourseDetails);
// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
//delete Course
router.delete("/deleteCourse",deleteCourse);
//Get All Courses
router.get("/getAllCourse",getAllCourses)
// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

router.post("/createCategory", auth,isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating",auth,isStudent,createRating);
router.get("/getAverageRating",getAverageRating);
router.get("/getReviews",getAllRatingReview);


module.exports = router