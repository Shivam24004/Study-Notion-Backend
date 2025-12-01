const Section= require("../Models/Section");
const SubSection=require("../Models/SubSection");
const {uploadImageToCloudinary}= require("../Utils/ImageUploader");
require("dotenv").config();


exports.createSubsection = async (req,res)=>
{
    try {
         //First Fetch Data
         const {sectionId, title,description} = req.body;
         //Fetching Video File
         const video=req.files.video;
         //Validating It

         if(!title || !video || !description || !sectionId )
        {
            return res.status(500).json({
                success:false,
                message:"Please Fill All Details"
            });
        }
        console.log("Coming Here ")
         //Uploading video online
         const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        //  console.log(uploadDetails);
         //create SubSection
         const SubSectionsDetails= await SubSection.create({
            title:title,
            timeDuration: `${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
         })
         console.log(sectionId);
         

         //update section with subsection id
         const updateSection=await Section.findByIdAndUpdate({_id:sectionId},
            {$push:{ subSection:SubSectionsDetails._id  }},
            {new:true},
         ).populate("subSection");


         console.log(updateSection);

         return res.status(200).json({
            success:true,
            message:"SubSection Created SuccessFully",
            data:updateSection,
         });

    } catch (error) {
 
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unable to Create Subsection...",
          
         });
        
    }
}

exports.updateSubsection = async (req,res)=>
{
  try {
     
    const {sectionId,subSectionId,title,description}= req.body
    const subSection= await SubSection.findById(subSectionId);

    if(!subSection)
    { 
        return res.status(500).json({
            success:false,
            message:"SubSection Not Founded....",
        });
    }

    if(title !== undefined)
    {
        subSection.title=title;
    }

    if(description !== undefined)
    {
        subSection.description=description;
    }

    if(req.files && req.files.video !== undefined)
    {
        const video=req.files.video;
        const uploadDetails= await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        subSection.videoUrl=uploadDetails.secure_url
        subSection.timeDuration= `${uploadDetails.duration}`
    }

    await subSection.save();

    //Now It's Time To Find The Section And Update Subsection Id

    const updateSection=await Section.findById(sectionId).populate("subSection");

    console.log("Updated Section",updateSection);

    return res.json({
        success:true,
        message:"Section Updated Successfully",
        data:updateSection,
    });

  } catch (error) {
    
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"An Error occur While Updating the Section",
    });
  }

}


exports.deleteSubsection = async (req,res)=>
{
   try {
      
    const {subSectionId,sectionId}=req.body;

    await Section.findByIdAndUpdate(
        {_id:sectionId},
        {
            $pull:{
                subsection:subSectionId,
            },
        }
    )
    
    const subSection= await SubSection.findByIdAndDelete({_id:subSectionId});

    if(!subSection)
    {
      return res.status(404).json({
         success:false,
         message:"SubSection Not Found...",
      });
    }

    const updatedSection = await Section.findById(sectionId).populate("subSection");

    return res.json({
        success:true,
        message:"SubSection Deleted Successfully",
        data:updatedSection,
    });
    
   } catch (error) {
    
    console.error(error);
    return res.status(404).json({
        success:false,
        message:"An error Occuring While Deleteing SubSection",
    })
     
   }

}