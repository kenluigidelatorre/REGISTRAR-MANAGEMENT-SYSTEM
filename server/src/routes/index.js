const router=require("express").Router();
const auth=require("../controllers/auth.controller");
const c=require("../controllers/registrar.controller");
const {requireAdmin}=require("../middleware/auth");
const requireRegistrarService=require("../middleware/serviceAuth");
const rateLimit=require("express-rate-limit");
const loginLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false,message:{status:"error",message:"Too many login attempts. Try again later."}});
router.post("/auth/login",loginLimit,auth.login);
router.get("/auth/me",requireAdmin,auth.me);
// Read-only student endpoints are protected by a dedicated service key for backend-to-backend integration.
router.get("/registrar/students/manage",requireAdmin,c.listStudentsAdmin);
router.get("/registrar/students",requireRegistrarService,c.listStudents);
router.get("/registrar/students/:studentId",requireRegistrarService,c.getStudent);
// All Registrar administration endpoints below require an administrator JWT.
router.use("/registrar",requireAdmin);
router.post("/registrar/students",c.createStudent);
router.put("/registrar/students/:studentId",c.updateStudent);
router.delete("/registrar/students/:studentId",c.deleteStudent);
for(const type of ["faculty","courses"]){router.get(`/registrar/${type}`, (req,res,next)=>c.listResource({...req,params:{...req.params,type}},res,next));router.get(`/registrar/${type}/:id`,(req,res,next)=>c.getResource({...req,params:{...req.params,type}},res,next));router.post(`/registrar/${type}`,(req,res,next)=>c.createResource({...req,params:{...req.params,type}},res,next));router.put(`/registrar/${type}/:id`,(req,res,next)=>c.updateResource({...req,params:{...req.params,type}},res,next));router.delete(`/registrar/${type}/:id`,(req,res,next)=>c.deleteResource({...req,params:{...req.params,type}},res,next));}
router.get("/registrar/enrollments",c.listEnrollments);router.post("/registrar/enrollments",c.createEnrollment);router.put("/registrar/enrollments/:id",c.updateEnrollment);router.delete("/registrar/enrollments/:id",c.deleteEnrollment);router.get("/registrar/dashboard",c.dashboard);
module.exports=router;
