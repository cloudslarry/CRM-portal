const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateDepartmentInput = (data) => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.code = !isEmpty(data.code) ? data.code : "";
  data.description = !isEmpty(data.description) ? data.description : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Department name is required";
  } else if (!Validator.isLength(data.name, { min: 2, max: 100 })) {
    errors.name = "Department name must be between 2 and 100 characters";
  }

  if (Validator.isEmpty(data.code)) {
    errors.code = "Department code is required";
  } else if (!Validator.isLength(data.code, { min: 2, max: 10 })) {
    errors.code = "Department code must be between 2 and 10 characters";
  } else if (!Validator.isAlphanumeric(data.code)) {
    errors.code = "Department code must contain only letters and numbers";
  }

  if (!Validator.isEmpty(data.description) && !Validator.isLength(data.description, { max: 500 })) {
    errors.description = "Description must not exceed 500 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateDepartmentInput;
