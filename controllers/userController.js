import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id || req.user.userId;
    
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      { name: 1, email: 1, avatar: 1 }
    ).limit(20);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
}; 