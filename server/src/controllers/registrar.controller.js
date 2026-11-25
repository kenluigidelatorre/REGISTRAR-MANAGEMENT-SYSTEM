const db = require("../config/db");
const allowedStatus = ["Enrolled", "Not Enrolled", "Graduated", "Dropped"];
const clean = (v) => v === undefined || v === null || v === "" ? null : v;
const fullName = (r) => [r.first_name, r.middle_name, r.last_name].filter(Boolean).join(" ");

async function listStudents(req,res,next){
 try {
  const {department,program,status,search}=req.query;
  const values=[]; const where=[];
  if(department){values.push(`%${department}%`);where.push(`s.department ILIKE $${values.length}`);}
  if(program){values.push(`%${program}%`);where.push(`c.course_code ILIKE $${values.length}`);}
  if(status){values.push(status);where.push(`upper(s.enrollment_status)=upper($${values.length})`);}
  if(search){values.push(`%${search}%`);where.push(`(s.student_id ILIKE $${values.length} OR s.first_name ILIKE $${values.length} OR s.last_name ILIKE $${values.length})`);}
  // This query intentionally selects only the fields approved for Library integration.
  const sql=`SELECT s.student_id,s.first_name,s.middle_name,s.last_name,s.year_level,s.year_block,s.department,s.enrollment_status,c.course_code FROM students s LEFT JOIN courses c ON c.id=s.course_id ${where.length?`WHERE ${where.join(" AND ")}`:""} ORDER BY s.last_name,s.first_name`;
  const r=await db.query(sql,values);
  const data=r.rows.map(x=>({studentId:x.student_id,fullName:[x.first_name,x.middle_name,x.last_name].filter(Boolean).join(" "),department:x.department,program:x.course_code||null,yearLevel:x.year_level,yearBlock:x.year_block||null,enrollmentStatus:x.enrollment_status.toUpperCase().replaceAll(" ","_")}));
  res.json({status:"success",count:data.length,data});
 }catch(e){next(e);}
}
async function listStudentsAdmin(req,res,next){
 try {
  const r=await db.query(`SELECT s.student_id AS "studentId",s.first_name AS "firstName",s.middle_name AS "middleName",s.last_name AS "lastName",concat_ws(' ',s.first_name,s.middle_name,s.last_name) AS "fullName",s.email,s.contact_number AS "contactNumber",s.gender,c.course_code AS course,c.course_code AS program,s.year_level AS "yearLevel",s.year_block AS "yearBlock",s.department,s.enrollment_status AS "enrollmentStatus",s.created_at AS "createdAt" FROM students s LEFT JOIN courses c ON c.id=s.course_id ORDER BY s.last_name,s.first_name`);
  res.json({status:"success",count:r.rowCount,data:r.rows});
 }catch(e){next(e);}
}
async function getStudent(req,res,next){
 try {
  const r=await db.query(`SELECT s.student_id,s.first_name,s.middle_name,s.last_name,s.year_level,s.year_block,s.department,s.enrollment_status,c.course_code FROM students s LEFT JOIN courses c ON c.id=s.course_id WHERE s.student_id=$1`,[req.params.studentId]);
  if(!r.rowCount)return res.status(404).json({status:"error",message:"Student not found."});
  const x=r.rows[0];
  res.json({status:"success",data:{studentId:x.student_id,fullName:fullName(x),department:x.department,program:x.course_code||null,yearLevel:x.year_level,yearBlock:x.year_block||null,enrollmentStatus:x.enrollment_status.toUpperCase().replaceAll(" ","_")}});
 }catch(e){next(e);}
}
async function createStudent(req,res,next){
 try {const b=req.body||{};if(!b.studentId||!b.firstName||!b.lastName||!b.department||!b.yearLevel)return res.status(400).json({status:"error",message:"Student ID, first name, last name, department, and year level are required."});if(b.enrollmentStatus&&!allowedStatus.includes(b.enrollmentStatus))return res.status(400).json({status:"error",message:"Invalid enrollment status."});const course=clean(b.course);const c=course?await db.query("SELECT id FROM courses WHERE course_code=$1",[course]):{rows:[]};if(course&&!c.rowCount)return res.status(400).json({status:"error",message:"Course code does not exist. Create the course first."});const r=await db.query(`INSERT INTO students(student_id,first_name,middle_name,last_name,email,contact_number,gender,course_id,year_level,year_block,department,enrollment_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING student_id`,[b.studentId.trim(),b.firstName.trim(),clean(b.middleName),b.lastName.trim(),clean(b.email),clean(b.contactNumber),clean(b.gender),c.rows[0]?.id||null,Number(b.yearLevel),clean(b.yearBlock),b.department.trim(),b.enrollmentStatus||"Enrolled"]);const detail=await db.query("SELECT student_id,first_name,middle_name,last_name,year_level,department,enrollment_status FROM students WHERE student_id=$1",[r.rows[0].student_id]);const x=detail.rows[0];res.status(201).json({status:"success",message:"Student created successfully.",data:{studentId:x.student_id,firstName:x.first_name,middleName:x.middle_name,lastName:x.last_name,name:fullName(x),yearLevel:x.year_level,department:x.department,enrollmentStatus:x.enrollment_status}});}catch(e){next(e);}
}
async function updateStudent(req,res,next){
 try {const b=req.body||{};if(b.enrollmentStatus&&!allowedStatus.includes(b.enrollmentStatus))return res.status(400).json({status:"error",message:"Invalid enrollment status."});const old=await db.query("SELECT id FROM students WHERE student_id=$1",[req.params.studentId]);if(!old.rowCount)return res.status(404).json({status:"error",message:"Student not found."});let courseId; if(b.course!==undefined){if(!b.course)courseId=null;else{const c=await db.query("SELECT id FROM courses WHERE course_code=$1",[b.course]);if(!c.rowCount)return res.status(400).json({status:"error",message:"Course code does not exist."});courseId=c.rows[0].id;}}const fields={first_name:b.firstName,middle_name:b.middleName,last_name:b.lastName,email:b.email,contact_number:b.contactNumber,gender:b.gender,year_level:b.yearLevel,year_block:b.yearBlock,department:b.department,enrollment_status:b.enrollmentStatus};const sets=[],vals=[];for(const [k,v] of Object.entries(fields)){if(v!==undefined){vals.push(clean(v));sets.push(`${k}=$${vals.length}`);}}if(courseId!==undefined){vals.push(courseId);sets.push(`course_id=$${vals.length}`);}if(!sets.length)return res.status(400).json({status:"error",message:"No fields supplied to update."});vals.push(req.params.studentId);await db.query(`UPDATE students SET ${sets.join(",")},updated_at=now() WHERE student_id=$${vals.length}`,vals);const rr=await db.query("SELECT student_id,first_name,middle_name,last_name,year_level,department,enrollment_status FROM students WHERE student_id=$1",[req.params.studentId]);const x=rr.rows[0];res.json({status:"success",message:"Student updated successfully.",data:{studentId:x.student_id,firstName:x.first_name,middleName:x.middle_name,lastName:x.last_name,name:fullName(x),yearLevel:x.year_level,department:x.department,enrollmentStatus:x.enrollment_status}});}catch(e){next(e);}
}
async function deleteStudent(req,res,next){try{const r=await db.query("DELETE FROM students WHERE student_id=$1 RETURNING student_id",[req.params.studentId]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Student not found."});res.json({status:"success",message:"Student deleted."});}catch(e){next(e);}}

const resourceConfig={faculty:{table:"faculty",idCol:"faculty_id",fields:{facultyId:"faculty_id",firstName:"first_name",middleName:"middle_name",lastName:"last_name",email:"email",contactNumber:"contact_number",gender:"gender",department:"department",position:"position",employmentStatus:"employment_status"},required:["facultyId","firstName","lastName","department","position"]},courses:{table:"courses",idCol:"course_code",fields:{courseCode:"course_code",courseName:"course_name",department:"department",description:"description",status:"status"},required:["courseCode","courseName","department"]}};
function cfg(req){return resourceConfig[req.params.type];}
async function listResource(req,res,next){try{const c=cfg(req);const r=await db.query(`SELECT * FROM ${c.table} ORDER BY ${c.idCol}`);res.json({status:"success",count:r.rowCount,data:r.rows});}catch(e){next(e);}}
async function getResource(req,res,next){try{const c=cfg(req);const r=await db.query(`SELECT * FROM ${c.table} WHERE ${c.idCol}=$1`,[req.params.id]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Record not found."});res.json({status:"success",data:r.rows[0]});}catch(e){next(e);}}
async function createResource(req,res,next){try{const c=cfg(req),b=req.body||{};for(const k of c.required)if(!b[k])return res.status(400).json({status:"error",message:`${k} is required.`});const keys=Object.keys(c.fields).filter(k=>b[k]!==undefined);const cols=keys.map(k=>c.fields[k]);const vals=keys.map(k=>b[k]);const marks=vals.map((_,i)=>`$${i+1}`);const r=await db.query(`INSERT INTO ${c.table}(${cols.join(",")}) VALUES(${marks.join(",")}) RETURNING *`,vals);res.status(201).json({status:"success",message:"Record created.",data:r.rows[0]});}catch(e){next(e);}}
async function updateResource(req,res,next){try{const c=cfg(req),b=req.body||{};const keys=Object.keys(c.fields).filter(k=>b[k]!==undefined&&k!== (c.idCol==="faculty_id"?"facultyId":"courseCode"));if(!keys.length)return res.status(400).json({status:"error",message:"No fields supplied to update."});const vals=keys.map(k=>b[k]);const sets=keys.map((k,i)=>`${c.fields[k]}=$${i+1}`);vals.push(req.params.id);const r=await db.query(`UPDATE ${c.table} SET ${sets.join(",")},updated_at=now() WHERE ${c.idCol}=$${vals.length} RETURNING *`,vals);if(!r.rowCount)return res.status(404).json({status:"error",message:"Record not found."});res.json({status:"success",data:r.rows[0]});}catch(e){next(e);}}
async function deleteResource(req,res,next){try{const c=cfg(req);const r=await db.query(`DELETE FROM ${c.table} WHERE ${c.idCol}=$1 RETURNING *`,[req.params.id]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Record not found."});res.json({status:"success",message:"Record deleted."});}catch(e){next(e);}}
async function listEnrollments(req,res,next){try{const r=await db.query(`SELECT e.id,s.student_id AS "studentId",concat_ws(' ',s.first_name,s.middle_name,s.last_name) AS "studentName",e.academic_year AS "academicYear",e.semester,e.enrollment_date AS "enrollmentDate",e.enrollment_status AS "enrollmentStatus" FROM enrollments e JOIN students s ON s.id=e.student_id ORDER BY e.enrollment_date DESC,e.id DESC`);res.json({status:"success",count:r.rowCount,data:r.rows});}catch(e){next(e);}}
async function createEnrollment(req,res,next){try{const b=req.body||{};if(!b.studentId||!b.academicYear||!b.semester)return res.status(400).json({status:"error",message:"Student ID, academic year, and semester are required."});if(!allowedStatus.includes(b.enrollmentStatus||"Enrolled"))return res.status(400).json({status:"error",message:"Invalid enrollment status."});const r=await db.query("SELECT id FROM students WHERE student_id=$1",[b.studentId]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Student not found."});const x=await db.query("INSERT INTO enrollments(student_id,academic_year,semester,enrollment_status) VALUES($1,$2,$3,$4) RETURNING id",[r.rows[0].id,b.academicYear,b.semester,b.enrollmentStatus||"Enrolled"]);await db.query("UPDATE students SET enrollment_status=$1,updated_at=now() WHERE id=$2",[b.enrollmentStatus||"Enrolled",r.rows[0].id]);res.status(201).json({status:"success",message:"Enrollment created.",data:{id:x.rows[0].id}});}catch(e){next(e);}}
async function updateEnrollment(req,res,next){try{const {enrollmentStatus}=req.body||{};if(!allowedStatus.includes(enrollmentStatus))return res.status(400).json({status:"error",message:"Invalid enrollment status."});const r=await db.query("UPDATE enrollments SET enrollment_status=$1 WHERE id=$2 RETURNING student_id",[enrollmentStatus,req.params.id]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Enrollment not found."});await db.query("UPDATE students SET enrollment_status=$1,updated_at=now() WHERE id=$2",[enrollmentStatus,r.rows[0].student_id]);res.json({status:"success",message:"Enrollment status updated."});}catch(e){next(e);}}
async function deleteEnrollment(req,res,next){try{const r=await db.query("DELETE FROM enrollments WHERE id=$1 RETURNING id",[req.params.id]);if(!r.rowCount)return res.status(404).json({status:"error",message:"Enrollment not found."});res.json({status:"success",message:"Enrollment deleted."});}catch(e){next(e);}}
async function dashboard(req,res,next){
 try {
  const [studentsCount,facultyCount,coursesCount,enrolledCount,notEnrolledCount,graduatedCount,recent,status,byCourse,byYear,facultyByDepartment]=await Promise.all([
   db.query("SELECT count(*)::int n FROM students"),
   db.query("SELECT count(*)::int n FROM faculty"),
   db.query("SELECT count(*)::int n FROM courses"),
   db.query("SELECT count(*)::int n FROM students WHERE enrollment_status='Enrolled'"),
   db.query("SELECT count(*)::int n FROM students WHERE enrollment_status='Not Enrolled'"),
   db.query("SELECT count(*)::int n FROM students WHERE enrollment_status='Graduated'"),
   db.query("SELECT student_id AS \"studentId\",concat_ws(' ',first_name,middle_name,last_name) AS name,created_at AS \"createdAt\" FROM students ORDER BY created_at DESC LIMIT 6"),
   db.query("SELECT enrollment_status AS status,count(*)::int total FROM students GROUP BY enrollment_status ORDER BY enrollment_status"),
   db.query("SELECT COALESCE(c.course_code,'Unassigned') AS course,count(*)::int total FROM students s LEFT JOIN courses c ON c.id=s.course_id GROUP BY c.course_code ORDER BY course"),
   db.query("SELECT year_level AS \"yearLevel\",count(*)::int total FROM students GROUP BY year_level ORDER BY year_level"),
   db.query("SELECT department,count(*)::int total FROM faculty GROUP BY department ORDER BY department")
  ]);
  res.json({status:"success",data:{totalStudents:studentsCount.rows[0].n,totalFaculty:facultyCount.rows[0].n,totalCourses:coursesCount.rows[0].n,enrolledStudents:enrolledCount.rows[0].n,notEnrolledStudents:notEnrolledCount.rows[0].n,graduatedStudents:graduatedCount.rows[0].n,recentStudents:recent.rows,studentsByStatus:status.rows,studentsByCourse:byCourse.rows,studentsByYear:byYear.rows,facultyByDepartment:facultyByDepartment.rows}});
 }catch(e){next(e);}
}
module.exports={listStudents,listStudentsAdmin,getStudent,createStudent,updateStudent,deleteStudent,listResource,getResource,createResource,updateResource,deleteResource,listEnrollments,createEnrollment,updateEnrollment,deleteEnrollment,dashboard};
