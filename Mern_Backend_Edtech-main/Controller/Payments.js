
const Course = require("../Models/Course")
const crypto = require("crypto")
const User = require("../Models/User")
const mailSender = require("../Utils/MailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const courseProgress = require("../Models/CourseProgress")
const mailsender = require("../Utils/MailSender")


// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body
    const userId = req.user.id
    if (courses.length === 0) {
      return res.json({ success: false, message: "Please Provide Course ID" })
    }
  
    let total_amount = 0
  
    for (const course_id of courses) {
      let course
      try {
        // Find the course by its ID
        course = await Course.findById(course_id)
  
        // If the course is not found, return an error
        if (!course) {
          return res
            .status(200)
            .json({ success: false, message: "Could not find the Course" })
        }
  
        // Check if the user is already enrolled in the course
        const uid = new mongoose.Types.ObjectId(userId)
        if (course.studentEnrolled.includes(uid)) {
          return res
            .status(200)
            .json({ success: false, message: "Student is already Enrolled" })
        }
  
        // Add the price of the course to the total amount
        total_amount += course.price
      } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })
      }
    }
  
    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    }
  
   
    try {
      // Initiate the payment using Razorpay
      
      res.json({
        success: true,
        data: options,
      })
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .json({ success: false, message: "Could not initiate order." })
    }
  }
  

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const {  amount } = req.body

    console.log("Payment Page");
  
    const userId = req.user.id
  
    if ( !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailsender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
        
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }


//  verify the payment
  exports.verifyPayment = async (req, res) => {
    // const razorpay_order_id = req.body?.razorpay_order_id
    // const razorpay_payment_id = req.body?.razorpay_payment_id
    // const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses

  
    const userId = req.user.id
    console.log("Now Lets Check");
    console.log(courses);
    console.log(userId);
  
    // if (
    //   !razorpay_order_id ||
    //   !razorpay_payment_id ||
    //   !razorpay_signature ||
    //   !courses ||
    //   !userId
    // ) {
    //   return res.status(200).json({ success: false, message: "Payment Failed" })
    // }
  
    // let body = razorpay_order_id + "|" + razorpay_payment_id
  
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_SECRET)
    //   .update(body.toString())
    //   .digest("hex")
    
   

    try
    {
      await enrollStudents(courses, userId, res)
      return res.json({ success: true, message: "Payment Verified f" })
    }
    catch(error)
    {
         
      return res.json({ success: false, message: "Payment Failed" })
    }
  
    
  }
  

 // enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {

 
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }

    console.log("Coming Here Or Nit");
  
    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentEnrolled: userId } },
          { new: true }
        )

     
  
        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        console.log("Updated course: ", enrolledCourse)
  
        const CourseProgress = await courseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: CourseProgress._id,
            },
          },
          { new: true }
        )
  
        console.log("Enrolled student: ", enrolledStudent)
        // Send an email notification to the enrolled student
        const emailResponse = await mailSender(
          enrolledStudent.email,
          `Successfully Enrolled into ${enrolledCourse.courseName}`,
          courseEnrollmentEmail(
            enrolledCourse.courseName,
            `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
          )
        )
  
        console.log("Email sent successfully: ", emailResponse.response)

        
        
      } catch (error) {
        console.log(error)
        return res.status(400).json({ success: false, error: error.message })
      }
    }
  }























