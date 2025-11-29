const SuperAdmin = require("../models/Admin_User.js");
const CreditHistory = require("../models/CreditHistory.js");
const Claims = require("../models/Claim.js");
const Subadmin = require("../models/subadmin.js");
const Payout = require("../models/Payout.js");
const ErrorResponse = require("../utlis/errorresponse.js");
const jwt = require("jsonwebtoken");
const catchAsyncerror = require("../middleware/catchAsyncerror.js");
const Appointment = require("../models/User.js");
var validator = require("email-validator");
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const { JsonWebTokenError } = require("jsonwebtoken");
const Razorpay = require("razorpay");
const { default: axios } = require("axios");
const { mongoose, mongo, Types } = require("mongoose");
const Bankdata = require("../models/Bankdata.js");
const Claim = require("../models/Claim.js");
const BeneficiaryAccount = require("../models/BenificheryAccount.js");
const BulkpayoutUserfile = require("../models/BulkpayoutUserfile.js");
const BulkBenificieryaccountfiles = require("../models/BulkBenificieryaccountfile.js");
const BulkPayoutfiles = require("../models/BulkPayoutfile.js");
const moment = require("moment-timezone");
const { google } = require("googleapis");
const { decryptApiKey, encryptApiKey, encrypttrexo } = require("../utils/cryptoHelper.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
// const { log } = require("node:console");
const publicKey = fs.readFileSync("./newpg.pem", { encoding: "utf8" });

async function isEmailValid(email) {
  return emailValidator.validate(email);
}
const startOfDay = moment().tz("Asia/Kolkata").startOf("day").toDate();
const endOfDay = moment().tz("Asia/Kolkata").endOf("day").toDate();
const crypto = require("crypto");


const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
};
function generateRandomId(length = 12) {
  // Generate a random 12-digit hexadecimal string (often sufficient)
  return Math.random().toString(36).substring(2, length + 2).toUpperCase();
}
exports.register = async (req, res) => {
  const { Name, User_name, email, Phone, Status, Password, role, Pages } =
    req.body;
  // const { valid, reason, validators } = await isEmailValid(email);

  const validemail = validator.validate(email);

  if (!Name || !User_name || !email || !Password || !role) {
    return res.status(400).json("plese fill all input ");
  }

  if (validemail == false) {
    return res.status(400).json("plz enter valid email");
  }
  try {
    const user = await SuperAdmin.findOne({ email });

    if (user) {
      res.status(400).json("User already exist");
    } else {
      const user = await SuperAdmin.create({
        Name,
        User_name,
        email,
        Phone,
        Status,
        Password,
        role,
        Pages,
      });
      return res.status(200).json("Admin created");
    }
  } catch (error) {
    //console.log(error.message);
  }
};
// Define OTP expiry duration in minutes
const OTP_EXPIRY_MINUTES = 10; // OTP valid for 10 minutes

exports.login = catchAsyncerror(async (req, res, next) => {
  const { email, Password } = req.body;
  try {

    if (!email || !Password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const models = [SuperAdmin, Subadmin, User];
    let user = null;

    for (const model of models) {
      const foundUser = await model.findOne({ email }).select("+Password");
      if (foundUser) {
        user = foundUser;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials: Email not found" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Contact admin for account activation" });
    }

    const isMatch = await user.matchPassword(Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
      return
    }
    if (user.role == "User") {

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save({ validateBeforeSave: false });

      const mobileNumber = user.Phone; // Assuming user.mobile is the number
      const countryCode = 91; // Example: 91 for India. Change as required.
      const authkey = "881d206fdc825aa7"; // Your Authkey API Key

      const smsMessage = encodeURIComponent(
        `Your OTP code is ${otp}. It is valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this with anyone.`
      );

      const apiUrl = `https://api.authkey.io/request?authkey=${authkey}&mobile=${mobileNumber}&country_code=${countryCode}&otp=${otp}&sid=27450`;

      try {
        const response = await axios.get(apiUrl);

        // Basic check for success (Authkey API usually returns a success message or LogID)
        if (response.data.Message === "Submitted Successfully" || response.data.LogID) {
          // console.log('Authkey SMS API Response:', response.data);
        } else {
          // Log an error if the response indicates a failure, but proceed to return a generic success message to the user
          console.error('Authkey SMS failed:', response.data);
        }

      } catch (error) {
        console.error('Error sending OTP via Authkey SMS:', error.message);
        // It's often better to not throw a user-facing error here, as the user doesn't need to know the transport failed.
        // However, for debugging, you might want to return a 500 error.
        // For this example, we log and proceed.
      }

      // --------------------------------------------------------------------------------
      // --------------------------------------------------------------------------------

      return res.status(200).json({
        success: true,
        message: "OTP sent to your registered mobile number.",
        // You might return a token or a session ID here to indicate the start of the 2FA process
      });
    }
    else {
      sendToken(user, 200, res);
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
      // You might return a token or a session ID here to indicate the start of the 2FA process
    });
  }
});


