const express = require('express');
const axios = require('axios');
const path = require('path');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const app = express();
const token = "cnbtnfpr01qlfrvka8j0cnbtnfpr01qlfrvka8jg";

const candle_router = require('./utils/candle');
require('./utils/dateformat');
const {run, client} = require('./utils/connection');
const filternews = require('./utils/newsfilter');
const formatSentiment = require('./utils/sentimentformatter');

// app.use(express.static(path.join(__dirname,'./build')));
run().then(app.listen(PORT)).catch((err)=>{console.log("Connection failed to MongoDB : ", err)});

const myDB = client.db("assignment3");
const myWatchlist = myDB.collection("watchlist");
const myPortfolio = myDB.collection("portfolio");

app.get("/", (req, res) => {
    var ts = new Date(Date.now());
    ts.setDate(ts.getDate() - 2);
    ts.setHours(ts.getHours() - 6);
    var last = new Date();
    last.setHours(ts.getHours() - 6);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send({str: String(ts), num: Number(ts), last: Number(last)});
});

// Profile
app.get("/api/profile/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/stock/profile2', {
        params: {
            token: token,
            symbol: symbol
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
});

// Latest Data
app.get("/api/latest/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/quote', {
        params: {
            token: token,
            symbol: symbol
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
});

// Autocomplete API
app.get("/api/autocomplete/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/search', {
        params: {
            token: token,
            q: symbol
        }
    }).then(data => {
        let result = data.data.result;
        result = result.filter(feed => {
            if (feed.type == null || feed.symbol == null || feed.symbol.indexOf('.') !== -1) {
                return false;
            }
            return feed.type == "Common Stock";
        });
        result.forEach(element => {
            delete element.type;
            delete element.primary;
        });
        res.send(result);
    }).catch(err => {
        res.send({error: err});
    })
});

// News
app.get("/api/news/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    var endtime = new Date(Date.now());
    var begintime = new Date(endtime);
    begintime.setDate(begintime.getDate() - 30);
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/company-news', {
        params: {
            token: token,
            symbol: symbol,
            from: begintime.format("yyyy-MM-dd"),
            to: endtime.format("yyyy-MM-dd")
        }
    }).then(data => {
        res.send(filternews(data.data));
    }).catch(err => {
        res.send({error: err});
    });
});

// Recommendation
app.get("/api/recommendation/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/stock/recommendation', {
        params: {
            token: token,
            symbol: symbol
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
});

// Insider Sentiment
app.get("/api/insider/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/stock/insider-sentiment', {
        params: {
            token: token,
            symbol: symbol,
            from: '2022-01-01'
        }
    }).then(data => {
        res.send(formatSentiment(data.data));
    }).catch(err => {
        res.send({error: err});
    });
});

// Peers
app.get("/api/peers/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/stock/peers', {
        params: {
            token: token,
            symbol: symbol
        }
    }).then(data => {
        res.send(data.data);
    }).catch(err => {
        res.send({error: err});
    });
});

// Earnings
app.get("/api/earnings/:symbol", (req, res) => {
    var symbol = req.params.symbol.trim().toUpperCase();
    res.setHeader("Access-Control-Allow-Origin", "*");
    axios.get('https://finnhub.io/api/v1/stock/earnings', {
        params: {
            token: token,
            symbol: symbol
        }
    }).then(data => {
        let result = data.data;
        result.forEach(element => {
            if (element.actual == null) {
                element.actual = 0
            }
            if (element.estimate == null) {
                element.estimate = 0
            }
            if (element.surprise == null) {
                element.surprise = 0
            }
            if (element.surprisePercent == null) {
                element.surprisePercent = 0 
            }
        });
        res.send(result);
    }).catch(err => {
        res.send({error: err});
    });
});

app.get("/api/addToWatchlist/:ticker/:name", async (req, res) => {
    var ticker = req.params.ticker;
    var name = req.params.name;
    res.setHeader("Access-Control-Allow-Origin", "*");
    const doc = { ticker: ticker, name: name };
    try{ 
        const result = await myWatchlist.insertOne(doc);
        res.send(result);
    }
    catch(err){
        res.send(err);
    }
});

app.get("/api/getWatchlist", async (req, res) => {
    var data = [];
    res.setHeader("Access-Control-Allow-Origin", "*");
    try{
        const result = myWatchlist.find();
        for await (const doc of result) {
            data.push(doc);
        }
        res.send(data);
    }
    catch(err){
        res.send(err);
    }
});

app.get("/api/deleteFromWatchlist/:ticker", async (req, res) => {
    var ticker = req.params.ticker;
    res.setHeader("Access-Control-Allow-Origin", "*");
    try{ 
        const query = { ticker: ticker };
        const result = await myWatchlist.deleteOne(query);
        res.send(result)
    }
    catch(err){
        res.send(err);
    }
});

app.get("/api/buyStock/:ticker/:name/:quantity/:totalCost", async (req, res) => {
    var ticker = req.params.ticker;
    var name = req.params.name;
    var quantity = req.params.quantity;
    var totalCost = req.params.totalCost;
    res.setHeader("Access-Control-Allow-Origin", "*");
    try{ 
        const result = await myPortfolio.findOne();
        if (!result) {
            console.log("Document not found.");
        }
        var stockExists = false;
        for (var stock of result.stocks) {
            if (stock.ticker === ticker) {
                stock.quantity = (parseInt(stock.quantity) + parseInt(quantity)).toString();
                stock.totalCost = (parseFloat(stock.totalCost) + parseFloat(totalCost)).toString();
                stockExists = true;
                break;
            }
        }
        if (!stockExists) {
            result.stocks.push({ ticker, name, quantity, totalCost });
        }
        result.balance -= totalCost;
        const output = await myPortfolio.replaceOne({}, result);
        res.send(output);
    }
    catch(err){
        res.send(err);
    }
});

app.get("/api/sellStock/:ticker/:quantity/:totalCost", async (req, res) => {
    var ticker = req.params.ticker;
    var quantity = Number(req.params.quantity);
    var totalCost = Number(req.params.totalCost);
    res.setHeader("Access-Control-Allow-Origin", "*");
    try{ 
        const result = await myPortfolio.findOne();
        if (!result) {
            console.log("Document not found.");
        }
        var deleteStock = false;
        for (var stock of result.stocks) {
            if (stock.ticker === ticker) {
                stock.quantity = (parseInt(stock.quantity) - parseInt(quantity)).toString();
                stock.totalCost = (parseFloat(stock.totalCost) - parseFloat(totalCost)).toString();
                if (stock.quantity == 0) {
                    deleteStock = true;
                }
                break;
            }
        }
        if (deleteStock) {
            result.stocks = result.stocks.filter(stock => stock.ticker != ticker)
        }
        result.balance += totalCost;
        const output = await myPortfolio.replaceOne({}, result);
        res.send(output);
    }
    catch(err){
        res.send(err);
    }
});

app.get("/api/getPortfolio", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    try{ 
        const result = await myPortfolio.findOne();
        if (!result) {
            console.log("Document not found.");
        }
        res.send(result);
    }
    catch(err){
        res.send(err);
    }
});


app.use(candle_router);