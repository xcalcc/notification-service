const serverConf = require('../package.json');
const express = require('express');
const router = express.Router();
const subscribe = require('./subscribe');

router.use('/subscribe',subscribe);

router.use('/', async (req, res) => {
    res.send(`Notification Service ${serverConf.version}`);
});

module.exports = router;