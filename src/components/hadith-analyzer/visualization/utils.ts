import type { Chain, Narrator } from '@/types/hadith';

// Function to remove Tashkeel (Arabic diacritical marks) from text
export const removeTashkeel = (text: string): string => {
  // Unicode range for Tashkeel marks: U+064B to U+065F
  // Also includes U+0670 (Arabic letter superscript alef)
  const tashkeelRegex = /[\u064B-\u065F\u0670]/g;
  return text.replace(tashkeelRegex, '');
};

// Function to normalize narrator names by removing Tashkeel
export const normalizeNarratorName = (name: string): string => {
  return removeTashkeel(name).trim();
};

// Array of 30 distinct colors for chain connections (theme-aware)
export const getChainColors = (isDarkMode: boolean): string[] => {
  if (isDarkMode) {
    // Dark mode colors - vibrant colors that work well on dark backgrounds
    return [
      "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
      "#911eb4", "#42d4f4", "#f032e6", "#bfef45", "#fabed4",
      "#469990", "#dcbeff", "#9a6324", "#ffd8b1", "#ff6b6b",
      "#aaffc3", "#ffd93d", "#6bcf7f", "#4d96ff", "#a9a9a9",
      "#ff1493", "#00ced1", "#daa520", "#adff2f", "#ff6347",
      "#1e90ff", "#dda0dd", "#98fb98", "#ff8c42", "#87ceeb"
    ];
  } else {
    // Light mode colors - darker colors that contrast well on light backgrounds
    return [
      "#8b0000", "#006400", "#daa520", "#000080", "#8b4513",
      "#4b0082", "#008080", "#8b008b", "#556b2f", "#8b4513",
      "#2f4f4f", "#483d8b", "#a0522d", "#696969", "#800000",
      "#008000", "#808000", "#483d8b", "#000080", "#2f4f4f",
      "#8b0000", "#006400", "#daa520", "#556b2f", "#8b4513",
      "#4b0082", "#008080", "#8b008b", "#483d8b", "#a0522d"
    ];
  }
};

