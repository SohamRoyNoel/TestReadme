const User = require("../models/User");
// Error Middleware
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");


// @desc    Register a User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {

      const { name, email, password, role } = req.body;

      const user = await User.create({
            name,
            email,
            password,
            role
      });

      sendTokenResponse(user, 200, res);
});


// @desc    Login a User
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
      console.log("Login");

      const { email, password } = req.body;    
      
      // check if that is password : LOGIN does not go through model so check manually
      if(!email || !password) {
            return next(new ErrorResponse('Please provide email or password', 400));
      }

      // +password as we have to include password, which will be validated with encrypted one
      const user = await User.findOne({ email }).select('+password');

      if(!user){
            return next(new ErrorResponse(`User can not be authenticated`, 404));
      } 

      // check if Password matches
      const isPassword = await user.signInWithJwt(password);

      if(!isPassword){
            return next(new ErrorResponse(`User can not be authenticated`, 404)); 
      }

      const token = user.getJwtToken();
      
      res.status(200).json({ success: true, token });
});

