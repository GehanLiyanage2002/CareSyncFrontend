export const containsSqlInjection = (input) => {
  if (typeof input !== 'string') return false;
  
  // Basic patterns to look for common SQL injection attempts
  const sqlInjectionPattern = /('|;|--|\/\*|\*\/|xp_)/i;
  
  // Keywords that are often used in SQL injections, checked in combination with special characters
  const sqlKeywordsPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|TRUNCATE)\b/i;
  
  // If the input contains dangerous special characters or a combination of them, flag it.
  // Note: We don't flag just keywords because words like "update" or "select" could be normal text.
  // But semicolons, single quotes followed by SQL keywords, or comments are suspicious.
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
