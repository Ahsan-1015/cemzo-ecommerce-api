const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // Optionally set HTTP-only cookie
  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return ApiResponse.success(
    res,
    201,
    'User registered successfully',
    result
  );
});

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return ApiResponse.success(
    res,
    200,
    'User logged in successfully',
    result
  );
});

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);

  return ApiResponse.success(
    res,
    200,
    'Current user profile retrieved successfully',
    { user }
  );
});

module.exports = {
  register,
  login,
  getMe
};
