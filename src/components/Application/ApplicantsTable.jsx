import React, { useEffect, useState } from "react";
import axios from "axios";

const ApplicationTable = ({ status }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cvLinks = [
    "https://www.bellevue.edu/student-support/career-services/pdfs/resume-samples.pdf",
    "https://www.bellevue.edu/student-support/career-services/pdfs/resume-samples.pdf",
    "https://www.bellevue.edu/student-support/career-services/pdfs/resume-samples.pdf",
    "https://www.bellevue.edu/student-support/career-services/pdfs/resume-samples.pdf",
    "https://www.bellevue.edu/student-support/career-services/pdfs/resume-samples.pdf",
  ];

  // Fetch data based on the status prop
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/applicants/applications?status=${status}`
        );

        // Assign random CV links to applicants
        const enrichedApplicants = response.data.map((applicant) => ({
          ...applicant,
          cv: cvLinks[Math.floor(Math.random() * cvLinks.length)],
        }));
        setApplicants(enrichedApplicants);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status]);

  const handleAccept = async (id, name) => {
    // Optimistically update the status
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === id ? { ...applicant, status: "Accepted" } : applicant
      )
    );

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/applicants/applications/${id}/status`,
        { status: "Accepted" }
      );
      if (response.status === 200) {
        window.location.reload(); // Refresh the page on successful response
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update the application status for: ${name}`);
      // Rollback the change on error
      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.id === id ? { ...applicant, status: "Pending" } : applicant
        )
      );
    }
  };

  const handleReject = async (id, name) => {
    // Optimistically update the status
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === id ? { ...applicant, status: "Rejected" } : applicant
      )
    );

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/applicants/applications/${id}/status`,
        { status: "Rejected" }
      );
      if (response.status === 200) {
        window.location.reload(); // Refresh the page on successful response
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Failed to update the application status for: ${name}`);
      // Rollback the change on error
      setApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.id === id ? { ...applicant, status: "Pending" } : applicant
        )
      );
    }
  };

  // Helper function to format the date
  const formatDate = (date) => {
    if (!date) return "N/A"; // Handle missing or null date
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr className="bg-red-500 text-white">
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Age</th>
              <th style={headerCellStyle}>Gender</th>
              <th style={headerCellStyle}>Application Date</th>
              <th style={headerCellStyle}>CV</th>
              <th style={headerCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f1f1f1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#f9f9f9" : "#fff")
                }
              >
                <td style={cellStyle}>{applicant.name}</td>
                <td style={cellStyle}>{applicant.age}</td>
                <td style={cellStyle}>{applicant.gender}</td>
                <td style={cellStyle}>{formatDate(applicant.date)}</td>
                <td style={cellStyle}>
                  <a
                    href={applicant.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "blue", textDecoration: "underline" }}
                  >
                    View CV
                  </a>
                </td>
                <td style={cellStyle}>
                  {applicant.status === "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleAccept(applicant.id, applicant.name)
                        }
                        style={acceptButtonStyle}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleReject(applicant.id, applicant.name)
                        }
                        style={rejectButtonStyle}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Common styles for table cells
const headerCellStyle = {
  padding: "15px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
};

const cellStyle = {
  padding: "12px 15px",
  textAlign: "left",
};

// Styles for buttons
const acceptButtonStyle = {
  backgroundColor: "grey",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  marginRight: "10px",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const rejectButtonStyle = {
  backgroundColor: "grey",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "5px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

export default ApplicationTable;
