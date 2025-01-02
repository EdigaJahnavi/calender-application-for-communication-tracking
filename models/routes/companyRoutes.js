const express = require('express');
const Company = require('../models/company');
const router = express.Router();

router.post('/', async (req, res) => {
  const company = new Company(req.body);
  try {
    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
