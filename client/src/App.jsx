import {
  Navigate,
  NavLink,
  Route,
  Routes,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  LibraryBig,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./context/AuthContext";
import api from "./services/api";

function Login() {
  const { admin, login } = useAuth();
  const nav = useNavigate();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(identity, password);
      nav("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to connect to the server.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="IDS Colleges logo" />

          <span>
            IDS <b>COLLEGES</b>
            <small className="brand-caption">REGISTRAR MANAGEMENT SYSTEM</small>
          </span>
        </div>

        <div className="art-copy">
          <p className="eyebrow">IDS COLLEGES · REGISTRAR OFFICE</p>

          <h1>
            Academic records,
            <br />
            made simple.
          </h1>

          <p>
            Manage student records, faculty information, courses, and enrollment
            in one secure workspace.
          </p>
        </div>

        <div className="art-foot">
          IDS Colleges · Academic Records Management
        </div>
      </div>

      <div className="login-side">
        <form className="login-card" onSubmit={submit}>
          <div className="login-mark">
            <ShieldCheck size={27} />
          </div>

          <p className="eyebrow">WELCOME BACK</p>
          <h2>Administrator Login</h2>

          <p className="muted">Sign in to access the registrar workspace.</p>

          {error && <div className="alert">{error}</div>}

          <label>Username or email</label>

          <input
            required
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="Enter your username or email"
          />

          <label>Password</label>

          <div className="password-wrap">
            <input
              required
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button
              type="button"
              className="text-button"
              onClick={() => setShow(!show)}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          <button className="primary full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <p className="login-note">
            Administrator access only. Contact your system administrator if you
            need assistance.
          </p>
        </form>
      </div>
    </div>
  );
}

const navItems = [
  ["/", "Dashboard", LayoutDashboard],
  ["/students", "Students", Users],
  ["/faculty", "Faculty", GraduationCap],
  ["/courses", "Courses", BookOpen],
  ["/enrollment", "Enrollment", ClipboardList],
  ["/reports", "Reports", BarChart3],
  ["/settings", "Settings", Settings],
];
function Shell() {
  const { admin, logout } = useAuth();
  const [mobile, setMobile] = useState(false);
  const nav = useNavigate();
  function leave() {
    logout();
    nav("/login");
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src="/logo.png" alt="IDS Colleges logo" />
          <span>
            IDS <b>COLLEGES</b>
            <small className="brand-caption">REGISTRAR MANAGEMENT SYSTEM</small>
          </span>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {navItems.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobile(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-help">
            <div className="help-icon">
              <ShieldCheck size={18} />
            </div>
            <b>Protected records</b>
            <span>Authorized registrar access</span>
          </div>
          <button className="logout-link" onClick={leave}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobile(!mobile)}>
            <Menu />
          </button>
          <div className="crumb">
            IDS Colleges <span>/</span> Registrar
          </div>
          <div className="top-user">
            <div className="avatar">{(admin?.fullName || "A").slice(0, 1)}</div>
            <div>
              <b>{admin?.fullName || "Administrator"}</b>
              <small>Administrator</small>
            </div>
            <ChevronDown size={16} />
          </div>
        </header>
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    api
      .get("/registrar/dashboard")
      .then((r) => setData(r.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load dashboard data."),
      )
      .finally(() => setBusy(false));
  }, []);
  const cards = [
    ["Total Students", data?.totalStudents, Users],
    ["Total Faculty", data?.totalFaculty, GraduationCap],
    ["Academic Programs", data?.totalCourses, BookOpen],
    ["Currently Enrolled", data?.enrolledStudents, ClipboardList],
    ["Not Enrolled", data?.notEnrolledStudents, LibraryBig],
    ["Graduated Students", data?.graduatedStudents, BarChart3],
  ];
  return (
    <>
      <section className="registrar-hero">
        <p>WELCOME TO</p>
        <h2>IDS COLLEGES REGISTRAR MANAGEMENT SYSTEM</h2>
        <span>
          Manage student information, faculty records, academic programs, and
          enrollment in one secure workspace.
        </span>
      </section>
      <PageHeading
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Here's what's happening across your registrar office."
      />
      <div className="stats-grid">
        {cards.map(([label, value, Icon], i) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon tint-${i}`}>
              <Icon size={19} />
            </div>
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
            <small>Live database count</small>
          </div>
        ))}
      </div>
      {error && <div className="alert">{error}</div>}
      {busy && <div className="empty">Loading dashboard...</div>}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Recent student registrations</h3>
              <p className="muted">
                Latest student records added to the system
              </p>
            </div>
            <a href="/students">View all</a>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Date added</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentStudents || []).map((s) => (
                  <tr key={s.studentId}>
                    <td>
                      <b>{s.name}</b>
                    </td>
                    <td>{s.studentId}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.recentStudents.length === 0 && (
              <div className="empty">No student records yet.</div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Enrollment summary</h3>
              <p className="muted">Current student status</p>
            </div>
          </div>
          {(data?.studentsByStatus || []).map((x, i) => (
            <div className="summary-row" key={x.status}>
              <span>{x.status}</span>
              <b>{x.total}</b>
              <div className="bar">
                <i
                  style={{
                    width: `${data.totalStudents ? (x.total / data.totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
          {!data && <div className="empty">Loading statistics...</div>}
        </div>
      </div>
    </>
  );
}
const configs = {
  students: {
    title: "Student Management",
    eyebrow: "ACADEMIC RECORDS",
    desc: "Manage student profiles and academic information.",
    endpoint: "/registrar/students/manage",
    writeEndpoint: "/registrar/students",
    key: "studentId",
    fields: [
      ["studentId", "Student ID"],
      ["firstName", "First name"],
      ["middleName", "Middle name"],
      ["lastName", "Last name"],
      ["email", "Email"],
      ["contactNumber", "Contact number"],
      ["gender", "Gender"],
      ["course", "Course code"],
      ["yearLevel", "Year level"],
      ["yearBlock", "Year and block"],
      ["department", "Department"],
      ["enrollmentStatus", "Enrollment status"],
    ],
    cols: [
      "studentId",
      "fullName",
      "program",
      "yearLevel",
      "yearBlock",
      "department",
      "enrollmentStatus",
    ],
    labels: [
      "Student ID",
      "Full name",
      "Program",
      "Year",
      "Year & block",
      "Department",
      "Status",
    ],
    initial: { gender: "", yearLevel: 1, enrollmentStatus: "Enrolled" },
  },
  faculty: {
    title: "Faculty Management",
    eyebrow: "PEOPLE & FACULTY",
    desc: "Maintain faculty profiles, departments, and employment details.",
    endpoint: "/registrar/faculty",
    key: "faculty_id",
    fields: [
      ["facultyId", "Faculty ID"],
      ["firstName", "First name"],
      ["middleName", "Middle name"],
      ["lastName", "Last name"],
      ["email", "Email"],
      ["contactNumber", "Contact number"],
      ["gender", "Gender"],
      ["department", "Department"],
      ["position", "Position"],
      ["employmentStatus", "Employment status"],
    ],
    cols: [
      "faculty_id",
      "first_name",
      "last_name",
      "email",
      "department",
      "position",
      "employment_status",
    ],
    labels: [
      "Faculty ID",
      "First name",
      "Last name",
      "Email",
      "Department",
      "Position",
      "Status",
    ],
    initial: { employmentStatus: "Active" },
  },
  courses: {
    title: "Course Management",
    eyebrow: "ACADEMIC PROGRAMS",
    desc: "Manage the academic programs offered by the institution.",
    endpoint: "/registrar/courses",
    key: "course_code",
    fields: [
      ["courseCode", "Course code"],
      ["courseName", "Course name"],
      ["department", "Department"],
      ["description", "Description"],
      ["status", "Course status"],
    ],
    cols: ["course_code", "course_name", "department", "description", "status"],
    labels: ["Code", "Course name", "Department", "Description", "Status"],
    initial: { status: "Active" },
  },
};
function Manage({ type }) {
  const cfg = configs[type];
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(cfg.initial);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  async function load() {
    setBusy(true);
    setError("");
    try {
      const r = await api.get(cfg.endpoint);
      setRows(r.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load records.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, [type]);
  const filtered = useMemo(
    () =>
      rows.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  function openForm(row) {
    setEditing(row || null);
    const next = { ...cfg.initial };
    if (row) {
      if (type === "students")
        Object.assign(next, {
          studentId: row.studentId,
          firstName: row.firstName,
          middleName: row.middleName || "",
          lastName: row.lastName,
          email: row.email || "",
          contactNumber: row.contactNumber || "",
          gender: row.gender || "",
          course: row.course,
          yearLevel: row.yearLevel,
          department: row.department,
          enrollmentStatus: row.enrollmentStatus,
        });
      else if (type === "faculty")
        Object.assign(next, {
          facultyId: row.faculty_id,
          firstName: row.first_name,
          middleName: row.middle_name || "",
          lastName: row.last_name,
          email: row.email || "",
          contactNumber: row.contact_number || "",
          gender: row.gender || "",
          department: row.department,
          position: row.position,
          employmentStatus: row.employment_status,
        });
      else
        Object.assign(next, {
          courseCode: row.course_code,
          courseName: row.course_name,
          department: row.department,
          description: row.description || "",
          status: row.status,
        });
    }
    setForm(next);
    setModal(true);
  }
  async function save(e) {
    e.preventDefault();
    try {
      const id =
        type === "students"
          ? editing?.studentId
          : type === "faculty"
            ? editing?.faculty_id
            : editing?.course_code;
      const writeEndpoint = cfg.writeEndpoint || cfg.endpoint;
      if (editing)
        await api.put(`${writeEndpoint}/${encodeURIComponent(id)}`, form);
      else await api.post(writeEndpoint, form);
      setModal(false);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save record.");
    }
  }
  async function remove(row) {
    const id =
      type === "students"
        ? row.studentId
        : type === "faculty"
          ? row.faculty_id
          : row.course_code;
    if (
      !confirm(
        `Delete ${id}? This action may be restricted if records are linked.`,
      )
    )
      return;
    try {
      await api.delete(
        `${cfg.writeEndpoint || cfg.endpoint}/${encodeURIComponent(id)}`,
      );
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete record.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow={cfg.eyebrow}
        title={cfg.title}
        description={cfg.desc}
        action={
          <button className="primary" onClick={() => openForm(null)}>
            <Plus size={17} />
            Add{" "}
            {type === "students"
              ? "student"
              : type === "faculty"
                ? "faculty"
                : "course"}
          </button>
        }
      />
      {error && <div className="alert">{error}</div>}
      <div className="panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={`Search ${type}...`}
            />
          </div>
          <button className="secondary" onClick={load}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cfg.labels.map((l) => (
                  <th key={l}>{l}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <tr key={r.id || i}>
                  {cfg.cols.map((col, j) => (
                    <td key={col}>
                      {j === 0 ? (
                        <b>{r[col]}</b>
                      ) : col === "enrollmentStatus" ||
                        col === "employment_status" ||
                        col === "status" ? (
                        <span className="status">{r[col]}</span>
                      ) : (
                        (r[col] ?? "—")
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="actions">
                      <button title="Edit" onClick={() => openForm(r)}>
                        <Edit size={16} />
                      </button>
                      <button title="Delete" onClick={() => remove(r)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {busy ? (
            <div className="empty">Loading records...</div>
          ) : !visible.length ? (
            <div className="empty">No records found.</div>
          ) : null}
        </div>
        <div className="table-footer">
          <span>
            Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
            records
          </span>
          <div>
            <button
              className="secondary small"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="secondary small"
              disabled={page * pageSize >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <form className="modal" onSubmit={save}>
            <div className="modal-head">
              <div>
                <p className="eyebrow">
                  {editing ? "UPDATE RECORD" : "NEW RECORD"}
                </p>
                <h2>
                  {editing ? "Edit" : "Add"}{" "}
                  {type === "students"
                    ? "student"
                    : type === "faculty"
                      ? "faculty member"
                      : "course"}
                </h2>
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setModal(false)}
              >
                ×
              </button>
            </div>
            <div className="form-grid">
              {cfg.fields.map(([key, label]) => (
                <label
                  key={key}
                  className={key === "description" ? "wide" : ""}
                >
                  {label}
                  {key === "gender" ||
                  key === "enrollmentStatus" ||
                  key === "employmentStatus" ||
                  key === "status" ? (
                    <select
                      value={form[key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      {(key === "gender"
                        ? ["Male", "Female", "Prefer not to say"]
                        : key === "enrollmentStatus"
                          ? ["Enrolled", "Not Enrolled", "Graduated", "Dropped"]
                          : key === "employmentStatus"
                            ? ["Active", "Inactive", "On Leave", "Retired"]
                            : ["Active", "Inactive"]
                      ).map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={[
                        "studentId",
                        "firstName",
                        "lastName",
                        "course",
                        "yearLevel",
                        "yearBlock",
                        "department",
                        "facultyId",
                        "position",
                        "courseCode",
                        "courseName",
                      ].includes(key)}
                      type={key === "email" ? "email" : "text"}
                      disabled={
                        editing &&
                        (key === "studentId" ||
                          key === "facultyId" ||
                          key === "courseCode")
                      }
                      value={form[key] ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>
              <button className="primary">
                {editing ? "Save changes" : "Create record"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function Enrollment() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  async function load() {
    try {
      const r = await api.get("/registrar/enrollments");
      setRows(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load enrollments.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function update(id, status) {
    try {
      await api.put(`/registrar/enrollments/${id}`, {
        enrollmentStatus: status,
      });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Update failed.");
    }
  }
  async function add() {
    const studentId = prompt("Enter student ID:");
    if (!studentId) return;
    const academicYear = prompt("Enter academic year (example: 2026-2027):");
    if (!academicYear) return;
    const semester = prompt(
      "Enter semester (1st Semester, 2nd Semester, Summer):",
    );
    if (!semester) return;
    try {
      await api.post("/registrar/enrollments", {
        studentId,
        academicYear,
        semester,
        enrollmentStatus: "Enrolled",
      });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create enrollment.");
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ACADEMIC RECORDS"
        title="Enrollment"
        description="Review enrollment history and update student enrollment status."
        action={
          <button className="primary" onClick={add}>
            <Plus size={17} />
            Add enrollment
          </button>
        }
      />
      {error && <div className="alert">{error}</div>}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student name</th>
                <th>Academic year</th>
                <th>Semester</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.studentId}</b>
                  </td>
                  <td>{r.studentName}</td>
                  <td>{r.academicYear}</td>
                  <td>{r.semester}</td>
                  <td>{new Date(r.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="inline-select"
                      value={r.enrollmentStatus}
                      onChange={(e) => update(r.id, e.target.value)}
                    >
                      {["Enrolled", "Not Enrolled", "Graduated", "Dropped"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {busy && <div className="empty">Loading enrollment records...</div>}
          {!busy && !rows.length && (
            <div className="empty">
              No enrollment records yet. Create records through the enrollment
              API.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
function Reports() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/registrar/dashboard").then((r) => setData(r.data.data));
  }, []);
  return (
    <>
      <PageHeading
        eyebrow="INSIGHTS"
        title="Reports"
        description="A summary of student and faculty records from the database."
        action={
          <button className="secondary" onClick={() => window.print()}>
            Print report
          </button>
        }
      />
      <div className="report-grid">
        {[
          ["Students", data?.totalStudents],
          ["Faculty", data?.totalFaculty],
          ["Courses", data?.totalCourses],
          ["Enrolled", data?.enrolledStudents],
        ].map((x) => (
          <div className="stat-card" key={x[0]}>
            <span>{x[0]}</span>
            <strong>{x[1] ?? "—"}</strong>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <ReportPanel
          title="Students by course"
          rows={data?.studentsByCourse || []}
          name="course"
        />
        <ReportPanel
          title="Students by year level"
          rows={data?.studentsByYear || []}
          name="yearLevel"
        />
        <ReportPanel
          title="Students by enrollment status"
          rows={data?.studentsByStatus || []}
          name="status"
        />
        <ReportPanel
          title="Faculty by department"
          rows={data?.facultyByDepartment || []}
          name="department"
        />
      </div>
    </>
  );
}
function ReportPanel({ title, rows, name }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {rows.map((r, i) => (
        <div className="summary-row" key={i}>
          <span>{r[name]}</span>
          <b>{r.total}</b>
        </div>
      ))}
    </div>
  );
}
function SettingsPage() {
  const { admin } = useAuth();
  return (
    <>
      <PageHeading
        eyebrow="PREFERENCES"
        title="Settings"
        description="Administrator account information and system connection details."
      />
      <div className="panel settings-panel">
        <h3>Administrator profile</h3>
        <div className="settings-line">
          <span>Name</span>
          <b>{admin?.fullName}</b>
        </div>
        <div className="settings-line">
          <span>Username</span>
          <b>{admin?.username}</b>
        </div>
        <div className="settings-line">
          <span>Email</span>
          <b>{admin?.email}</b>
        </div>
        <h3>System connection</h3>
        <div className="settings-line">
          <span>API endpoint</span>
          <b>{import.meta.env.VITE_API_URL || "http://localhost:5001/api"}</b>
        </div>
        <p className="muted">
          Administrator accounts are initialized by the backend setup script.
          Public administrator registration is disabled.
        </p>
      </div>
    </>
  );
}
export default function App() {
  const { admin } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={admin ? <Shell /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Manage type="students" />} />
        <Route path="faculty" element={<Manage type="faculty" />} />
        <Route path="courses" element={<Manage type="courses" />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={admin ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
