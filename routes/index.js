const express = require('express');

const webhook = require('../controllers/webhook');

const app = express();

app.use('/webhook', webhook);

module.exports = app;