// Function to generate Mermaid code from chains
export const generateMermaidCode = (chains: Chain[], isDarkMode: boolean): string => {
  if (chains.length === 0) return "";

  const chainColors = getChainColors(isDarkMode);

  // Define colors based on theme
  const bgColor = isDarkMode ? "#374151" : "#f3f4f6";
  const strokeColor = isDarkMode ? "#9ca3af" : "#9ca3af";
  const textColor = isDarkMode ? "#ffffff" : "#111827";

  // Define grade-based colors
  const getGradeColorHex = (grade: number) => {
    if (grade >= 8) return isDarkMode ? "#10b981" : "#059669"; // Green for excellent
    if (grade >= 6) return isDarkMode ? "#3b82f6" : "#2563eb"; // Blue for good
    if (grade >= 4) return isDarkMode ? "#f59e0b" : "#d97706"; // Yellow for fair
    if (grade >= 2) return isDarkMode ? "#f97316" : "#ea580c"; // Orange for poor
    return isDarkMode ? "#ef4444" : "#dc2626"; // Red for very poor
  };

  let mermaidCode = `flowchart TD
    classDef narratorClass fill:${bgColor},stroke:${strokeColor},stroke-width:2px,color:${textColor}
    classDef excellentClass fill:${getGradeColorHex(8)},stroke:${getGradeColorHex(8)},stroke-width:2px,color:${textColor}
    classDef goodClass fill:${getGradeColorHex(6)},stroke:${getGradeColorHex(6)},stroke-width:2px,color:${textColor}
    classDef fairClass fill:${getGradeColorHex(4)},stroke:${getGradeColorHex(4)},stroke-width:2px,color:${textColor}
    classDef poorClass fill:${getGradeColorHex(2)},stroke:${getGradeColorHex(2)},stroke-width:2px,color:${textColor}
    classDef veryPoorClass fill:${getGradeColorHex(0)},stroke:${getGradeColorHex(0)},stroke-width:2px,color:${textColor}
    classDef messengerClass fill:${isDarkMode ? "#6b7280" : "#9ca3af"},stroke:${isDarkMode ? "#6b7280" : "#9ca3af"},stroke-width:2px,color:${textColor}

`;

  // Create a map to track unique narrators and their data
  const narratorMap = new Map<string, Narrator>();

  // Collect all unique narrators from chains
  chains.forEach((chain) => {
    chain.narrators.forEach((narrator) => {
      const key = normalizeNarratorName(narrator.arabicName);
      if (!narratorMap.has(key)) {
        narratorMap.set(key, narrator);
      }
    });
  });

  // Group narrators by grade (0-10, rounded to nearest integer)
  const gradeGroups = new Map<number, Array<{ key: string; narrator: Narrator }>>();
  const ungradedNarrators: Array<{ key: string; narrator: Narrator }> = [];

  narratorMap.forEach((narrator, key) => {
    const grade = narrator.calculatedGrade;
    if (grade !== undefined && grade !== null) {
      const roundedGrade = Math.round(grade);
      if (!gradeGroups.has(roundedGrade)) {
        gradeGroups.set(roundedGrade, []);
      }
      gradeGroups.get(roundedGrade)!.push({ key, narrator });
    } else {
      ungradedNarrators.push({ key, narrator });
      }
  });

  // Sort grades from highest to lowest (10 to 0)
  const sortedGrades = Array.from(gradeGroups.keys()).sort((a, b) => b - a);

  // Create node ID mapping
  const nodeIdMap = new Map<string, string>();
  let nodeCounter = 1;

  // Create a grid layout: each grade gets its own row
  sortedGrades.forEach((grade) => {
    const narrators = gradeGroups.get(grade)!;
    // Sort narrators alphabetically by Arabic name within each grade
    narrators.sort((a, b) => a.narrator.arabicName.localeCompare(b.narrator.arabicName));

    // Create nodes for this grade row
    narrators.forEach(({ key, narrator }) => {
      const nodeId = `N${nodeCounter++}`;
      nodeIdMap.set(key, nodeId);

      const arabicName = narrator.arabicName.replace(/"/g, '\\"');
      const englishName = narrator.englishName.replace(/"/g, '\\"');
      const label = `${arabicName}<br/>(${englishName})<br/>Grade: ${grade}`;
      mermaidCode += `    ${nodeId}["${label}"]\n`;
    });

    // Connect narrators horizontally in this grade row (invisible connections for layout)
    for (let j = 1; j < narrators.length; j++) {
      const prevKey = narrators[j - 1].key;
      const currentKey = narrators[j].key;
      const prevNode = nodeIdMap.get(prevKey)!;
      const currentNode = nodeIdMap.get(currentKey)!;
      mermaidCode += `    ${prevNode} -.-> ${currentNode}\n`; // Invisible edge for horizontal layout
    }
  });

  // Handle ungraded narrators
  if (ungradedNarrators.length > 0) {
    ungradedNarrators.sort((a, b) => a.narrator.arabicName.localeCompare(b.narrator.arabicName));

    ungradedNarrators.forEach(({ key, narrator }) => {
      const nodeId = `N${nodeCounter++}`;
      nodeIdMap.set(key, nodeId);

    const arabicName = narrator.arabicName.replace(/"/g, '\\"');
    const englishName = narrator.englishName.replace(/"/g, '\\"');
      const label = `${arabicName}<br/>(${englishName})<br/>Ungraded`;
    mermaidCode += `    ${nodeId}["${label}"]\n`;
  });

    // Connect ungraded narrators horizontally
    for (let j = 1; j < ungradedNarrators.length; j++) {
      const prevKey = ungradedNarrators[j - 1].key;
      const currentKey = ungradedNarrators[j].key;
      const prevNode = nodeIdMap.get(prevKey)!;
      const currentNode = nodeIdMap.get(currentKey)!;
      mermaidCode += `    ${prevNode} -.-> ${currentNode}\n`; // Invisible edge for horizontal layout
    }
  }

  // Add chain connections (these will show the transmission paths)
  mermaidCode += "\n";
  chains.forEach((chain, chainIndex) => {
    const chainColor = chainColors[chainIndex % chainColors.length];

    for (let i = 0; i < chain.narrators.length - 1; i++) {
      const fromKey = normalizeNarratorName(chain.narrators[i].arabicName);
      const toKey = normalizeNarratorName(chain.narrators[i + 1].arabicName);
      const fromNode = nodeIdMap.get(fromKey);
      const toNode = nodeIdMap.get(toKey);

      if (fromNode && toNode) {
        mermaidCode += `    ${fromNode} -.-> ${toNode}\n`; // Dotted line for chain connections
      }
    }

    // Style the chain connections
    const linkCount = chain.narrators.length - 1;
    for (let i = 0; i < linkCount; i++) {
      const linkIndex = chains.slice(0, chainIndex).reduce((sum, c) => sum + Math.max(0, c.narrators.length - 1), 0) + i;
      mermaidCode += `    linkStyle ${linkIndex} stroke:${chainColor},stroke-width:2px,stroke-dasharray: 5 5\n`;
    }
  });

  // Add styling based on calculated grade
  nodeIdMap.forEach((nodeId, key) => {
    const narrator = narratorMap.get(key)!;
    const grade = narrator.calculatedGrade;
    
    // Special handling for Messenger of Allah
    if (narrator.arabicName === "رَسُولَ اللَّهِ") {
      mermaidCode += `    class ${nodeId} messengerClass\n`;
    } else if (grade === undefined || grade === null) {
      // Use default narrator class for ungraded narrators
      mermaidCode += `    class ${nodeId} narratorClass\n`;
    } else if (grade >= 8) {
      mermaidCode += `    class ${nodeId} excellentClass\n`;
    } else if (grade >= 6) {
      mermaidCode += `    class ${nodeId} goodClass\n`;
    } else if (grade >= 4) {
      mermaidCode += `    class ${nodeId} fairClass\n`;
    } else if (grade >= 2) {
      mermaidCode += `    class ${nodeId} poorClass\n`;
    } else {
      mermaidCode += `    class ${nodeId} veryPoorClass\n`;
    }
  });

  return mermaidCode;
};

