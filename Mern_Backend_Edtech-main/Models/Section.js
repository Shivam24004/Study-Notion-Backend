const mongoose=require("mongoose");

const SectionSchema= new mongoose.Schema({
  
    sectionName:{
        type:String,
    },
    subSection:[
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"SubSection",
        }
    ]
    

});

module.exports = mongoose.models.Section || mongoose.model("Section", SectionSchema);
