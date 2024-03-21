import * as scoreRepository from "../data/score.js";

export async function getScores(req, res) {
  const id = req.params.id;
  const data = await scoreRepository.getAllByUserId(id);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `Data for id(${id}) not found` });
  }
}

export async function getScoresByDateRange(req, res) {
  const id = req.params.id;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Both startDate and endDate are required" });
  }

  const data = await scoreRepository.getScoresByDateRange(
    id,
    startDate,
    endDate
  );
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({
      message: `Data for id(${id}) not found in the specified date range`,
    });
  }
}

export async function createScore(req, res, next) {
  const { userID, score, time } = req.body;
  console.log
  const data = await scoreRepository.create(userID, score, time);
  res.status(201).json(data);
}

export async function updateScore(req, res, next) {
  const id = req.params.id;
  const text = req.body.text;
  const data = await scoreRepository.update(id, text);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `Score data for id(${id}) not found` });
  }
}
