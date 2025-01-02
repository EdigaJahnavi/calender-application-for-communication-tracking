import React, { useState, useEffect } from 'react';
import axios from '../../api/apiService';

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    axios.get('/companies')
      .then(response => setCompanies(response.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {companies.map(company => (
          <li key={company._id}>{company.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
