const userModel = require("../models/user.model");

module.exports.checkAuth = async (req, res) => {
  try {
    res.status(200).json({ message: "Authenticated", user: req.user });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports.syncUser = async (req, res) => {
  // console.log("Sync User controller function was hit.");
  try {
    const { userId, email, username } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ message: 'User ID and email are required' });
    }

    let user = await userModel.findOne({ clerkId: userId });

    if (!user) {
      user = await userModel.create({
        clerkId: userId,
        username: username || email.split('@')[0],
        email: email,
      });
    }

    res.status(200).json({ message: 'User synced successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Failed to sync user' });
  }
};