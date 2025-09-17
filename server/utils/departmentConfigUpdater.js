const fs = require('fs');
const path = require('path');

// Path to the departments config file
const DEPARTMENTS_CONFIG_PATH = path.join(__dirname, '../../client/src/config/departments.js');

/**
 * Read the current departments config file
 */
function readDepartmentsConfig() {
  try {
    const content = fs.readFileSync(DEPARTMENTS_CONFIG_PATH, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading departments config:', error);
    return null;
  }
}

/**
 * Write updated departments config file
 */
function writeDepartmentsConfig(content) {
  try {
    fs.writeFileSync(DEPARTMENTS_CONFIG_PATH, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing departments config:', error);
    return false;
  }
}

/**
 * Add a new department to the config file
 */
function addDepartmentToConfig(shortForm, fullForm) {
  try {
    let content = readDepartmentsConfig();
    if (!content) {
      console.error('Could not read departments config file');
      return false;
    }

    // Find the DEPARTMENT_MAPPING section
    const mappingStart = content.indexOf('export const DEPARTMENT_MAPPING = {');
    const mappingEnd = content.indexOf('};', mappingStart);
    
    if (mappingStart === -1 || mappingEnd === -1) {
      console.error('Could not find DEPARTMENT_MAPPING section');
      return false;
    }

    // Extract the mapping content
    const mappingContent = content.substring(mappingStart, mappingEnd + 2);
    
    // Check if department already exists
    if (mappingContent.includes(`'${shortForm.toUpperCase()}':`)) {
      console.log(`Department ${shortForm} already exists in config`);
      return true;
    }

    // Add the new department entry
    const newEntry = `  '${shortForm.toUpperCase()}': '${fullForm}',\n`;
    
    // Insert before the closing brace
    const updatedMapping = mappingContent.replace(
      '};',
      `${newEntry}};`
    );

    // Replace the mapping section in the content
    const updatedContent = content.replace(mappingContent, updatedMapping);

    // Also update the DEPARTMENTS array if the full form is not already there
    if (!content.includes(fullForm)) {
      const departmentsArrayStart = content.indexOf('export const DEPARTMENTS = [');
      const departmentsArrayEnd = content.indexOf('];', departmentsArrayStart);
      
      if (departmentsArrayStart !== -1 && departmentsArrayEnd !== -1) {
        const departmentsArray = content.substring(departmentsArrayStart, departmentsArrayEnd + 2);
        const newDepartmentEntry = `  '${fullForm}',\n`;
        
        const updatedDepartmentsArray = departmentsArray.replace(
          '];',
          `${newDepartmentEntry}];`
        );
        
        const finalContent = updatedContent.replace(departmentsArray, updatedDepartmentsArray);
        return writeDepartmentsConfig(finalContent);
      }
    }

    return writeDepartmentsConfig(updatedContent);
  } catch (error) {
    console.error('Error adding department to config:', error);
    return false;
  }
}

/**
 * Remove a department from the config file
 */
function removeDepartmentFromConfig(shortForm, fullForm) {
  try {
    let content = readDepartmentsConfig();
    if (!content) {
      console.error('Could not read departments config file');
      return false;
    }

    // Remove from DEPARTMENT_MAPPING
    const mappingRegex = new RegExp(`\\s*'${shortForm.toUpperCase()}':\\s*'${fullForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',?\\n?`, 'g');
    content = content.replace(mappingRegex, '');

    // Remove from DEPARTMENTS array
    const departmentRegex = new RegExp(`\\s*'${fullForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',?\\n?`, 'g');
    content = content.replace(departmentRegex, '');

    return writeDepartmentsConfig(content);
  } catch (error) {
    console.error('Error removing department from config:', error);
    return false;
  }
}

/**
 * Sync all departments from database to config file
 */
async function syncDepartmentsToConfig(departments) {
  try {
    let content = readDepartmentsConfig();
    if (!content) {
      console.error('Could not read departments config file');
      return false;
    }

    // Build new DEPARTMENT_MAPPING
    let mappingContent = 'export const DEPARTMENT_MAPPING = {\n';
    let departmentsArray = 'export const DEPARTMENTS = [\n';
    
    departments.forEach(dept => {
      mappingContent += `  '${dept.shortForm}': '${dept.fullForm}',\n`;
      departmentsArray += `  '${dept.fullForm}',\n`;
    });
    
    mappingContent += '};\n\n';
    departmentsArray += '];\n';

    // Replace the entire mapping section
    const mappingStart = content.indexOf('export const DEPARTMENT_MAPPING = {');
    const mappingEnd = content.indexOf('};', mappingStart) + 2;
    
    if (mappingStart !== -1 && mappingEnd !== -1) {
      content = content.substring(0, mappingStart) + mappingContent + content.substring(mappingEnd);
    }

    // Replace the departments array
    const deptArrayStart = content.indexOf('export const DEPARTMENTS = [');
    const deptArrayEnd = content.indexOf('];', deptArrayStart) + 2;
    
    if (deptArrayStart !== -1 && deptArrayEnd !== -1) {
      content = content.substring(0, deptArrayStart) + departmentsArray + content.substring(deptArrayEnd);
    }

    return writeDepartmentsConfig(content);
  } catch (error) {
    console.error('Error syncing departments to config:', error);
    return false;
  }
}

module.exports = {
  addDepartmentToConfig,
  removeDepartmentFromConfig,
  syncDepartmentsToConfig,
  readDepartmentsConfig,
  writeDepartmentsConfig
};
