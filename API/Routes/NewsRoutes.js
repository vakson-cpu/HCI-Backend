const express=  require('express');
const NewsController = require("../Conrollers/NewsController")
const {check} = require('express-validator');
const router = express.Router();

router.get("/All",NewsController.getNewsByCategory);


module.exports=router;