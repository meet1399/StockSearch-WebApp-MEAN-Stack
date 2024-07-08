let formatSentiment = data => {
    var res = {
        symbol: data.symbol, 
        mspr: {
            positiveMspr: 0,
            negativeMspr: 0
        }, 
        change: {
            positiveChange: 0,
            negativeChange: 0
        }};
    data.data.forEach(entry => {
        if (entry.mspr >= 0) {
            res.mspr.positiveMspr += entry.mspr;
        } else {
            res.mspr.negativeMspr += entry.mspr;
        }
        if (entry.change >= 0) {
            res.change.positiveChange += entry.change;
        } else {
            res.change.negativeChange += entry.change;
        }
        });
    return res;
};

module.exports = formatSentiment;