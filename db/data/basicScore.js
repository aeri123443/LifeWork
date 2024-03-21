import { db } from "../db/database.js";

const SELECT_JOIN =
  "SELECT users.userID, basicScores.userID, basicScores.nackScore, basicScores.wristScore FROM basicScores JOIN users ON basicScores.userID=users.userID";

export async function getById(id) {
  return db
    .execute(`${SELECT_JOIN} WHERE basicScores.userID=?`, [id])
    .then((result) => result[0]);
}

export async function create(userID, nackScore, wristScore) {
  return db
    .execute(
      "INSERT INTO basicScores (userID, nackScore, wristScore) VALUES (?, ?, ?)",
      [userID, nackScore, wristScore]
    )
    .then((result) => getById(result[0].insertId));
}

export async function getScores(req, res) {
  const id = req.params.id;
  const data = await scoreRepository.getAllByUserId(id);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `data id(${id}) not found` });
  }
}
