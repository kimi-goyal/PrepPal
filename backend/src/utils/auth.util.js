import jwt from "jsonwebtoken";

export const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
        httpOnly: true, // XSS protection
        secure: isProduction, // HTTPS only in production
        sameSite: isProduction ? "none" : "strict", // Allow cross-origin cookies in production
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};
