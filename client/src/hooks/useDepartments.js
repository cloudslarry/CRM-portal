import { useState, useEffect, useCallback } from 'react';
import { 
  getDepartments, 
  getActiveDepartments, 
  getDepartmentsByCategory,
  getDepartmentsByRole,
  getDepartmentOptions,
  getDepartmentOptionsWithFullForm,
  getDepartmentStats,
  clearDepartmentCache
} from '../utils/dynamicDepartmentConverter';

/**
 * Custom hook for managing departments
 */
export const useDepartments = (options = {}) => {
  const {
    autoFetch = true,
    forceRefresh = false,
    category = null,
    role = null,
    activeOnly = true
  } = options;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const fetchDepartments = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (activeOnly) {
        data = await getActiveDepartments(refresh);
      } else {
        data = await getDepartments(refresh);
      }
      
      // Apply filters
      if (category) {
        data = data.filter(dept => dept.category === category);
      }
      
      if (role) {
        data = data.filter(dept => dept.allowedRoles.includes(role));
      }
      
      setDepartments(data);
      
      // Fetch stats if not already available
      if (Object.keys(stats).length === 0) {
        const departmentStats = await getDepartmentStats(refresh);
        setStats(departmentStats);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly, category, role, stats]);

  const refreshDepartments = useCallback(() => {
    return fetchDepartments(true);
  }, [fetchDepartments]);

  const clearCache = useCallback(() => {
    clearDepartmentCache();
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchDepartments(forceRefresh);
    }
  }, [autoFetch, forceRefresh, fetchDepartments]);

  return {
    departments,
    loading,
    error,
    stats,
    fetchDepartments,
    refreshDepartments,
    clearCache
  };
};

/**
 * Hook for department options (for dropdowns)
 */
export const useDepartmentOptions = (config = {}) => {
  const {
    useFullForm = false,
    forceRefresh = false,
    category = null,
    role = null
  } = config;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (useFullForm) {
        data = await getDepartmentOptionsWithFullForm(refresh);
      } else {
        data = await getDepartmentOptions(refresh);
      }
      
      // Apply filters
      if (category) {
        data = data.filter(option => option.category === category);
      }
      
      if (role) {
        // Filter based on role access
        const departments = await getDepartmentsByRole(role, refresh);
        const allowedShortForms = departments.map(dept => dept.shortForm);
        data = data.filter(option => allowedShortForms.includes(option.value));
      }
      
      setOptions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch department options');
      console.error('Error fetching department options:', err);
    } finally {
      setLoading(false);
    }
  }, [useFullForm, category, role]);

  const refreshOptions = useCallback(() => {
    return fetchOptions(true);
  }, [fetchOptions]);

  useEffect(() => {
    fetchOptions(forceRefresh);
  }, [forceRefresh, fetchOptions]);

  return {
    options,
    loading,
    error,
    fetchOptions,
    refreshOptions
  };
};

/**
 * Hook for department statistics
 */
export const useDepartmentStats = (forceRefresh = false) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getDepartmentStats(refresh);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch department statistics');
      console.error('Error fetching department stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    return fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats(forceRefresh);
  }, [forceRefresh, fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats
  };
};

export default useDepartments;
