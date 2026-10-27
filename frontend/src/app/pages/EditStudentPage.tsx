import { API_ORIGIN } from "../api/config";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import API from "../api/studentApi";
import { Sidebar, TopBar } from "./DashboardPage";

const P = "Poppins, sans-serif";

function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        style={{
          fontFamily: P,
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {label}
      </label>

      {options ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        >
          <option value="">Select</option>

          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />
      )}
    </div>
  );
}

export default function EditStudentPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<File | null>(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    disability: "",
    studentCategory: "",
    learningLevel: "",
    facpFunctionalLevel: "",
    facp: "",
    guardian: "",
    phone: "",
    address: "",
  });

  const set =
    (k: keyof typeof form) =>
    (v: string) =>
      setForm((prev) => ({
        ...prev,
        [k]: v,
      }));

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    try {
      const res = await API.get(`/${id}`);

      const s = res.data;

      setForm({
        fullName: s.name,
        age: String(s.age),
        gender: s.gender,
        disability: s.disabilityLevel,
        studentCategory: s.group || "",
        learningLevel: s.learningLevel,
        facpFunctionalLevel: s.facpFunctionalLevel || "",
        facp: String(s.facpScore),
        guardian: s.guardianName,
        phone: s.guardianPhone,
        address: s.address,
      });

      if (s.photo) {
        setPreview(`${API_ORIGIN}${s.photo}`);
      }
    } catch (err) {
      console.log(err);

      alert("Unable to load student");
    }

    setLoading(false);
  }

  function handlePhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhoto(file);

    setPreview(URL.createObjectURL(file));
  }
    async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("fullName", form.fullName);
      formData.append("age", String(form.age));

      const dob = new Date();
      dob.setFullYear(
        dob.getFullYear() - Number(form.age)
      );

      formData.append(
        "dateOfBirth",
        dob.toISOString()
      );

      formData.append(
        "gender",
        form.gender
      );

      formData.append(
        "disabilityLevel",
        form.disability
      );

      formData.append(
        "group",
        form.studentCategory
      );

      formData.append(
        "learningLevel",
        form.learningLevel
      );

      formData.append(
        "facpFunctionalLevel",
        form.facpFunctionalLevel
      );

      formData.append(
        "facpBaseline",
        form.facp
      );

      formData.append(
        "guardianName",
        form.guardian
      );

      formData.append(
        "guardianPhone",
        form.phone
      );

      formData.append(
        "address",
        form.address
      );

      if (photo) {
        formData.append("photo", photo);
      }

      await API.put(`/${id}`, formData, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

      alert("Student Updated Successfully");

      navigate("/students");

    } catch (err) {

      console.log(err);

      alert("Unable to update student");

    } finally {

      setSaving(false);

    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: P,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className="flex"
      style={{
        minHeight: "100vh",
        background: "#F0F6FF",
      }}
    >
      <Sidebar active="Students" />

      <div className="flex-1">

        <TopBar
          title="Edit Student"
          subtitle="Update Student Details"
        />

        <main className="p-8">

          <form
            onSubmit={handleUpdate}
            className="max-w-4xl mx-auto bg-white rounded-2xl p-8"
          >

            <div className="flex gap-6 mb-8">

              <div>

                <img
                  src={
                    preview ||
                    "https://placehold.co/120x120"
                  }
                  alt=""
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhoto}
                />

                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Change Photo
                </button>

              </div>

              <div className="grid grid-cols-2 gap-5 flex-1">

                <Field
                  label="Full Name"
                  id="name"
                  value={form.fullName}
                  onChange={set("fullName")}
                />

                <Field
                  label="Age"
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={set("age")}
                />

                <Field
                  label="Gender"
                  id="gender"
                  value={form.gender}
                  onChange={set("gender")}
                  options={[
                    "Male",
                    "Female",
                    "Other",
                  ]}
                />

                <Field
                  label="Disability"
                  id="disability"
                  value={form.disability}
                  onChange={set("disability")}
                  options={[
                    "Mild",
                    "Moderate",
                    "Severe",
                    "Profound",
                  ]}
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
                />

                <Field
                  label="Learning Level"
                  id="learning"
                  value={form.learningLevel}
                  onChange={set("learningLevel")}
                  options={[
                    "Beginner",
                    "Intermediate",
                    "Advanced",
                  ]}
                />

                <Field
                  label="FACP Functional Level (Derived)"
                  id="facpFunctionalLevel"
                  value={form.facpFunctionalLevel}
                  onChange={set("facpFunctionalLevel")}
                  options={[
                    "Preprimary",
                    "Primary-I",
                    "Primary-II",
                    "Secondary",
                    "Prevocational-I",
                    "Prevocational-II",
                    "Vocational",
                    "Care Group",
                  ]}
                />

                <Field
                  label="FACP Score"
                  id="facp"
                  type="number"
                  value={form.facp}
                  onChange={set("facp")}
                />

                <Field
                  label="Guardian"
                  id="guardian"
                  value={form.guardian}
                  onChange={set("guardian")}
                />

                <Field
                  label="Phone"
                  id="phone"
                  value={form.phone}
                  onChange={set("phone")}
                />

              </div>

            </div>

            <Field
              label="Address"
              id="address"
              value={form.address}
              onChange={set("address")}
            />

            <div className="flex justify-end gap-4 mt-8">

              <Link to="/students">

                <button
                  type="button"
                  className="px-6 py-3 border rounded-lg"
                >
                  Cancel
                </button>

              </Link>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                {saving
                  ? "Updating..."
                  : "Update Student"}
              </button>

            </div>

          </form>

        </main>

      </div>

    </div>
  );
}