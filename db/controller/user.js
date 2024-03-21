import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {} from "express-async-errors";
import * as userRepository from "../data/user.js";
import { config } from "../config.js";
import * as basicScoreRepository from "../data/basicScore.js";

export async function signup(req, res) {
  const { userID, username, password, email, createAt } = req.body;
  const found = await userRepository.findById(userID);
  if (found) {
    return res.status(409).json({ message: `${userID} already exists` });
  }
  const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const userId = await userRepository.createUser({
    userID,
    password: hashed,
    username,
    email,
    createAt,
  });
  const token = createJwtToken(userId);
  setToken(res, token);
  res.status(201).json({ token, userID });
}

export async function login(req, res) {
  const { userID, password } = req.body;
  const id = await userRepository.findById(userID);
  if (!id) {
    return res.status(401).json({ message: "Invalid id or password" });
  }
  const isValidPassword = await bcrypt.compare(password, id.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid id or password" });
  }
  const token = createJwtToken(id.userID);
  setToken(res, token);
  res.status(200).json({ token, userID });
}

function createJwtToken(id) {
  return jwt.sign({ id }, config.jwt.secretKey, {
    expiresIn: config.jwt.expiresInSec,
  });
}

function setToken(res, token) {
  const options = {
    maxAge: config.jwt.expiresInSec * 1000, //쿠키 만료 시간
    httpOnly: true,
    sameSite: "none", // 동일한 도메인이 아니더라도 http가 동작
    secure: true,
  };
  res.cookie("token", token, options); //HTTP-ONLY cookie
}

export async function basicScore(req, res) {
  const { userID, nackScore, wristScore } = req.body;
  const data = await basicScoreRepository.create(userID, nackScore, wristScore);
  res.status(201).json(data);
}

export async function getScores(req, res) {
  const id = req.params.id;
  const data = await basicScoreRepository.getById(id);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(404).json({ message: `data id(${id}) not found` });
  }
}

export async function me(req, res, next) {
  console.log(req.userId);
  const user = await userRepository.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ token: req.token, username: user.username });
}
