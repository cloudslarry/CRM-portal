// Utility to clear authentication tokens
// This can be used to force a fresh login for testing

export const clearAllAuthTokens = () => {
  localStorage.removeItem('studentToken');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('facultyToken');
  localStorage.removeItem('applicantToken');
  localStorage.removeItem('token');
  
  console.log('All authentication tokens cleared');
  
  // Reload the page to force fresh login
  window.location.reload();
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.clearAuth = clearAllAuthTokens;
}
