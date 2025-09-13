const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateSubjectRegisterInput = (data) => {
  let errors = {};
  data.subjectName = !isEmpty(data.subjectName) ? data.subjectName : "";
  data.subjectCode = !isEmpty(data.subjectCode) ? data.subjectCode : "";
  data.year = !isEmpty(data.year) ? data.year : "";
  data.department = !isEmpty(data.department) ? data.department : "";
  data.totalLectures = !isEmpty(data.totalLectures) ? data.totalLectures : "";

  // Subject Name validation
  if (Validator.isEmpty(data.subjectName)) {
    errors.subjectName = "Subject Name field is required";
  } else if (!Validator.isLength(data.subjectName, { min: 2, max: 100 })) {
    errors.subjectName = "Subject Name must be between 2 and 100 characters";
  }

  // Subject Code validation
  if (Validator.isEmpty(data.subjectCode)) {
    errors.subjectCode = "Subject Code field is required";
  } else if (!Validator.isLength(data.subjectCode, { min: 2, max: 20 })) {
    errors.subjectCode = "Subject Code must be between 2 and 20 characters";
  } else if (!/^[A-Z0-9-]+$/.test(data.subjectCode)) {
    errors.subjectCode = "Subject Code must contain only uppercase letters, numbers, and hyphens";
  }

  // Year validation
  if (Validator.isEmpty(data.year)) {
    errors.year = "Year field is required";
  } else {
    const yearNum = parseInt(data.year);
    if (isNaN(yearNum) || yearNum < 1 || yearNum > 5) {
      errors.year = "Year must be between 1 and 5";
    }
  }

  // Department validation
  if (Validator.isEmpty(data.department)) {
    errors.department = "Department field is required";
  }

  // Total Lectures validation
  if (Validator.isEmpty(data.totalLectures)) {
    errors.totalLectures = "Total Lectures field is required";
  } else {
    const lectures = parseInt(data.totalLectures);
    if (isNaN(lectures) || lectures < 1 || lectures > 200) {
      errors.totalLectures = "Total Lectures must be between 1 and 200";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateSubjectRegisterInput;
