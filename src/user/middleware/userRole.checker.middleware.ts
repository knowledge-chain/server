import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Usermodel from "../../database/models/user.model";
import { IUser } from "../../database/interface/user.interface";


interface JwtPayload {
    email: string;
    _id: string;
    userId: any;
}

interface CustomRequest extends Request {
    jwtPayload?: JwtPayload;
    user: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const checkUserRole = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {

    let secret = process.env.JWT_USER_SECRET_KEY;
  // Get JWT from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    // Verify JWT and extract payload
    const payload = jwt.verify(token, secret!) as unknown as JwtPayload;
   
    // Check if email and mobile are in the MongoDB and belong to an admin role
    const user = await Usermodel.findOne({
      _id: payload.userId
    });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    // Add the payload to the request object for later use
    req.user = user;
    
    // Call the next middleware function
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid authorization token" });
  }
}