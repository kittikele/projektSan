import express from "express";
import * as db from "./data/dbCharacters.js";

const router = express.Router();

router.get("/", (req, res) => {
  const characters = db.GetAllPublicCharacters();
  res.status(200).json(characters);
});

router.get("/:real_name", (req, res) => {
  const character = db.GetPublicCharacterByR_Name(req.params.real_name);
  if (!character) {
    return res.status(404).json({message: "Not found"});
  }
  res.status(200).json(character);
});



export default router;