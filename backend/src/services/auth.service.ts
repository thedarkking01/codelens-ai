import { userRepository } from "../repositories/user.repository";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";
import { AppError } from "../utils/app-error";

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken({
      userId: user.id,
    });

    // Return safe user data
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Login existing user
   */
  async login(data: LoginInput) {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    // Compare password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
    });

    // Return safe user data
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

export const authService = new AuthService();
