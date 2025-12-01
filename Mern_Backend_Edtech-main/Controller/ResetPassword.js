const User = require("../Models/User");
const mailSender= require("../Utils/MailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req,res)=>
{
    try {
         const {email}= req.body;

         const user=await User.findOne({email});

         if(!user)
        {
            return res.json({
                success:false,
                message:"Your Email Is Not Registered With Us",
            });
        }

        //Generate Token
        const token = crypto.randomUUID();

        //update user Token and ExpiryTime
        const updateDetails = await User.findOneAndUpdate({email:email}, 
            { token:token ,
                 resetPasswordExpires : Date.now() + 5*60*1000,
            },
            {new : true}
         );

         //createing URL
         const url=`http://localhost:5173/update-password/${token}`;
         //send Mail 
         await mailSender(email,"Password Reset Link: ", `Click On This Link To Reset Your Password : ${url}`);

         res.json({
            success:true,
            message:"Email Send SuccessFully To Your Email Id , Please Check Your Email And Change Your Password",
         })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Something Went Wrong While Reset password ",
        })
        
    }
}


exports.resetPassword = async (req,res)=>
{

    try {
         
    const {password,confirmPassword,token} = req.body;

    if(password !== confirmPassword)
    {
        return res.json({
            success:false,
            message:"Password Not Matched... ",
        });
    }

    const userDetails = await User.findOne({token:token});

    if(!userDetails)
    {
        return res.json({
            success:false,
            message:"Token Is Invalid",
        });
    }

    if(userDetails.resetPasswordExpires < Date.now())
    {
        return res.json({
            success:false,
            message:"Token Expire Please Regenrate it... your token",
        })
    }
    
    const hashedPassword=await bcrypt.hash(password,10);

    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    )
    
    return res.status(200).json({
        success:true,
        message:"Password Reset SuccessFully",
    })


    } catch (error) {

        console.log(error);
        return res.status(501).json({
            success:false,
            message:"Something Went Wrong While Sending Password Mail ",
        });
        
    }
}