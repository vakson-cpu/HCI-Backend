const Users = require("../../Data/Models/User");
const Roles = require("../../Data/Models/Roles");
const CustomResponse = require("../utils/CustomResponse");
const HttpError = require("../utils/HttpError");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const { validationResult } = require("express-validator");

const RoleEnums = require("../../Data/Constants/RoleEnums");
const nodemailer = require("nodemailer");

const getUsers = async (req, res, next) => {
  try {
    let users = await Users.find();
    let response = new CustomResponse(users, "Succeeded", true);
    return response.SendToClient(res, 200);
  } catch (err) {
    console.log(err);
    next(new HttpError("Error While Fetching from database", 404, false));
    return
  }
};

const getUserbyId = async (req, res, next) => {
  const { id } = req.params;
  try {
    let user;
    user = await Users.findById(id);
    if (user == null) next(new HttpError("User doesnt exist", 422, false));
    let response = new CustomResponse(user, "Succeeded", true);
    return response.SendToClient(res, 200);
  } catch (err) {
    next(new HttpError("Error While Fetching from database", 501, false));
    return
  }
};

function generateFourDigitNumber() {
  var min = 1000; // Minimum value (inclusive)
  var max = 9999; // Maximum value (inclusive)

  // Generate a random number within the specified range
  var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}
const Register = async (req, res, next) => {
  const { name, email, age, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    var error = new HttpError(
      "Validation Failed " + errors.array(),
      422,
      false
    );
     next(error);
     return
  }
  let existingUser;
  try {
    existingUser = await Users.findOne({ email: email });
  } catch (err) {
     next(
      new HttpError("Error While Fetching from database", 501, false)
    );
    return
  }
  if (existingUser) {
     next(new HttpError("User Exists", 422, false));
     return;
  }
  let hashedPassword;
  try {
    hashedPassword = await bycrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not hash password", 500, false);
     next(error);
     return
  }
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    type: "SMTP",
    host: "smtp.gmail.com",
    secure:true,
    auth: {
      user: "vakson12@gmail.com",
      pass: "malxzwrtegtgpsib",
    },
  });
  let code = generateFourDigitNumber();
  var mailOptions = {
    from: "vakson12@gmail.com",
    to: email,
    subject: "Verify Account",
    text: `Thank you for signin up on our app! Here is the code to verify your acc: ${code}`,
  };
try{
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
       next(new HttpError(err,500,false));
       return
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}catch(err){
  console.log(err);

}
  const newUser = new Users({
    name,
    age,
    email,
    password: hashedPassword,
    code: code,
  });
  try {
    let role = await Roles.findOne({ name: RoleEnums.USER });
    newUser.role = role;
  } catch (err) {
    const error = new HttpError("Error while Fetching role", 500, false);
     next(error);
     return
  }
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError(
      "Unknown Error occured while creating user",
      500,
      false
    );
     next(error);
     return
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      "tajni_string",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Error while creating token", 500, false);
     next(error);
     return
  }

  res.status(201);
  let response = new CustomResponse(
    { user: newUser, token: token },
    "User Created Successfully",
    true
  );
  return response.SendToClient(res, 201);
};

const LogIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var error = new HttpError("Validation Failed ", 422, false);
     next(error);
     return
  }
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await Users.findOne({ email: email }).populate("role");
  } catch (err) {
    const error = new HttpError("Could not find the user", 500, false);
     next(error);
     return
  }

  if (!existingUser) {
    const error = new HttpError(
      "Could not find the user for the provided id",
      401,
      false
    );
     next(error);
     return
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bycrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Hashing failed", 500, false);
     next(error);
     return
  }

  if (isValidPassword == false) {
    const error = new HttpError("Invalid Credentials", 401, false);
     next(error);
     return
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role.name,
      },
      "tajni_string",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Greska u jwt", 500, false);
     next(error);
     return
  }
  let response = new CustomResponse(
    {
      userId: existingUser._id,
      email: existingUser.email,
      token: token,
      role: existingUser.role,
      verified: existingUser.isVerified,
      name: existingUser.name,
    },
    "Successfully Logged In ",
    true
  );

  return response.SendToClient(res, 200);
};
const verifyUserAccount = async (req, res, next) => {
  const { code, userId } = req.query;
  console.log("code ", code);
  console.log("\n userId : ", userId);
  let existingUser;
  try {
    console.log("tu dodje...");
    const cleanedUserId = userId.slice(1, -1); // Remove double quotes from the user ID
    console.log(cleanedUserId);
    existingUser = await Users.findById(cleanedUserId);
    console.log("existingcode", existingUser.code);
  } catch (err) {
    console.log(err);
    const error = new HttpError("Database Error!", 500, false);
     next(error);
     return
  }
  if (code === existingUser.code || +code === +existingUser.code) {
    existingUser.isVerified = true;

    try {
      await existingUser.save();
      res.status(200);
      let response = new CustomResponse({}, "User Verified Successfully", true);
      return response.SendToClient(res, 201);
    } catch (err) {
      const error = new HttpError("Failed To Update", 500, false);
       next(error);
       return

    }
  } else { next(new HttpError("Code invalid", 501, false));
  return

}
};
function getTeamById(teamId, leaderboard) {
  const team = leaderboard.filter((item) => item.id === teamId);
  return team[0] || null;
}
const getUsersFavorites = async (req, res, next) => {
  let { userId } = req.query;
  // let easternResult = await axios
  //   .get(`https://api-nba-v1.p.rapidapi.com/standings?conference=east&season=2022&league=standard`, {
      
  //     headers: {
  //       "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
  //       "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
  //     },
  //   })
  //   .then((res) => res.data.response)
  //   .catch((err) => next(new HttpError(err, 500, false)));
  // let westernResult = await axios
  //   .get(`https://api-nba-v1.p.rapidapi.com/standings?conference=west&season=2022&league=standard`, {
  //     headers: {
  //       "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
  //       "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
  //     },
  //   })
  //   .then((res) => res.data.response)
  //   .catch((err) => next(new HttpError(err, 500, false)));
  // console.log(easternResult)
  // let easternTeams = easternResult.map((item) => item.team.id);
  // let westernTeams = westernResult.map((item) => item.team.id);
  const trimmedUserId = userId.slice(1,-1)
  let allTeams= await axios
    .get(`https://api-nba-v1.p.rapidapi.com/teams`, {
      headers: {
        "X-RapidAPI-Key": "3be10b1358msh51fd936d1571daep1230ccjsn529137f75def",
        "X-RapidAPI-Host": "api-nba-v1.p.rapidapi.com",
      },
    })
    .then((res) => res.data.response)
    .catch((err) => next(new HttpError(err, 500, false)));
      let allTeamsIds = allTeams.map((item) => item.id);

  let user
  try{
  user = await Users.findById(trimmedUserId);
  console.log("user je : ",user);}catch(err){
    return  next(new HttpError(err,404,false));
  }
  const favoriteIds = user.favorites;
  const favoriteTeams = [];
  allTeamsIds.forEach((element) => {
    if (favoriteIds.includes(element)) {
      favoriteTeams.push(getTeamById(element,allTeams));
    }
  });
  // westernTeams.forEach((element) => {
  //   if (favoriteIds.includes(element)) {
  //     favoriteTeams.push(getTeamById(element,westernResult));
  //   }
  // });

  let Response = new CustomResponse(
    { favorites: favoriteTeams },
    "Succeeded",
    true
  );
  return Response.SendToClient(res, 200);
};

const favoriteATeam=async(req,res,next)=>{
  const {userId,teamId} = req.query;
  console.log(teamId)
  let user;
  try{
    const trimmedUserId=userId.slice(1,-1);
    console.log("user id : ",userId," \n")
  user =await Users.findById(trimmedUserId);
  console.log(user)
  }catch(err){
    throw(new HttpError("Failed to fetch user",404,false));
  }
  user.favorites.push(teamId);
  try{
    await user.save();
  }catch(err){
    throw(new HttpError("Failed to save",501,false))
  }
  let Response = new CustomResponse(
    { favorites: user.favorites },
    "Succeeded",
    true
  );
  return Response.SendToClient(res, 200);}

const unFavoriteATeam=async(req,res,next)=>{
  let {userId,teamId} = req.query;
  let user
  try{
    const trimmedUserid = userId.slice(1,-1);
    user = await Users.findById(trimmedUserid);
    let oldFavorites = user.favorites;
    let newFavorites = oldFavorites.filter(item=>item!== +teamId);
    user.favorites=newFavorites;
    await user.save()
  }catch(err){
     next(new HttpError(err,500,false));
  }
  let Response = new CustomResponse(
    { favorites: user.favorites },
    "Succeeded",
    true
  );
  return Response.SendToClient(res, 200);
}
module.exports.getUsers = getUsers;
module.exports.Register = Register;
module.exports.LogIn = LogIn;
module.exports.verifyUserAccount = verifyUserAccount;
module.exports.getUsersFavorites = getUsersFavorites;
module.exports.favoriteATeam=favoriteATeam;
module.exports.unFavoriteATeam=unFavoriteATeam;