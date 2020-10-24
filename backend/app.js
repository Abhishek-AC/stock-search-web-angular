// Import express
const express = require('express');

// Import lodash
const _ = require('lodash');

// import axios 
const axios = require("axios");

// Import body parser
const bodyParser = require('body-parser');
const { last } = require('lodash');
const { response } = require('express');

// Initialize express
const app = express();

// Use the body parser middleware to allow 
// express to recognize JSON requests
app.use(bodyParser.json());

// Error handler
function createError(message) {
    return {
      errors: [
        {
          message
        }
      ]
    }
  }


// Endpoint to check if API is working
app.get('/', (req, res) => {
  res.send({
    status: 'online'
  })
});



/*

Endpoint for stock details 

Route: /api/details 
Query Parameter: ticker symbol

Return JSON 
- key 'details' will contain values from A.1 and A.2 
  - ticker 
  - companyName
  - exchangeCode
  - lastPrice
  - change
  - changePercentage
  - marketStatus
  - currentTimestamp
  - lastTimestamp only if market close 

depending on the marketStatus open/close summary will contain varied values 
- key 'summary'
  - highPrice
  - lowPrice 
  - openPrice
  - prevClose
  - volume
  - startDate
  - decsription
  if market open 
  - midPrice 
  - askPrice
  - askSize
  - bidPrice
  - bidSize

- key 'stockCharts'
  - list of list

- key 'news'
  - publisher 
  - publishedDate
  - title 
  - description
  - url
*/

