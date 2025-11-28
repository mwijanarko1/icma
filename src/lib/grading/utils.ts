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
  if (grade >= 8) return 'text-green-600';
  if (grade >= 6) return 'text-blue-600';
  if (grade >= 4) return 'text-yellow-600';
  if (grade >= 2) return 'text-orange-600';
  return 'text-red-600';
};

// Function to get grade color (for hex colors, e.g., in Mermaid graphs)
export const getGradeColor = (grade: number): string => {
  if (grade >= 8) return "#059669"; // Green for excellent
  if (grade >= 6) return "#2563eb"; // Blue for good
  if (grade >= 4) return "#d97706"; // Yellow for fair
  if (grade >= 2) return "#ea580c"; // Orange for poor
  return "#dc2626"; // Red for very poor
};

