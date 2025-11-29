// Quick test for theological grade penalties
import { calculateNarratorGrade } from './src/lib/grading/calculator';
import type { ReputationGrade } from './src/lib/grading/constants';

console.log('Testing theological grade penalties...');

// Test with high grade + theological issue
const testGrades1: ReputationGrade[] = ['Thiqah', 'Shia'];
const result1 = calculateNarratorGrade(testGrades1);
console.log('Thiqah + Shia:', result1);

// Test with multiple theological issues
const testGrades2: ReputationGrade[] = ['Thiqah', 'Shia', 'Qadari'];
const result2 = calculateNarratorGrade(testGrades2);
console.log('Thiqah + Shia + Qadari:', result2);

// Test with only theological issues
const testGrades3: ReputationGrade[] = ['Shia', 'Khawarij'];
const result3 = calculateNarratorGrade(testGrades3);
console.log('Shia + Khawarij:', result3);

// Test with just Thiqah for comparison
const testGrades4: ReputationGrade[] = ['Thiqah'];
const result4 = calculateNarratorGrade(testGrades4);
console.log('Just Thiqah:', result4);

// Test with Rafidi (most severe)
const testGrades5: ReputationGrade[] = ['Thiqah', 'Rafidi'];
const result5 = calculateNarratorGrade(testGrades5);
console.log('Thiqah + Rafidi:', result5);
