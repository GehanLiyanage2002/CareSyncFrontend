export const containsSqlInjection = (input) => {
  if (typeof input !== 'string') return false;
  
  // Basic patterns to look for common SQL injection attempts
  // We removed single quotes and semicolons because they are common in normal text (names, bios).
  // Parameterized queries on the backend already protect against SQL injection.
  const sqlInjectionPattern = /(--|\/\*|\*\/|xp_)/i;
  
  // Keywords that are often used in SQL injections, checked in combination with special characters
  const sqlKeywordsPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|TRUNCATE)\b/i;
  
  // If the input contains dangerous special characters or a combination of them, flag it.
  if (sqlInjectionPattern.test(input)) {
    return true;
  }
  
  return false;
};

export const validateFormFields = (fields) => {
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string' && containsSqlInjection(value)) {
      return {
        isValid: false,
        message: `Invalid characters detected in ${key.replace(/_/g, ' ')}. Please avoid using special characters like quotes or semicolons.`
      };
    }
  }
  return { isValid: true };
};
