import express from "express";
import characters from "./appCharacters.js";
import users from "./appUsers.js";

const app = express();
const PORT = 3300;

app.use(express.json());
app.use(express.static("index"));

app.use("/api/characters", characters);
app.use("/api/users", users);

app.listen(PORT, () => {
  console.log(`Server runs on port: ${PORT}`);
});