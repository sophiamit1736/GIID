import { useState, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { motion } from "motion/react";
import { Sidebar, TopBar } from "./DashboardPage";
import API from "../api/studentApi";

const P = "Poppins, sans-serif";

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  options,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  options?: string[];
}) {
  const [focused, setFocused] = useState(false);

  const base: React.CSSProperties = {
    width: "100%",
    fontFamily: P,
    fontSize: 14,
    color: "#0D2137",
    outline: "none",
    border: `1.5px solid ${focused ? "#1565C0" : "rgba(21,101,192,0.18)"}`,
    borderRadius: 14,
    padding: "11px 14px",
    background: focused ? "#f0f7ff" : "#F8FAFF",
    transition: "all 0.18s",
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        style={{
          fontFamily: P,
          fontWeight: 500,
          fontSize: 13,
          color: "#0D2137",
        }}
      >
        {label}
        {required && <span style={{ color: "#EF5350" }}> *</span>}
      </label>

      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        >
          <option value="">Select {label}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...base, resize: "none" }}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={base}
        />
      )}
    </div>
  );
}

export default function AddStudentPage() {

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role !== "admin")
  {
    return <Navigate to="/dashboard" replace />;
  }
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    disability: "",
    studentCategory: "",
    learningLevel: "Not Assessed",
    facpFunctionalLevel: "",

    guardian: "",
    phone: "",
    address: "",
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.fullName.trim()) return alert("Enter student name");
    if (!form.age) return alert("Enter age");
    if (!form.gender) return alert("Select gender");
    if (!form.disability) return alert("Select disability level");
    if (!form.studentCategory) return alert("Select student category");
    if (!form.guardian.trim()) return alert("Enter guardian name");
    if (!form.phone.trim()) return alert("Enter guardian phone");

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("fullName", form.fullName);
      formData.append("age", String(form.age));

      // Backend calculates age from DOB
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - Number(form.age));
      formData.append("dateOfBirth", dob.toISOString());

      formData.append("gender", form.gender);
      formData.append("disabilityLevel", form.disability);
      // Student category is the GIID placement/group (Pre-Primary, Primary, etc.).
      // Backend converts it to the appropriate FACP functional level.
      formData.append("group", form.studentCategory);
      // Learning level is provisional until the Entry FACP assessment.
      // FACP baseline is NEVER entered manually here; it is calculated from the assessment.
      formData.append("learningLevel", "Not Assessed");
      if (form.facpFunctionalLevel) formData.append("facpFunctionalLevel", form.facpFunctionalLevel);
      formData.append("guardianName", form.guardian);
      formData.append("guardianPhone", form.phone);
      formData.append("address", form.address);

      if (photo) {
        formData.append("photo", photo);
      }

      await API.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Student Added Successfully");

      navigate("/students");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Unable to Save Student");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="flex"
      style={{ minHeight: "100vh", background: "#F0F6FF" }}
    >
      <Sidebar active="Students" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          title="Add New Student"
          subtitle="Register a new student"
        />

        <main className="flex-1 p-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
            style={{ maxWidth: 760 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Link
                to="/students"
                style={{
                  fontFamily: P,
                  fontSize: 13,
                  color: "#1565C0",
                  textDecoration: "none",
                }}
              >
                Students
              </Link>
              <span
                className="material-icons-round"
                style={{ fontSize: 16, color: "#90a4b8" }}
              >
                chevron_right
              </span>
              <span
                style={{
                  fontFamily: P,
                  fontSize: 13,
                  color: "#4A6580",
                }}
              >
                Add New Student
              </span>
            </div>

            <form onSubmit={handleSave}>
              {/* Photo */}
              <div
                className="rounded-2xl p-6 mb-5 flex items-center gap-6"
                style={{
                  background: "#fff",
                  border: "1.5px solid rgba(21,101,192,0.08)",
                }}
              >
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center justify-center rounded-2xl cursor-pointer"
                  style={{
                    width: 110,
                    height: 110,
                    border: "2px dashed rgba(21,101,192,0.3)",
                    background: "#F0F6FF",
                    overflow: "hidden",
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Student"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      className="material-icons-round"
                      style={{ fontSize: 36, color: "#90a4b8" }}
                    >
                      add_a_photo
                    </span>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                />

                <div>
                  <div
                    style={{
                      fontFamily: P,
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#0D2137",
                    }}
                  >
                    Student Photo
                  </div>

                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 px-4 py-2 rounded-xl"
                    style={{
                      background: "#E3F2FD",
                      border: "none",
                      fontFamily: P,
                      color: "#1565C0",
                      cursor: "pointer",
                    }}
                  >
                    {preview ? "Change Photo" : "Choose File"}
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <Section title="Personal Information">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <Field
                      label="Student Full Name"
                      id="fullName"
                      value={form.fullName}
                      onChange={set("fullName")}
                      required
                    />
                  </div>

                  <Field
                    label="Age"
                    id="age"
                    type="number"
                    value={form.age}
                    onChange={set("age")}
                    required
                  />

                  <Field
                    label="Gender"
                    id="gender"
                    value={form.gender}
                    onChange={set("gender")}
                    options={["Male", "Female", "Other"]}
                    required
                  />
                </div>
              </Section>

              {/* Clinical Information */}
              <Section title="Clinical Information">
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    label="Disability Level"
                    id="disability"
                    value={form.disability}
                    onChange={set("disability")}
                    options={[
                      "Mild",
                      "Moderate",
                      "Severe",
                      "Profound",
                    ]}
                    required
                  />

                  <Field
                    label="Student Category / GIID Group"
                    id="studentCategory"
                    value={form.studentCategory}
                    onChange={set("studentCategory")}
                    options={[
                      "Pre-Primary",
                      "Primary",
                      "Secondary",
                      "Pre-Vocational-1",
                      "Pre-Vocational-2",
                      "Vocational",
                      "Care Group",
                    ]}
                    required
                  />

                  <div style={{
                    gridColumn: "1 / -1",
                    border: "1px solid #D8E8F5", borderRadius: 14, padding: "12px 14px",
                    background: "#F7FBFF", fontFamily: P, fontSize: 12, color: "#546E7A", lineHeight: 1.55
                  }}>
                    <b style={{ color: "#1565C0" }}>FACP Functional Level</b><br />
                    Automatically derived from the student's category and age. For example, a Primary student aged 11 or above is mapped to <b>Primary-II</b>.
                  </div>

                  <div style={{
                    border: "1px solid #D8E8F5", borderRadius: 14, padding: "12px 14px",
                    background: "#F7FBFF", fontFamily: P, fontSize: 12, color: "#546E7A", lineHeight: 1.55
                  }}>
                    <b style={{ color: "#1565C0" }}>Learning Level</b><br />
                    <span style={{ fontWeight: 800, color: "#263238" }}>Not Assessed</span><br />
                    Determined after the student's Entry FACP assessment. It is not guessed during admission.
                  </div>

                  <div style={{
                    border: "1px solid #D8E8F5", borderRadius: 14, padding: "12px 14px",
                    background: "#F7FBFF", fontFamily: P, fontSize: 12, color: "#546E7A", lineHeight: 1.55
                  }}>
                    <b style={{ color: "#1565C0" }}>FACP Baseline</b><br />
                    Pending Entry FACP assessment. The baseline is calculated from the teacher's
                    observed FACP responses and finalized after assessment; it is not entered manually.
                  </div>
                </div>
              </Section>

              {/* Guardian Information */}
              <Section title="Guardian Information">
                <div className="grid grid-cols-2 gap-5">
                  <Field
                    label="Guardian Name"
                    id="guardian"
                    value={form.guardian}
                    onChange={set("guardian")}
                    required
                  />

                  <Field
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    required
                  />

                  <div className="col-span-2">
                    <Field
                      label="Address"
                      id="address"
                      type="textarea"
                      value={form.address}
                      onChange={set("address")}
                    />
                  </div>
                </div>
              </Section>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <Link to="/students">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl"
                    style={{
                      background: "#fff",
                      border: "1.5px solid rgba(21,101,192,0.2)",
                      fontFamily: P,
                    }}
                  >
                    Cancel
                  </button>
                </Link>

                <motion.button
                  type="submit"
                  disabled={saving}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-xl text-white"
                  style={{
                    background: "linear-gradient(135deg,#1565C0,#27ae60)",
                    border: "none",
                    fontFamily: P,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save Student"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 mb-5"
      style={{
        background: "#fff",
        border: "1.5px solid rgba(21,101,192,0.08)",
      }}
    >
      <div
        style={{
          fontFamily: P,
          fontWeight: 600,
          fontSize: 15,
          color: "#0D2137",
          marginBottom: 18,
        }}
      >
        {title}
      </div>

      {children}
    </div>
  );
}