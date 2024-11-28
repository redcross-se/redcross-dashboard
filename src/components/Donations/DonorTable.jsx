import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DonorTable = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch donor data from the backend
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/donations/donations`);
        console.log("Response Data:", response.data); // Debug the response
        setDonors(response.data);
      } catch (err) {
        console.error("Error fetching donors:", err); // Debug errors
        setError(err.message || 'Failed to fetch donor data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#FF4C4C', color: '#fff' }}>
              <th style={headerCellStyle}>Name</th>
              <th style={headerCellStyle}>Email</th>
              <th style={headerCellStyle}>Donated Amount</th>
              <th style={headerCellStyle}>Donation Date</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(donors) && donors.length > 0 ? (
              donors.map((donor, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                  <td style={cellStyle}>{donor.User.fullName}</td>
                  <td style={cellStyle}>{donor.User.email}</td>
                  <td style={cellStyle}>${donor.amount.toFixed(2)}</td>
                  <td style={cellStyle}>{new Date(donor.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={cellStyle}>No donors available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Common styles for table cells
const headerCellStyle = {
  padding: '15px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid #ddd',
};

const cellStyle = {
  padding: '12px 15px',
  textAlign: 'left',
};

export default DonorTable;
