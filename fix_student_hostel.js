const mongoose = require('mongoose');
const Student = require('./models/Student');
const Hostel = require('./models/Hostel');
const Room = require('./models/Room');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixStudentHostel() {
  try {
    console.log('🔍 Checking student hostel assignment...');
    
    // Find the student by registration number
    const student = await Student.findOne({ registrationNumber: 'STU202506000' });
    
    if (!student) {
      console.log('❌ Student not found');
      return;
    }
    
    console.log('👤 Student found:', {
      name: student.name,
      registrationNumber: student.registrationNumber,
      hasHostelInfo: !!student.hostelInfo,
      hostelId: student.hostelInfo?.hostel,
      roomId: student.hostelInfo?.room
    });
    
    // Check if student already has hostel assignment
    if (student.hostelInfo && student.hostelInfo.hostel) {
      console.log('✅ Student already assigned to hostel');
      return;
    }
    
    // Find available hostels
    const hostels = await Hostel.find({ status: 'Active' });
    console.log('🏠 Available hostels:', hostels.length);
    
    if (hostels.length === 0) {
      console.log('❌ No active hostels found');
      return;
    }
    
    // Find available rooms
    for (const hostel of hostels) {
      console.log(`🔍 Checking hostel: ${hostel.name}`);
      
      const availableRooms = await Room.find({
        hostel: hostel._id,
        status: 'Active',
        $expr: { $lt: ['$occupied', '$capacity'] }
      }).sort({ roomNumber: 1 });
      
      console.log(`📦 Available rooms in ${hostel.name}:`, availableRooms.length);
      
      if (availableRooms.length > 0) {
        const room = availableRooms[0];
        console.log(`🏠 Assigning to room: ${room.roomNumber}`);
        
        // Assign student to room
        room.students.push(student._id);
        room.occupied += 1;
        await room.save();
        
        // Update student's hostel info
        student.hostelInfo = {
          hostel: hostel._id,
          room: room._id,
          bedNumber: `${room.roomNumber}-${room.occupied}`
        };
        await student.save();
        
        console.log('✅ Student assigned successfully!');
        console.log('📋 Assignment details:', {
          hostel: hostel.name,
          room: room.roomNumber,
          bedNumber: student.hostelInfo.bedNumber
        });
        
        return;
      }
    }
    
    console.log('❌ No available rooms found in any hostel');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

fixStudentHostel();
