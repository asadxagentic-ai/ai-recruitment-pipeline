import { useRef, useState } from "react";
import { Upload, User, Mail, Briefcase, X } from "lucide-react";

export type ResumeFormValues = {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  resumeFile: File | null;
};

const inputStyle = {
  width: "100%",
  background: "#F5F0E8",
  border: "1px solid #D9D4C7",
  borderRadius: "8px",
  padding: "10px 12px 10px 38px",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.875rem",
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: "6px",
};

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#1a1a1a",
};

const categoryStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  color: "#9a9a9a",
};

const iconWrap = {
  position: "absolute" as const,
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9a9a9a",
  pointerEvents: "none" as const,
};

export function ResumeForm({
  onSubmit,
  error,
}: {
  onSubmit: (values: ResumeFormValues) => void;
  error?: string | null;
}) {
  const [values, setValues] = useState<ResumeFormValues>({
    candidateName: "",
    candidateEmail: "",
    jobTitle: "",
    resumeFile: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof Omit<ResumeFormValues, "resumeFile">) => (v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleFile = (file: File | null) => {
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      setFileError("Please upload a PDF, Word, or text file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File is larger than 10MB.");
      return;
    }
    setFileError(null);
    setValues((prev) => ({ ...prev, resumeFile: file }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.resumeFile) {
          setFileError("Please upload your resume file.");
          return;
        }
        onSubmit(values);
      }}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {/* Row 1: Name */}
      <div>
        <div style={labelRowStyle}>
          <label style={labelStyle} htmlFor="candidateName">
            <span style={{ color: "#9a9a9a", marginRight: 4 }}>01</span> Candidate Name{" "}
            <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <span style={categoryStyle}>FULL NAME</span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={iconWrap}>
            <User size={14} />
          </span>
          <input
            id="candidateName"
            required
            placeholder="Ada Lovelace"
            value={values.candidateName}
            onChange={(e) => set("candidateName")(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 2: Email */}
      <div>
        <div style={labelRowStyle}>
          <label style={labelStyle} htmlFor="candidateEmail">
            <span style={{ color: "#9a9a9a", marginRight: 4 }}>02</span> Email{" "}
            <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <span style={categoryStyle}>YOUR EMAIL</span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={iconWrap}>
            <Mail size={14} />
          </span>
          <input
            id="candidateEmail"
            type="email"
            required
            placeholder="ada@example.com"
            value={values.candidateEmail}
            onChange={(e) => set("candidateEmail")(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 3: Job Title */}
      <div>
        <div style={labelRowStyle}>
          <label style={labelStyle} htmlFor="jobTitle">
            <span style={{ color: "#9a9a9a", marginRight: 4 }}>03</span> Job Title{" "}
            <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <span style={categoryStyle}>ROLE APPLYING FOR</span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={iconWrap}>
            <Briefcase size={14} />
          </span>
          <input
            id="jobTitle"
            required
            placeholder="Frontend Developer"
            value={values.jobTitle}
            onChange={(e) => set("jobTitle")(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Row 4: File upload */}
      <div>
        <div style={labelRowStyle}>
          <label style={labelStyle}>
            <span style={{ color: "#9a9a9a", marginRight: 4 }}>04</span> Resume{" "}
            <span style={{ color: "#e53e3e" }}>*</span>
          </label>
          <span style={categoryStyle}>PDF / WORD / TXT</span>
        </div>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0] ?? null);
          }}
          style={{
            border: `1.5px dashed ${dragOver ? "#1a3a1a" : "#D9D4C7"}`,
            borderRadius: "8px",
            padding: "1.5rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "#f0ede5" : "#F5F0E8",
            transition: "all 0.2s",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {values.resumeFile ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Upload size={16} style={{ color: "#1a3a1a" }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.85rem",
                  color: "#1a1a1a",
                  fontWeight: 500,
                }}
              >
                {values.resumeFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setValues((p) => ({ ...p, resumeFile: null }));
                  if (fileRef.current) fileRef.current.value = "";
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9a9a9a",
                  padding: 0,
                }}
                aria-label="Remove file"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <Upload size={20} style={{ color: "#9a9a9a", margin: "0 auto 8px" }} />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.8rem",
                  color: "#6b6b6b",
                  margin: 0,
                }}
              >
                Drop your resume here or{" "}
                <span style={{ color: "#1a3a1a", textDecoration: "underline" }}>
                  browse
                </span>
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.7rem",
                  color: "#9a9a9a",
                  margin: "4px 0 0",
                }}
              >
                PDF, Word, or TXT — max 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {(error || fileError) && (
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.8rem",
            color: "#c53030",
            background: "#fff5f5",
            border: "1px solid #feb2b2",
            borderRadius: "6px",
            padding: "10px 14px",
          }}
        >
          {error || fileError}
        </p>
      )}

      {/* Buttons row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          paddingTop: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.75rem",
            color: "#9a9a9a",
          }}
        >
          Your results will appear beside this form.
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => {
              setValues({
                candidateName: "",
                candidateEmail: "",
                jobTitle: "",
                resumeFile: null,
              });
              setFileError(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              padding: "8px 16px",
              border: "1px solid #D9D4C7",
              borderRadius: "6px",
              background: "transparent",
              color: "#6b6b6b",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "8px 18px",
              border: "none",
              borderRadius: "6px",
              background: "#1a1a1a",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Submit Resume ↗
          </button>
        </div>
      </div>
    </form>
  );
}