app.get('/api/details', async (req, res) => {
  // AC would like to do something sophiscticated here
  var token = '2e60e48782d8be49b0f9e7b9a3b627bc50bdc58d';

  var ticker = req.query.ticker;
  var route;
  var result = {};
  var details = {};

  route = 'https://api.tiingo.com/tiingo/daily/' + ticker + '?token=' + token;
  
  var startDate, description, startDateObject;

  await axios.get(route)
  .then((response) => {
    details = {
      'ticker': response.data.ticker,
      'name': response.data.name,
      'exchangeCode': response.data.exchangeCode
    };
    result.details = details
    
    startDate = response.data.startDate;
    description = response.data.description;

    }, (error) => {
      console.log(error);
    });

  route = 'https://api.tiingo.com/iex?tickers=' + ticker + '&token=' + token;
  await axios.get(route)
  .then((response) => {
    var change = response.data[0].last  - response.data[0].prevClose;
    
    var currentTimestamp = new Date();
    var changeMarketStatus = (currentTimestamp - new Date(response.data[0].timestamp))/1000;

    var currentMinutes = currentTimestamp.getMinutes().toString().padStart(2, '0');
    var currentHours = currentTimestamp.getHours().toString().padStart(2, '0');
    var currentSeconds = currentTimestamp.getSeconds().toString().padStart(2, '0');
    var date = currentTimestamp.getFullYear() + "-" + (currentTimestamp.getMonth() + 1).toString().padStart(2, '0') + "-" + (currentTimestamp.getDate()).toString().padStart(2, '0') 
        + " " + currentHours + ":" + currentMinutes + ":" + currentSeconds;

    var temp = {
      'last': response.data[0].last,
      'change': parseFloat(change.toFixed(2)),
      'changePercentage': parseFloat(((change*100)/(response.data[0].prevClose)).toFixed(2)),
      'currentTimestamp': date,
    }

    var summary = {
      'highPrice': response.data[0].high,
      'lowPrice': response.data[0].low,
      'openPrice': response.data[0].open,
      'prevClose': response.data[0].prev,
      'volume': response.data[0].volume,
      'startDate': startDate,
      'description': description
    };

    if (changeMarketStatus > 60) {
      temp.marketStatus = 'close';
      temp.lastTimestamp = date;
      var chartDate = new Date(response.data[0].timestamp);

      startDate = chartDate.getFullYear() + "-" + (chartDate.getMonth() + 1).toString().padStart(2, '0') + "-" + chartDate.getDate().toString().padStart(2, '0');
      startDateObject = chartDate;
    }
    else {
      temp.marketStatus = 'open';
      summary.midPrice = response.data[0].mid == null ? '-' :  response.data[0].mid;
      summary.askPrice = response.data[0].askPrice == null ? '-' : response.data[0].askPrice;
      summary.askSize = response.data[0].askSize == null ? '-' : response.data[0].askSize;
      summary.bidSize = response.data[0].bidSize == null ? '-' : response.data[0].bidSize;
      summary.bidPrice = response.data[0].bidPrice == null ? '-': response.data[0].bidPrice;
      startDate = currentTimestamp.getFullYear() + "-" + (currentTimestamp.getMonth() + 1).toString().padStart(2, '0') + "-" + currentTimestamp.getDate().toString().padStart(2, '0');
      startDateObject = currentTimestamp;
    }
    result.details = Object.assign({},result.details, temp)
    result.summary = summary;
  },
  (error) => {
    console.log(error);
  });

  var newsApiKey = '3a67c2b7713c47cf8e309fd9c1fc2b35';
  var newsArticles = []

  route = 'https://newsapi.org/v2/everything?apiKey=' + newsApiKey + '&q=' + ticker;
  await axios.get(route)
    .then((response) => {
      var newsDump = response.data.articles;
      for(var i = 0; i < newsDump.length; ++i) {
        if (newsDump[i].title != null && newsDump[i].url != null && newsDump[i].urlToImage && newsDump[i].publishedAt != null) {
          var newsData = {
            'title': newsDump[i].title,
            'url': newsDump[i].url,
            'urlToImage': newsDump[i].urlToImage,
            'publishedAt': newsDump[i].publishedAt,
            'source': newsDump[i].source.name,
            'description': newsDump[i].description
          }
          newsArticles.push(newsData)
        }
      }
      result.newsArticles = newsArticles
    },
    (error) => {
      console.log(error);
    });

  route = 'https://api.tiingo.com/iex/' + ticker + '/prices?startDate=' + startDate + '&resampleFreq=4min&token=' + token;
  await axios.get(route)
    .then((response) => {
      var date_closing = [];
      response = response.data; 
      for (var i=0; i<response.length; i++) {
        var year = parseInt(response[i].date.slice(0,4))
        var month = parseInt(response[i].date.slice(5,7))
        var day = parseInt(response[i].date.slice(8,10))
        var utcDate = Date.UTC(year, month-1, day)
        date_closing.push([utcDate, response[i].close])
    }
    result.summaryTabCharts = date_closing;
    },
    (error) => {
      console.log(error);
    });
  
  var startDateLastTwoYears = new Date(new Date(startDateObject).setFullYear(new Date().getFullYear() - 2));

  startDateLastTwoYears = startDateLastTwoYears.getFullYear() + "-" + (startDateLastTwoYears.getMonth() + 1).toString().padStart(2, '0') + "-" + startDateLastTwoYears.getDate().toString().padStart(2, '0');
  
  route = 'https://api.tiingo.com/tiingo/daily/' + ticker + '/prices?startDate=' + startDateLastTwoYears + '&endDate='+ startDate + '&resampleFreq=monthly&token=' + token;
  
  await axios.get(route)
    .then((response) => {
      var historicalData = response.data;
      var sma_volume = [];
      var sma_ohlc = [];
      for (var i = 0; i < historicalData.length; i++) {
        var year = parseInt(historicalData[i].date.slice(0,4))
        var month = parseInt(historicalData[i].date.slice(5,7))
        var day = parseInt(historicalData[i].date.slice(8,10))
        var utcDate = Date.UTC(year, month-1, day)
        sma_ohlc.push([utcDate, historicalData[i].open, historicalData[i].high, historicalData[i].low, historicalData[i].close]);
        sma_volume.push([utcDate, historicalData[i].volume]);
      }

      result.sma_volume = sma_volume;
      result.sma_ohlc = sma_ohlc;
    }, 
    (error) => {
      console.log(error);
    });

  res.send({
    'result': result
  });
});


// Expose endpoints to port 3000
app.listen(3000, () => {
  console.log("Listening to port 3000");
});