const Validator = require("validator");
const isEmpty = require("./is-empty");

const validateDepartmentInput = (data, isUpdate = false) => {
  let errors = {};

  // Required fields for creation
  if (!isUpdate) {
    data.shortForm = !isEmpty(data.shortForm) ? data.shortForm : "";
    data.fullForm = !isEmpty(data.fullForm) ? data.fullForm : "";
    data.category = !isEmpty(data.category) ? data.category : "";
  }

  // Short Form validation
  if (!isUpdate || data.shortForm !== undefined) {
    if (isEmpty(data.shortForm)) {
      errors.shortForm = "Short form is required";
    } else if (!Validator.isLength(data.shortForm, { min: 2, max: 10 })) {
      errors.shortForm = "Short form must be between 2 and 10 characters";
    } else if (!/^[A-Z0-9._-]+$/.test(data.shortForm)) {
      errors.shortForm = "Short form can only contain uppercase letters, numbers, dots, underscores, and hyphens";
    }
  }

  // Full Form validation
  if (!isUpdate || data.fullForm !== undefined) {
    if (isEmpty(data.fullForm)) {
      errors.fullForm = "Full form is required";
    } else if (!Validator.isLength(data.fullForm, { min: 5, max: 100 })) {
      errors.fullForm = "Full form must be between 5 and 100 characters";
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    if (isEmpty(data.category)) {
      errors.category = "Category is required";
    } else {
      const validCategories = ['Engineering', 'Management', 'Arts', 'Science', 'Medical', 'Law', 'Other'];
      if (!validCategories.includes(data.category)) {
        errors.category = "Category must be one of: " + validCategories.join(', ');
      }
    }
  }

  // Description validation
  if (data.description && !isEmpty(data.description)) {
    if (!Validator.isLength(data.description, { max: 500 })) {
      errors.description = "Description must not exceed 500 characters";
    }
  }

  // Degree Types validation
  if (data.degreeTypes && Array.isArray(data.degreeTypes)) {
    const validDegreeTypes = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'];
    const invalidTypes = data.degreeTypes.filter(type => !validDegreeTypes.includes(type));
    if (invalidTypes.length > 0) {
      errors.degreeTypes = `Invalid degree types: ${invalidTypes.join(', ')}. Valid types: ${validDegreeTypes.join(', ')}`;
    }
  }

  // Years validation
  if (data.years && Array.isArray(data.years)) {
    const invalidYears = data.years.filter(year => !Number.isInteger(year) || year < 1 || year > 8);
    if (invalidYears.length > 0) {
      errors.years = "Years must be integers between 1 and 8";
    }
  }

  // Sections validation
  if (data.sections && Array.isArray(data.sections)) {
    const invalidSections = data.sections.filter(section => 
      typeof section !== 'string' || section.trim().length === 0 || section.length > 10
    );
    if (invalidSections.length > 0) {
      errors.sections = "Sections must be non-empty strings with maximum 10 characters";
    }
  }

  // Allowed Roles validation
  if (data.allowedRoles && Array.isArray(data.allowedRoles)) {
    const validRoles = ['admin', 'faculty', 'student', 'applicant'];
    const invalidRoles = data.allowedRoles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      errors.allowedRoles = `Invalid roles: ${invalidRoles.join(', ')}. Valid roles: ${validRoles.join(', ')}`;
    }
  }

  // Contact Email validation
  if (data.contactEmail && !isEmpty(data.contactEmail)) {
    if (!Validator.isEmail(data.contactEmail)) {
      errors.contactEmail = "Contact email must be a valid email address";
    }
  }

  // Contact Phone validation
  if (data.contactPhone && !isEmpty(data.contactPhone)) {
    if (!Validator.isMobilePhone(data.contactPhone, 'any')) {
      errors.contactPhone = "Contact phone must be a valid phone number";
    }
  }

  // Established Date validation
  if (data.establishedDate && !isEmpty(data.establishedDate)) {
    if (!Validator.isISO8601(data.establishedDate)) {
      errors.establishedDate = "Established date must be a valid ISO 8601 date";
    } else if (new Date(data.establishedDate) > new Date()) {
      errors.establishedDate = "Established date cannot be in the future";
    }
  }

  // Boolean field validations
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.isActive = "isActive must be a boolean value";
  }

  if (data.isPublic !== undefined && typeof data.isPublic !== 'boolean') {
    errors.isPublic = "isPublic must be a boolean value";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = { validateDepartmentInput };