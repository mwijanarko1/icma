import { REPUTATION_GRADES, type ReputationGrade } from './constants';
import type { Narrator } from '@/types/hadith';

// Function to calculate narrator grade based on reputation tags
// Now weights grades by frequency - if multiple people call someone "Thiqah", it's weighted more heavily
export const calculateNarratorGrade = (reputation: ReputationGrade[]): number => {
  if (reputation.length === 0) return 0;
  
  // Count frequency of each grade
  const gradeCounts = new Map<ReputationGrade, number>();
  for (const grade of reputation) {
    gradeCounts.set(grade, (gradeCounts.get(grade) || 0) + 1);
  }
  
  // Calculate frequency-weighted average
  // Each grade's weight is multiplied by how many times it appears
  let totalWeightedSum = 0;
  let totalCount = 0;
  
  for (const [grade, count] of gradeCounts.entries()) {
    const gradeWeight = REPUTATION_GRADES[grade].weight;
    // Weight is multiplied by frequency (count)
    totalWeightedSum += gradeWeight * count;
    totalCount += count;
  }
  
  const averageWeight = totalWeightedSum / totalCount;
  
  // Apply penalty for multiple conflicting grades (high and low together)
  // Check if we have grades from different categories
  const uniqueGrades = Array.from(gradeCounts.keys());
  const hasHigh = uniqueGrades.some(grade => REPUTATION_GRADES[grade].category === 'high');
  const hasLow = uniqueGrades.some(grade => REPUTATION_GRADES[grade].category === 'low');
  const hasIntermediate = uniqueGrades.some(grade => REPUTATION_GRADES[grade].category === 'intermediate');
  const hasTheological = uniqueGrades.some(grade => REPUTATION_GRADES[grade].category === 'theological');
  
  let penalty = 0;
  if (hasHigh && hasLow) {
    penalty = 2; // Strong penalty for conflicting high and low grades
  } else if ((hasHigh || hasLow) && hasIntermediate) {
    penalty = 1; // Moderate penalty for mixed categories
  }

  // Apply severe penalty for theological differences
  if (hasTheological) {
    penalty += 3; // Heavy penalty for theological issues
  }
  
  return Math.max(0, Math.round((averageWeight - penalty) * 10) / 10);
};

// Function to calculate chain grade based on narrator grades
export const calculateChainGrade = (narrators: Narrator[]): number | null => {
  if (narrators.length === 0) return null;
  
  const grades = narrators
    .map(n => n.calculatedGrade)
    .filter((grade): grade is number => grade !== undefined && grade !== null);
  
  // Only calculate if more than 50% of narrators have grades
  const gradedPercentage = (grades.length / narrators.length) * 100;
  if (gradedPercentage <= 50) return null;
  
  if (grades.length === 0) return null;
  
  const sum = grades.reduce((acc, grade) => acc + grade, 0);
  return Math.round((sum / grades.length) * 10) / 10;
};

