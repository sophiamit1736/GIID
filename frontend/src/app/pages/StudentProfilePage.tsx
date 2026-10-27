import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import API from "../api/studentApi";
import { getAdaptiveSummary, getResults } from "../api/resultApi";
import { getFACPStudentSummary } from "../api/facpApi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Sidebar, TopBar } from "./DashboardPage";

const P = "Poppins, sans-serif";

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(21,101,192,.08)",
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl mb-4"
        style={{
          width: 45,
          height: 45,
          background: bg,
        }}
      >
        <span
          className="material-icons-round"
          style={{
            color,
          }}
        >
          {icon}
        </span>
      </div>

      <div
        style={{
          fontFamily: P,
          fontWeight: 700,
          fontSize: 24,
          color: "#0D2137",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontFamily: P,
          color: "#666",
          fontSize: 13,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ProgressRing({
  value,
}: {
  value: number;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width="110" height="110">
      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="#E3F2FD"
        strokeWidth="10"
        fill="transparent"
      />

      <circle
        cx="55"
        cy="55"
        r={radius}
        stroke="#1565C0"
        strokeWidth="10"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
        strokeLinecap="round"
      />

      <text
        x="55"
        y="60"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill="#0D2137"
      >
        {value}
      </text>
    </svg>
  );
}

export default function StudentProfilePage() {

  const { id } = useParams();

  const [student, setStudent] = useState<any>(null);
  const [adaptiveSummary, setAdaptiveSummary] = useState<any>(null);
  const [facpSummary, setFacpSummary] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetchStudent();

  }, []);

  async function fetchStudent() {

    try {

      const res = await API.get(`/${id}`);

      setStudent(res.data);

      try {
        const [adaptiveRes, resultsRes, facpRes] = await Promise.all([
          getAdaptiveSummary(id as string),
          getResults(id as string),
          getFACPStudentSummary(id as string),
        ]);
        setAdaptiveSummary(adaptiveRes.data);
        setResults(resultsRes.data || []);
        setFacpSummary(facpRes.data);
      } catch (performanceError) {
        console.error("Unable to load learner performance:", performanceError);
        setAdaptiveSummary(null);
        setResults([]);
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {

    return <h2 style={{ padding: 30 }}>Loading...</h2>;

  }

  if (!student) {

    return <h2 style={{ padding: 30 }}>Student not found.</h2>;

  }

  const initials = student.name
    ?.split(" ")
    .map((x: string) => x[0])
    .join("")
    .substring(0, 2);

  const avatarColor = "#1565C0";

  const avatarBg = "#E3F2FD";

  const domainProgress = (adaptiveSummary?.domainMastery || []).map((item: any) => ({
    label: item.domain,
    alpi: Number(item.mastery || 0),
  }));

  const recentResults = results.slice(0, 5);
  const recentProgress = results
    .slice(0, 7)
    .reverse()
    .map((item: any, index: number) => ({
      label: item.activityName ? item.activityName.slice(0, 12) : `A${index + 1}`,
      alpi: Number(item.accuracy || 0),
    }));

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F0F6FF" }}>
  <Sidebar active="Students" />

  <div className="flex-1 flex flex-col min-w-0">

    <TopBar
      title="Student Profile"
      subtitle="View complete student information"
    />

    <main className="flex-1 p-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">

        <Link
          to="/students"
          style={{
            fontFamily: P,
            color: "#1565C0",
            textDecoration: "none",
          }}
        >
          Students
        </Link>

        <span className="material-icons-round">
          chevron_right
        </span>

        <span>{student.name}</span>

      </div>

      {/* Hero Card */}

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        className="rounded-3xl overflow-hidden"

        style={{
          background: "#fff",
          border: "1px solid rgba(21,101,192,.08)",
        }}
      >

        <div
          style={{
            height: 120,
            background:
              "linear-gradient(135deg,#1565C0,#27AE60)",
          }}
        />

        <div
          className="px-8 pb-6"
          style={{ marginTop: -45 }}
        >

          <div className="flex justify-between">

            <div className="flex gap-5">

              <div

                className="rounded-full d-flex"

                style={{
                  width: 90,
                  height: 90,
                  background: avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "4px solid white",
                }}
              >

                <span

                  style={{
                    fontFamily: P,
                    fontWeight: 700,
                    fontSize: 28,
                    color: avatarColor,
                  }}
                >

                  {initials}

                </span>

              </div>

              <div style={{ paddingTop: 45 }}>

                <h2
                  style={{
                    fontFamily: P,
                    fontWeight: 700,
                  }}
                >
                  {student.name}
                </h2>

                <div
                  style={{
                    color: "#666",
                    marginTop: 6,
                  }}
                >

                  {student.studentCode}

                  {" • "}

                  {student.age} Years

                  {" • "}

                  {student.gender}

                </div>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >

                  <span

                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: "#FFF9C4",
                      color: "#F57F17",
                      marginRight: 10,
                      fontSize: 13,
                    }}
                  >

                    {student.learningLevel}

                  </span>

                  <span

                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: "#E8F5E9",
                      color: "#2E7D32",
                      fontSize: 13,
                    }}
                  >

                    {student.status}

                  </span>

                </div>

              </div>

            </div>

            <div
              className="flex gap-3"
              style={{
                paddingTop: 45,
              }}
            >

              <Link to={`/students/edit/${student._id}`}>

                <button
                  className="px-4 py-2 rounded-xl"
                  style={{
                    background: "#E3F2FD",
                    border: "none",
                    color: "#1565C0",
                  }}
                >
                  Edit
                </button>

              </Link>

              <Link to={`/observation/${student._id}`}>

                <button
                  className="px-4 py-2 rounded-xl"
                  style={{
                    background: "#E8F5E9",
                    border: "none",
                    color: "#2E7D32",
                  }}
                >
                  Observe
                </button>

              </Link>

            </div>

          </div>

        </div>

      </motion.div>

      {/* Information */}

      <div
        className="grid grid-cols-4 gap-4 mt-6"
      >

        <StatCard
          label="FACP Score"
          value={(facpSummary?.applicableItems > 0 || student.facpAssessed) ? `${Number(facpSummary?.score ?? student.facpScore ?? 0)}%` : "Not assessed"}
          icon="assessment"
          color="#27AE60"
          bg="#E8F5E9"
        />

        <StatCard
          label="Learning Level"
          value={student.learningLevel}
          icon="school"
          color="#1565C0"
          bg="#E3F2FD"
        />

        <StatCard
          label="Disability"
          value={student.disabilityLevel}
          icon="psychology"
          color="#EF6C00"
          bg="#FFF3E0"
        />

        <div
          className="rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid rgba(21,101,192,.08)",
          }}
        >

          <div className="flex justify-center">

            <ProgressRing value={Number(adaptiveSummary?.alpi ?? student.alpiScore ?? 0)} />

          </div>

          <div
            style={{
              textAlign: "center",
              fontWeight: 600,
              marginTop: 10,
            }}
          >
            ALPI Score
          </div>

        </div>

      </div>

      {/* Guardian Details */}

      <div

        className="rounded-2xl p-6 mt-6"

        style={{
          background: "#fff",
          border: "1px solid rgba(21,101,192,.08)",
        }}
      >

        <h3
          style={{
            fontFamily: P,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Guardian Information
        </h3>

        <div className="grid grid-cols-2 gap-5">

          <div>

            <b>Name</b>

            <br />

            {student.guardianName}

          </div>

          <div>

            <b>Phone</b>

            <br />

            {student.guardianPhone}

          </div>

          <div className="col-span-2">

            <b>Address</b>

            <br />

            {student.address}

          </div>

        </div>

      </div>
                {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">

            <div
              className="rounded-2xl p-5 flex flex-col items-center gap-2"
              style={{
                background: "#fff",
                border: "1.5px solid rgba(21,101,192,0.08)",
              }}
            >
              <ProgressRing value={Number(adaptiveSummary?.alpi ?? student.alpiScore ?? 0)} />
              <div
                style={{
                  fontFamily: P,
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#0D2137",
                }}
              >
                Current ALPI
              </div>
            </div>

            <StatCard
              label="FACP Score"
              value={(facpSummary?.applicableItems > 0 || student.facpAssessed) ? `${Number(facpSummary?.score ?? student.facpScore ?? 0)}%` : "Not assessed"}
              icon="assessment"
              color="#27ae60"
              bg="#E8F5E9"
            />

            <StatCard
              label="Learning Level"
              value={student.learningLevel}
              icon="school"
              color="#1565C0"
              bg="#E3F2FD"
            />

            <StatCard
              label="Status"
              value={student.status}
              icon="check_circle"
              color="#FF9800"
              bg="#FFF3E0"
            />

          </div>

          {/* FACP Domain Progress */}
          {facpSummary?.domainScores?.length > 0 && (
            <div
              className="rounded-2xl p-6 mt-6"
              style={{ background: "#fff", border: "1px solid rgba(21,101,192,.08)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: P, fontWeight: 600, margin: 0 }}>FACP Domain Progress</h3>
                <Link
                  to={`/observation/${student._id}`}
                  style={{ color: "#1565C0", fontFamily: P, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
                >
                  Open Assessment →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {facpSummary.domainScores.map((d: any) => (
                  <div key={d.domain} style={{ padding: 14, borderRadius: 14, background: "#F8FAFF" }}>
                    <div className="flex justify-between" style={{ fontSize: 12, fontWeight: 700 }}>
                      <span>{d.domain}</span><span style={{ color: "#1565C0" }}>{d.score}%</span>
                    </div>
                    <div style={{ height: 7, background: "#E4EDF5", borderRadius: 99, marginTop: 8 }}>
                      <div style={{ width: `${Math.max(0, Math.min(100, Number(d.score || 0)))}%`, height: "100%", background: "#1565C0", borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#607D8B", marginTop: 6 }}>
                      {d.achievedItems}/{d.applicableItems} achieved
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#fff",
                border: "1px solid rgba(21,101,192,.08)",
              }}
            >
              <h3
                style={{
                  fontFamily: P,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Domain Mastery
              </h3>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={domainProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="alpi" fill="#1565C0" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "#fff",
                border: "1px solid rgba(21,101,192,.08)",
              }}
            >
              <h3
                style={{
                  fontFamily: P,
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Recent Activity Performance
              </h3>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={recentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey="alpi"
                    stroke="#27ae60"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          <div className="mt-5 rounded-2xl p-4" style={{ background: "#F7FAFD", border: "1px solid #E2ECF4" }}>
            <div style={{ fontFamily: P, fontSize: 11, fontWeight: 800, color: "#607D8B" }}>ALPI CALCULATION</div>
            <div style={{ fontFamily: P, fontSize: 13, color: "#263238", marginTop: 5 }}>
              ALPI = recency-weighted average of the latest 10 activity Performance Index values. Current activities included: {adaptiveSummary?.totalActivities ?? results.length}.
            </div>
          </div>

          {adaptiveSummary?.recommendation && (
            <div className="mt-5 rounded-2xl p-5" style={{ background: "#fff", border: "1px solid rgba(21,101,192,.08)" }}>
              <div style={{ fontFamily: P, fontSize: 11, fontWeight: 800, color: "#607D8B" }}>ADAPTIVE RECOMMENDATION</div>
              <div style={{ fontFamily: P, fontSize: 17, fontWeight: 800, color: "#0D2137", marginTop: 6 }}>
                {adaptiveSummary.recommendation.title}
              </div>
              <div style={{ fontFamily: P, fontSize: 12, color: "#607D8B", marginTop: 4 }}>
                {adaptiveSummary.recommendation.reason}
              </div>
              {adaptiveSummary.recommendation.moduleId && (
                <Link to={`/learning-modules/${adaptiveSummary.recommendation.moduleId}`} style={{ display: "inline-block", marginTop: 12, padding: "9px 14px", borderRadius: 10, background: "#E3F2FD", color: "#1565C0", textDecoration: "none", fontFamily: P, fontSize: 12, fontWeight: 700 }}>
                  Open Recommended Activity →
                </Link>
              )}
            </div>
          )}

          {/* Student Information */}

          <div
            className="rounded-2xl p-6"
            style={{
              background: "#fff",
              border: "1px solid rgba(21,101,192,.08)",
            }}
          >

            <h3
              style={{
                fontFamily: P,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              Student Information
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <Info label="Student Code" value={student.studentCode} />

              <Info label="Gender" value={student.gender} />

              <Info label="Age" value={`${student.age} Years`} />

              <Info
                label="Disability Level"
                value={student.disabilityLevel}
              />

              <Info
                label="Learning Level"
                value={student.learningLevel}
              />

              <Info
                label="Guardian"
                value={student.guardianName}
              />

              <Info
                label="Guardian Phone"
                value={student.guardianPhone}
              />

              <Info
                label="Address"
                value={student.address || "-"}
              />

            </div>

          </div>

        </main>

      </div>

    </div>

  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: P,
          fontSize: 12,
          color: "#607D8B",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: P,
          fontWeight: 600,
          fontSize: 15,
          color: "#0D2137",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}