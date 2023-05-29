const express = require("express");
const UserController = require("../Conrollers/UserController");
const { check } = require("express-validator");
const router = express.Router();

router.get("/GetAll", UserController.getUsers);
router.post(
  "/Register",
  [
    check("password").matches(/^(?=[A-Z])(?=.*\d).{7,}$/),
    check("name").not().isEmpty().isLength({ min: 5 }),
    check("email").isEmail(),
  ],
  UserController.Register
);
router.post("/Login", UserController.LogIn);
router.put("/Verify", UserController.verifyUserAccount);
router.get("/favorites", UserController.getUsersFavorites);
router.post("/AddToFavorites",UserController.favoriteATeam);
router.post("/UnFavorite",UserController.unFavoriteATeam);
module.exports = router;
