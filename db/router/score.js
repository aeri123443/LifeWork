import express from "express";
import "express-async-errors";
import * as scoreController from "../controller/score.js";
import { isAuth } from "../middleware/user.js";

const router = express.Router();

// GET /score/:id
router.get("/:id", scoreController.getScores);

// GET /score/statistics/:id?startDate=xxxx-xx-xx&endDate=xxxx-xx-xx
router.get("/statistics/:id", scoreController.getScoresByDateRange);

// POST /score
router.post("/", isAuth, scoreController.createScore);

// 사용할지 안할지 미지수
// PUT /score/:id
router.put("/:id", isAuth, scoreController.updateScore);

export default router;
