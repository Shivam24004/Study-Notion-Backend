const jwt=require("jsonwebtoken");
const user= require("../Models/User");
require("dotenv").config();

exports.auth=(req,res,next) =>
{
  try {
    console.log("Instructor te ayya")
 
    const token= req.cookies.token || req.body.token ||	req.header("Authorization").replace("Bearer ", "");
    
   
    console.log(token);
  
    // if token is missing then return response
    if(!token)
    {  console.log("Token Missing")
        return res.status(401).json({
            success:false,
            message:"Token is Missing",
        });
    }

    

    try {
         const decode= jwt.verify(token,process.env.JWT_SECRET);
         console.log(decode);
         req.user=decode;

    } catch (error) {
        
        return res.status(401).json({
            success:false,
            message: "Token is Invalid",
        });
    }
  
    next();

  } catch (error) {
    console.log(error);
    return res.status(401).json({
     
        success:false,
        message:"Something Went Wrong While Validating the token",
    });
    
  }

}

// is Student 
exports.isStudent = async (req,res,next)=>
{
    try {

        if(req.user.accountType !== "Student")
        {
            return res.status(401).json({
                success:false,
                message:"This Is Protected Route For Students only",
            });
        }

        next();
        
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"User Role CanNot Verified, Please Try Again"
        })
    }
}

//isInstructor
exports.isInstructor = async (req,res,next)=>
    {  
      ;
        try {
    
            if(req.user.accountType !== "Instructor")
            {
                return res.status(401).json({
                    success:false,
                    message:"This Is Protected Route For Instructor only",
                });
            }
    
            next();
            
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"User Role CanNot Verified, Please Try Again"
            })
        }
    }


//IsAdmin
exports.isAdmin = async (req,res,next)=>
    {
        try {
    
            if(req.user.accountType !== "Admin")
            {
                return res.status(401).json({
                    success:false,
                    message:"This Is Protected Route For Admin only",
                });
            }
    
            next();
            
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"User Role CanNot Verified, Please Try Again"
            })
        }
    }