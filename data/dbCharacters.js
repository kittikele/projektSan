import Database from "better-sqlite3";

const db = new Database("./data/characters.db");

export const GetAllUserCharacters = (userId) => db.prepare('SELECT * FROM sanrio WHERE userId = ?').all(userId);

export const GetAllPublicCharacters = () => db.prepare('SELECT * FROM sanrio WHERE isPublic = 1').all(); // Publikus 

export const GetUserCharacterByR_Name = (userId, real_name) => db.prepare('SELECT * FROM sanrio WHERE userId = ? AND real_name = ?').get(userId, real_name);

export const GetPublicCharacterByR_Name = (real_name) => db.prepare('SELECT * FROM sanrio WHERE real_name = ? AND isPublic = 1').get(real_name); // Publikus

export const UpdateUserCharacter = (name, real_name, birthday, species, gender, breed, isPublic, userId, image) => db.prepare('UPDATE sanrio SET name = ?, birthday = ?, species = ?, gender = ?, breed = ?, isPublic = ?, image = ? WHERE userId = ? AND real_name = ?').run(name, birthday, species, gender, breed, isPublic, image, userId, real_name);

export const SaveUserCharacter = (name, real_name, birthday, species, gender, breed, isPublic, userId, image) => db.prepare('INSERT INTO sanrio (name, real_name, birthday, species, gender, breed, isPublic, userId, image) VALUES (?,?,?,?,?,?,?,?,?)').run(name, real_name, birthday, species, gender, breed, isPublic, userId, image);

export const DeleteUserCharacter = (userId, real_name) => db.prepare('DELETE FROM sanrio WHERE userId = ? AND real_name = ?').run(userId, real_name);
