const express = require('express');
const router = express.Router();
const { generateInvoicePDF } = require('../controllers/invoiceController');

router.post('/generate', generateInvoicePDF);

module.exports = router;
