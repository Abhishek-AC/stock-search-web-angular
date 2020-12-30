// Import express
const express = require('express');

// import axios 
const axios = require("axios");

// import cors
var cors = require('cors');

// Import body parser
const bodyParser = require('body-parser');

// Initialize express
const app = express();
// Use cors 
app.use(cors());

// Use the body parser middleware to allow 
// express to recognize JSON requests
app.use(bodyParser.json());

const dotenv = require('dotenv');
dotenv.config();

// Endpoint to check if API is working
app.get('/', (req, res) => {
  res.send({
    status: 'online'
  })
});

app.get('/api/details', async (req, res) => {
 
  var tiingo_token = process.env.TIINGO_TOKEN;
  var newsApiKey = process.env.NEWS_TOKEN;
  
  var ticker = req.query.ticker;
  var hitNumber = req.query.hitNumber;

  var route;
  var result = {};
  var details = {};
  var incorrectTicker = true;
  const monthNames = ["", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  route = 'https://api.tiingo.com/tiingo/daily/' + ticker + '?token=' + tiingo_token;

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
      result['error'] = "Incorrect Ticker Symbol";
      incorrectTicker = false;
    });

  if (incorrectTicker) {
    route = 'https://api.tiingo.com/iex?tickers=' + ticker + '&token=' + tiingo_token;
    await axios.get(route)
      .then((response) => {
        var change = response.data[0].last - response.data[0].prevClose;
        
        var currentTimestamp = new Date();

        var changeMarketStatus = (currentTimestamp - new Date(response.data[0].timestamp)) / 1000;

        var temp = {
          'last': response.data[0].last,
          'change': parseFloat(change.toFixed(2)),
          'changePercentage': parseFloat(((change * 100) / (response.data[0].prevClose)).toFixed(2)),
          'currentTimestamp': currentTimestamp,
        }
        var summary = {
          'highPrice': (response.data[0].high).toFixed(2),
          'lowPrice': (response.data[0].low).toFixed(2),
          'openPrice': (response.data[0].open).toFixed(2),
          'prevClose': (response.data[0].prevClose).toFixed(2),
          'volume': response.data[0].volume,
          'startDate': startDate,
          'description': description
        };

        if (changeMarketStatus > 60) {
          temp.marketStatus = 'close';
          temp.lastTimestamp = response.data[0].timestamp;

          var chartDate = new Date(response.data[0].timestamp);

          startDate = chartDate.getFullYear() + "-" + (chartDate.getMonth() + 1).toString().padStart(2, '0') + "-" + chartDate.getDate().toString().padStart(2, '0');
          startDateObject = chartDate;
        }
        else {
          temp.marketStatus = 'open';
          summary.midPrice = response.data[0].mid == null ? '-' : (response.data[0].mid).toFixed(2);
          summary.askPrice = response.data[0].askPrice == null ? '-' : (response.data[0].askPrice).toFixed(2);
          summary.askSize = response.data[0].askSize == null ? '-' : (response.data[0].askSize).toFixed(2);
          summary.bidSize = response.data[0].bidSize == null ? '-' : (response.data[0].bidSize).toFixed(2);
          summary.bidPrice = response.data[0].bidPrice == null ? '-' : (response.data[0].bidPrice).toFixed(2);
          startDate = currentTimestamp.getFullYear() + "-" + (currentTimestamp.getMonth() + 1).toString().padStart(2, '0') + "-" + currentTimestamp.getDate().toString().padStart(2, '0');
          startDateObject = currentTimestamp;
        }
        result.details = Object.assign({}, result.details, temp)
        result.summary = summary;
      },
        (error) => {
          console.log(error);
        });

    var newsArticles = []

    if (hitNumber == 'first') {
      route = 'https://newsapi.org/v2/everything?apiKey=' + newsApiKey + '&q=' + ticker;
      await axios.get(route)
        .then((response) => {
          var newsDump = response.data.articles;
          for (var i = 0; i < newsDump.length; ++i) {
            if (newsDump[i].title != null && newsDump[i].url != null && newsDump[i].urlToImage && newsDump[i].publishedAt != null) {
              let publishedDate = monthNames[newsDump[i].publishedAt.slice(5, 7)] + " " + newsDump[i].publishedAt.slice(8, 10) + ", " + newsDump[i].publishedAt.slice(0, 4);
              var newsData = {
                'title': newsDump[i].title,
                'url': newsDump[i].url,
                'urlToImage': newsDump[i].urlToImage,
                'publishedAt': publishedDate,
                'publishedAtUnformatted': newsDump[i].publishedAt,
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
    }

    route = 'https://api.tiingo.com/iex/' + ticker + '/prices?startDate=' + startDate + '&resampleFreq=4min&token=' + tiingo_token;
    console.log(route);
    await axios.get(route)
      .then((response) => {
        var date_closing = [];
        response = response.data;
        for (var i = 0; i < response.length; i++) {
          var utcDate = new Date(response[i].date);
          utcDate = utcDate.getTime();
          date_closing.push([utcDate, response[i].close])
        }
        result.summaryTabCharts = date_closing;
      },
        (error) => {
          console.log(error);
        });

    if (hitNumber == 'first') {
      var startDateLastTwoYears = new Date(new Date(startDateObject).setFullYear(new Date().getFullYear() - 2));

      startDateLastTwoYears = startDateLastTwoYears.getFullYear() + "-" + (startDateLastTwoYears.getMonth() + 1).toString().padStart(2, '0') + "-" + startDateLastTwoYears.getDate().toString().padStart(2, '0');


      route = 'https://api.tiingo.com/tiingo/daily/' + ticker + '/prices?startDate=' + startDateLastTwoYears + '&endDate=' + startDate + '&resampleFreq=daily&token=' + tiingo_token;

      await axios.get(route)
        .then((response) => {
          var historicalData = response.data;
          var sma_volume = [];
          var sma_ohlc = [];
          for (var i = 0; i < historicalData.length; i++) {
            var utcDate = new Date(historicalData[i].date);
            utcDate = utcDate.getTime();
            sma_ohlc.push([utcDate, historicalData[i].open, historicalData[i].high, historicalData[i].low, historicalData[i].close]);
            sma_volume.push([utcDate, historicalData[i].volume]);
          }
          result.sma_volume = sma_volume;
          result.sma_ohlc = sma_ohlc;
        },
          (error) => {
            console.log(error);
          });
    }
    res.status(200).send(result);
  }
  else {
    res.status(200).send(result);
  }
});

app.get('/api/autocomplete', async (req, res) => {
  var q = req.query.q;
  var tiingo_token = process.env.TIINGO_TOKEN;
  var result = [];
  route = 'https://api.tiingo.com/tiingo/utilities/search?query=' + q + '&token=' + tiingo_token;
  await axios.get(route)
    .then((response) => {

      response = response.data;
      for (var i = 0; i < response.length; ++i) {
        if (response[i].name != null)
          result.push({
            'name': response[i].name,
            'ticker': response[i].ticker
          })
      }
    },
      (error) => {
        console.log(error);
      });
  res.send(result);
});

app.get('/api/watchlist', async (req, res) => {

  var tickers = [];
  tickers = req.query.q;
  var tiingo_token = process.env.TIINGO_TOKEN;
  var route = 'https://api.tiingo.com/iex/?tickers=';
  var result = {};
  if (typeof (tickers) === 'string') {
    route += tickers + ',' + '&token=' + tiingo_token;
  }
  else {
    for (var i = 0; i < tickers.length - 1; ++i)
      route += tickers[i] + ','
    route += tickers[i] + '&token=' + tiingo_token;
  }
  // console.log(route);
  await axios.get(route)
    .then((response) => {
      response = response.data;
      for (var i = 0; i < response.length; ++i) {
        var change = response[i].last - response[i].prevClose;
        result[response[i].ticker] = {
          'last': response[i].last,
          'change': parseFloat(change.toFixed(2)),
          'changePercentage': parseFloat(((change * 100) / (response[i].prevClose)).toFixed(2)),
        };
      }
    },
      (error) => {
        console.log(error);
      });
  res.status(200).send(result);
});

var port = process.env.PORT || 3000;
// Expose endpoints to port 3000
app.listen(port, () => {
  console.log("Listening to port 3000");
});