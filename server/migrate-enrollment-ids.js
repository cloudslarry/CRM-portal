const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to generate unique enrollment ID
const generateEnrollmentId = async () => {
  let enrollmentId;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate enrollment ID in format: ENR + 6 random digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    enrollmentId = `ENR${randomNum}`;
    
    // Check if this enrollment ID already exists
    const existingStudent = await Student.findOne({ enrollmentId });
    if (!existingStudent) {
      isUnique = true;
    }
  }
  
  return enrollmentId;
};

// Migration function
const migrateEnrollmentIds = async () => {
  try {
    console.log('Starting enrollment ID migration...');
    
    // Find all students without enrollmentId
    const studentsWithoutEnrollmentId = await Student.find({ 
      $or: [
        { enrollmentId: { $exists: false } },
        { enrollmentId: null },
        { enrollmentId: '' }
      ]
    });
    
    console.log(`Found ${studentsWithoutEnrollmentId.length} students without enrollment IDs`);
    
    // Update each student with a unique enrollment ID
    for (let i = 0; i < studentsWithoutEnrollmentId.length; i++) {
      const student = studentsWithoutEnrollmentId[i];
      const enrollmentId = await generateEnrollmentId();
      
      await Student.findByIdAndUpdate(student._id, { enrollmentId });
      console.log(`Updated student ${student.name} (${student.registrationNumber}) with enrollment ID: ${enrollmentId}`);
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the migration
    const totalStudents = await Student.countDocuments();
    const studentsWithEnrollmentId = await Student.countDocuments({ 
      enrollmentId: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log(`Total students: ${totalStudents}`);
    console.log(`Students with enrollment ID: ${studentsWithEnrollmentId}`);
    
    if (totalStudents === studentsWithEnrollmentId) {
      console.log('✅ All students now have enrollment IDs!');
    } else {
      console.log('❌ Some students still missing enrollment IDs');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
migrateEnrollmentIds();
