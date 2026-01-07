import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
type JwtPayloadType = { userId: string };

export const signToken = (payload: JwtPayloadType) => {

  const options: SignOptions = { expiresIn: 7 * 24 * 60 * 60 };
  return jwt.sign(payload, JWT_SECRET as Secret, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET as Secret) as JwtPayloadType;
  } catch {
    return null;
  }
};
