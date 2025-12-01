const RatingAndReview=require("../Models/RatingAndReview");
const Course=require("../Models/Course");
const { default: mongoose } = require("mongoose");

exports.createRating = async (req,res)=>
{
  try {
       //get User id
       const userId=req.user.id;
       //fetchdata from req body
       const {rating,review,courseId}=req.body;
       //check If User is Enrolled Or Not
       const courseDetails=await Course.findOne(
                                              {_id:courseId,
                                                studentEnrolled:{$elemMatch:{$eq:userId}},
                                              });
      if(!courseDetails)
    {
        return res.status(500).json({
            success:false,
            message:"First Enroll The Student In Course",
        });
    }

    //Check If User Already Reviwed The Course

    const alreadyReview= await RatingAndReview.findOne({
         user:userId,
         course:courseId,
    })

    if(alreadyReview)
    {
        return res.status(403).json({
            success:false,
            message:"Course Is Already Review by User",
        });  
    }

    const ratingReview = await RatingAndReview.create({
         rating,review,
         course:courseId,
         user:userId,
    });

    const updateCourseReview= await Course.findByIdAndUpdate({_id:courseId},
                                                    {
                                                        $push:{
                                                            ratingAndReviews:ratingReview._id,
                                                        }
                                                    },
                                              {new:true});

    console.log(updateCourseReview);

    return res.status(200).json({
        success:true,
        message:"Rating And Review Created Successfully",
        ratingReview,
    });

  } catch (error) {
    
    console.log(error);                                        
    return res.status(404).json({
        success:false,
        message:error.message,
    });
  }

}


exports.getAverageRating = async (req,res)=>
{
    try {
        const courseId= req.body.courseId;

        const result= await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg : "rating"},
                }
            }
        ]);
  
      if(result.length > 0)
       {
        return res.status(200).json({
            success:true,
            averageRating: result[0].averageRating,
        });
       }
      
       return res.status(200).json({
        success:true,
        message:"Average Raing is 0 , no Rating Given till Now",
        averageRating: 0,
    });


    } catch (error) {
         
        console.log(error);                                        
       return res.status(404).json({
        success:false,
        message:error.message,
      });
    }

}


exports.getAllRatingReview = async(req,res)=>
{
    try {
         
        const allReview= await RatingAndReview.find({})
                               .sort({rating:"desc"})
                               .populate({
                                path:"user",
                                select: "firstName lastName email image",
                               })
                               .populate({
                                path:"course",
                                select: "courseName",
                               })
                               .exec();
 
       return res.status(200).json({
        success:true,
        message:"All Review Fetched Successfully",
        data:allReview,
       });
 
    } catch (error) {
        
        console.log(error);                                        
        return res.status(404).json({
         success:false,
         message:error.message,
       });
    }
}

