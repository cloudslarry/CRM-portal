/**
 * Dynamic Department Converter Utility
 * Fetches departments from API and provides conversion functions
 */

import api from '../config/api';

class DynamicDepartmentConverter {
  constructor() {
    this.departments = [];
    this.departmentMap = new Map();
    this.lastFetch = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch departments from API
  async fetchDepartments(forceRefresh = false) {
    const now = Date.now();
    
    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
      return this.departments;
    }

    try {
      const response = await api.get('/api/department');
      this.departments = response.data.data || [];
      this.lastFetch = now;
      
      // Build department map for quick lookups
      this.buildDepartmentMap();
      
      return this.departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Return cached data if available, even if expired
      return this.departments;
    }
  }

  // Build internal map for quick lookups
  buildDepartmentMap() {
    this.departmentMap.clear();
    
    this.departments.forEach(dept => {
      if (dept.isActive) {
        // Map short form to full form
        this.departmentMap.set(dept.shortForm.toUpperCase(), dept.fullForm);
        this.departmentMap.set(dept.fullForm, dept.shortForm);
        
        // Map variations
        this.departmentMap.set(dept.shortForm, dept.fullForm);
        this.departmentMap.set(dept.fullForm.toLowerCase(), dept.shortForm);
        this.departmentMap.set(dept.shortForm.toLowerCase(), dept.fullForm);
      }
    });
  }

  // Get all departments
  async getDepartments(forceRefresh = false) {
    await this.fetchDepartments(forceRefresh);
    return this.departments;
  }

  // Get active departments only
  async getActiveDepartments(forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    return departments.filter(dept => dept.isActive);
  }

  // Get departments by category
  async getDepartmentsByCategory(category, forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    return departments.filter(dept => dept.category === category && dept.isActive);
  }

  // Get departments by role access
  async getDepartmentsByRole(role, forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    return departments.filter(dept => 
      dept.allowedRoles.includes(role) && dept.isActive
    );
  }

  // Convert short form to full form
  async getFullForm(shortForm, forceRefresh = false) {
    if (!shortForm) return '';
    
    await this.fetchDepartments(forceRefresh);
    const normalized = shortForm.toUpperCase().trim();
    return this.departmentMap.get(normalized) || shortForm;
  }

  // Convert full form to short form
  async getShortForm(fullForm, forceRefresh = false) {
    if (!fullForm) return '';
    
    await this.fetchDepartments(forceRefresh);
    const normalized = fullForm.trim();
    return this.departmentMap.get(normalized) || fullForm;
  }

  // Get department options for dropdowns
  async getDepartmentOptions(forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    return departments
      .filter(dept => dept.isActive)
      .map(dept => ({
        value: dept.shortForm,
        label: `${dept.shortForm} - ${dept.fullForm}`,
        fullForm: dept.fullForm,
        category: dept.category,
        description: dept.description
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  // Get department options with full form as value
  async getDepartmentOptionsWithFullForm(forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    return departments
      .filter(dept => dept.isActive)
      .map(dept => ({
        value: dept.fullForm,
        label: `${dept.shortForm} - ${dept.fullForm}`,
        shortForm: dept.shortForm,
        category: dept.category,
        description: dept.description
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  // Validate if a department exists
  async isValidDepartment(department, forceRefresh = false) {
    if (!department) return false;
    
    await this.fetchDepartments(forceRefresh);
    const normalized = department.toUpperCase().trim();
    return this.departmentMap.has(normalized) || 
           this.departmentMap.has(department) ||
           this.departments.some(dept => 
             dept.fullForm === department || 
             dept.shortForm.toUpperCase() === normalized
           );
  }

  // Get department by partial match
  async findDepartmentByPartial(partial, forceRefresh = false) {
    if (!partial) return [];
    
    const departments = await this.fetchDepartments(forceRefresh);
    const normalized = partial.toUpperCase().trim();
    
    return departments
      .filter(dept => 
        dept.isActive && (
          dept.shortForm.toUpperCase().includes(normalized) || 
          dept.fullForm.toUpperCase().includes(normalized) ||
          (dept.description && dept.description.toUpperCase().includes(normalized))
        )
      )
      .map(dept => ({
        shortForm: dept.shortForm,
        fullForm: dept.fullForm,
        category: dept.category,
        description: dept.description
      }));
  }

  // Get department statistics
  async getDepartmentStats(forceRefresh = false) {
    const departments = await this.fetchDepartments(forceRefresh);
    const activeDepartments = departments.filter(dept => dept.isActive);
    
    const categoryStats = activeDepartments.reduce((acc, dept) => {
      acc[dept.category] = (acc[dept.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: departments.length,
      active: activeDepartments.length,
      inactive: departments.length - activeDepartments.length,
      byCategory: categoryStats,
      lastUpdated: this.lastFetch ? new Date(this.lastFetch).toISOString() : null
    };
  }

  // Clear cache
  clearCache() {
    this.departments = [];
    this.departmentMap.clear();
    this.lastFetch = null;
  }

  // Get cached departments (synchronous)
  getCachedDepartments() {
    return this.departments;
  }

  // Check if cache is valid
  isCacheValid() {
    if (!this.lastFetch) return false;
    return (Date.now() - this.lastFetch) < this.cacheTimeout;
  }
}

// Create singleton instance
const departmentConverter = new DynamicDepartmentConverter();

// Export functions that use the singleton
export const getDepartments = (forceRefresh = false) => 
  departmentConverter.getDepartments(forceRefresh);

export const getActiveDepartments = (forceRefresh = false) => 
  departmentConverter.getActiveDepartments(forceRefresh);

export const getDepartmentsByCategory = (category, forceRefresh = false) => 
  departmentConverter.getDepartmentsByCategory(category, forceRefresh);

export const getDepartmentsByRole = (role, forceRefresh = false) => 
  departmentConverter.getDepartmentsByRole(role, forceRefresh);

export const getFullForm = (shortForm, forceRefresh = false) => 
  departmentConverter.getFullForm(shortForm, forceRefresh);

export const getShortForm = (fullForm, forceRefresh = false) => 
  departmentConverter.getShortForm(fullForm, forceRefresh);

export const getDepartmentOptions = (forceRefresh = false) => 
  departmentConverter.getDepartmentOptions(forceRefresh);

export const getDepartmentOptionsWithFullForm = (forceRefresh = false) => 
  departmentConverter.getDepartmentOptionsWithFullForm(forceRefresh);

export const isValidDepartment = (department, forceRefresh = false) => 
  departmentConverter.isValidDepartment(department, forceRefresh);

export const findDepartmentByPartial = (partial, forceRefresh = false) => 
  departmentConverter.findDepartmentByPartial(partial, forceRefresh);

export const getDepartmentStats = (forceRefresh = false) => 
  departmentConverter.getDepartmentStats(forceRefresh);

export const clearDepartmentCache = () => 
  departmentConverter.clearCache();

export const getCachedDepartments = () => 
  departmentConverter.getCachedDepartments();

export const isDepartmentCacheValid = () => 
  departmentConverter.isCacheValid();

// Default export
export default departmentConverter;
