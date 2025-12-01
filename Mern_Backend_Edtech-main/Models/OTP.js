const mongoose=require("mongoose");
const mailsender = require("../Utils/MailSender");
const emailTemplate= require("../mail/templates/emailVerificationTemplate")

const OTPSchema= new mongoose.Schema({
  
   email:{

    type:String,
    required:true,

   },
   otp:{
     
    type:String,
    required:true

   },
   createdAt:{
     type:Date,
     default:Date.now(),
     expires: 600 * 5,

   }

});

async function sendVerificationEmail(email,otp)
{                                      
   try {
    
    const mailResponse = await mailsender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
    console.log("Email Send SuccessFully:  ", mailResponse);

   } catch (error) {
      
     console.log("Email Send Not SuccessFull : ", error);
     throw error;
   }

}

OTPSchema.pre("save",async function(next)
{ 
  if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}

  await sendVerificationEmail(this.email,this.otp);
  next();
})


module.exports=mongoose.model("OTP",OTPSchema);