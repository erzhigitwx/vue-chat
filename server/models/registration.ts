import jwt from "jsonwebtoken";
import { UserData } from "../types/user";

export function generateToken(userData: Pick<UserData, "nickname" | "email">) {
  const token = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: "48h",
  });

  return token;
}
