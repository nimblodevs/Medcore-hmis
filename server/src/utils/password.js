import bcrypt from "bcryptjs";
import env from "../config/env.js";

export const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
export const comparePassword = async (plainPassword, passwordHash) => bcrypt.compare(plainPassword, passwordHash);
