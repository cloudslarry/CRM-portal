const mongoose = require('mongoose');
const Subject = require('./models/Subject');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm-portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to remove sample subjects
const removeSampleSubjects = async () => {
  try {
    console.log('Removing sample subjects...');
    
    // Remove subjects with the sample codes we created
    const sampleCodes = ['CS101', 'CS102', 'CS103', 'CS104', 'CS105', 'CE101', 'CE102', 'CE103'];
    
    const result = await Subject.deleteMany({
      subjectCode: { $in: sampleCodes }
    });
    
    console.log(`Removed ${result.deletedCount} sample subjects`);
    
    // Show remaining subjects
    const remainingSubjects = await Subject.find({});
    console.log(`Remaining subjects in database: ${remainingSubjects.length}`);
    
    if (remainingSubjects.length > 0) {
      console.log('Remaining subjects:');
      remainingSubjects.forEach(subject => {
        console.log(`  - ${subject.subjectCode}: ${subject.subjectName} (${subject.department}, Year ${subject.year}, Semester ${subject.semester})`);
      });
    } else {
      console.log('No subjects remaining in database');
    }
    
  } catch (error) {
    console.error('Error removing sample subjects:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
removeSampleSubjects();
