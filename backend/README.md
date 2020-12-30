# Backend

## To setup backend locally 
- Create a developer account on [Tiingo](https://api.tiingo.com/)
    - Generate and acess the tiingo API token
- Create a developer account on [NewsAPI](https://newsapi.org/)
    - Generate and access the API key
- Create a .env file inside the backend folder
```
TIINGO_TOKEN=<your-tiingo-api-key>
NEWS_TOKEN=<your-news-org-token>
```
- Run `npm install`
- Start the backend server `node app.js`
- Use a API testing client like Postman and test  `http://localhost:3000/`. It should return a JSON with key status and value online.
- Refer app.js file for the endpoints and associated query paramaters 

