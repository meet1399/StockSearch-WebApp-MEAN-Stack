const express = require("express");
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const token = "FckwwVDqTlTayduwzls_PSRz3ptKwxFB";
const sort = "asc";
const adjusted = "true";

// Get hourly historical data 
// For summary tab chart only
router.get("/api/candle/hour/:symbol/:date1/:date2", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    var closeDate = req.params.date1;
    var prevDate = req.params.date2;
    res.setHeader("Access-Control-Allow-Origin", "*");
    var url = "https://api.polygon.io/v2/aggs/ticker/" + symbol + "/range/1/hour/" + prevDate + "/" + closeDate + "/"
    axios.get(url, {
        params: {
            apiKey: token,
            adjusted: adjusted,
            sort:sort
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
})

// Get 2 years of historical data 
// For Charts tab
router.get("/api/candle/year/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    var currentDate = new Date();
    var currentDateStr = currentDate.toISOString().split('T')[0];
    var twoYearsFromNow = new Date(currentDate);
    twoYearsFromNow.setFullYear(currentDate.getFullYear() - 2);
    var twoYearsFromNowStr = twoYearsFromNow.toISOString().split('T')[0];
    res.setHeader("Access-Control-Allow-Origin", "*");
    var url = "https://api.polygon.io/v2/aggs/ticker/" + symbol + "/range/1/day/" + twoYearsFromNowStr + "/" + currentDateStr + "/"
    axios.get(url, {
        params: {
            apiKey: token,
            adjusted: adjusted,
            sort:sort
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
});

module.exports = router;