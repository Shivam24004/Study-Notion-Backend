const User= require("../Models/User");
const Course= require("../Models/Course");
const { uploadImageToCloudinary } = require("../Utils/ImageUploader");
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const Category =require( "../Models/Category");
const courseProgress= require("../Models/CourseProgress")
const { convertSecondsToDuration } = require("../Utils/secToDuration")

exports.createCourse=async(req,res)=>
{     console.log("Solving Here not")
    try {

      const userId = req.user.id

     
       const { courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        tag: _tag,
        category,
        status,
        instructions: _instructions,}= req.body;
       const thumbnail=req.files.thumbnailImage;
      
       console.log(thumbnail)

       const tag = JSON.parse(_tag)
       const instructions = JSON.parse(_instructions)
       
       if(  !courseName ||
        !courseDescription ||
        !whatYouWillLearn ||
        !price ||
        !tag.length ||
        !thumbnail ||
        !category ||
        !instructions.length)
       {
         return res.status(400).json({
            success:false,
            message:"Please Fill All Field Carefully",
         });
       }

       if (!status || status === undefined) {
        status = "Draft"
      }

        // Check if the user is an instructor
     const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

        // Check if the tag given is valid
        const categoryDetails = await Category.findById(category)
        if (!categoryDetails) {
          return res.status(404).json({
            success: false,
            message: "Category Details Not Found",
          })
        }
  
        const thumbnailImages=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
       

        const newCourse = await Course.create({
          courseName,
          courseDescription,
          instructor: instructorDetails._id,
          whatYouWillLearn: whatYouWillLearn,
          price,
          tag,
          category: categoryDetails._id,
          thumbnail: thumbnailImages.secure_url,
          status: status,
          instructions,
        });
    

        await User.findByIdAndUpdate(
          {
            _id: instructorDetails._id,
          },
          {
            $push: {
              courses: newCourse._id,
            },
          },
          { new: true }
        )
        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
          { _id: category },
          {
            $push: {
              courses: newCourse._id,
            },
          },
          { new: true }
        )
       return res.status(200).json({
        success:true,
        message:"Course Created SuccessFully",
        data:newCourse,
       });


    } catch (error) {
        
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something Went Wrong While Creating Course.."
        })
    }
}

exports.getAllCourses = async (req,res)=>
{
    try {
        
        const allCourses= await Course.find({});

        return res.status(200).json({
            success:true,
            message:"Data For All Courses Fetched SuccessFully..",
            data:allCourses,
        });


    } catch (error) {

        console.lof(error);
        return res.status(500).json({
            success:false,
            message:"Can Not Fetch All Courses",
        });
    }
}

exports.getCourseDetails= async (req,res)=>
{
  
      
    try {
      const { courseId } = req.body
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
            select: "-videoUrl",
          },
        })
        .exec()
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
    
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
        },
      })

  } catch (error) {

    return res.status(500).json({
        success:false,
        message:error.message,
    });
    
  }

}

exports.deleteCourse = async (req,res)=>
{
    try {

        const {courseId} = req.body;

        const courseDetails=await Course.findById(courseId);
        if(!courseDetails)
        {
            return res.status(404).json({
                success:false,
                message:"Course Not Founded",
            });
        }

        const enrolledStudent=courseDetails.studentEnrolled;

        for(const studentId of enrolledStudent)
        {
            await User.findByIdAndUpdate(studentId,{
                $pull:{courses:courseId},
            });
        }

        //Delete Section And SubSection
        const courseSection = courseDetails.courseContent;

        for(const sectionId of courseSection)
        {
            const section=await Section.findById(sectionId);
            if(section)
            {
                const subSection= section.subSection;
                for(const SubsectionId of subSection)
                {
                    await SubSection.findByIdAndDelete(SubsectionId);
                }
            }

            await Section.findByIdAndDelete(sectionId);
        }

        //Now We Are Going To Delete Courses

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success:true,
            message:" Course Deleted Successfully..."
        });
        
    } catch (error) {
       
        console.log(error);
        
        return res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}

exports.editCourse = async (req,res)=>
{
    try {
         
        const {courseId} = req.body;
        const updates= req.body;

        const course=await Course.findById(courseId);

        if(!course)
        {
            return res.status(404).json({
                success:false,
                message:"Course Not Found..."
            })
        }


        if(req.files)
        {
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
            course.thumbnail=thumbnailImage.secure_url;
        }

        for(const key in updates)
        {
            if(updates.hasOwnProperty(key))
            {
                if(key === "Category" || key === "instructions"){
                    course[key]= JSON.parse(updates[key])
                }
                else
                {
                    course[key] = updates[key];
                }
            }
        }

        await course.save();

        const updatedCourse = await Course.findOne({
        _id: courseId,
        })
        .populate({
        path:"instructor",
        populate:{
        path:"additionalDetails",
        },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
        path:"courseContent",
        populate:{
        path:"subSection",
        },
        }).exec();



     res.json({
            success:true,
            message: "Course Updated Successfully",
            data:updatedCourse,
        });

    } catch (error) {

        return res.status(500).json({
            success:false,
            message: "Internal Server Error",
            error: error.message,
        });
        
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await courseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      // console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
   
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
   
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }