
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { db } from "../prisma/db";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Generate JWT token
function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET!, {
    expiresIn: "7d",
  });
}

// REGISTER
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, valid email and password (at least 8 characters) are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db.orm.public.User
      .where({ email: normalizedEmail })
      .first();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.orm.public.User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// LOGIN WITH EMAIL AND PASSWORD
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await db.orm.public.User
      .where({ email: normalizedEmail })
      .first();

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// GOOGLE LOGIN
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: "Google login is not configured",
      });
    }

    if (typeof idToken !== "string" || !idToken) {
      return res.status(400).json({
        success: false,
        message: "Google ID token is required",
      });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or unverified Google account",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];

    // Find existing Google account
    let user = await db.orm.public.User
      .where({ googleId })
      .first();

    if (!user) {
      // Check whether an email/password account already exists
      user = await db.orm.public.User
        .where({ email })
        .first();

      if (user) {
        // Do not link an email already linked to another Google account
        if (user.googleId && user.googleId !== googleId) {
          return res.status(409).json({
            success: false,
            message: "This email is linked to another Google account",
          });
        }

        // Link the verified Google account to the existing user
        user = await db.orm.public.User
          .where({ id: user.id })
          .update({ googleId });
      } else {
        // Create a new Google user
        user = await db.orm.public.User.create({
          name,
          email,
          googleId,
        });
      }
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

export default router;
