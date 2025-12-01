const mongoose=require("mongoose");

const CourseSchema= new mongoose.Schema({
   
   courseName:{

    type:String,
    trim:true,

   },
   courseDescription:{

      type:String,
      trim:true,

   },
   instructor:{

    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,

   },
   whatYouWillLearn:{

    type:String,

   },
   courseContent:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section",
    }
   ],
   ratingAndReviews:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReview",
    }
   ],
   price:{

    type:Number,

   },
   thumbnail:{

    type:String,

   },
   tag:{
    type: [String],
    required:true,
   },
   category:{

    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",

   },
   studentEnrolled:[{
      
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
    
   }],
   instructions: {
    type: [String],
  },
   status:{
    type:String,
    enum:["Draft","Published"],
   },
   createdAt: { type: Date, default: Date.now },
});

// Export the Courses model

// Check if the model already exists before defining it
module.exports = mongoose.models.Course || mongoose.model("Course", CourseSchema);