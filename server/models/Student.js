const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // BEST PRACTICE: Remove whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // BEST PRACTICE: Store emails in lowercase
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
      required: true,
      minlength: 6, // BEST PRACTICE: Enforce a minimum length
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    year: {
      type: Number,
      required: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject", // CONVENTION: Capitalized ref name
      },
    ],
    fatherName: {
      type: String,
    },
    registrationNumber: {
      type: String,
      required: true, // IMPROVEMENT: Should be required
      unique: true, // IMPROVEMENT: Should be unique
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
    },
    studentMobileNumber: {
      type: String, // FIX: Changed from Number to String
    },
    fatherMobileNumber: {
      type: String, // FIX: Changed from Number to String
    },
    // REMOVED: Duplicate fatherName field was here
    otp: {
      type: String,
    },
    hostelInfo: {
      hostel: {
        type: Schema.Types.ObjectId,
        ref: "Hostel", // CONVENTION: Capitalized ref name
      },
      room: {
        type: Schema.Types.ObjectId,
        ref: "Room", // CONVENTION: Capitalized ref name
      },
      bedNumber: {
        type: String,
      },
    },
  },
  {
    timestamps: true, // BEST PRACTICE: Automatically add createdAt and updatedAt
  }
);

// SECURITY: Mongoose pre-save hook to hash password before saving
studentSchema.pre("save", async function (next) {
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
  mongoose.models.Student || mongoose.model("Student", studentSchema);