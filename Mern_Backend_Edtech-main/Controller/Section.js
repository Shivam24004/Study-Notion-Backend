const Section=require("../Models/Section");
const Course=require("../Models/Course");
const SubSection = require("../Models/SubSection");



exports.createSection=async(req,res)=>
{

  try {

    const {sectionName,courseId} = req.body;

    if(!sectionName || !courseId)
    {
        return res.status(400).json({
            success:false,
            message:"Please Fill All Details",
        });
    }
    console.log("Comeing Here ")

    const newSection= await Section.create({sectionName});
    const updatedCourse= await Course.findByIdAndUpdate(
         courseId,
         {
           $push:{
            courseContent:newSection._id,
           }
         },
         {new:true},
        ).populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  

        console.log(updatedCourse);

     return res.status(200).json({
        success:true,
        message:"Section Created SuccessFully",
        updatedCourse,
     });
    
  } catch (error) {
   
    console.log(error)
    return res.status(500).json({
        success:false,
        message:"Unable To Create Section",
        error:error,
    });
    
  }

}



exports.updateSection = async (req,res)=>
    {
    
      try {
    
        const {sectionName,sectionId,courseId} = req.body;

        if(!sectionName || !sectionId)
        {
            return res.status(400).json({
                success:false,
                message:"Fill All Details"
            });
        }

        const section = await Section.findByIdAndUpdate(sectionId,{sectionName}, {new:true});

        const course = await Course.findById(courseId)
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  

        return res.status(200).json({
            success:true,
            message:"Section Updated SuccessFully",
            data: course,
        })
      
        
      } catch (error) {
       
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Unable To update Section",
            error:error,
        });
        
      }
    
    }

exports.deleteSection= async (req,res)=> 
{
  try {
  
    const { sectionId, courseId } = req.body

    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })

    const section = await Section.findById(sectionId)
    console.log(sectionId, courseId)
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }

    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })
     
    await Section.findByIdAndDelete(sectionId)

    const course = await Course.findById(courseId)
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec()


    return res.status(200).json({
      success:true,
      message:" Section Deleted SuccessFully...",
      data:course,
  });

    
  }  catch (error) {
    
    return res.status(500).json({
        success:false,
        message:"Unable To Delete Section",
        error:error,
    });
    
  }
}