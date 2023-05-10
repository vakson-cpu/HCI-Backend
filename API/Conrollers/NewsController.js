const axios = require("axios");
const CustomResponse = require("../utils/CustomResponse");
const HttpError = require("../utils/HttpError");
//2f506c983a0846fb96ca72048e64a48d

const getNews = async (req, res, next) => {
  let result = await axios
    .get(`https://nba-latest-news.p.rapidapi.com/articles`, {
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data)
    .catch((err) => next(new HttpError(err, 500, false)));
  console.log(result);
  return res.json(result);
};

const getNewsByCategory = async (req, res, next) => {
  let result = await axios
    .get(
      "https://newsapi.org/v2/top-headlines",
      {
        params: {
            country: 'us', // Replace with your desired country code
            category: 'sports',
            apiKey: "2f506c983a0846fb96ca72048e64a48d",
            q:"NBA"
          }
      }
    )
    .then((res) => res.data)
    .catch((err) => err);
    return res.json(result);
};
exports.getNews = getNews;
exports.getNewsByCategory=getNewsByCategory;