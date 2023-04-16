const axios = require("axios");
const CustomResponse = require("../utils/CustomResponse");
const HttpError = require("../utils/HttpError");
const ColorThief = require("color-thief-node");

const getGames = async (req, res, next) => {
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/games`, {
      params: { date: "2022-02-12" },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data)
    .catch((err) => next(new HttpError(err, 500, false)));
  return res.status(200).json(result);
};
const getSeasons = async (req, res, next) => {
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/season`, {
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data)
    .catch((err) => err);

  return res.status(200).json(result);
};
const getLive = async (req, res, next) => {
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/games`, {
      params: { live: "all" },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data)
    .catch((err) => err);

  return res.status(200).json(result);
};

const getLeaderBoardOfConference = async (req, res, next) => {
  let {conference} = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/standings`, {
      params: { league: "standard", season: "2022", conference: conference },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  let sortedResult = result.sort(function (a, b) {
    return +b.conference.rank - +a.conference.rank;
  });

  sortedResult = sortedResult.reverse();

  let Response = new CustomResponse(
    { Leaderboard: sortedResult },
    "Succeeded",
    true
  );
  return Response.SendToClient(res, 200);
};

const getStandingsByTeamId = async (req, res, next) => {
  const { teamId } = req.body;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/standings`, {
      params: { league: "standard", season: "2022", team: `${teamId}` },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response[0])
    .catch((err) => next(new HttpError(err, 500, false)));
  let Response = new CustomResponse({
    team: result.team,
    conference: result.conference,
    division: result.division,
  });
  return Response.SendToClient(res, 200);
};
const getTeamById = async (req, res, next) => {
  const { id } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/teams`, {
      params: { id: `${id}` },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => err);
    console.log(result[0].logo)
    // const colorThief = new ColorThief();
    const color = await ColorThief.getColorFromURL(result[0].logo); //Ovde kupi sa linka

  return res.status(200).json({team:result,color:color});
};

const getGamesByTeamAndSeason =async(req,res,next)=>{
    const {season,teamId}=req.query;
    let result = await axios
      .get(`https://api-nba-v1.p.rapidapi.com/games`, {
        params: { season:season,team:teamId },
        headers: {
          "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
          "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
        },
      })
      .then((res) => res.data.response)
      .catch((err) => next(new HttpError(err, 500, false)));
    
    return res.status(200).json(result);

}
exports.getGames = getGames;
exports.getSeasons = getSeasons;
exports.getLive = getLive;
exports.getStandingsByTeamId = getStandingsByTeamId;
exports.getTeamById = getTeamById;
exports.getLeaderBoardOfConference = getLeaderBoardOfConference;
exports.getGamesByTeamAndSeason=getGamesByTeamAndSeason;