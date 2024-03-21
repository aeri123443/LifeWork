import { db } from "../db/database.js";

export async function findById(id) {
  return db
    .execute("SELECT * FROM users WHERE userID=?", [id])
    .then((result) => result[0][0]);
}

export async function createUser(user) {
  const { userID, username, password, email, createAt } = user;
  return db
    .execute(
      "INSERT INTO users (userID, username, password, email, createAt) VALUES (?, ?, ?, ?, ?)",
      [userID, username, password, email, createAt]
    )
    .then((result) => result[0].insertId);
}
