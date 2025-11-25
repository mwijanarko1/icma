// Function to get grade description
export const getGradeDescription = (grade: number): string => {
  if (grade >= 8) return 'Excellent';
  if (grade >= 6) return 'Good';
  if (grade >= 4) return 'Fair';
  if (grade >= 2) return 'Poor';
  return 'Very Poor';
};

// Function to get grade color class (for Tailwind CSS classes)
export const getGradeColorClass = (grade: number): string => {
  if (grade >= 8) return 'text-green-600 dark:text-green-400';
  if (grade >= 6) return 'text-blue-600 dark:text-blue-400';
  if (grade >= 4) return 'text-yellow-600 dark:text-yellow-400';
  if (grade >= 2) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

// Function to get grade color (for hex colors, e.g., in Mermaid graphs)
export const getGradeColor = (grade: number, isDarkMode: boolean): string => {
  if (grade >= 8) return isDarkMode ? "#10b981" : "#059669"; // Green for excellent
  if (grade >= 6) return isDarkMode ? "#3b82f6" : "#2563eb"; // Blue for good
  if (grade >= 4) return isDarkMode ? "#f59e0b" : "#d97706"; // Yellow for fair
  if (grade >= 2) return isDarkMode ? "#f97316" : "#ea580c"; // Orange for poor
  return isDarkMode ? "#ef4444" : "#dc2626"; // Red for very poor
};

