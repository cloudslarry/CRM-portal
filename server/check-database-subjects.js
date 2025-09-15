const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Student = require('./models/Student');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to check database subjects and students
const checkDatabaseData = async () => {
  try {
    console.log('=== DATABASE SUBJECTS ===');
    
    // Get all subjects
    const subjects = await Subject.find({});
    console.log(`Total subjects in database: ${subjects.length}`);
    
    if (subjects.length > 0) {
      console.log('\nSubjects:');
      subjects.forEach((subject, index) => {
        console.log(`${index + 1}. ${subject.subjectCode} - ${subject.subjectName}`);
        console.log(`   Department: ${subject.department}`);
        console.log(`   Year: ${subject.year}`);
        console.log(`   Semester: ${subject.semester}`);
        console.log(`   Total Lectures: ${subject.totalLectures}`);
        console.log('   ---');
      });
    }
    
    console.log('\n=== DATABASE STUDENTS ===');
    
    // Get all students
    const students = await Student.find({}).select('name registrationNumber department year semester enrollmentId');
    console.log(`Total students in database: ${students.length}`);
    
    if (students.length > 0) {
      console.log('\nStudents:');
      students.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.registrationNumber})`);
        console.log(`   Department: ${student.department}`);
        console.log(`   Year: ${student.year}`);
        console.log(`   Semester: ${student.semester}`);
        console.log(`   Enrollment ID: ${student.enrollmentId}`);
        console.log('   ---');
      });
    }
    
    console.log('\n=== SUBJECT-STUDENT MATCHING ===');
    
    // Show which subjects each student would see
    students.forEach(student => {
      console.log(`\nStudent: ${student.name} (${student.registrationNumber})`);
      console.log(`Department: ${student.department}, Year: ${student.year}, Semester: ${student.semester}`);
      
      const matchingSubjects = subjects.filter(subject => 
        subject.department === student.department && 
        subject.year === student.year.toString() && 
        subject.semester === student.semester
      );
      
      if (matchingSubjects.length > 0) {
        console.log(`Would see ${matchingSubjects.length} subjects:`);
        matchingSubjects.forEach(subject => {
          console.log(`  - ${subject.subjectCode}: ${subject.subjectName}`);
        });
      } else {
        console.log('No matching subjects found for this student');
      }
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
checkDatabaseData();
