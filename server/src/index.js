require("dotenv").config();
const express=require("express");
const cors=require("cors");
const routes=require("./routes");
const db=require("./config/db");
const {notFound,errorHandler}=require("./middleware/errors");
if(!process.env.DATABASE_URL||!process.env.JWT_SECRET){console.error("DATABASE_URL and JWT_SECRET must be configured in server/.env");process.exit(1);}
const app=express();
const origins=(process.env.CORS_ORIGINS||"http://localhost:5173,http://localhost:3000").split(",").map(x=>x.trim());
app.use(cors({origin:(origin,cb)=>!origin||origins.includes(origin)?cb(null,true):cb(new Error("Origin not allowed by CORS"))}));
app.use(express.json({limit:"1mb"}));
app.get("/health",async(req,res)=>{try{await db.query("SELECT 1");res.json({status:"success",message:"Registrar API and PostgreSQL are connected."});}catch{res.status(503).json({status:"error",message:"Database connection unavailable."});}});
app.use("/api",routes);app.use(notFound);app.use(errorHandler);
const port=Number(process.env.PORT)||5001;app.listen(port,"0.0.0.0",()=>console.log(`Registrar API running at http://localhost:${port}`));
