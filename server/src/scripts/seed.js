require("dotenv").config();
const db = require("../config/db");

const courses = [
  ["BSIT", "Bachelor of Science in Information Technology", "College of Information Technology"],
  ["BSCS", "Bachelor of Science in Computer Science", "College of Information Technology"],
  ["BSBA", "Bachelor of Science in Business Administration", "College of Business"],
  ["BSHM", "Bachelor of Science in Hospitality Management", "College of Hospitality Management"],
  ["BSCRIM", "Bachelor of Science in Criminology", "College of Criminal Justice Education"],
];

// Fictional demonstration records only. No real contact details or addresses are included.
const students = [
  ["STU-1001", "Juan", "Miguel", "Dela Cruz", "BSIT", 2, "2-A", "College of Information Technology", "Enrolled"],
  ["STU-1002", "Maria", "Isabel", "Santos", "BSIT", 1, "1-A", "College of Information Technology", "Enrolled"],
  ["STU-1003", "Angelo", "Reyes", "Garcia", "BSCS", 3, "3-A", "College of Information Technology", "Enrolled"],
  ["STU-1004", "Sofia", "Mae", "Mendoza", "BSBA", 2, "2-B", "College of Business", "Enrolled"],
  ["STU-1005", "Gabriel", "Luis", "Torres", "BSHM", 1, "1-A", "College of Hospitality Management", "Enrolled"],
  ["STU-1006", "Andrea", "Nicole", "Ramos", "BSCRIM", 4, "4-A", "College of Criminal Justice Education", "Graduated"],
  ["STU-1007", "Nathan", "James", "Flores", "BSIT", 3, "3-B", "College of Information Technology", "Enrolled"],
  ["STU-1008", "Camille", "Anne", "Aquino", "BSCS", 2, "2-A", "College of Information Technology", "Enrolled"],
  ["STU-1009", "Paolo", "Andre", "Castillo", "BSBA", 4, "4-A", "College of Business", "Enrolled"],
  ["STU-1010", "Bianca", "Rose", "Villanueva", "BSHM", 2, "2-B", "College of Hospitality Management", "Not Enrolled"],
  ["STU-1011", "Enzo", "Rafael", "Bautista", "BSCRIM", 3, "3-A", "College of Criminal Justice Education", "Enrolled"],
  ["STU-1012", "Patricia", "Joy", "Gonzales", "BSIT", 4, "4-A", "College of Information Technology", "Enrolled"],
  ["STU-1013", "Adrian", "Cole", "Fernandez", "BSCS", 1, "1-B", "College of Information Technology", "Enrolled"],
  ["STU-1014", "Isabella", "Grace", "Morales", "BSBA", 3, "3-A", "College of Business", "Dropped"],
  ["STU-1015", "Joshua", "Paul", "Navarro", "BSHM", 4, "4-B", "College of Hospitality Management", "Enrolled"],
  ["STU-1016", "Mikaela", "Faith", "Perez", "BSCRIM", 2, "2-A", "College of Criminal Justice Education", "Enrolled"],
  ["STU-1017", "Daniel", "Sean", "Rivera", "BSIT", 1, "1-B", "College of Information Technology", "Enrolled"],
  ["STU-1018", "Angela", "Claire", "Lim", "BSCS", 4, "4-B", "College of Information Technology", "Graduated"],
  ["STU-1019", "Kyle", "Matthew", "Dizon", "BSBA", 1, "1-A", "College of Business", "Enrolled"],
  ["STU-1020", "Trisha", "Mae", "Ocampo", "BSHM", 3, "3-A", "College of Hospitality Management", "Enrolled"],
];

const faculty = [
  ["FAC-1001", "Alberto", "Cruz", "Santiago", "College of Information Technology", "Program Chair"],
  ["FAC-1002", "Elena", "Reyes", "Villamor", "College of Information Technology", "Instructor"],
  ["FAC-1003", "Roberto", "Diaz", "Mendoza", "College of Information Technology", "Instructor"],
  ["FAC-1004", "Teresa", "Lopez", "Garcia", "College of Business", "Program Chair"],
  ["FAC-1005", "Maricel", "Tan", "Bautista", "College of Business", "Instructor"],
  ["FAC-1006", "Eduardo", "Flores", "Ramos", "College of Hospitality Management", "Program Chair"],
  ["FAC-1007", "Lourdes", "Santos", "Aquino", "College of Hospitality Management", "Instructor"],
  ["FAC-1008", "Manuel", "Reyes", "Castillo", "College of Criminal Justice Education", "Program Chair"],
  ["FAC-1009", "Cecilia", "Dela Cruz", "Navarro", "College of Criminal Justice Education", "Instructor"],
  ["FAC-1010", "Ramon", "Garcia", "Torres", "College of Information Technology", "Instructor"],
];

(async () => {
  try {
    const courseIds = new Map();
    for (const [code, name, department] of courses) {
      const result = await db.query(
        `INSERT INTO courses(course_code, course_name, department, status)
         VALUES ($1, $2, $3, 'Active')
         ON CONFLICT(course_code) DO UPDATE SET course_name=EXCLUDED.course_name, department=EXCLUDED.department
         RETURNING id`,
        [code, name, department]
      );
      courseIds.set(code, result.rows[0].id);
    }

    for (const [studentId, firstName, middleName, lastName, course, yearLevel, yearBlock, department, status] of students) {
      await db.query(
        `INSERT INTO students(student_id, first_name, middle_name, last_name, course_id, year_level, year_block, department, enrollment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(student_id) DO NOTHING`,
        [studentId, firstName, middleName, lastName, courseIds.get(course), yearLevel, yearBlock, department, status]
      );
    }

    for (const [studentId, , , , , , , , status] of students) {
      const student = await db.query("SELECT id FROM students WHERE student_id=$1", [studentId]);
      if (student.rowCount) {
        await db.query(
          `INSERT INTO enrollments(student_id, academic_year, semester, enrollment_status)
           VALUES ($1, '2026-2027', '1st Semester', $2)
           ON CONFLICT(student_id, academic_year, semester) DO NOTHING`,
          [student.rows[0].id, status]
        );
      }
    }

    for (const [facultyId, firstName, middleName, lastName, department, position] of faculty) {
      await db.query(
        `INSERT INTO faculty(faculty_id, first_name, middle_name, last_name, department, position, employment_status)
         VALUES ($1,$2,$3,$4,$5,$6,'Active')
         ON CONFLICT(faculty_id) DO NOTHING`,
        [facultyId, firstName, middleName, lastName, department, position]
      );
    }

    console.log(`Demo seed complete: ${students.length} fictional students, ${faculty.length} fictional faculty members, and ${courses.length} courses.`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await db.pool.end();
  }
})();
