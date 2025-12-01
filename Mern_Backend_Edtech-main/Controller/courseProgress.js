const mongoose = require("mongoose")
const Section = require("../Models/Section")
const SubSection = require("../Models/SubSection")
const courseProgress = require("../Models/CourseProgress")
const Course = require("../Models/Course")


exports.updateCourseProgress = async (req, res) => {
    const { courseId, subsectionId } = req.body
    const userId = req.user.id
  
    try {
      // Check if the subsection is valid
      const subsection = await SubSection.findById(subsectionId)
      if (!subsection) {
        return res.status(404).json({ error: "Invalid subsection" })
      }
  
      // Find the course progress document for the user and course
      let CourseProgress = await courseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      if (!CourseProgress) {
        // If course progress doesn't exist, create a new one
        return res.status(404).json({
          success: false,
          message: "Course progress Does Not Exist",
        })
      } else {
        // If course progress exists, check if the subsection is already completed
        if (CourseProgress.completedVideos.includes(subsectionId)) {
          return res.status(400).json({ error: "Subsection already completed" })
        }
  
        // Push the subsection into the completedVideos array
        CourseProgress.completedVideos.push(subsectionId)
      }
  
      // Save the updated course progress
      await CourseProgress.save()
  
      return res.status(200).json({ message: "Course progress updated" })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }