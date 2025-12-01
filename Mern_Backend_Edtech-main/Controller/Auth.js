const User= require("../Models/User");
const OTP= require("../Models/OTP");
const otp_generator=require("otp-generator");
const bcrypt=require("bcrypt");
const Profile = require("../Models/Profile");
const jwt=require("jsonwebtoken");
const mailsender = require("../Utils/MailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

//OTP Generator
exports.sendOTP = async (req,res)=>
{
  try {
      //First Pick Up Email
        const {email}= req.body;

        //Check Email Pre Exist in Db Or Not
        const emailValidation= await User.findOne({email});

        if(emailValidation)
        {
        return res.status(401).json({
        success:false,
        message:"Email Already Exist in DataBase",
        });
        };

        //Here We Generate OTP 
        let otp= otp_generator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        })

        console.log("Generated Otp: ", otp );

        let result= await OTP.findOne({otp:otp});

        while(result)
        {
        otp= otp_generator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        });

        result= await OTP.findOne({otp:otp});
        }

        const otpPayload= {email,otp};
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
        success:true,
        message:"OTP Sent SuccessFUlly",
        otp,
        });

        } catch (error) {

        console.log(error);

        return res.status(500).json({
        success:false,
        message:error.message,
        });

        }

}


exports.signUp = async (req,res)=>
{
  try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
      } = req.body;
         

      if(!firstName || !lastName || !email || !password || !confirmPassword || !otp)
     {
        return res.status(403).json({
            success:false,
            message:"Please Fill All Required Filled"
        });
     }

     if(password !== confirmPassword)
    {
        return res.status(403).json({
            success:false,
            message:"Values Of Password And ConfirmPassword Not Match",
        });  
    }

    const existingUser= await User.findOne({email});

    //Here We Checking User exist or Not
    if(existingUser)
    {
        return res.status(403).json({
            success:false,
            message:"User Already Exist . PLease Try With Different Email id",
        });  
    }

    //finding Recent OTP for the user
    const recentOtp= await OTP.find({email}).sort({createdAt:-1}).limit(1);
    // console.log(recentOtp[0].otp);

    if(recentOtp.length === 0)
    {
        return res.status(400).json({
            success:false,
            message:"OTP Not Found",
        });
    }
    else if(otp != recentOtp[0].otp)
    {
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }

    //Now We ARe DOing Hashing of Our Password
    const hashedPassword= await bcrypt.hash(password,10);

    //Createing Entry In DB

    const ProfileDetails =  await Profile.create({
        gender:null,
        dateofbirth:null,
        about:null,
        contactNumber:null,
    });

    const user = await User.create({
        firstName,
        lastName,
        password:hashedPassword,
        email,
        contactNumber,
        accountType,
        additionalDetails:ProfileDetails._id,
        image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    return res.status(200).json({
        success:true,
        message:"User Registered SuccessFully",
        user,
    });
     

  } catch (error) {
    
    console.log(error);
    return  res.status(500).json({
        success:false,
        message:"User Registeration Failed",
    });
     
  }

}

exports.login = async (req,res)=>
{
   try {
        
    //first we Get The email and Password
    const {email,password} = req.body;

    if(!email || !password)
    {
        return res.status(403).json({
            success:false,
            message:"All Field Are Required To Fill"
        });
    }

    const user= await User.findOne({email}).populate("additionalDetails");

    if(!user)
    {
        return res.status(401).json({
            success:false,
            message:"User Is Not Registered , First Do Sign UP",
        });
    }
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
          email: user.email,
          id: user._id,
          accountType: user.accountType,
      };
  
      // Sign the token without expiration time
      const token = jwt.sign(payload, process.env.JWT_SECRET);
  
      user.token = token;
      user.password = undefined;
  
      const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Cookie expiration time
          httpOnly: true,  // Secure the cookie
      };
  
      res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: "Logged in Successfully",
      });
  }
    else
    {
        return res.status(401).json({
            success:false,
            message:"Password Is Incorrect",
        });
    }


   } catch (error) {
    
    return res.status(401).json({
        success:false,
        message:"Login Failed Please Try After Some Time",
    });
     
   }

}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      console.log(userDetails.password)
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailsender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }