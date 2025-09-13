module.exports = {
  secretOrKey: process.env.JWT_SECRET || "your_super_secret_jwt_key_here_change_this_in_production",
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/crm-portal",
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
};
