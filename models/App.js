// Backend: server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const PORT = process.env.PORT || 5000;

const companySchema = new mongoose.Schema({
  name: String,
  location: String,
  linkedinProfile: String,
  emails: [String],
  phoneNumbers: [String],
  comments: String,
  communicationPeriodicity: Number,
  lastCommunications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Communication" }],
  nextCommunication: { type: Date, default: null },
});
const Company = mongoose.model("Company", companySchema);

const communicationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  type: String,
  date: { type: Date, default: Date.now },
  notes: String,
});
const Communication = mongoose.model("Communication", communicationSchema);

app.get("/api/companies", async (req, res) => {
  try {
    const companies = await Company.find().populate("lastCommunications");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/companies", async (req, res) => {
  try {
    const newCompany = new Company(req.body);
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/communications", async (req, res) => {
  try {
    const { companyId, type, notes } = req.body;
    const communication = new Communication({ companyId, type, notes });
    await communication.save();

    const company = await Company.findById(companyId);
    company.lastCommunications.push(communication._id);
    if (company.lastCommunications.length > 5) {
      company.lastCommunications.shift();
    }
    company.nextCommunication = new Date(
      Date.now() + company.communicationPeriodicity * 24 * 60 * 60 * 1000
    );
    await company.save();

    res.status(201).json(communication);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Frontend: src/components/UserDashboard.js
import React, { useState, useEffect } from "react";
import axios from "../apiService";

const UserDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    axios.get("/companies").then((response) => {
      setCompanies(response.data);
    });
  }, []);

  const logCommunication = async (companyId, type, notes) => {
    await axios.post("/communications", { companyId, type, notes });
    const updatedCompanies = companies.map((company) =>
      company._id === companyId
        ? { ...company, nextCommunication: new Date() }
        : company
    );
    setCompanies(updatedCompanies);
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Last Communications</th>
            <th>Next Communication</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company._id}
              style={{
                backgroundColor:
                  new Date(company.nextCommunication) < new Date()
                    ? "red"
                    : "yellow",
              }}
            >
              <td>{company.name}</td>
              <td>
                {company.lastCommunications.map((comm) => (
                  <div key={comm._id}>{`${comm.type} on ${new Date(
                    comm.date
                  ).toLocaleDateString()}`}</div>
                ))}
              </td>
              <td>
                {company.nextCommunication
                  ? new Date(company.nextCommunication).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <button
                  onClick={() =>
                    setSelectedCompany(
                      selectedCompany === company._id ? null : company._id
                    )
                  }
                >
                  Log Communication
                </button>
                {selectedCompany === company._id && (
                  <div>
                    <select
                      onChange={(e) => logCommunication(company._id, e.target.value)}
                    >
                      <option value="LinkedIn Post">LinkedIn Post</option>
                      <option value="Email">Email</option>
                      <option value="Phone Call">Phone Call</option>
                    </select>
                    <textarea placeholder="Notes"></textarea>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserDashboard;