// Step 2: Verify OTP
exports.verifyOTP = catchAsyncerror(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const models = [SuperAdmin, Subadmin, User];
  let user = null;

  for (const model of models) {
    const foundUser = await model.findOne({ email });
    if (foundUser) {
      user = foundUser;
      break;
    }
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.otp || !user.otpExpiry) {
    return res.status(400).json({ message: "No OTP found. Please request again." });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ message: "OTP expired. Please request again." });
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  // ✅ Generate token & login
  sendToken(user, 200, res);
});
exports.logout = catchAsyncerror(async (req, res, next) => {
  const tokens = req.cookies?.tokens;

  if (!tokens) {
    return res.status(400).json({
      success: false,
      message: "No active session found",
    });
  }

  res.clearCookie("tokens", {
    httpOnly: true,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


exports.SubAdmin_register = async (req, res) => {
  const {
    Name,
    User_name,
    email,
    Phone,
    Status,
    Password,
    role,
    Pages,
    CreatedBy,
  } = req.body;
  // const { valid, reason, validators } = await isEmailValid(email);

  const validemail = validator.validate(email);

  if (
    !Name ||
    !User_name ||
    !email ||
    !Phone ||
    !Status ||
    !Password ||
    !role ||
    !Pages ||
    !CreatedBy
  ) {
    return res.status(400).json("plese fill all input ");
  }
  if (validemail == false) {
    return res.status(400).json("plz enter valid email");
  }
  try {
    const user = await Subadmin.findOne({ email });

    if (user) {
      res.status(400).json("User already exist");
    } else {
      const user = await Subadmin.create({
        Name,
        User_name,
        email,
        Phone,
        Status,
        Password,
        role,
        Pages,
        CreatedBy,
      });

      const io = req.app.get("io");
      const notification = {
        message: `Subadmin "${user.Name}" (${user.role}) has been created by ${req.user.Name} (${req.user.role}).`,
        type: "success",
        createdAt: new Date(),
      };

      // Role-based emission
      if (req.user.role === "Super_Admin") {
        io.to("Super_Admin").emit("notification", notification);
      } else if (req.user.role === "Sub_Admin") {
        io.to("Super_Admin").emit("notification", notification);
        io.to("Sub_Admin").emit("notification", notification);
      }

      return res.status(200).json("Subadmin created");
    }
  } catch (error) {
    //console.log(error.message);
  }
};

exports.Search_Subadmin = async (req, res) => {
  try {
    const { searchKey = "", page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { Name: { $regex: "^" + searchKey, $options: "i" } },
        { User_name: { $regex: "^" + searchKey, $options: "i" } },
        { email: { $regex: "^" + searchKey, $options: "i" } },
        { Phone: { $regex: "^" + searchKey, $options: "i" } },
      ],
    };

    const skip = (page - 1) * parseInt(limit);

    // Count total documents matching the query
    const total = await Subadmin.countDocuments(query);

    // Get paginated subadmins
    const subadmins = await Subadmin.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Optional sorting

    return res.status(200).json({
      subadmins,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json("Server error");
  }
};

exports.View_Subadmin = catchAsyncerror(async (req, res, next) => {
  try {
    const subadmins = await Subadmin.find().sort({ createdAt: -1 });
    const userIds = subadmins.map((u) => u._id);

    // ✅ Aggregate balances from CreditHistory
    const balances = await CreditHistory.aggregate([
      { $match: { "User.ID": { $in: userIds } } },
      {
        $facet: {
          allTime: [
            {
              $group: {
                _id: "$User.ID",
                balance: {
                  $sum: {
                    $cond: [
                      { $eq: ["$operation", "credit_added"] },
                      "$amount",
                      { $multiply: ["$amount", -1] },
                    ],
                  },
                },
              },
            },
          ],
          today: [
            { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
            {
              $group: {
                _id: "$User.ID",
                balance: {
                  $sum: {
                    $cond: [
                      { $eq: ["$operation", "credit_added"] },
                      "$amount",
                      { $multiply: ["$amount", -1] },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // ✅ Create lookup maps
    const allTimeMap = new Map(balances[0].allTime.map((b) => [b._id.toString(), b.balance]));
    const todayMap = new Map(balances[0].today.map((b) => [b._id.toString(), b.balance]));

    // ✅ Attach balances to users
    const usersWithBalance = subadmins.map((u) => ({
      ...u.toObject(),
      allTimeBalance: allTimeMap.get(u._id.toString()) || 0,
      todayBalance: todayMap.get(u._id.toString()) || 0,
    }));
    return res.status(200).json({
      success: true,
      subadmins: usersWithBalance,
      total: subadmins.length,
    });
  } catch (error) {
    console.error("Error fetching subadmins:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

exports.View_SubadminPagination = catchAsyncerror(async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const subadmins = await Subadmin.find()
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Subadmin.countDocuments();

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      subadmins,
      total,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching subadmins:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

exports.subAdminStatusChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedSubadmin = await Subadmin.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedSubadmin) {
      return res
        .status(404)
        .json({ success: false, message: "Subadmin not found" });
    }

    res.status(200).json({ success: true, updatedSubadmin });
  } catch (error) {
    console.error("Error updating subadmin status:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update subadmin status" });
  }
};

// edit subadmin
exports.edit_subadmin = catchAsyncerror(async (req, res) => {
  try {
    let uid = req.params.id;
    let data = await Subadmin.findById(uid);
    return res.json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

//Update Subadmin
exports.update_subadmin = catchAsyncerror(async (req, res) => {
  try {
    const {
      Name,
      User_name,
      email,
      Phone,
      Status,
      Password,
      Pages,
      CreatedBy,
      id,
    } = req.body;

    let updateData = {
      Name,
      User_name,
      email,
      Phone,
      Status,
      // Password,
      Pages,
      CreatedBy,
    };

    if (Password && Password.trim() !== "") {
      if (Password.length < 8) {
        return res.status(400).json("Password must be at least 8 characters");
      }
      const hashedPassword = await bcrypt.hash(Password, 10);
      updateData.Password = hashedPassword;
    }
    const data = await Subadmin.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return res.json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

exports.User_register = async (req, res) => {
  const {
    Name,
    User_name,
    CreatedBy,
    email,
    Phone,
    status,
    Password,
    role,
    Pages,
    Key,
  } = req.body;

  const validemail = validator.validate(email);
  const requiredFields = [
    'Name',
    'User_name',
    'CreatedBy',
    'email',
    'Phone',
    'status',
    'Password',
    'role',
    'Pages',
    'Key',
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Please fill all inputs: ${missingFields.join(", ")}`,
    });
  }
  // return
  if (validemail == false) {
    return res.status(400).json("plz enter valid email");
  }
  try {
    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json("User already exist");
    } else {
      const user = await User.create({
        Name,
        User_name,
        CreatedBy,
        email,
        Phone,
        status,
        Password,
        role,
        Pages,
        Key,
        Subadmin: req.body.Subadmin,
        apiKey: `US-${generateApiKey()}`,
      });

      const io = req.app.get("io");
      const notification = {
        message: `User "${user.Name}" (${user.role}) has been created by ${req.user.Name} (${req.user.role}).`,
        type: "success",
        createdAt: new Date(),
      };

      // Role-based emission
      if (req.user.role === "Super_Admin") {
        io.to("Super_Admin").emit("notification", notification);
      } else if (req.user.role === "Sub_Admin") {
        io.to("Super_Admin").emit("notification", notification);
        io.to("Sub_Admin").emit("notification", notification);
      }
      return res.status(200).json("User created");
    }
  } catch (error) {
    //console.log(error.message);
  }
};

exports.Search_User = async (req, res) => {
  try {
    const { searchKey = "", page = 1, limit = 10, downloadAll = false } = req.query;
    const baseFilter = req.user.role === "Super_Admin" ? {} : { Subadmin: req.user.id };

    // ✅ Add search conditions
    const searchFilter = {
      $or: [
        { Name: { $regex: "^" + searchKey, $options: "i" } },
        { User_name: { $regex: "^" + searchKey, $options: "i" } },
        { email: { $regex: "^" + searchKey, $options: "i" } },
        { Phone: { $regex: "^" + searchKey, $options: "i" } },
      ],
    };
    const query = { $and: [baseFilter, searchFilter] };
    let users;
    let total;
    if (downloadAll === "true") {
      // ✅ Return all filtered users (for Excel export, no pagination)
      users = await User.find(query).sort({ createdAt: -1 });
      total = users.length;
    } else {

      const skip = (page - 1) * parseInt(limit);
      total = await User.countDocuments(query);
      users = await User.find(query)
        .skip(skip)
        .limit(parseInt(limit))
      // .sort({ createdAt: -1 });
    }

    const userIds = users.map((u) => u._id);
    // ✅ Time boundaries for today

    // ✅ Aggregate balances from CreditHistory
    const balances = await CreditHistory.aggregate([
      { $match: { "User.ID": { $in: userIds } } },
      {
        $facet: {
          allTime: [
            {
              $group: {
                _id: "$User.ID",
                balance: {
                  $sum: {
                    $cond: [
                      { $eq: ["$operation", "credit_added"] },
                      "$amount",
                      { $multiply: ["$amount", -1] },
                    ],
                  },
                },
              },
            },
          ],
          today: [
            { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
            {
              $group: {
                _id: "$User.ID",
                balance: {
                  $sum: {
                    $cond: [
                      { $eq: ["$operation", "credit_added"] },
                      "$amount",
                      { $multiply: ["$amount", -1] },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ]);

    // ✅ Create lookup maps
    const allTimeMap = new Map(balances[0].allTime.map((b) => [b._id.toString(), b.balance]));
    const todayMap = new Map(balances[0].today.map((b) => [b._id.toString(), b.balance]));
    const usersWithBalance = users.map((u) => ({
      ...u.toObject(),
      allTimeBalance: allTimeMap.get(u._id.toString()) || 0,
      todayBalance: todayMap.get(u._id.toString()) || 0,
    }));
    return res.status(200).json({
      users: usersWithBalance,
      total,
      page: parseInt(page),
      pages: downloadAll === "true" ? 1 : Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json("Server error");
  }
};


exports.View_user = (async (req, res, next) => {
  const { role, email, id } = req.user;
  const { page, limit } = req.query;
  // console.log( page , limit )
  // Pagination setup
  const filter = role === "Super_Admin" ? {} : { Subadmin: id };
  const skip = (page - 1) * parseInt(limit);

  // Time boundaries for today
  // console.log(skip)
  // console.log(limit,"limit")
  // ✅ Get paginated users
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
  // .sort({ createdAt: -1 });

  // ✅ Collect user IDs
  const userIds = users.map((u) => u._id);

  // ✅ Aggregate balances from CreditHistory
  const balances = await CreditHistory.aggregate([
    { $match: { "User.ID": { $in: userIds } } },
    {
      $facet: {
        allTime: [
          {
            $group: {
              _id: "$User.ID",
              balance: {
                $sum: {
                  $cond: [
                    { $eq: ["$operation", "credit_added"] },
                    "$amount",
                    { $multiply: ["$amount", -1] },
                  ],
                },
              },
            },
          },
        ],
        today: [
          { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
          {
            $group: {
              _id: "$User.ID",
              balance: {
                $sum: {
                  $cond: [
                    { $eq: ["$operation", "credit_added"] },
                    "$amount",
                    { $multiply: ["$amount", -1] },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ]);

  // ✅ Create lookup maps
  const allTimeMap = new Map(balances[0].allTime.map((b) => [b._id.toString(), b.balance]));
  const todayMap = new Map(balances[0].today.map((b) => [b._id.toString(), b.balance]));

  // ✅ Attach balances to users
  const usersWithBalance = users.map((u) => ({
    ...u.toObject(),
    allTimeBalance: allTimeMap.get(u._id.toString()) || 0,
    todayBalance: todayMap.get(u._id.toString()) || 0,
  }));

  // ✅ Final response
  res.status(200).json({
    users: usersWithBalance,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
});



exports.Search_claim = async (req, res) => {
  try {
    const { searchKey = "", page = 1, limit = 10 } = req.query;
    const query = {
      $or: [
        { accountHolderName: { $regex: "^" + searchKey, $options: "i" } },
        { utr: { $regex: "^" + searchKey, $options: "i" } },
        { "Payment_By.email": { $regex: "^" + searchKey, $options: "i" } },
        { accountNumber: { $regex: "^" + searchKey, $options: "i" } },
      ],
    };
    const skip = (page - 1) * parseInt(limit);
    const total = await Claims.countDocuments(query);
    const projection = req.user.role === "User" ? { utr: 0 } : {};

    const claims = await Claims
      .find(query, projection)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    return res.status(200).json({
      claims,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json("Server error");
  }
};

exports.View_claim = catchAsyncerror(async (req, res, next) => {
  const { role, email } = req.user;
  const { page = 1, limit = 10 } = req.query;

  let filter = role == "Super_Admin" ? {} : ({ 'claimby.email': email });
  if (role == "Super_Admin") {
    filter = {};
  } else if (role == "User") {
    filter = { 'claimby.email': email };
  } else if (role == "Sub_Admin") {
    const user = await User.find({ 'CreatedBy.email': email });
    const userEmails = user.map((user) => user.email);
    userEmails.push(req.user.email.toString());
    //console.log(userEmails)
    //console.log(filter, "filter")
    filter = { "claimby.email": { $in: userEmails } }
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }
  const skip = (page - 1) * parseInt(limit);

  const total = await Claims.countDocuments(filter);
  projection = req.user.role === "User" ? { utr: 0 } : {};
  const claims = await Claims.find(filter, projection)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ Date: -1 });

  res.status(200).json({
    claims,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  });
});

exports.ClaimStatusChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const updatedUser = await Claims.findByIdAndUpdate(
      id,
      { status, remark },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Claim not found" });
    }

    res.status(200).json({ success: true, updatedUser });
  } catch (error) {
    console.error("Error updating Claim status:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update Claim status" });
  }
};
// ✅ Delete Claim API
exports.DeleteClaim = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedClaim = await Claims.findByIdAndDelete(id);

    if (!deletedClaim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }

    res.status(200).json({
      success: true,
      message: "Claim deleted successfully",
      deletedClaim,
    });
  } catch (error) {
    console.error("Error deleting Claim:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete Claim" });
  }
};

exports.userStatusChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, updatedUser });
  } catch (error) {
    console.error("Error updating user status:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user status" });
  }
};

exports.edit_user = catchAsyncerror(async (req, res, next) => {
  const { role, email } = req.user;
  const uid = req.params.id;

  let user;

  if (role == "Super_Admin") {
    user = await User.findById(uid).populate("Subadmin", "Name");
  } else if (role == "Sub_Admin") {
    user = await User.findOne({ _id: uid, "CreatedBy.email": email }).populate(
      "Subadmin",
      "Name"
    );
  } else {
    return next(new ErrorResponse("Invalid role or not authorized", 403));
  }

  //console.log(user.Subadmin);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json(user);
});

///Update user
exports.update_user = catchAsyncerror(async (req, res) => {
  try {
    const {
      Name,
      User_name,
      Subadmin,
      email,
      Phone,
      Status,
      Pages,
      CreatedBy,
      id,
    } = req.body;

    let data = await User.findByIdAndUpdate(id, {
      Name,
      User_name,
      Subadmin,
      email,
      Phone,
      Status,
      Pages,
      CreatedBy,
    });
    return res.json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

exports.dashboarddata = catchAsyncerror(async (req, res, next) => {
  const { role, email } = req.user;
  const filter = role === "Super_Admin" ? {} : { "CreatedBy.email": email };

  // Always compute fresh start/end of day in IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;

  // Convert UTC -> IST start of day
  const startOfTodayIST = new Date(now.getTime() + istOffset);
  startOfTodayIST.setHours(0, 0, 0, 0);
  const startOfTodayUTC = new Date(startOfTodayIST.getTime() - istOffset);

  // Convert UTC -> IST end of day
  const endOfTodayIST = new Date(now.getTime() + istOffset);
  endOfTodayIST.setHours(23, 59, 59, 999);
  const endOfTodayUTC = new Date(endOfTodayIST.getTime() - istOffset);

  console.log("IST Start:", startOfTodayIST, "UTC Start:", startOfTodayUTC);
  console.log("IST End:", endOfTodayIST, "UTC End:", endOfTodayUTC);

  // console.log(startOfDay, endOfDay)
  const localTime = moment().tz('Asia/Kolkata');
  // console.log(localTime.format());
  // 1️⃣ Total Users
  const total_user = await User.countDocuments(filter).read('primary');
  const today_user = await User.countDocuments({
    ...filter,
    createdAt: { $gte: (new Date(startOfTodayUTC)) - (5.5 * 60 * 60 * 1000), $lte: (new Date(endOfTodayUTC).setHours(23, 59, 59, 999)) - (5.5 * 60 * 60 * 1000) },
  }).read('primary');

  // 2️⃣ Subadmins (only for Super_Admin)
  let total_subadmin = 0,
    today_subadmin = 0;
  if (role === "Super_Admin") {
    total_subadmin = await Subadmin.countDocuments({}).read('primary');
    today_subadmin = await Subadmin.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).read('primary');
  }
  let balancequery
  // 3️⃣ Payouts
  let query = {};
  if (role === "Super_Admin") {
    query = {};
    balancequery = {};
  } else if (role === "User") {
    query = { "Payment_By.email": req.user.email };
    balancequery = { "User.ID": new mongo.ObjectId(req.user.id) };
  } else if (role === "Sub_Admin") {
    const users = await User.find({ "CreatedBy.email": email });
    const userEmails = users.map((u) => u.email);
    const user_id = users.map((u) => u._id);
    userEmails.push(req.user.email.toLowerCase());
    query = { "Payment_By.email": { $in: userEmails } };
    balancequery = { "User.ID": { $in: (user_id) } };
  }

  const total_payout = await Payout.aggregate([
    { $match: { ...query, status: "Credited" } },
    { $group: { _id: null, sum: { $sum: "$Amount" } } },
  ]).read('primary');

  const today_payout = await Payout.aggregate([
    {
      $match: {
        ...query,
        status: "Credited",
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    { $group: { _id: null, sum: { $sum: "$Amount" } } },
  ]).read('primary');

  // 4️⃣ Accounts (payout count)
  const total_account = await Payout.aggregate([
    { $match: query },
    { $count: "total_account" },
  ]).read('primary');

  const today_account = await Payout.aggregate([
    { $match: { ...query, createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $count: "total_account" },
  ]).read('primary');

  // 5️⃣ Beneficiaries
  let queryforBeneficiary = {};
  if (role === "Super_Admin") {
    queryforBeneficiary = {};
  } else if (role === "User") {
    queryforBeneficiary = { "createdBy.email": req.user.email };
  } else if (role === "Sub_Admin") {
    const users = await User.find({ "CreatedBy.email": req.user.email });
    const userEmails = users.map((u) => u.email);
    userEmails.push(req.user.email.toString());
    queryforBeneficiary = { "createdBy.email": { $in: userEmails } };
  }

  const totalbeneficiary = await BeneficiaryAccount.countDocuments(queryforBeneficiary).read('primary');
  const today_beneficiary = await BeneficiaryAccount.countDocuments({
    ...queryforBeneficiary,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).read('primary');

  // total claim
  if (role == "Super_Admin") {
    Claimfilter = {};
  } else if (role == "User") {
    Claimfilter = { 'claimby.email': email };
  } else if (role == "Sub_Admin") {
    const user = await User.find({ 'CreatedBy.email': email });
    const userEmails = user.map((user) => user.email);
    userEmails.push(req.user.email.toString());
    //console.log(userEmails)
    //console.log(Claimfilter, "Claimfilter")
    Claimfilter = { "claimby.email": { $in: userEmails } }
  }
  const totalClaim = await Claims.countDocuments(Claimfilter).read('primary');
  const TodayClaim = await Claims.countDocuments({
    ...Claimfilter,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  }).read('primary');

  let transactionQuery = {};
  let creditHistoryQuery = {};
  if (role === "Super_Admin") {
    // keep empty = fetch all
  } else if (role === "User") {
    transactionQuery = { userId: new mongo.ObjectId(req.user.id) };
    creditHistoryQuery = { "User.ID": new mongo.ObjectId(req.user.id) };
  } else if (role === "Sub_Admin") {
    const users = await User.find({ "CreatedBy.email": email }).select("email _id");
    const userEmails = users.map((u) => u.email).concat(email);
    const userIds = users.map((u) => u._id).concat(new mongo.ObjectId(req.user.id));

    transactionQuery = { userId: { $in: userIds } };
    creditHistoryQuery = { "User.ID": req.user.id };
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }
  // console.log(transactionQuery, "transactionQuery")
  const toatalrejectedtransaction = await Transaction.aggregate([
    { $match: { ...transactionQuery, type: "credit", } },
    { $group: { _id: null, sum: { $sum: "$amount" } } }]).read('primary')
  const todalrejectedtransaction = await Transaction.aggregate([{
    $match: { ...transactionQuery, type: "credit", createdAt: { $gte: startOfDay, $lte: endOfDay } },

  }, { $group: { _id: null, sum: { $sum: "$amount" } } }]).read('primary')
  const balances = await CreditHistory.aggregate([
    { $match: balancequery },
    {
      $facet: {
        // --- Total All-Time Balance (for all users) ---
        allTime: [
          {
            $group: {
              _id: null, // <- combine all users
              totalBalance: {
                $sum: {
                  $cond: [
                    { $eq: ["$operation", "credit_added"] },
                    "$amount",
                    { $multiply: ["$amount", -1] },
                  ],
                },
              },
            },
          },
        ],

        // --- Total Balance for Today (for all users) ---
        today: [
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            },
          },
          {
            $group: {
              _id: null,
              totalTodayBalance: {
                $sum: {
                  $cond: [
                    { $eq: ["$operation", "credit_added"] },
                    "$amount",
                    { $multiply: ["$amount", -1] },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      // Flatten the arrays from $facet for cleaner output
      $project: {
        allTime: { $arrayElemAt: ["$allTime.totalBalance", 0] },
        today: { $arrayElemAt: ["$today.totalTodayBalance", 0] },
      },
    },
  ]);
  const total_balance = (balances[0] && balances[0].allTime) || 0;
  const today_balance = (balances[0] && balances[0].today) || 0;
  res.status(200).json({
    total_user,
    today_user,
    total_balance,
    today_balance,
    total_payout: (total_payout[0] && total_payout[0].sum) || 0,
    today_payout: (today_payout[0] && today_payout[0].sum) || 0,
    total_subadmin,
    today_subadmin,
    total_account: (total_account[0] && total_account[0].total_account) || 0,
    today_account: (today_account[0] && today_account[0].total_account) || 0,
    totalbeneficiary,
    today_beneficiary,
    totalClaim: totalClaim || 0,
    TodayClaim: TodayClaim || 0,
    toatalrejectedtransaction: toatalrejectedtransaction[0] && toatalrejectedtransaction[0].sum || 0,
    todalrejectedtransaction: todalrejectedtransaction[0] && todalrejectedtransaction[0].sum || 0,
  });
});

exports.isAuthenticatedRole = (...allowedRoles) =>
  catchAsyncerror(async (req, res, next) => {
    try {
      // ✅ 1. API KEY AUTH
      const encryptedKeys = req.headers["x-api-key"];
      // console.log(encryptedKeys , "apikey")
      if (encryptedKeys) {
        // Search in all role models
        // Search in all role models

        //  const apiKeys = encryptApiKey(encryptedKeys);
        //  console.log(apiKeys , "encrypted apikey")
        const apiKey = decryptApiKey(encryptedKeys);

        console.log(apiKey, "decrypted apikey")
        let user;
        if (apiKey.startsWith("SU-")) {
          user = await SuperAdmin.findOne({ apiKey });
        } else if (apiKey.startsWith("SA-")) {
          user = await Subadmin.findOne({ apiKey });
        } else if (apiKey.startsWith("US-")) {
          user = await User.findOne({ apiKey });
        }
        if (!user) {
          return next(new ErrorResponse("Invalid API key", 401));
        }

        if (!allowedRoles.includes(user.role)) {
          return next(new ErrorResponse("Not authorized", 403));
        }

        if (user.status !== "Active") {
          return next(
            new ErrorResponse("Contact admin for account activation", 403)
          );
        }

        req.user = user;
        return next(); // ✅ API key success
      }

      // ✅ 2. JWT AUTH (if no API key)
      const { tokens } = req.cookies;
      if (!tokens) {
        return next(
          new ErrorResponse("Please login to access this resource", 401)
        );
      }

      let decodedData;
      try {
        decodedData = jwt.verify(tokens, process.env.secret);
      } catch (err) {
        return next(new ErrorResponse("Invalid or expired tokens", 401));
      }

      const { id, role } = decodedData;
      const roleModelMap = {
        Super_Admin: SuperAdmin,
        Sub_Admin: Subadmin,
        User: User,
      };

      if (!allowedRoles.includes(role)) {
        return next(new ErrorResponse("Not authorized", 403));
      }

      const model = roleModelMap[role];
      const user = await model.findById(id);

      if (!user) {
        return next(new ErrorResponse("User not found", 404));
      }

      if (user.status !== "Active") {
        return next(
          new ErrorResponse("Contact admin for account activation", 403)
        );
      }

      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      return next(new ErrorResponse("Auth failed", 401));
    }
  });




exports.Create_payout = async (req, res) => {
  const {
    beneficiaryCode,
    beneficiaryName,
    beneficiaryAddress,
    beneficiaryaccountNumber,
    ifsc,
    bankName,
    paymentMethod,
    Amount,
    remark,
    key
  } = req.body;
  const requiredFields = [
    "remark", 'Amount', 'key'
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Please fill all inputs: ${missingFields.join(", ")}`,
    });
  }

  try {
    // ✅ Verify beneficiary exists
    let beneficiary = await BeneficiaryAccount.findOne({
      "Beneficiary Code": beneficiaryCode,
      "Beneficiary Account No": beneficiaryaccountNumber,
      "BIC / SWIFT / IFSC Code": ifsc,
      "Beneficiary Bank Name": bankName,
      "createdBy.email": req.user.email,
      "createdBy.name": req.user.Name,
      "createdBy.role": req.user.role,

    });

    if (!beneficiary) {
      beneficiary = await BeneficiaryAccount.create({
        ["Beneficiary Code"]: beneficiaryCode,
        ["Beneficiary Name"]: beneficiaryName,
        ["Beneficiary Address 1"]: beneficiaryAddress || ".",
        ["Beneficiary Account No"]: beneficiaryaccountNumber,
        ["BIC / SWIFT / IFSC Code"]: ifsc,
        ["Beneficiary Bank Name"]: bankName,
        ["Payment Method Name"]: paymentMethod,
        ["Effective From"]: new Date(),
        status: "approved", // directly approved for API clients
        createdBy: [
          {
            email: req.user.email,
            name: req.user.Name,
            role: req.user.role,
          },
        ],
      });
    }


    // ✅ Check logged-in user
    const [superAdmin, subAdmin, normalUser] = await Promise.all([
      SuperAdmin.findOne({ email: req.user.email }),
      Subadmin.findOne({ email: req.user.email }),
      User.findOne({ email: req.user.email }).select('+Key'),
    ]);


    const matchedUser = superAdmin || subAdmin || normalUser;
    if (!matchedUser) {
      return res.status(404).json({
        success: false,
        message: "User making the payment not found.",
      });
    }
    if (Amount > matchedUser.creditlimit) {

      return res.status(400).json({
        success: false,
        message: "Insufficient credit to process this payout.",
      });
    }

    if (matchedUser.Key != key) {
      return res.status(500).json({
        success: false,
        message: "User Key Verification failed.",
      })
    }
    // ✅ Balance check (skip for Super Admin)
    if (req.user.role !== "Super_Admin") {

      if (matchedUser.credit < Amount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient credit to process this payout.",
        });
      }
    }


    // console.log(newbankutr, "newbankutr")
    // const value = date.subtract(now, date1);
    // Display the result
    // console.log("total days between them "
    //   + value.toDays())
    // return

    const order_id = generateRandomId(12)


    // Usage Example:
    const payload = {
      "sender_account_number": "WTRX04697029820",
      "order_id": order_id,
      "transfer_type": "IMPS",
      "name": beneficiaryName,
      "account_number": beneficiaryaccountNumber,
      "ifsc_code": ifsc,
      "amount": Amount,
      "mobile_number": "9876543210",
      "description": "Payment for services",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    };

    const encryptedPayload = encrypttrexo(JSON.stringify(payload), publicKey);

    // Send to API
    const requestBody = {
      "enc": encryptedPayload
    };

    const options = {
      method: 'POST',
      url: 'https://reseller.api.payout.trexoedge.com/api/v1/transfer',
      headers: {
        'x-trexo-key': process.env["x-trexo-key"],
        'x-trexo-secret': process.env["x-trexo-secret"],
        'Content-Type': 'application/json',
        "x-trexo-id": process.env["x-trexo-id"],
        Accept: 'application/json'
      },
      data: { enc: encryptedPayload }
    };


    const apiResponse = await axios.request(options);
    console.log(apiResponse.data);

    const payout = await Payout.create({
      ["Beneficiary Code"]: beneficiaryCode,
      ["Beneficiary Name"]: beneficiaryName,
      ["Beneficiary Address 1"]:
        beneficiaryAddress || beneficiary["Beneficiary Address 1"],
      ["Beneficiary Account No"]: beneficiaryaccountNumber,
      ["BIC / SWIFT / IFSC Code"]: ifsc,
      ["Beneficiary Bank Name"]: bankName,
      ["Payment Method Name"]: paymentMethod,
      Credit_status: 'Pending',
      order_id: order_id,
      transaction_id: apiResponse.data.data.transaction_id,
      Amount,
      Bank_Utr: "",
      Payment_By: [
        {
          email: req.user.email,
          name: req.user.Name,
          role: req.user.role,
        },
      ],
      status: "Processing",
      utr: "",
      remark,
      Availble_balance: matchedUser.credit - Amount,
    });
    // ✅ Send Money record


    // ✅ Deduct credits
    matchedUser.credit -= Amount;
    matchedUser.creditlimit -= Amount;
    await matchedUser.save();
    // 📝 Save transaction entry
    await Transaction.create({
      userId: matchedUser._id,
      type: "debit",
      'Beneficiary Name': payout['Beneficiary Name'],
      'Beneficiary Account No': payout['Beneficiary Account No'],
      'BIC / SWIFT / IFSC Code': payout['BIC / SWIFT / IFSC Code'],
      'Beneficiary Bank Name': payout['Beneficiary Bank Name'],
      utr: payout.utr,
      Bank_Utr: payout.Bank_Utr,
      amount: Amount,
      balanceAfter: matchedUser.credit || 0,
      description: `Payout initiated for ${beneficiaryName}`,
    });
    // ✅ Socket notification
    const io = req.app.get("io");
    const notification = {
      message: `Payout of ₹${Amount} to "${payout["Beneficiary Name"]}" has been initiated by ${req.user.Name} (${req.user.role}).`,
      type: "success",
      createdAt: new Date(),
    };
    const notifyRefresh = { message: "", type: "success", createdAt: new Date() };
    io.to("Super_Admin").emit("notification", notification);
    // io.to("Super_Admin").emit("refreshpayout", notifyRefresh);

    if (req.user.role !== "Super_Admin") {
      io.to("Sub_Admin").emit("notification", notification);
      // io.to("Super_Admin").emit("refreshpayout", notifyRefresh);
      // io.to("User").emit("refreshpayout", notifyRefresh);

    }

    // 

    // ✅ Auto status flow (Processing → pending → approved)
    // setTimeout(async () => {
    //   try {
    //     // 🔍 Check if payout already in pending
    //     const checkpending = await Payout.findOne({ _id: payout._id, status: "Pending" });

    //     let pending;
    //     if (checkpending) {
    //       console.log("⚠️ Payout already in pending state");
    //       pending = checkpending; // ✅ Use this instead of undefined
    //     } else {
    //       pending = await Payout.findOneAndUpdate(
    //         { _id: payout._id, status: "Processing" },
    //         { $set: { status: "Pending" } },
    //         { new: true }
    //       );
    //     }

    //     if (!pending) {
    //       console.log("⚠️ No payout found in Processing state");
    //       return;
    //     }

    //     // io.to("Super_Admin").emit("refreshpayout", notifyRefresh);
    //     // io.to("Sub_Admin").emit("refreshpayout", notifyRefresh);
    //     io.to("User").emit("refreshpayout", notifyRefresh);

    //     if (pending) {
    //       console.log("✅ Moved to pending");

    //       // ✅ Only approve if it was not already pending before
    //       if (!checkpending) {
    //         setTimeout(async () => {
    //           try {
    //             const approved = await Payout.findOneAndUpdate(
    //               { _id: payout._id, status: "Pending" },
    //               { $set: { status: "Credited" } },
    //               { new: true }
    //             );

    //             if (approved) {
    //               io.to("Super_Admin").emit("refreshpayout", notifyRefresh);
    //               io.to("Sub_Admin").emit("refreshpayout", notifyRefresh);
    //               io.to("User").emit("refreshpayout", notifyRefresh);
    //               console.log("✅ Set to approved");
    //             }
    //           } catch (err) {
    //             console.error("❌ Approve error:", err);
    //           }
    //         }, 30000);
    //       }

    //       // ✅ Always run UTR logic (whether already pending or newly approved)
    //       setTimeout(async () => {
    //         try {
    //           const Bank_Utr = await Payout.findOne({
    //             Bank_Utr: { $regex: /\S/, $exists: true },
    //           }).sort({ createdAt: -1 });

    //           if (!Bank_Utr) {
    //             console.log("⚠️ No Bank_Utr found");
    //             return;
    //           }

    //           const now = new Date();
    //           const date1 = Bank_Utr.createdAt;
    //           const diffMs = now - date1;

    //           const diffSec = Math.floor(diffMs / 1000);
    //           const diffMin = Math.floor(diffMs / (1000 * 60));

    //           let newbankutr = diffMin < 3 ? diffSec : diffMin;
    //           const prefix = 'TP202510';
    //           const num = Number(Bank_Utr.Bank_Utr.slice(8)) + Number(newbankutr);

    //           const aadutr = await Payout.findOneAndUpdate(
    //             { _id: payout._id, $or: [{ Bank_Utr: "" }, { Bank_Utr: null }] },
    //             {
    //               $set: {
    //                 Bank_Utr: prefix + String(num).padStart(6, '0'),
    //               },
    //             },
    //             { new: true }
    //           );

    //           if (aadutr) {
    //             console.log("✅ UTR added & payout approved");
    //             io.to("Super_Admin").emit("refreshpayout", notifyRefresh);
    //             io.to("Sub_Admin").emit("refreshpayout", notifyRefresh);
    //             io.to("User").emit("refreshpayout", notifyRefresh);
    //           } else {
    //             console.log("⚠️ Could not approve payout");
    //           }
    //         } catch (err) {
    //           console.error("❌ UTR error:", err);
    //         }
    //       }, checkpending ? 0 : 40000); // ✅ Run immediately if already pending
    //     }
    //   } catch (err) {
    //     console.error("❌ Pending error:", err);
    //   }
    // }, 30000);


    return res.status(200).json({
      success: true,
      message: "✅ Payment initiated successfully",
    });



  } catch (error) {
    console.error("❌ Payout Error:", error.response.data);
    return res.status(500).json({
      success: false,
      message: "Payout failed",
      error: error.response.data.message || error.message,
    });
  }
};


exports.Approve_payout = async (req, res) => {
  try {
    const { id, utr, status, transaction_id, remark, Payment_By, Amount } = req.body;
    const indiaTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];

    // 🔎 Find the payout
    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({ message: "Payout not found." });
    }

    // 🚫 Prevent editing if already rejected
    if (payout.status === "rejected") {
      return res.status(400).json({ message: "Rejected payouts cannot be edited." });
    }

    // ✏️ Update payout fields
    payout.status = status;
    if (utr) {
      payout.utr = utr;
      payout.Credit_status = `Confirmed ${indiaTime}`;
    }
    if (remark) payout.remark = remark;
    if (transaction_id) payout.transaction_id = transaction_id;

    // 🔍 Get the right model (User / Subadmin)
    let Model;
    switch (Payment_By?.[0]?.role) {
      case "Sub_Admin":
        Model = Subadmin;
        break;
      case "User":
        Model = User;
        break;
      case "Super_Admin":
        Model = SuperAdmin;
        break;
      default:
        return res.status(400).json({ message: "Invalid Payment_By model." });
    }
    // console.log(payout, "payout");
    // return
    const user = await Model.findOne({ email: Payment_By[0].email });
    if (!user) {
      return res.status(404).json({ message: `${Payment_By[0].role} not found.` });
    }

    // // ✅ Handle approval → debit
    // if (status === "approved") {
    //   user.credit = (user.credit || 0) - (Amount || 0);
    //   await user.save();

    //   await Transaction.create({
    //     userId: user._id,
    //     type: "debit",
    //     amount: Amount,
    //     balanceAfter: user.credit,
    //     description: `Payout approved (ID: ${payout._id})`,
    //   });
    // }

    // ❌ Handle rejection → refund credit
    else if (status === "rejected") {
      user.credit = (user.credit || 0) + (Amount || 0);
      payout.Credit_status = `Rejected ${indiaTime}`
      await user.save();

      await Transaction.create({
        userId: user._id,
        'Beneficiary Name': payout['Beneficiary Name'],
        'Beneficiary Account No': payout['Beneficiary Account No'],
        'BIC / SWIFT / IFSC Code': payout['BIC / SWIFT / IFSC Code'],
        'Beneficiary Bank Name': payout['Beneficiary Bank Name'],
        utr: payout.utr,
        transaction_id: payout.transaction_id,
        type: "credit",
        amount: Amount,
        balanceAfter: user.credit,
        description: `Refund for rejected payout (ID: ${payout._id})`,
      });
    }

    // 💾 Save payout after all updates
    await payout.save();

    return res.status(200).json({
      message: `✅ Payout ${status} successfully.`,
    });
  } catch (error) {
    console.error("❌ Payout Approval Error:", error);
    return res.status(500).json({
      message: "Payout approval failed.",
      error: error.message,
    });
  }
};


exports.search_Payout = async (req, res) => {
  const { searchKey, page = 1, limit = 10, startDate, endDate, status, utr } = req.query;
  const { role, email } = req.user;

  const dateFilter = {};
  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.$lte = new Date(endDate).setHours(23, 59, 59, 999);
  }

  try {
    // 👉 Start building conditions
    let conditions = [];

    // 🔍 Search condition (only if searchKey exists)
    if (searchKey) {
      let orConditions = [
        { "Beneficiary Name": { $regex: "^" + searchKey, $options: "i" } },
        { "Beneficiary Address 1": { $regex: "^" + searchKey, $options: "i" } },
        { "Beneficiary Account No": { $regex: "^" + searchKey, $options: "i" } },
        { "BIC / SWIFT / IFSC Code": { $regex: "^" + searchKey, $options: "i" } },
        { "utr": { $regex: "^" + searchKey, $options: "i" } }
      ];

      // ✅ if searchKey looks like ObjectId
      if (Types.ObjectId.isValid(searchKey)) {
        orConditions.push({ _id: new Types.ObjectId(searchKey) });
      }

      conditions.push({ $or: orConditions });
    }

    // ✅ Exact status match (outside OR!)
    if (status) {
      conditions.push({ status: status });
    }
    if (utr == 'noutr') {
      conditions.push({ utr: "" });
    }

    // 📅 Date condition
    if (Object.keys(dateFilter).length) {
      conditions.push({ createdAt: dateFilter });
    }

    // 👉 Role-based query
    let query = {};
    if (role == "Super_Admin") {
      query = {};
    } else if (role == "User") {
      query = { "Payment_By.email": req.user.email };
    } else if (role == "Sub_Admin") {
      const users = await User.find({ "CreatedBy.email": email });
      const userEmails = users.map((user) => user.email);
      userEmails.push(req.user.email.toString());
      query = { "Payment_By.email": { $in: userEmails } };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Merge conditions into final query
    if (conditions.length > 0) {
      query = { $and: [query, ...conditions] };
    }

    const skip = (page - 1) * parseInt(limit);
    const total = await Payout.countDocuments(query);
    const projection = req.user.role === "User" ? { utr: 0 } : {};

    const payouts = await Payout.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      payouts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json("Server error");
  }
};

exports.view_payout = async (req, res) => {
  try {
    const { role, email } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    let query = {};
    //console.log(role, email);
    if (role == "Super_Admin") {
      query = {};
    } else if (role == "User") {
      query = { "Payment_By.email": req.user.email };
    } else if (role == "Sub_Admin") {
      const users = await User.find({ "CreatedBy.email": email });
      const userEmails = users.map((user) => user.email);
      userEmails.push(req.user.email.toString());
      //console.log(userEmails);
      //console.log(query, "query");
      query = { "Payment_By.email": { $in: userEmails } };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const total = await Payout.countDocuments(query);
    const projection = req.user.role === "User" ? { utr: 0 } : {};
    const payouts = await Payout.find(query, projection)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      payouts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("View Payout Error:", error.message);
    return res.status(500).json("Server error");
  }
};

exports.payoutStatusChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedPayout = await Payout.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!updatedPayout) {
      return res
        .status(404)
        .json({ success: false, message: "Payout not found" });
    }
    res.status(200).json({ success: true, updatedPayout });
  } catch (error) {
    console.error("Error updating payout status:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update payout status" });
  }
};
exports.create_BeneficiaryAccount = async (req, res) => {
  try {
    const {
      beneficiaryCode,
      beneficiaryName,
      beneficiaryAddress,
      beneficiaryaccountNumber,
      ifsc,
      bankName,
      paymentMethod,
      effectiveFrom,

      updatedBy,
    } = req.body;

    // Validate required fields
    const requiredFields = ["beneficiaryCode",
      "beneficiaryName",
      // "beneficiaryAddress",
      "beneficiaryaccountNumber",
      "ifsc",
      "bankName",
      "paymentMethod",
      // "effectiveFrom",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please fill all inputs: ${missingFields.join(", ")}`,
      });
    }
    let existBeneficiary = await BeneficiaryAccount.findOne({
      "createdBy.email": req.user.email,
      $or: [
        { "Beneficiary Code": beneficiaryCode },
        { "Beneficiary Account No": beneficiaryaccountNumber },
      ],
    });

    if (existBeneficiary) {
      let duplicateField = "";

      if (existBeneficiary["Beneficiary Code"] === beneficiaryCode) {
        duplicateField = "*Beneficiary Code already existing.";
      } else if (
        existBeneficiary["Beneficiary Account No"] === beneficiaryaccountNumber
      ) {
        duplicateField = "*Beneficiary Account No. already existing.";
      }

      return res.status(400).json({
        success: false,
        message: `${duplicateField}`,
      });
    }
    // const total_payout = await Payout.aggregate([
    //   { $match: query },
    //   { $match: { status: "Credited"} },
    //   { $group: { _id: null, sum: { $sum: "$Amount" } } },
    // ]
    // )
    // Create account
    const beneficiary = await BeneficiaryAccount.create({
      ["Beneficiary Code"]: beneficiaryCode,
      ["Beneficiary Name"]: beneficiaryName,
      ["Beneficiary Address 1"]: beneficiaryAddress || ".",
      ["Beneficiary Account No"]: beneficiaryaccountNumber,
      ["BIC / SWIFT / IFSC Code"]: ifsc,
      ["Beneficiary Bank Name"]: bankName,
      ["Payment Method Name"]: paymentMethod,
      ["Effective From"]: effectiveFrom || ".",

      status: "pending",
      createdBy: [
        {
          email: req.user.email,
          name: req.user.Name,
          role: req.user.role,
        },
      ],
      updatedBy,
    });

    const io = req.app.get("io");

    const notification = {
      message: `Beneficiary account for "${beneficiary["Beneficiary Name"]}" has been created by ${req.user.Name} (${req.user.role}).`,
      type: "success",
      createdAt: new Date(),
    };
    if (req.user.role === "Super_Admin") {
      io.to("Super_Admin").emit("notification", notification);
    } else if (req.user.role === "Sub_Admin") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    } else if (req.user.role === "User") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
      // io.to("User").emit("notification", notification);
    }
    setTimeout(async () => {

      try {
        const pending = await BeneficiaryAccount.findOneAndUpdate(
          { _id: beneficiary._id, status: "pending" },
          { $set: { status: "approved" } },
          { new: true }
        );


      } catch (err) {
        console.error("❌ Pending error:", err);
      }

    }, 20000);
    return res
      .status(201)
      .json({ message: "Beneficiary account created successfully" });
  } catch (error) {
    console.error("Error creating beneficiary account:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.update_BeneficiaryAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updatedAccount = await BeneficiaryAccount.findByIdAndUpdate(
      id,
      {
        status,
        remark: remark,
        updatedAt: new Date(),
        updatedBy: {
          email: req.user.email,
          name: req.user.Name,
          role: req.user.role,
        },
      },
      { new: true }
    );

    if (!updatedAccount) {
      return res
        .status(404)
        .json({ message: "Beneficiary account not found." });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      data: updatedAccount,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.view_BeneficiaryAccount = async (req, res) => {
  try {
    const { role, email } = req.user;
    //console.log(req.query);

    const { page = 1, limit = 10, all } = req.query;
    const skip = (page - 1) * parseInt(limit);

    let query = {};
    //console.log(role, email, "viewbenificery");
    if (role == "Super_Admin") {
      query = {};
    } else if (role == "User") {
      query = { "createdBy.email": req.user.email };
    } else if (role == "Sub_Admin") {
      const users = await User.find({ "CreatedBy.email": email });
      const userEmails = users.map((user) => user.email);
      //console.log(userEmails, "userEmails");
      userEmails.push(req.user.email.toString());
      query = { "createdBy.email": { $in: userEmails } };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (req.query.status) {
      query.status = new RegExp(`^${req.query.status}$`, "i");
    }
    // //console.log(query, "total")
    let BeneficiaryAccounts
    total = await BeneficiaryAccount.countDocuments(query);
    if (all && all.toLowerCase() === "true") {
      BeneficiaryAccounts = await BeneficiaryAccount.find(query)
        .sort({ createdAt: -1 });
      return res.status(200).json({
        BeneficiaryAccounts,
        total,
        page: 1,
        pages: 1,
      });
    }
    //console.log(query, "total query");
    BeneficiaryAccounts = await BeneficiaryAccount.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      BeneficiaryAccounts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("View benifichery Error:", error.message);
    return res.status(500).json("Server error");
  }
};
exports.search_benficiery = async (req, res) => {
  const { searchKey, page = 1, limit = 10, startDate, endDate } = req.query;
  const { role, email } = req.user;

  const dateFilter = {};

  //console.log(req.query, "dateFilter");
  if (startDate) {
    dateFilter.$gte = new Date(startDate); // Start of day
  }

  if (endDate) {
    dateFilter.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999)); // End of day
  }
  //console.log(endDate, "dateFilter");
  try {
    // Build conditions
    const conditions = [];

    // Search condition (only if searchKey exists)
    if (searchKey) {
      conditions.push({
        $or: [
          { "Beneficiary Name": { $regex: "^" + searchKey, $options: "i" } },
          { "Beneficiary Address 1": { $regex: "^" + searchKey, $options: "i" } },
          { "Beneficiary Account No": { $regex: "^" + searchKey, $options: "i" } },
          { "BIC / SWIFT / IFSC Code": { $regex: "^" + searchKey, $options: "i" } },
          { "Beneficiary Bank Name": { $regex: "^" + searchKey, $options: "i" } },
        ],
      });
    }

    // Date condition (only if any date filter applied)
    if (Object.keys(dateFilter).length) {
      conditions.push({ createdAt: dateFilter });
    }
    //console.log(conditions, "conditions");
    let query
    // Final query
    if (role == "Super_Admin") {
      query = {};
    } else if (role == "User") {
      query = { "createdBy.email": req.user.email };
    } else if (role == "Sub_Admin") {
      const users = await User.find({ "CreatedBy.email": email });
      const userEmails = users.map((user) => user.email);
      //console.log(userEmails, "userEmails");
      userEmails.push(req.user.email.toString());
      query = { "createdBy.email": { $in: userEmails } };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (conditions.length > 0) {
      query = { $and: [query, ...conditions] };
    }
    // console.log(query)
    const skip = (page - 1) * parseInt(limit);
    const total = await BeneficiaryAccount.countDocuments(query);

    const BeneficiaryAccounts = await BeneficiaryAccount.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      BeneficiaryAccounts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Search Error:", error.message);
    return res.status(500).json("Server error");
  }
};

const sendToken = async (user, statusCode, res) => {
  const tokens = user.getSignedToken();
  const options = {
    expire: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  user.tokens = tokens;
  await user.save();
  res.status(statusCode).cookie("tokens", tokens, options).json({
    success: true,
    user,
    tokens,
    server: process.env.Server
  });
};

exports.dashboard = catchAsyncerror(async (req, res, next) => {
  if (req.session) {
  }
  if (req.user) {
    res.status(200).json({
      sucess: true,
      user: req.user,
      server: process.env.Server
    });
  }
});


exports.Add_Credit_subadmin = catchAsyncerror(async (req, res, next) => {
  const { Sub_admin_id, credit } = req.body;

  if (!Sub_admin_id || credit == undefined) {
    return next(new ErrorResponse("Sub_admin_id and credit are required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(Sub_admin_id)) {
    return next(new ErrorResponse("Invalid Sub_admin_id format", 400));
  }

  if (typeof credit !== "number" || credit < 0) {
    return next(new ErrorResponse("Credit must be a non-negative number", 400));
  }

  if (req.user.role !== "Super_Admin") {
    return next(new ErrorResponse("Unauthorized to perform this action", 403));
  }
  await Subadmin.updateMany(
    { credit: { $exists: false } },
    { $set: { credit: 0 } }
  );
  const subAdmin = await Subadmin.findById(Sub_admin_id);
  if (!subAdmin) {
    return next(new ErrorResponse("Sub-admin not found", 404));
  }
  subAdmin.credit += credit;
  await subAdmin.save({ validateBeforeSave: true });
  let user = { Name: subAdmin.Name, ID: subAdmin._id, Role: subAdmin.role };
  // ✅ Log to CreditHistory
  await CreditHistory.create({
    User: user,
    modifiedBy: {
      id: req.user._id,
      Name: req.user.Name,
      model: req.user.role
    },
    amount: credit,
    operation: "credit_added",
  });

  res.status(200).json({
    success: true,
    message: `Successfully added ${credit} credit.`,
    updatedCredit: subAdmin.credit,
  });
});
exports.Add_Credit_User = catchAsyncerror(async (req, res, next) => {
  const { User_id, credit } = req.body;

  try {
    if (req.user.credit < credit) {
      res.status(400).json("Insufficient Credit");
      return next(new ErrorResponse("Insufficient Credit", 400));
    }
    if (!User_id || credit == undefined) {
      return next(new ErrorResponse("User_id and credit are required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(User_id)) {
      return next(new ErrorResponse("Invalid User_id format", 400));
    }

    if (typeof credit !== "number" || credit < 0) {
      return next(new ErrorResponse("Credit must be a non-negative number", 400));
    }

    if (req.user.role != "Super_Admin" && req.user.role != "Sub_Admin") {
      return next(new ErrorResponse("Unauthorized to perform this action", 403));
    }
    const filter =
      req.user.role == "Super_Admin"
        ? { _id: User_id }
        : { "CreatedBy.email": req.user.email, _id: User_id };
    const targetUser = await User.findOne(filter);
    if (!targetUser) {
      return next(new ErrorResponse("User not found", 404));
    }
    targetUser.credit += Number(credit);

    const ops = [targetUser.save({ validateBeforeSave: true })];

    if (req.user.role !== "Super_Admin") {
      req.user.credit -= credit;
      ops.push(req.user.save({ validateBeforeSave: true }));
    }

    await Promise.all(ops);
    await CreditHistory.create({
      User: { Name: targetUser.Name, ID: targetUser._id, Role: targetUser.role },
      modifiedBy: {
        id: req.user._id,
        model: req.user.role,
        Name: req.user.Name,
      },
      amount: credit,
      operation: "credit_added",
    });

    res.status(200).json({
      success: true,
      message: `Successfully added ${credit} credit.`,
      updatedCredit: User.credit,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message || "Internal Server Error", 500));
  }
});
exports.raiseclaim = catchAsyncerror(async (req, res) => {

  const {
    phone,
    ['Beneficiary Account No']: accountNo,
    ['Beneficiary Name']: beneficiaryName,
    ['BIC / SWIFT / IFSC Code']: ifsc,
    Payment_By,
    Amount,
    utr,
    status,
    createdAt, _id
  } = req.body.data;
  const payout = await Payout.findById(_id);
  if (!payout) {
    return res.status(404).json({ message: "Payout not found." });
  }
  try {
    const [superAdmin, subAdmin, normalUser] = await Promise.all([
      SuperAdmin.findOne({ email: Payment_By[0].email }),
      Subadmin.findOne({ email: Payment_By[0].email }),
      User.findOne({ email: Payment_By[0].email }),
    ]);

    const matchedUser = superAdmin || subAdmin || normalUser;

    if (!matchedUser) {
      return res.status(404).json({ message: "Payment_By user not found" });
    }

    const claim = await Claims.create({
      phone: phone || "",
      claimby: req.user,
      accountNumber: accountNo,
      accountHolderName: beneficiaryName,
      ifsc,
      Payment_By: matchedUser,
      Amount,
      utr: payout.utr,
      Bank_Utr: payout.Bank_Utr,
      status,
      CLAIMstatus: "Active",
      payoutdate: createdAt
    });
    const io = req.app.get("io");
    const notification = {
      message: `"${req.user.Name}" (${req.user.role}) has been Raised cliam for ${payout["Beneficiary Account No"]}((${payout["Beneficiary Name"]})).`,
      type: "success",
      createdAt: new Date(),
    };
    return res.status(200).json("Claim Raised");
  } catch (error) {

    console.log(error)
    return res.status(500).json({ error: error.message });
  }
});
exports.UploadBUlkBenificieryaccount = catchAsyncerror(async (req, res) => {
  //console.log("File path:", req.file);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = req.file.path;
  // console.log(req.file)
  try {
    await BulkBenificieryaccountfiles.create({
      filename: req.file.originalname,
      filepath: filePath,
      uploadedBy: { id: req.user._id, email: req.user.email, role: req.user.role, Name: req.user.Name },
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),

    })
    const io = req.app.get("io");

    const notification = {
      message: `${req.user.email} (${req.user.role}) Upload new Bulkbenficiery File.`,
      type: "success",
      createdAt: new Date(),
    };

    // Role-based emission
    if (req.user.role === "Super_Admin") {
      io.to("Super_Admin").emit("notification", notification);
    } else if (req.user.role === "Sub_Admin") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    else if (req.user.role === "User") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



exports.downloadBUlkBenificieryaccount = catchAsyncerror(async (req, res) => {
  const { id } = req.params;
  const fileRecord = await BulkBenificieryaccountfiles.findById(id);
  if (!fileRecord) { return res.status(404).json({ error: "File not found" }); }
  const filerecordpath = path.resolve(fileRecord.filepath)
  // console.log(filerecordpath)
  if (!fs.existsSync(filerecordpath)) { return res.status(404).json({ error: "File not found on server" }); }
  res.setHeader("Content-Disposition", `attachment; filename="${fileRecord.filename}"`);
  res.setHeader("Content-Type", "text/csv");
  const fileStream = fs.createReadStream(filerecordpath);
  fileStream.pipe(res);

  fileStream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Error reading file" });
  });
});

exports.ViewBUlkBenificieryaccount = catchAsyncerror(async (req, res) => {
  const { page = 1, limit = 10, } = req.query;
  const skip = (page - 1) * parseInt(limit);
  const { role, email } = req.user

  let query = {};
  if (role == "Super_Admin") {
    query = {};
  } else if (role == "User") {
    query = { "uploadedBy.email": req.user.email };
  } else if (role == "Sub_Admin") {
    const users = await User.find({ 'CreatedBy.email': email });
    const userEmails = users.map((user) => user.email);
    userEmails.push(req.user.email.toString());
    //console.log(userEmails)
    //console.log(query, "query")
    query = { "uploadedBy.email": { $in: userEmails } }
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }

  const csvfile = await BulkBenificieryaccountfiles.find(query);
  res.status(200).json({ data: csvfile })

})
exports.changeBUlkBenificieryaccountStatus = catchAsyncerror(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const fileRecord = await BulkBenificieryaccountfiles.findById(id);
  if (!fileRecord) {
    return res.status(404).json({ error: "File not found" });
  }

  // Update status
  fileRecord.status = status || "pending";
  fileRecord.updatedAt = new Date();
  await fileRecord.save();

  res.status(200).json({
    message: "Status updated successfully",
    data: fileRecord,
  });
});

// skip alredy exist
exports.processBulkBeneficiaries = catchAsyncerror(async (req, res) => {
  try {
    const { id } = req.params; // file id stored earlier

    // Find uploaded file record
    const fileRecord = await BulkBenificieryaccountfiles.findById(id);
    if (!fileRecord) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.resolve(fileRecord.filepath);

    // Parse Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

    if (data.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Map rows → DB schema
    const beneficiariesFromExcel = data.map((row) => ({
      "Beneficiary Code": row["Beneficiary Code"] || "",
      "Beneficiary Address 1": row["Beneficiary Address 1"] || "",
      "Beneficiary Account No": row["Beneficiary Account No."] || "",
      "Beneficiary Name": row["Beneficiary Name"] || "",
      "BIC / SWIFT / IFSC Code": row["BIC / SWIFT / IFSC Code"] || "",
      "Beneficiary Bank Name": row["Beneficiary Bank Name"] || "",
      "Payment Method Name": row["Payment Method Name"] || "",
      "Effective From": row["Effective From"] || "",
      status: "approved",
      createdBy: [
        {
          email: fileRecord.uploadedBy.email,
          name: fileRecord.uploadedBy.Name,
          role: fileRecord.uploadedBy.role,
        },
      ],
      updatedBy: [
        {
          email: fileRecord.uploadedBy.email,
          name: fileRecord.uploadedBy.Name,
          role: fileRecord.uploadedBy.role,
        },
      ],
    }));

    // Get all account numbers from the Excel file to check for existing beneficiaries
    const accountNumbers = beneficiariesFromExcel.map(
      (b) => b["Beneficiary Account No"]
    );

    // Find existing beneficiaries in the database
    const existingBeneficiaries = await BeneficiaryAccount.find({
      "Beneficiary Account No": { $in: accountNumbers },
    });

    // Create a set of existing account numbers for efficient lookup
    const existingAccountNumbers = new Set(
      existingBeneficiaries.map((b) => b["Beneficiary Account No"])
    );

    // Filter out beneficiaries that already exist
    const newBeneficiaries = beneficiariesFromExcel.filter(
      (b) => !existingAccountNumbers.has(b["Beneficiary Account No"])
    );

    // Insert only the new beneficiaries
    if (newBeneficiaries.length > 0) {
      await BeneficiaryAccount.insertMany(newBeneficiaries);
    }

    const skippedCount = beneficiariesFromExcel.length - newBeneficiaries.length;

    fileRecord.status = "approved";
    await fileRecord.save();

    return res.status(201).json({
      message: "Bulk beneficiaries processed successfully",
      file: fileRecord.filename,
      inserted: newBeneficiaries.length,
      skiped: skippedCount,
      skippedmsg: skippedCount > 0 ? `${skippedCount} beneficiaries were skipped as they already exist.` : "No beneficiaries were skipped.",
    });
  } catch (error) {
    console.error("Bulk process error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// bulpayout 

exports.UploadBUlkPayoutfile = catchAsyncerror(async (req, res) => {
  //console.log("File path:", req.file);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = req.file.path;
  // console.log(req.file)
  try {
    await BulkPayoutfiles.create({
      filename: req.file.originalname,
      filepath: filePath,
      uploadedBy: { id: req.user._id, email: req.user.email, role: req.user.role, Name: req.user.Name },
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),

    })
    const io = req.app.get("io");

    const notification = {
      message: `${req.user.email} (${req.user.role}) Upload new Bulkpayout File.`,
      type: "success",
      createdAt: new Date(),
    };

    // Role-based emission
    if (req.user.role === "Super_Admin") {
      io.to("Super_Admin").emit("notification", notification);
    } else if (req.user.role === "Sub_Admin") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    else if (req.user.role === "User") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
exports.UploadBUlkPayoutbankfile = catchAsyncerror(async (req, res) => {
  //console.log("File path:", req.file);
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = req.file.path;
  // console.log(req.file)
  try {
    const record = await BulkPayoutfiles.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "File not found" });

    record.bankFile = {
      filename: req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date()
    };
    record.status = "bank_uploaded";
    await record.save();


    const io = req.app.get("io");

    const notification = {
      message: `${req.user.email} (${req.user.role}) Upload new Bulkpayout File.`,
      type: "success",
      createdAt: new Date(),
    };

    // Role-based emission
    if (req.user.role === "Super_Admin") {
      io.to("Super_Admin").emit("notification", notification);
    } else if (req.user.role === "Sub_Admin") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    else if (req.user.role === "User") {
      io.to("Super_Admin").emit("notification", notification);
      io.to("Sub_Admin").emit("notification", notification);
    }
    res.json({ message: "Bank file uploaded successfully", record });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
exports.downloadBUlkPayoutfile = catchAsyncerror(async (req, res) => {
  const { id } = req.params;
  const indiaTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];

  // 1️⃣ Find file record
  const fileRecord = await BulkPayoutfiles.findById(id);
  if (!fileRecord) {
    return res.status(404).json({ error: "File not found in database" });
  }

  const filePath = path.resolve(fileRecord.filepath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on server" });
  }

  // 2️⃣ Read the Excel or CSV file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // 3️⃣ Convert each row into structured transactionData
  const formattedData = jsonData.map((row) => {
    const accountDataStr = row["Account Data"];
    const accountData = {};

    if (accountDataStr) {
      const parts = accountDataStr.split(/\t+/);
      parts.forEach((part) => {
        const [key, value] = part.split(" : ").map((str) => str.trim());
        if (key && value) {
          const formattedKey = key.toLowerCase().replace(/\s+/g, "_");
          accountData[formattedKey] = value;
        }
      });
    }
    // console.log(accountData)
    // console.log(row)
    const transactionData = {
      "Payment Amount (Request)": row["Amount"] ? (row["Amount"]) : null,
      "IFSC CODE": accountData["ifsc_code"]?.trim(),
      "Beneficiary Account No": accountData["account_number"]?.toString().trim(),
      "Beneficiary Bank Name": accountData["bank_name"]?.trim(),
      "Beneficiary Name (Request)": accountData["account_holder_name"]?.toString().trim(),
      "Phone/Mobile No": "",
      "Email": "",
      "REMARKS": "",
      "Payment Instructions 1": "",
      "CCY": "INR",
      "Payment Method": "IMPS",
    };

    return transactionData;
  });

  // 4️⃣ Convert back to Excel for download (you can also return JSON if you prefer)
  const newSheet = XLSX.utils.json_to_sheet(formattedData);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Processed_Data");

  // 5️⃣ Save converted file temporarily
  const downloadsDir = path.join(__dirname, "../downloads");

  // Create folder if it doesn't exist
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const outputFilePath = path.join(
    downloadsDir,
    `Processed_Bulk_Payout_${Date.now()}.xlsx`
  );
  XLSX.writeFile(newWorkbook, outputFilePath);

  // 6️⃣ Send file for download
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Processed_Bulk_Payout.xlsx"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  const fileStream = fs.createReadStream(outputFilePath);
  fileStream.pipe(res);

  fileStream.on("close", () => {
    // Optional: clean up temporary file
    fs.unlink(outputFilePath, () => { });
  });

  fileStream.on("error", (err) => {
    console.error("Stream error:", err);
    res.status(500).json({ error: "Error generating download" });
  });
});


exports.ViewBUlkPayoutfiles = catchAsyncerror(async (req, res) => {
  const { page = 1, limit = 10, } = req.query;
  const skip = (page - 1) * parseInt(limit);
  const { role, email } = req.user

  let query = {};
  if (role == "Super_Admin") {
    query = {};
  } else if (role == "User") {
    query = { "uploadedBy.email": req.user.email };
  } else if (role == "Sub_Admin") {
    const users = await User.find({ 'CreatedBy.email': email });
    const userEmails = users.map((user) => user.email);
    userEmails.push(req.user.email.toString());
    //console.log(userEmails)
    //console.log(query, "query")
    query = { "uploadedBy.email": { $in: userEmails } }
  } else {
    return res.status(403).json({ message: "Not authorized" });
  }
  // console.log(query)
  const csvfile = await BulkPayoutfiles.find(query);
  res.status(200).json({ data: csvfile })

})
exports.update_Payoutfilestatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const fileRecord = await BulkBenificieryaccountfiles.findById(id);
  if (!fileRecord) {
    return res.status(404).json({ error: "File not found" });
  }

  // Update status
  fileRecord.status = status || "Pending";
  fileRecord.updatedAt = new Date();
  await fileRecord.save();

  res.status(200).json({
    message: "Status updated successfully",
    data: fileRecord,
  });
};

exports.processBulkPayout = catchAsyncerror(async (req, res) => {
  try {
    const { id } = req.params;
    // 📂 Find uploaded file record
    const record = await BulkPayoutfiles.findById(id);
    if (!record?.bankFile) {
      return res.status(404).json({ error: "Bank file missing" });
    }

    const filePath = path.resolve(record.bankFile.path);

    // 📑 Parse Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 13 });

    if (jsonData.length === 0) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // 🔑 Identify logged-in user
    const [superAdmin, subAdmin, normalUser] = await Promise.all([
      SuperAdmin.findOne({ email: record.uploadedBy.email }),
      Subadmin.findOne({ email: record.uploadedBy.email }),
      User.findOne({ email: record.uploadedBy.email }),
    ]);
    const matchedUser = superAdmin || subAdmin || normalUser;
    if (!matchedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 📌 Helper: Parse Excel date
    const parseExcelDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (!isNaN(value)) {
        const dateObj = XLSX.SSF.parse_date_code(value);
        if (dateObj) return new Date(dateObj.y, dateObj.m - 1, dateObj.d);
      }
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    // 📌 Process rows
    let successCount = 0, failedCount = 0, skippedCount = 0;
    const payouts = [];
    // console.log(jsonData)
    for (const row of jsonData) {
      const accountDataStr = row["Account Data"];
      const accountData = {};

      if (accountDataStr) {
        const parts = accountDataStr.split(/\t+/);
        parts.forEach((part) => {
          const [key, value] = part.split(" : ").map((str) => str.trim());
          if (key && value) {
            const formattedKey = key.toLowerCase().replace(/\s+/g, "_");
            accountData[formattedKey] = value;
          }
        });
      }

      try {
        const beneficiaryCode = accountData["ACCOUNT HOLDER NAME"]?.toString().trim();
        const beneficiaryName = accountData["ACCOUNT HOLDER NAME"]?.trim();
        const beneficiaryAccountNo = accountData["ACCOUNT NUMBER"]?.toString().trim();
        const ifsc = accountData["IFSC CODE"]?.trim();
        const bankName = accountData["BANK NAME"]?.trim();
        const paymentMethod = row["Payment Type"]?.trim();
        const Amount = row["Amount"] ? (row["Amount"]) : null;
        const remark = row["Remarks"]?.trim() || "";
        const utr = row["UTR no./ Transaction Reference no."]?.trim() || "";
        const Bank_Utr = row["UTR no./ Transaction Reference no."]?.trim() || "";
        // const paymentDate = parseExcelDate(row["Initiated On"]);

        if (!beneficiaryCode || !beneficiaryName || !beneficiaryAccountNo || !ifsc || !bankName || !paymentMethod || !Amount) {
          skippedCount++;

          // console.log(`❌ 
          // Missing required fields in row: ${JSON.stringify(row)}`);
          // console.log(`❌ Missing required fields in row: ${JSON.stringify(row)}`);
          continue;
        }
        // return
        // ✅ Verify beneficiary exists
        const beneficiary = await BeneficiaryAccount.findOne({
          "Beneficiary Account No": beneficiaryAccountNo,
          "BIC / SWIFT / IFSC Code": ifsc,
        });
        if (!beneficiary) {
          beneficiary = await BeneficiaryAccount.create({
            ["Beneficiary Code"]: beneficiaryCode || beneficiaryName,
            ["Beneficiary Name"]: beneficiaryName,
            ["Beneficiary Address 1"]: ".",
            ["Beneficiary Account No"]: beneficiaryAccountNo,
            ["BIC / SWIFT / IFSC Code"]: ifsc,
            ["Beneficiary Bank Name"]: bankName || "",
            ["Payment Method Name"]: paymentMethod || "IMPS",
            ["Effective From"]: new Date(),
            status: "approved", // directly approved for API clients
            createdBy: [
              {
                email: req.user.email,
                name: req.user.Name,
                role: req.user.role,
              },
            ],
          });
        }

        // 💰 Balance check
        if (record.uploadedBy.role !== "Super_Admin" && matchedUser.credit < Amount) {
          failedCount++;
          console.log(`❌ Insufficient credit for user: ${matchedUser.email}`);
          return res.status(400).json({
            success: false,
            message: "Insufficient credit to process this payout.",
          });
          continue;
        }
        const indiaTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];

        const payout = await Payout.create({
          ["Beneficiary Code"]: beneficiaryCode,
          ["Beneficiary Name"]: beneficiaryName,
          ["Beneficiary Address 1"]: beneficiary["Beneficiary Address 1"],
          ["Beneficiary Account No"]: beneficiaryAccountNo,
          ["BIC / SWIFT / IFSC Code"]: ifsc,
          ["Beneficiary Bank Name"]: bankName,
          ["Payment Method Name"]: paymentMethod,
          Amount,
          Bank_Utr: Bank_Utr,
          utr: utr,
          remark,
          Payment_By: [
            {
              email: record.uploadedBy.email,
              name: record.uploadedBy.Name,
              role: record.uploadedBy.role,
            },
          ],
          status: "Credited",
          Availble_balance: matchedUser.credit - Amount,
          Credit_status: `Confirmed ${indiaTime}`
        });

        // 💳 Deduct credits
        if (record.uploadedBy.role !== "Super_Admin") {
          matchedUser.credit -= Amount;
          await matchedUser.save();
        }
        record.status = "processed"
        await record.save()
        // 🔄 Save transaction
        await Transaction.create({
          userId: matchedUser._id,
          type: "debit",
          "Beneficiary Name": payout["Beneficiary Name"],
          "Beneficiary Account No": payout["Beneficiary Account No"],
          "BIC / SWIFT / IFSC Code": payout["BIC / SWIFT / IFSC Code"],
          "Beneficiary Bank Name": payout["Beneficiary Bank Name"],
          utr: payout.utr,
          Bank_Utr: payout.Bank_Utr,
          amount: Amount,
          balanceAfter: matchedUser.credit,
          description: `Bulk payout initiated for ${beneficiaryName}`,
        });

        // 📢 Notify via socket
        const io = req.app.get("io");
        io.to("Super_Admin").emit("notification", {
          message: `Bulk payout of ₹${Amount} to "${payout["Beneficiary Name"]}" initiated by ${record.uploadedBy.Name}.`,
          type: "success",
          createdAt: new Date(),
        });

        if (record.uploadedBy.role !== "Super_Admin") {
          io.to("Sub_Admin").emit("notification", {
            message: `Bulk payout of ₹${Amount} to "${payout["Beneficiary Name"]}" initiated by ${record.uploadedBy.Name}.`,
            type: "success",
            createdAt: new Date(),
          });
        }

        // 🚦 Auto status flow
        setTimeout(async () => {
          const pending = await Payout.findOneAndUpdate(
            { _id: payout._id, status: "Processing" },
            { $set: { status: "Pending" } },
            { new: true }
          );
          if (pending) {
            setTimeout(async () => {
              await Payout.findOneAndUpdate(
                { _id: payout._id, status: "Pending" },
                { $set: { status: "Credited" } },
                { new: true }
              );
            }, 30000);
          }
        }, 5000);

        payouts.push(payout);
        successCount++;
      } catch (err) {
        console.error("❌ Row error:", err);
        failedCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: "✅ Bulk payouts processed",
      file: record.filename,
      totalRows: jsonData.length,
      inserted: successCount,
      failed: failedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("❌ Bulk process error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});


const { parse } = require("csv-parse");

// 🔹 Helper function to parse SMS text
// Drop-in replacement
function parseSMS(text) {
  if (!text || typeof text !== "string") {
    return { amount: null, utr: null, name: null };
  }
  // console.log(text, "text")
  // Amount: supports "INR 800.00", "Rs.9,377.19", "Rs 99"
  const amountMatch = text.match(/(?:INR|Rs\.?)\s?([\d,]+(?:\.\d{2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

  // Find the line that contains IMPS
  const lines = text.split(/\r?\n/);
  const impsLine = lines.find(l => /IMPS/i.test(l)) || "";

  // UTR: numbers after IMPS-
  const utrMatch = impsLine.match(/IMPS[-\s]*([0-9]+)/i);
  const utr = utrMatch ? utrMatch[1] : null;

  // Name: text after "IMPS-<digits>" and first hyphen, up to the next hyphen or EOL
  let name = null;
  if (impsLine) {
    // Remove everything up to the first "IMPS-<digits>"
    let after = impsLine.replace(/.*IMPS[-\s]*[0-9]+/i, "");
    // Trim leading separators like " - "
    after = after.replace(/^[\s\-–—:]+/, "");
    // Take up to the next '-' (often IFSC) or end of string
    name = after.split("-")[0].trim();
    // Normalize excessive spaces
    if (name) name = name.replace(/\s+/g, " ");
    if (!name) name = null;
  }

  return { amount, utr, name };
}



exports.Getutr = catchAsyncerror(async (req, res) => {
  const indiaTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const sheetId = "1_E5RpIw9-3hS3I2NyjOn86EzLybW0Or2Ybz4hU3v7qc";
    const gid = "0";
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    // Fetch CSV from Google Sheets
    const response = await axios({
      method: "get",
      url: sheetUrl,
      responseType: "stream",
    });

    const results = [];
    const csvStream = response.data.pipe(parse({ columns: true, trim: true }));

    csvStream.on("data", (data) => results.push(data));

    csvStream.on("end", async () => {
      if (results.length === 0) {
        return res.status(404).json({ error: "No data found in Google Sheet" });
      }

      // Parse messages and attach row index
      const parsedResults = results
        .map((msg, index) => {
          if (!msg.messages) return null;
          return { rowIndex: index + 1, ...msg, ...parseSMS(msg.messages), };
        })
        .filter(Boolean);

      const updatedPayouts = [];
      const notFoundRows = [];

      // Update payouts in MongoDB
      for (let msg of parsedResults) {
        const { amount, utr, name, rowIndex, messages, date } = msg;

        if (!amount || !name) {
          notFoundRows.push(rowIndex);
          continue;
        }
        const isRejected = /RETURN|REJECT/i.test(messages || "");
        let payout;
        if (isRejected) {
          function extractUTRNumber(messages) {
            // Extract after "Ref" or "Ref RETURN" and remove non-digit characters
            const match = messages.match(/Ref\s+(?:RETURN\s+)?([A-Z]*-)?(\d+)/i);
            return match ? match[2] : null;
          }
          // include all statuses, even previously rejected ones
          payout = await Payout.findOne({
            ["Beneficiary Name"]: new RegExp("^" + name.trim() + "$", "i"),
            Amount: amount,
            status: { $ne: "Failed" },
            utr: extractUTRNumber(msg.messages)
          });
        } else {
          payout = await Payout.findOne({
            ["Beneficiary Name"]: new RegExp("^" + name.trim() + "$", "i"),
            Amount: amount,
            status: { $ne: "Failed" },
            $or: [{ utr: { $exists: false } }, { utr: null }, { utr: "" }],
          });
        }
        const fixed = date
          .replace(/\bat\b/i, "")               // remove " at "
          .replace(/(\d)(AM|PM)\b/i, "$1 $2")   // ensure space before AM/PM
          .trim();
        const indiaTime = new Date(fixed + " GMT+0530");

        // Step 2: Convert to UTC ISO format
        const utcTime = indiaTime.toISOString();
        const now = new Date();
        now.setHours(now.getHours() - 1);

        const oneHourAgoUTC = now.toISOString();
        if (utcTime < oneHourAgoUTC) {
          // If payout is older than 1 hour, mark as not found for deletion
          notFoundRows.push(rowIndex);
        }
        if (!payout) {
          // console.log(`⚠️ No matching payout found for Name: ${name}, Amount: ${amount}`);
          // notFoundRows.push(rowIndex);
          continue;
        }
        let Model;
        switch (payout.Payment_By?.[0]?.role) {
          case "Sub_Admin":
            Model = Subadmin;
            break;
          case "User":
            Model = User;
            break;
          case "Super_Admin":
            Model = SuperAdmin;
            break;
          default:
            return res.status(400).json({ message: "Invalid Payment_By model." });
        }
        // console.log(payout, "payout");
        // return
        const user = await Model.findOne({ email: payout.Payment_By[0].email }); // assuming payout.CreatedBy has user ID

        if (isRejected) {
          payout.status = "rejected";
          payout.Credit_status = `Rejected ${indiaTime}`;
          payout.remark = "Payment returned by bank";

          // Refund to user credit and create transaction
          if (user) {
            user.credit = (user.credit || 0) + (amount || 0);
            await user.save();

            await Transaction.create({
              userId: user._id,
              'Beneficiary Name': payout['Beneficiary Name'],
              'Beneficiary Account No': payout['Beneficiary Account No'],
              'BIC / SWIFT / IFSC Code': payout['BIC / SWIFT / IFSC Code'],
              'Beneficiary Bank Name': payout['Beneficiary Bank Name'],
              utr: payout.utr,
              Bank_Utr: payout.Bank_Utr,
              type: "credit",
              amount: amount,
              balanceAfter: user.credit,
              devremark: "reverse from auto utr service",
              description: `Refund for rejected payout (ID: ${payout._id})`,
            });
          }
          notFoundRows.push(rowIndex);

        } else {
          // normal approval logic
          if (utr) payout.utr = utr;
          if (name) payout["Beneficiary Name"] = name;
          if (amount) payout.Amount = amount;
          payout.status = "Credited";
          payout.Credit_status = `Confirmed ${indiaTime}`;
          payout.remark = payout.remark;
        }
        await payout.save();
        updatedPayouts.push(payout);

        if (user.call_back_url && payout.status !== "Credited", payout.utr != "") {
          console.log(`✅ Payout ${payout._id} approved`);

          // ✅ Callback Trigger
          const callbackPayload = {
            payoutId: payout._id,
            status: payout.status,
          };
          try {


            console.log(user.call_back_url)
            const datat = await axios.post(user.call_back_url, callbackPayload, {
              headers: { "Content-Type": "application/json" },
            })
            console.log(`📩 Callback sent to ${user.call_back_url}`);

          } catch (error) {
            console.log("error", error.response.data)
          }
        }
      }
      // Optimized deletion of not-found rows from Google Sheet
      if (notFoundRows.length > 0) {
        const auth = new google.auth.GoogleAuth({
          keyFile: "service-account.json",
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: client });

        // Sort descending to handle index shift
        notFoundRows.sort((a, b) => b - a);

        // Group consecutive rows
        let ranges = [];
        let start = notFoundRows[0];
        let end = start;

        for (let i = 1; i < notFoundRows.length; i++) {
          if (notFoundRows[i] === end - 1) {
            end = notFoundRows[i];
          } else {
            ranges.push({ startIndex: end, endIndex: start + 1 });
            start = notFoundRows[i];
            end = start;
          }
        }
        ranges.push({ startIndex: end, endIndex: start + 1 });

        // Prepare batch requests
        const requests = ranges.map((range) => ({
          deleteDimension: { range: { sheetId: Number(gid), dimension: "ROWS", ...range } },
        }));

        // Execute batch update
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: { requests },
          });
          console.log(`✅ Deleted ${notFoundRows.length} rows in ${ranges.length} batch requests`);
        } catch (err) {
          console.error("Error deleting rows:", err.response.data);
        }
      }

      // Return response
      return res.json({
        count: parsedResults.length,
        updated: updatedPayouts.length,
        updatedPayouts,
        notFound: notFoundRows.length,
        deletedRows: notFoundRows,
      });
    });

    csvStream.on("error", (err) => {
      console.error("CSV Parsing Error:", err);
      res.status(500).json({ error: "Failed to parse CSV data" });
    });
  } catch (error) {
    console.error("Error fetching UTR:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
});




const ExcelJS = require("exceljs");
const Transaction = require("../models/Transaction");

exports.download_payout_excel = async (req, res) => {
  try {
    const { role, email, _id, credit = 0, name } = req.user;
    const { fromDate, toDate } = req.query;

    // --- Base queries ---
    let payoutQuery = {};
    let transactionQuery = {};
    let creditHistoryQuery = {};

    if (role === "Super_Admin") {
      // keep empty = fetch all
    } else if (role === "User") {
      payoutQuery = { "Payment_By.email": email };
      transactionQuery = { userId: new mongo.ObjectId(_id) };
      creditHistoryQuery = { "User.ID": _id };
    } else if (role === "Sub_Admin") {
      const users = await User.find({ "CreatedBy.email": email }).select("email _id");
      const userEmails = users.map((u) => u.email).concat(email);
      const userIds = users.map((u) => u._id).concat(new mongo.ObjectId(_id));

      payoutQuery = { "Payment_By.email": { $in: userEmails } };
      transactionQuery = { userId: { $in: userIds } };
      creditHistoryQuery = { "User.ID": new mongo.ObjectId(_id) };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    // --- Date filter ---
    if (fromDate && toDate) {
      const start = moment.tz(fromDate, "Asia/Kolkata").startOf("day").toDate();
      const end = moment.tz(toDate, "Asia/Kolkata").endOf("day").toDate();

      payoutQuery.updatedAt = { $gte: start, $lte: end };
      transactionQuery.createdAt = { $gte: start, $lte: end };
      creditHistoryQuery.createdAt = { $gte: start, $lte: end };
    }

    // --- Fetch data in parallel ---
    const [transactions, creditHistories] = await Promise.all([
      Transaction.find(transactionQuery).sort({ createdAt: 1 }).lean(),
      CreditHistory.find(creditHistoryQuery).sort({ createdAt: 1 }).lean(),
    ]);

    // --- Transform CreditHistory into same format ---
    const creditHistoryMapped = creditHistories.map((item) => ({
      _id: item._id,
      status: "rejected",
      Amount: item.amount || 0,
      utr: "",
      remark: item.operation?.includes("credit_added") ? "Wallet Transaction"
        : "",
      "Beneficiary Name": item.modifiedBy?.model || "",
      "Beneficiary Bank Name": item.modifiedBy?.Name || "",
      "Beneficiary Account No": "",
      "BIC / SWIFT / IFSC Code": "",
      Availble_balance: item.balanceAfter,
      createdAt: item.createdAt,
    }));

    // --- Transform Transaction into same format ---
    const accountNumbers = transactions.map(t => t["Beneficiary Account No"]).filter(Boolean);

    // Step 2: Fetch payouts that match accounts
    const payouts = await Payout.find({
      "Beneficiary Account No": { $in: accountNumbers }
    }).lean();

    // Step 3: Function to check same hour
    const isSameHour = (date1, date2) => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate() &&
        d1.getHours() === d2.getHours()
      );
    };
    // Step 4: Map transactions with matched payouts
    const transactionMapped = transactions.map((t) => {
      const matchedPayout = payouts.find(p =>
        p["Beneficiary Account No"] === t["Beneficiary Account No"] &&
        p.Amount === t.amount &&
        isSameHour(p.createdAt, t.createdAt) // ✅ same hour match
      );

      return {
        _id: t._id,
        status: t.type === "credit" ? "Failed" : "Credited",
        Amount: t.amount,
        utr: req.user.role == "User"
          ? ((matchedPayout?.transaction_id || matchedPayout?.utr) || "")
          : `${matchedPayout?.utr || ""} transaction_id:- ${(matchedPayout?.transaction_id) || ""}`,
        remark: t.description.includes("Refund") ? "Refund Entry" : "Payout Transaction",
        "Beneficiary Name": t["Beneficiary Name"] || "",
        "Beneficiary Account No": t["Beneficiary Account No"] || "",
        "BIC / SWIFT / IFSC Code": t["BIC / SWIFT / IFSC Code"] || "",
        "Beneficiary Bank Name": t["Beneficiary Bank Name"] || "",
        Availble_balance: t.balanceAfter,
        createdAt: t.createdAt,
      };
    });

    // --- Merge & sort ---
    const allData = [...transactionMapped, ...creditHistoryMapped].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    // console.log(allData)
    // --- Opening Balance ---
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payout Statement");
    // let totalDebits = 0;
    // Headers
    let totalDebits = 0;

    // --- Calculate Opening Balance ---
    allData.forEach((p) => {
      if (p.status === "Credited") totalDebits += p.Amount;
    });

    const openingBalance = totalDebits + (req.user.credit || 0);
    // / Insert Opening Balance at row 2
    sheet.spliceRows(2, 0, ["", "", "", "", "Opening Balance", openingBalance]);
    const openingRow = sheet.getRow(2);
    openingRow.getCell(5).font = { bold: true };
    openingRow.getCell(6).font = { bold: true };
    openingRow.alignment = { horizontal: "right" };
    openingRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }, // light blue background
      };
    });
    // Now manually add header row on line 3
    const headerRow = sheet.insertRow(3, [
      "Beneficiary Name",
      "Beneficiary Account No.",
      "Beneficiary Bank Name",
      "BIC / SWIFT / IFSC Code",
      "Utr",
      "Remark",
      "Debit (₹)",
      "Credit (₹)",
      "Available Balance",
      "Date",
    ]);

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }, // light blue background
      };
    });

    // Now set column widths (this doesn’t write headers anymore, just widths)
    sheet.columns = [
      { key: "name", width: 25 },
      { key: "account", width: 20 },
      { key: "bank", width: 25 },
      { key: "ifsc", width: 25 },
      { key: "utr", width: 25 },
      { key: "remark", width: 25 },
      { key: "debit", width: 12 },
      { key: "credit", width: 12 },
      { key: "Availble_balance", width: 18 },
      { key: "date", width: 20 },
    ];
    allData.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    // console.log(allData)
    // let balance = req.user.balance || 0;
    allData.forEach(p => {
      // console.log(p)
      const debit = p.status === "Credited" ? p.Amount || p.amount : 0;
      const credit = p.status === "Failed" ? p.Amount || p.amount : 0;
      const name = p['Beneficiary Name'] || p.accountHolderName || "";
      const account = p['Beneficiary Account No'] || p.accountNumber || "";
      const bank = p['Beneficiary Bank Name'] || p.bankName || "";
      const ifsc = p['BIC / SWIFT / IFSC Code'] || p.ifsc || "";
      const utr = p.utr || "";
      const remark = p.remark || "";
      const Availble_balance = p.Availble_balance || "";
      const date = p.createdAt ? new Date(p.createdAt).toLocaleString("en-Us", { timeZone: 'Asia/Kolkata' }) : "";
      // totalDebits += debit;
      sheet.addRow({
        name,
        account,
        bank,
        ifsc,
        utr,
        remark,
        debit,
        credit,
        Availble_balance,
        date,
      });
    });



    sheet.addRow([]);

    // 🎯 Add Available Balance line (text in column E, value in column F)
    const row = sheet.addRow(["", "", "", "", "Available Balance", req.user.credit]);

    // 👉 Do NOT merge A:E (that was shifting value wrongly)
    // Instead, just make style nice:
    row.getCell(5).font = { bold: true }; // "Available Balance"
    row.getCell(6).font = { bold: true }; // balance value
    row.alignment = { horizontal: "right" };
    // Response
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9E1F2" }, // light blue background
      };
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payout_statement_${req.user.name}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel Download Error:", error.message);
    return res.status(500).json({ message: "Failed to download Excel" });
  }
};

exports.findUtr = catchAsyncerror(async (req, res) => {
  try {
    const { transaction_id } = req.params;
    // console.log(transaction_id)
    if (!transaction_id) {
      return res.status(400).json({ error: "transaction id parameter is required" });
    }
    const payout = await Payout.find({ transaction_id: transaction_id },
    );
    if (!payout) {
      return res.status(404).json({ error: "Payout not found" });
    }
    const trexoResponse = await axios.get(
      `https://reseller.api.payout.trexoedge.com/api/v1/check_status/${transaction_id}`,
      {
        headers: {
          "x-trexo-key": process.env["x-trexo-key"],
          "x-trexo-secret": process.env["x-trexo-secret"],
          "x-trexo-id": process.env["x-trexo-id"],
          Accept: "application/json",
        },
      }
    );
    const data = trexoResponse.data.data;
    if (data.utr) {
      await Payout.findOneAndUpdate(
        { transaction_id: data.transaction_id },
        { status: data.status, utr: data.utr }
      );
      return res.status(200).json({ message: "Payout UTR", utr: data.utr });
    }
    return res.status(404).json({ message: "UTR not found for this payout" });
  } catch (error) {
    console.error("Find UTR Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
})

exports.add_Bulk_utr_Payout = catchAsyncerror(async (req, res) => {
  const indiaTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = req.file.path;

    // 📑 Parse Excel (skip first 13 rows)
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { range: 13 });

    if (!jsonData.length) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // 🔑 Identify logged-in user


    // 📌 Helper: Excel date parser
    const parseExcelDate = (value) => {
      if (!value) return null;
      if (value instanceof Date) return value;
      if (!isNaN(value)) {
        const d = XLSX.SSF.parse_date_code(value);
        return d ? new Date(d.y, d.m - 1, d.d) : null;
      }
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    let successCount = 0,
      failedCount = 0,
      skippedCount = 0;
    const payouts = [];

    for (const row of jsonData) {
      // console.log(row);
      try {
        const beneficiaryCode = row["Beneficiary Code"]?.toString().trim();
        const beneficiaryName = row["Beneficiary Name"]?.trim();
        const beneficiaryAccountNo = row["Beneficiary A/c no"]?.toString().trim();
        const ifsc = row["Beneficiary Bank BIC Code"]?.trim();
        const bankName = row["Beneficiary Bank Name"]?.trim();
        const paymentMethod = row["Payment Method"]?.trim();
        const Amount = row["Amount Payable"] || null;
        const remark = row["Remarks"]?.trim() || "";
        const Bank_Utr = row["UTR no./ Transaction Reference no."]?.trim() || "";
        const paymentDate = parseExcelDate(row["Initiated On"]);

        if (!beneficiaryCode || !beneficiaryName || !beneficiaryAccountNo || !ifsc || !bankName || !Amount) {
          skippedCount++;
          continue;
        }
        // ✅ Update existing payout with UTR
        console.log(beneficiaryCode, beneficiaryName, beneficiaryAccountNo, ifsc, paymentMethod, Amount, Bank_Utr)
        const payout = await Payout.findOneAndUpdate(
          {
            // ["Beneficiary Code"]: beneficiaryCode,
            ["Beneficiary Name"]: beneficiaryName,
            ["Beneficiary Account No"]: beneficiaryAccountNo,
            ["BIC / SWIFT / IFSC Code"]: ifsc,
            // ["Beneficiary Bank Name"]: bankName,
            ["Payment Method Name"]: paymentMethod,
            Amount,
            // Credit_status: `Confirmed ${indiaTime}`,
            utr: ""
          },
          {
            $set: {
              utr: Bank_Utr,
              Credit_status: `Confirmed ${indiaTime}`,
              devremark: "auto utr set from excel sheet form bulk option"
            },

          },
          { new: true }
        );

        console.log(payout)
        switch (payout.Payment_By?.[0]?.role) {
          case "Sub_Admin":
            Model = Subadmin;
            break;
          case "User":
            Model = User;
            break;
          case "Super_Admin":
            Model = SuperAdmin;
            break;
          default:
            return res.status(400).json({ message: "Invalid Payment_By model." });
        }
        const user = await Model.findOne({ email: payout.Payment_By[0].email }); // assuming payout.CreatedBy has user ID
        if (user.call_back_url && payout.status !== "Pending", payout.utr != "") {
          console.log(`✅ Payout ${payout._id} approved`);

          // ✅ Callback Trigger
          const callbackPayload = {
            payoutId: payout._id,
            status: payout.status,
          };
          try {


            console.log(user.call_back_url)
            if (user.call_back_url) {
              const datat = await axios.post(user.call_back_url, callbackPayload, {
                headers: { "Content-Type": "application/json" },
              })
              console.log(`📩 Callback sent to ${user.call_back_url}`);

            }
          } catch (error) {
            console.log("error", error.response.data)
          }
        }
        if (!payout) {
          skippedCount++;
          continue;
        }

        // 🔄 Save transaction


        // 📢 Notify via socket
        const io = req.app.get("io");
        const notification = {
          message: `Bulk payout of ₹${Amount} to "${payout["Beneficiary Name"]}"  .`,
          type: "success",
          createdAt: new Date(),
        };
        io.to("Super_Admin").emit("notification", notification);



        payouts.push(payout);
        successCount++;
      } catch (err) {
        console.error("❌ Row error:", err);
        failedCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: "✅ Bulk payouts processed",
      totalRows: jsonData.length,
      inserted: successCount,
      failed: failedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("❌ Bulk process error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
});