import bcrypt from "bcrypt";
import express from "express";
import * as db from "./data/dbUsers.js";
import * as characterdb from "./data/dbCharacters.js";

const router = express.Router();

// Új felhasználó hozzáadása
router.post("/", (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Missing data" });
    }
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const saved = db.SaveUser(username, email, hashedPassword);
    const user = db.GetUserById(saved.lastInsertRowid);
    res.status(201).json(user);
});

// Bejelentkezés
router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = db.GetUserByEmail(email);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!bcrypt.compareSync(password, db.GetPwById(user.id))) {
        return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json(user);
});

// Saját karakterek lekérése
router.get("/characters/:userId", (req, res) => {
    const userId = +req.params.userId;
    const characters = characterdb.GetAllUserCharacters(userId);
    res.status(200).json(characters);
});

// Új karakter hozzáadása
router.post("/characters", (req, res) => {
    const { name, real_name, birthday, species, gender, breed, isPublic, userId, image } = req.body;
    if (!name || !real_name || !birthday || !species || !gender || !breed || isPublic === undefined || userId === undefined) {
        return res.status(400).json({ message: "Missing data" });
    }
    const saved = characterdb.SaveUserCharacter(name, real_name, birthday, species, gender, breed, isPublic, userId, image || "");
    res.status(201).json({ message: "Character saved", changes: saved.changes });
});

// Saját karakter módosítása
router.put("/characters/:userId/:real_name", (req, res) => {
    const userId = +req.params.userId;
    const real_name = req.params.real_name;
    const { name, birthday, species, gender, breed, isPublic, image } = req.body;
    if (!name || !birthday || !species || !gender || !breed || isPublic === undefined) {
        return res.status(400).json({ message: "Missing data" });
    }
    const character = characterdb.GetUserCharacterByR_Name(userId, real_name);
    if (!character) {
        return res.status(404).json({ message: "Character not found" });
    }
    const updated = characterdb.UpdateUserCharacter(name, real_name, birthday, species, gender, breed, isPublic, userId, image || "");
    res.status(200).json({ message: "Character updated", changes: updated.changes });
});

// Saját karakter törlése
router.delete("/characters/:userId/:real_name", (req, res) => {
    const userId = +req.params.userId;
    const real_name = req.params.real_name;
    const character = characterdb.GetUserCharacterByR_Name(userId, real_name);
    if (!character) {
        return res.status(404).json({ message: "Character not found" });
    }
    const deleted = characterdb.DeleteUserCharacter(userId, real_name);
    res.status(200).json({ message: "Character deleted", changes: deleted.changes });
});

export default router;