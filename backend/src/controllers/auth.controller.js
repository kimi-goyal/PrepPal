import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateToken } from "../utils/auth.util.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			return res.status(400).json({ success: false, message: "All fields are required" });
		}

		const userAlreadyExists = await User.findOne({ email });
		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const verifyPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verifyPasswordToken,
			verifyPasswordTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
		});

		await user.save();

		generateToken(res, user._id);

		// Sanitize return object payload safely
		const sanitizedUser = user.toObject();
		delete sanitizedUser.password;

		return res.status(201).json({
			success: true,
			message: "User created successfully",
			user: sanitizedUser,
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message || "Signup failed" });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verifyPasswordToken: code,
			verifyPasswordTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verifyPasswordToken = undefined;
		user.verifyPasswordTokenExpiresAt = undefined;
		await user.save();

		const sanitizedUser = user.toObject();
		delete sanitizedUser.password;

		return res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: sanitizedUser,
		});
	} catch (error) {
		console.error("Error in verifyEmail: ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		if (!email || !password) {
			return res.status(400).json({ success: false, message: "Please fill in all fields" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateToken(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		const sanitizedUser = user.toObject();
		delete sanitizedUser.password;

		return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: sanitizedUser,
		});
	} catch (error) {
		console.error("Error in login: ", error);
		return res.status(400).json({ success: false, message: error.message || "Login failed" });
	}
};

export const logout = async (req, res) => {
	res.cookie("jwt", "", { maxAge: 0 });
	return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		return res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.error("Error in forgotPassword: ", error);
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		return res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.error("Error in resetPassword: ", error);
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		return res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error in checkAuth: ", error);
		return res.status(400).json({ success: false, message: error.message });
	}
};