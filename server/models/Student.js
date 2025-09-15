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
    semester: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8'],
      default: '1'
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
    enrollmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // Add index for faster lookups
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
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
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

// Function to generate unique enrollment ID
const generateEnrollmentId = async () => {
  let enrollmentId;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate enrollment ID in format: ENR + 6 random digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    enrollmentId = `ENR${randomNum}`;
    
    // Check if this enrollment ID already exists
    const existingStudent = await mongoose.model('Student').findOne({ enrollmentId });
    if (!existingStudent) {
      isUnique = true;
    }
  }
  
  return enrollmentId;
};

// Pre-save hook to generate enrollment ID if not provided
studentSchema.pre("save", async function (next) {
  // Generate enrollment ID if not provided
  if (!this.enrollmentId) {
    try {
      this.enrollmentId = await generateEnrollmentId();
    } catch (error) {
      return next(error);
    }
  }
  
  // Hash password if modified
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