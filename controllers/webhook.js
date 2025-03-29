const express = require('express');
const router = express.Router();

const webhookService = require('../services/webhookService');

router.post('/tradingview', async (req, res) => {
    try {
        webhookService.placeOrder(req.body);
        res.status(200).json({ status: true, message: 'Successfully excute signal', data: [] });
    } catch (error) {
        res.status(500).json({ status: false, data: error });
    }
});

module.exports = router;