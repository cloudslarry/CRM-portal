const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Migration function to add semester field to existing students
const migrateStudentSemester = async () => {
  try {
    console.log('Starting student semester migration...');
    
    // Find all students without semester field
    const studentsWithoutSemester = await Student.find({ 
      $or: [
        { semester: { $exists: false } },
        { semester: null },
        { semester: '' }
      ]
    });
    
    console.log(`Found ${studentsWithoutSemester.length} students without semester field`);
    
    // Update each student with a default semester based on their year
    for (let i = 0; i < studentsWithoutSemester.length; i++) {
      const student = studentsWithoutSemester[i];
      
      // Calculate semester based on year (assuming 2 semesters per year)
      let semester = '1';
      if (student.year === 1) {
        semester = '1';
      } else if (student.year === 2) {
        semester = '3';
      } else if (student.year === 3) {
        semester = '5';
      } else if (student.year === 4) {
        semester = '7';
      }
      
      await Student.findByIdAndUpdate(student._id, { semester });
      console.log(`Updated student ${student.name} (${student.registrationNumber}) with semester: ${semester}`);
    }
    
    console.log('Student semester migration completed successfully!');
    
    // Verify the migration
    const totalStudents = await Student.countDocuments();
    const studentsWithSemester = await Student.countDocuments({ 
      semester: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log(`Total students: ${totalStudents}`);
    console.log(`Students with semester: ${studentsWithSemester}`);
    
    if (totalStudents === studentsWithSemester) {
      console.log('✅ All students now have semester field!');
    } else {
      console.log('❌ Some students still missing semester field');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run migration
migrateStudentSemester();
