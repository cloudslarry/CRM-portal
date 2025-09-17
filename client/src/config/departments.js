// Department mapping with short forms and full forms
export const DEPARTMENT_MAPPING = {
  'C.S.E': 'Computer Science Engineering',
  'CSE': 'Computer Science Engineering',
  'CS': 'Computer Science Engineering',
  'COMPUTER_SCIENCE': 'Computer Science Engineering',
  
  'E.C.E': 'Electronics & Communication Engineering',
  'ECE': 'Electronics & Communication Engineering',
  'EC': 'Electronics & Communication Engineering',
  'ELECTRONICS_COMMUNICATION': 'Electronics & Communication Engineering',
  
  'I.T': 'Information Technology',
  'IT': 'Information Technology',
  'INFORMATION_TECHNOLOGY': 'Information Technology',
  
  'MECHANICAL': 'Mechanical Engineering',
  'MECH': 'Mechanical Engineering',
  'ME': 'Mechanical Engineering',
  'MECHANICAL_ENGINEERING': 'Mechanical Engineering',
  
  'CIVIL': 'Civil Engineering',
  'CE': 'Civil Engineering',
  'CIVIL_ENGINEERING': 'Civil Engineering',
  
  'ELECTRICAL': 'Electrical Engineering',
  'EE': 'Electrical Engineering',
  'ELECTRICAL_ENGINEERING': 'Electrical Engineering',
  
  'BBA': 'Business Administration',
  'BUSINESS_ADMINISTRATION': 'Business Administration',
  'MANAGEMENT': 'Business Administration',
  
  'COMMERCE': 'Commerce',
  'BCOM': 'Commerce',
  'COMMERCIAL': 'Commerce',
  
  'ARTS': 'Arts',
  'ARTS_SCIENCE': 'Arts',
  'LIBERAL_ARTS': 'Arts',
  
  'SCIENCE': 'Science',
  'PURE_SCIENCE': 'Science',
  'BASIC_SCIENCE': 'Science'
};

// Legacy departments array (for backward compatibility)
export const DEPARTMENTS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Business Administration',
  'Commerce',
  'Arts',
  'Science'
];

// Get all unique department full forms
export const getAllDepartments = () => Object.values(DEPARTMENT_MAPPING);

// Get department options for dropdowns (with short forms as values)
export const getDepartmentOptions = () => {
  const shortForms = Object.keys(DEPARTMENT_MAPPING);
  return shortForms.map(shortForm => ({
    value: shortForm,
    label: `${shortForm} - ${DEPARTMENT_MAPPING[shortForm]}`,
    fullForm: DEPARTMENT_MAPPING[shortForm]
  }));
};

// Convert short form to full form
export const getFullForm = (shortForm) => {
  if (!shortForm) return '';
  const normalized = shortForm.toUpperCase().trim();
  return DEPARTMENT_MAPPING[normalized] || shortForm;
};

// Convert full form to short form
export const getShortForm = (fullForm) => {
  if (!fullForm) return '';
  const normalized = fullForm.trim();
  const reverseMapping = Object.fromEntries(
    Object.entries(DEPARTMENT_MAPPING).map(([short, full]) => [full, short])
  );
  return reverseMapping[normalized] || fullForm;
};

// Get common departments used in the application
export const COMMON_DEPARTMENTS = [
  'C.S.E',
  'E.C.E', 
  'I.T',
  'MECHANICAL',
  'CIVIL',
  'ELECTRICAL'
];

// Engineering departments only
export const ENGINEERING_DEPARTMENTS = [
  'C.S.E',
  'E.C.E',
  'I.T',
  'MECHANICAL',
  'CIVIL',
  'ELECTRICAL'
];

// Management departments
export const MANAGEMENT_DEPARTMENTS = [
  'BBA',
  'COMMERCE'
];

// Arts & Science departments
export const ARTS_SCIENCE_DEPARTMENTS = [
  'ARTS',
  'SCIENCE'
];

// Default export
export default {
  DEPARTMENTS,
  DEPARTMENT_MAPPING,
  getAllDepartments,
  getDepartmentOptions,
  getFullForm,
  getShortForm,
  COMMON_DEPARTMENTS,
  ENGINEERING_DEPARTMENTS,
  MANAGEMENT_DEPARTMENTS,
  ARTS_SCIENCE_DEPARTMENTS
};


