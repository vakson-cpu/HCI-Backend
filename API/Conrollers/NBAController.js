const axios = require("axios");
const CustomResponse = require("../utils/CustomResponse");
const HttpError = require("../utils/HttpError");
const ColorThief = require("colorthief");
// "color-thief-node": "^1.0.4"
function formatDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}
const getGames = async (req, res, next) => {
  // let dateFormat = formatDate()
  const currentDate = new Date();

  // One day before the current date
  const oneDayBefore = new Date(currentDate);
  oneDayBefore.setDate(currentDate.getDate() - 1);
  
  // Four days after the current date
  const fourDaysAfter = new Date(currentDate);
  fourDaysAfter.setDate(currentDate.getDate() + 4);  
  let startDate = oneDayBefore.toISOString();
  let endDate = fourDaysAfter.toISOString();
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/games`, {
      params: {season: '2022'},
            headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data)
    .catch((err) => next(new HttpError(err, 500, false)));
    let filteredArray = result.response.filter(item=>item.date.start>= startDate).sort((a, b) => new Date(a.date.start) - new Date(b.date.start));
    let finishedGames = filteredArray.filter(item=>item.status.long==="Finished")
    let unFinishedGames =filteredArray.filter(item=>item.status.long!=="Finished")
    
  return res.status(200).json(filteredArray);
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
  let { conference } = req.query;
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
  
  let result;
  console.log("Primljeni id je : ",id);
  try {
    result = await axios
      .get(`https://api-nba-v1.p.rapidapi.com/teams`, {
        params: { id: `${id}` },
        headers: {
          "X-RapidAPI-Key":
            "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
          "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
        },
      })
      .then((res) => res.data.response)
      .catch((err) => err);
  } catch (err) {
    const error = new HttpError(err, 500, false);
    next(error);
  }
  return res.status(200).json({ team: result, color: [34,34,34] });
};

const getGamesByTeamAndSeason = async (req, res, next) => {
  const { season, teamId } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/games`, {
      params: { season: season, team: teamId },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  return res.status(200).json(result);
};
const getGameDetails = async (req, res, next) => {
  const { gameId } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/games/statistics`, {
      params: { id: gameId },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  return res.status(200).json(result);
};
const getPlayerStatistics = async (req, res, next) => {
  const { gameId } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/players/statistics`, {
      params: { game: gameId },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  // let points=result.sort((a, b) => b.points - a.points).slice(0,3);
  // let assists=result.sort((a,b)=>b.assists-a.assists).slice(0,3);
  // let rebounds=result.sort((a,b)=>b.totReb-a.totReb).slice(0,3);
  let filteredList = result
    .filter((item) => item.min > 0)
    .sort(
      (a, b) =>
        b.points - a.points
    );
  return res
    .status(200)
    .json({ players: filteredList, number: filteredList.length });
};



const searchForTeam = async (req, res, next) => {
  const { searchText } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/teams`, {
      params: { search:searchText },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  return res.status(200).json(result);
};
const searchForPlayers = async (req, res, next) => {
  const { searchText } = req.query;
  let result = await axios
    .get(`https://api-nba-v1.p.rapidapi.com/players`, {
      params: { search:searchText },
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));

  return res.status(200).json(result);
};





// params: {search: 'atl'},

exports.getGames = getGames;
exports.getSeasons = getSeasons;
exports.getLive = getLive;
exports.getStandingsByTeamId = getStandingsByTeamId;
exports.getTeamById = getTeamById;
exports.getLeaderBoardOfConference = getLeaderBoardOfConference;
exports.getGamesByTeamAndSeason = getGamesByTeamAndSeason;
exports.getPlayerStatistics = getPlayerStatistics;
exports.getGameDetails = getGameDetails;
exports.searchForPlayers=searchForPlayers;
exports.searchForTeam=searchForTeam;