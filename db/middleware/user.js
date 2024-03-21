import jwt from "jsonwebtoken";
import { config } from "../config.js";

import * as userRepository from "../data/user.js";

const AUTH_ERROR = { message: "Authentication Error" };

export const isAuth = async (req, res, next) => {
  // 1. 쿠키 여부 확인
  // 2. 헤더 검사

  let token;
  // check the header first
  const authHeader = req.get("Authorization");
  console.log(authHeader);

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  //if no token in to header, check the cookie
  if (!token) {
    token = req.cookies["token"];
  }

  if (!token) {
    return res.status(401).json(AUTH_ERROR);
  }

  jwt.verify(token, config.jwt.secretKey, async (error, decoded) => {
    if (error) {
      console.log("2");
      return res.status(401).json(AUTH_ERROR);
    }
    console.log("\n decoded: ", decoded, "\n");

    const user = await userRepository.findById(decoded.id);

    console.log("\n user: ", user, "\n");

    if (!user) {
      console.log("3");

      return res.status(401).json(AUTH_ERROR);
    }


    //req.userId = user.id;
    req.userId = user.userID;
    req.token = token;
    console.log("\n req.userId: ", req.userId);
    console.log("req.token: ", req.token, "\n");

    next();
  });
};
