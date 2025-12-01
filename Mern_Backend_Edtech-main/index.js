const express= require("express")
const app=express();


const userRoutes= require("./Routes/User");
const profileRoutes= require("./Routes/Profile");
const paymentRoutes= require("./Routes/Payments");
const courseRoutes= require("./Routes/Course");


const database=require("./Config/Database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect} =require("./Config/cloudinary")
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
//Port Number
const PORT=process.env.PORT || 4000;

//Database Connection
database.connect();
//MidlleWare
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"*",
        credentials:true,
    }),
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp/",
    })
)


//cloudinary coonnection
cloudinaryConnect();

//Routes Mount
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);

//default Route
app.get("/", (req,res)=>
{
    return res.json({
        success:true,
        message:"Your Server Is Running Fantastic....."
    });
})

//let's run the server
app.listen(PORT,()=>
{
    console.log(`Your App Is Successfully Run On ${PORT} Port Number...`)
})
