// Test script for Department Config
const { 
  getFullForm, 
  getShortForm, 
  getDepartmentOptions,
  DEPARTMENT_MAPPING,
  COMMON_DEPARTMENTS
} = require('./client/src/config/departments');

console.log('🧪 Testing Department Config\n');

// Test 1: Short form to full form conversion
console.log('1. Testing Short Form to Full Form Conversion:');
const testShortForms = ['C.S.E', 'ECE', 'IT', 'MECHANICAL', 'CIVIL', 'BBA'];
testShortForms.forEach(short => {
  const full = getFullForm(short);
  console.log(`   ${short} → ${full}`);
});

console.log('\n2. Testing Full Form to Short Form Conversion:');
const testFullForms = ['Computer Science Engineering', 'Mechanical Engineering', 'Civil Engineering'];
testFullForms.forEach(full => {
  const short = getShortForm(full);
  console.log(`   ${full} → ${short}`);
});

console.log('\n3. Testing Department Options:');
const options = getDepartmentOptions();
console.log(`   Total departments available: ${options.length}`);
console.log('   First 5 options:');
options.slice(0, 5).forEach(option => {
  console.log(`   - ${option.value} (${option.fullForm})`);
});

console.log('\n4. Testing Common Departments:');
console.log('   Common departments:', COMMON_DEPARTMENTS);

console.log('\n5. Testing Department Mapping:');
console.log('   Total mappings:', Object.keys(DEPARTMENT_MAPPING).length);
console.log('   Sample mappings:');
Object.entries(DEPARTMENT_MAPPING).slice(0, 5).forEach(([short, full]) => {
  console.log(`   - ${short} → ${full}`);
});

console.log('\n✅ Department Config Test Completed!');
