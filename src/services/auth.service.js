const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - { name, email, password, role }
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const user = await User.create(userData);
    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Login user with credentials
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = user.generateAuthToken();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Get user profile by ID
   * @param {string} userId
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found.');
    }
    return user;
  }
}

module.exports = new AuthService();
