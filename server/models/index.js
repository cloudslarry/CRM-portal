// Models index file - ensures all models are properly registered
const mongoose = require('mongoose');

// Import all models
const Admin = require('./Admin');
const Applicant = require('./Applicant');
const Attendance = require('./Attendance');
const CollegeFee = require('./CollegeFee');
const Faculty = require('./Faculty');
const Hostel = require('./Hostel');
const HostelFee = require('./HostelFee');
const HostelNotice = require('./HostelNotice');
const Marks = require('./Marks');
const Message = require('./Message');
const Notification = require('./Notification');
const Room = require('./Room');
const Student = require('./Student');
const Subject = require('./Subject');
const Book = require('./Book');
const Form = require('./Form');
const FormSubmission = require('./FormSubmission');

// Export all models
module.exports = {
  Admin,
  Applicant,
  Attendance,
  CollegeFee,
  Faculty,
  Hostel,
  HostelFee,
  HostelNotice,
  Marks,
  Message,
  Notification,
  Room,
  Student,
  Subject,
  Book,
  Form,
  FormSubmission
};

