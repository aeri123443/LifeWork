import { db } from "../db/database.js";

const SELECT_JOIN =
  "SELECT users.userID, scores.userID, scores.date, scores.score, scores.time FROM scores JOIN users ON scores.userID=users.userID";

const ORDER_DESC = "ORDER BY scores.date DESC";

export async function getAll() {
  return db
    .execute(`${SELECT_JOIN} ${ORDER_DESC}`) //
    .then((result) => result[0]);
}

export async function getById(id) {
  return db
    //.execute(`${SELECT_JOIN} WHERE scores.userID=?`[id]) //
    .then((result) => result[0][0]);
}

export async function getAllByUserId(userID) {
  return db
    .execute(`${SELECT_JOIN} WHERE scores.userID=? ${ORDER_DESC}`, [userID]) //
    .then((result) => result[0]);
}

export async function create(userID, score, time) {
  return db
    .execute(`INSERT INTO scores (userID, date, score, time) VALUES(?,?,?,?)`, [
      userID,
      new Date(),
      score,
      time,
    ])
    .then((result) => getById(result[0].insertId)); //
}

export async function getScoresByDateRange(id, startDate, endDate) {
  return db
    .execute(
      `${SELECT_JOIN} WHERE scores.userID=? AND scores.date >= ? AND scores.date <= ? ${ORDER_DESC}`,
      [id, startDate, endDate]
    )
    .then((result) => result[0]);
}

export async function update(score, time, userID) {
  return db
    .execute(
      "UPDATE scores SET (score, time) VALUES(?, ?) WHERE (userID, date) VALUES(?, ?)",
      [score, time],
      [userID, new Date()]
    )
    .then(() => getById(userID));
}
