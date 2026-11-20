import Database from "better-sqlite3";

const db = new Database("./data/users.db");

export const GetAllUsers = () => db.prepare(`SELECT id, username, email FROM users`).all();

export const GetUserById = (id) => db.prepare(`SELECT id, username, email FROM users WHERE id = ?`).get(id);

export const GetUserByEmail = (email) => db.prepare(`SELECT id, username, email FROM users WHERE email = ?`).get(email);

export const GetPwById = (id) => db.prepare(`SELECT password FROM users WHERE id = ?`).get(id).password

export const SaveUser = (username, email, password) => db.prepare(`INSERT INTO users (username, email, password) VALUES (?,?,?)`).run(username, email, password);
