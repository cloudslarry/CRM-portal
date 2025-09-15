/**
 * Utility function to safely get avatar URL from student data
 * Handles both string URLs and object with url property
 * @param {string|object} avatar - Avatar data from student
 * @returns {string|null} - Safe avatar URL or null
 */
export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  
  // If it's already a string URL, return it
  if (typeof avatar === 'string') {
    return avatar;
  }
  
  // If it's an object with url property, return the url
  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url;
  }
  
  // If it's an object but no url property, return null
  return null;
};

/**
 * Utility function to check if avatar URL is valid
 * @param {string} url - Avatar URL to validate
 * @returns {boolean} - True if URL is valid
 */
export const isValidAvatarUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // If it's a relative path, check if it starts with /
    return url.startsWith('/') || url.startsWith('http');
  }
};
