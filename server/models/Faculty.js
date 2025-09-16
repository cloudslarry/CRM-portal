const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing
const { Schema } = mongoose;

const facultySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    password: {
      type: String,
      required: true, // FIX: Password should be required
      minlength: 6,
    },
    registrationNumber: {
      type: String,
      required: true, // FIX: Registration number should be required
      unique: true,   // FIX: Registration number must be unique
      trim: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    facultyMobileNumber: {
      type: String, // FIX: Changed from Number to String
    },
    joiningYear: {
      type: Number,
      required: true,
    },
    subjectsCanTeach: [
      {
        type: Schema.Types.ObjectId, // IMPROVEMENT: Reference the Subject model
        ref: "Subject",
      },
    ],
    otp: {
      type: String,
    },
  },
  {
    timestamps: true, // BEST PRACTICE: Automatically add createdAt and updatedAt
  }
);

// SECURITY: Mongoose pre-save hook to hash password before saving
facultySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports =
  mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);