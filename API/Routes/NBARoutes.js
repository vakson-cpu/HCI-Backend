const express=  require('express');
const NBAController = require("../Conrollers/NBAController")
const {check} = require('express-validator');
const router = express.Router();
router.get("/Games",NBAController.getGames);
router.get("/Games/Live",NBAController.getLive);
router.get("/Seasons",NBAController.getSeasons);
router.get("/Standings/TeamId",NBAController.getStandingsByTeamId);
router.get("/LeaderBoard",NBAController.getLeaderBoardOfConference);
router.get("/Teams/Name",NBAController.getTeamById);
router.get("/Games/Season",NBAController.getGamesByTeamAndSeason);
router.get("/Game/Stats",NBAController.getGameDetails);
router.get("/Games/Player/Stats",NBAController.getPlayerStatistics);
module.exports=router;