"use client";

import { useEffect, useRef } from "react";
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import type { MermaidGraphProps } from './types';
import type { Chain } from '@/types/hadith';
import { getChainColors } from './utils';

interface CytoNode {
  data: {
    id: string;
    label: string;
    rank: number;
    grade: number | null;
    backgroundColor?: string;
    borderColor?: string;
    arabicName?: string;
    englishName?: string;
    fullLabel?: string;
  };
}

interface CytoEdge {
  data: {
    id: string;
    source: string;
    target: string;
    color: string;
    chainIndices: number[];
    originalChainIndices?: number[];
    chainCount?: number;
  };
}

interface ExtendedNodeSingular extends cytoscape.NodeSingular {
  _tooltip?: {
    element: HTMLDivElement;
    updateTooltip: (e: MouseEvent) => void;
    removeTooltip: () => void;
  };
}

// Register dagre layout
cytoscape.use(dagre);

// Function to create Cytoscape graph from chains
const createCytoscapeGraph = (
  container: HTMLElement,
  chains: Chain[],
  isDarkMode: boolean,
  onEdgeClickRef?: { current?: (chainIndices: number[]) => void },
  onEdgeHoverRef?: { current?: (chainIndices: number[]) => void }
) => {
  // Filter out hidden chains and create mapping from visible chain index to original chain index
  const visibleChains = chains.filter(chain => !chain.hiddenFromVisualization);
  const chainIndexMap = new Map<number, number>(); // Maps visible index to original index
  visibleChains.forEach((chain, visibleIndex) => {
    const originalIndex = chains.findIndex(c => c.id === chain.id);
    chainIndexMap.set(visibleIndex, originalIndex);
  });

  const chainColors = getChainColors(isDarkMode);
  const bgColor = isDarkMode ? "#1f2937" : "#ffffff";
  const textColor = isDarkMode ? "#ffffff" : "#111827";
  const nodeBgColor = isDarkMode ? "#374151" : "#f3f4f6";

  // Get grade color
  const getGradeColor = (grade: number | null) => {
    if (grade === null) return nodeBgColor;
    if (grade >= 8) return isDarkMode ? "#10b981" : "#059669";
    if (grade >= 6) return isDarkMode ? "#3b82f6" : "#2563eb";
    if (grade >= 4) return isDarkMode ? "#f59e0b" : "#d97706";
    if (grade >= 2) return isDarkMode ? "#f97316" : "#ea580c";
    return isDarkMode ? "#ef4444" : "#dc2626";
  };

  // Collect unique narrators and their ranks
  // Key format: "name-rank" to allow same narrator at different ranks
  const narratorMap = new Map<string, { narrator: Chain['narrators'][0]; rank: number; grade: number | null }>();
  
  visibleChains.forEach((chain) => {
    chain.narrators.forEach((narrator, position) => {
      const rank = position + 1;
      const key = `${narrator.arabicName}-${rank}`; // Include rank in key
      
      // Only create node if it doesn't exist at this rank
      // Same narrator at same rank across chains will be grouped
      if (!narratorMap.has(key)) {
        narratorMap.set(key, {
          narrator,
          rank,
          grade: narrator.calculatedGrade || null
        });
      }
    });
  });

  // Create nodes - use shorter labels
  const nodes: CytoNode[] = [];
  narratorMap.forEach((data, name) => {
    const { narrator, rank, grade } = data;
    const gradeColor = getGradeColor(grade);
    const isMessenger = narrator.arabicName === "رَسُولَ اللَّهِ";
    const bgColor = isMessenger ? (isDarkMode ? "#6b7280" : "#9ca3af") : gradeColor;
    
    // Include both Arabic and English names
    nodes.push({
      data: {
        id: name,
        label: `${narrator.arabicName}\n${narrator.englishName}`,
        rank: rank,
        grade: grade,
        backgroundColor: bgColor,
        borderColor: gradeColor,
        arabicName: narrator.arabicName,
        englishName: narrator.englishName,
        fullLabel: `${narrator.arabicName}\n${narrator.englishName}`
      }
    });
  });

  // Create edges - consolidate duplicates
  const edgeMap = new Map<string, { source: string; target: string; chainIndices: number[]; originalChainIndices: number[]; colors: string[] }>();
  
  visibleChains.forEach((chain, visibleIndex) => {
    const originalIndex = chainIndexMap.get(visibleIndex)!;
    const chainColor = chainColors[originalIndex % chainColors.length];
    
    for (let i = 0; i < chain.narrators.length - 1; i++) {
      const fromRank = i + 1;
      const toRank = i + 2;
      const fromName = chain.narrators[i].arabicName;
      const toName = chain.narrators[i + 1].arabicName;
      const fromId = `${fromName}-${fromRank}`;
      const toId = `${toName}-${toRank}`;
      const edgeKey = `${fromId}->${toId}`;
      
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: fromId,
          target: toId,
          chainIndices: [visibleIndex],
          originalChainIndices: [originalIndex],
          colors: [chainColor]
        });
      } else {
        const existing = edgeMap.get(edgeKey)!;
        if (!existing.chainIndices.includes(visibleIndex)) {
          existing.chainIndices.push(visibleIndex);
          existing.originalChainIndices.push(originalIndex);
          existing.colors.push(chainColor);
        }
      }
    }
  });

  // Create edges - use first color for consolidated edges, or average if multiple
  const edges: CytoEdge[] = [];
  edgeMap.forEach((edgeData, edgeKey) => {
    // Use the first chain's color, or a neutral color if multiple chains share the edge
    const color = edgeData.colors.length === 1 
      ? edgeData.colors[0] 
      : (isDarkMode ? "#9ca3af" : "#6b7280"); // Neutral gray for shared edges
    
    edges.push({
      data: {
        id: edgeKey,
        source: edgeData.source,
        target: edgeData.target,
        chainCount: edgeData.chainIndices.length,
        chainIndices: edgeData.chainIndices, // Visible chain indices for display
        originalChainIndices: edgeData.originalChainIndices, // Original chain indices for click handling
        color: color
      }
    });
  });

  // Create Cytoscape instance
  const cy = cytoscape({
    container: container,
    elements: [...nodes, ...edges],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'data(backgroundColor)',
          'border-color': 'data(borderColor)',
          'border-width': '3px',
          'color': textColor,
          'label': 'data(label)',
          'text-wrap': 'wrap',
          'text-max-width': '250px',
          'font-size': '14px',
          'font-weight': 600,
          'text-valign': 'center',
          'text-halign': 'center',
          'width': '250px',
          'height': 'label',
          'padding': '15px',
          'shape': 'roundrectangle',
          'text-outline-width': '2px',
          'text-outline-color': bgColor,
          'overlay-opacity': 0,
          'min-height': '80px'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': '8px',
          'border-color': isDarkMode ? '#60a5fa' : '#2563eb'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': '5px',
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
          'curve-style': 'bezier',
          'opacity': 0.6,
          'overlay-opacity': 0,
          'label': '' // No labels on edges
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'opacity': 1,
          'width': '4px'
        }
      }
    ],
    layout: {
      name: 'dagre',
      rankdir: 'TB',
      nodeSep: 125, // Half a card width (250px / 2) for spacing between nodes
      edgeSep: 40,
      rankSep: 200,
      spacingFactor: 1.0,
      ranker: 'network-simplex',
      align: 'UL',
      acyclicer: 'greedy'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  });

  // Enable pan and zoom
  cy.userPanningEnabled(true);
  cy.boxSelectionEnabled(false);
  cy.userZoomingEnabled(true);
  
  // Configure zoom limits
  cy.minZoom(0.1);
  cy.maxZoom(5);

  // Track hover state to prevent flickering when moving between edges
  let hoverTimeout: NodeJS.Timeout | null = null;
  let currentHoveredEdge: cytoscape.EdgeSingular | null = null;

  // Add hover tooltips and effects for nodes
  cy.on('mouseover', 'node', (evt) => {
    const node = evt.target;
    
    // Visual hover effect
    node.style('border-width', '4px');
    
    // Clear any pending edge hover timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    // Clear edge tracking and highlighting when hovering over nodes
    currentHoveredEdge = null;
    if (onEdgeHoverRef?.current) {
      onEdgeHoverRef.current([]);
    }
    
    // Create tooltip
    const arabicName = node.data('arabicName');
    const englishName = node.data('englishName');
    const grade = node.data('grade');
    const rank = node.data('rank');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'cytoscape-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: ${isDarkMode ? '#1f2937' : '#ffffff'};
      color: ${textColor};
      padding: 12px 16px;
      border-radius: 8px;
      border: 2px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 14px;
      pointer-events: none;
      max-width: 300px;
    `;
    tooltip.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 6px; font-size: 16px;">${arabicName}</div>
      <div style="opacity: 0.8; margin-bottom: 6px; font-size: 14px;">${englishName}</div>
      <div style="font-size: 13px;">
        Rank: ${rank}${grade !== null ? ` | Grade: ${Math.round(grade)}` : ' | Ungraded'}
      </div>
    `;
    document.body.appendChild(tooltip);
    
    const updateTooltip = (e: MouseEvent) => {
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
    };
    
    const removeTooltip = () => {
      tooltip.remove();
      document.removeEventListener('mousemove', updateTooltip);
      document.removeEventListener('mouseout', removeTooltip);
    };
    
    document.addEventListener('mousemove', updateTooltip);
    document.addEventListener('mouseout', removeTooltip);
    
    // Store tooltip reference for cleanup
    (node as ExtendedNodeSingular)._tooltip = { element: tooltip, updateTooltip, removeTooltip };
  });

  cy.on('mouseout', 'node', (evt) => {
    const node = evt.target;
    
    // Reset border width
    node.style('border-width', '3px');
    
    // Remove tooltip
    const tooltipData = (node as ExtendedNodeSingular)._tooltip;
    if (tooltipData) {
      tooltipData.element.remove();
      delete (node as ExtendedNodeSingular)._tooltip;
    }
  });

  cy.on('mouseover', 'edge', (evt) => {
    evt.target.style('opacity', '1');
    evt.target.style('width', '4px');
  });

  cy.on('mouseout', 'edge', (evt) => {
    evt.target.style('opacity', '0.6');
    evt.target.style('width', '3px');
  });

  // Add click handler for edges
  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target;
    const originalChainIndices = edge.data('originalChainIndices') || edge.data('chainIndices') || [];
    if (onEdgeClickRef?.current && originalChainIndices.length > 0) {
      onEdgeClickRef.current(originalChainIndices);
    }
  });

  // Highlight chains when hovering over edges (no scrolling)
  cy.on('mouseover', 'edge', (evt) => {
    // Clear any pending timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }

    const edge = evt.target;
    currentHoveredEdge = edge;
    const originalChainIndices = edge.data('originalChainIndices') || edge.data('chainIndices') || [];

    if (onEdgeHoverRef?.current && originalChainIndices.length > 0) {
      onEdgeHoverRef.current(originalChainIndices);
    }
  });

  // Clear highlighting when mouse leaves edge
  cy.on('mouseout', 'edge', (evt) => {
    const edge = evt.target;

    // Clear the current hovered edge if it's this one
    if (currentHoveredEdge === edge) {
      currentHoveredEdge = null;
    }

    // Use a delay to check if we're moving to another edge
    // This prevents flickering when moving between edges
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    hoverTimeout = setTimeout(() => {
      // Only clear if we're not hovering over any edge
      if (!currentHoveredEdge && onEdgeHoverRef?.current) {
        onEdgeHoverRef.current([]);
      }
      hoverTimeout = null;
    }, 200);
  });

  // Clear highlighting when clicking on background
  cy.on('tap', (evt) => {
    if (evt.target === cy) {
      // Clicked on background, clear highlighting
      if (onEdgeClickRef?.current) {
        onEdgeClickRef.current([]);
      }
    }
  });

  // After layout, ensure nodes of same rank are properly grouped horizontally
  cy.ready(() => {
    // Group nodes by rank
    const nodesByRank = new Map<number, cytoscape.NodeSingular[]>();
    cy.nodes().forEach((node: cytoscape.NodeSingular) => {
      const rank = node.data('rank');
      if (!nodesByRank.has(rank)) {
        nodesByRank.set(rank, []);
      }
      nodesByRank.get(rank)!.push(node);
    });

    // For each rank, ensure nodes are horizontally aligned at the same Y
    nodesByRank.forEach((nodes) => {
      // Get the average Y position for this rank
      const avgY = nodes.reduce((sum: number, node: cytoscape.NodeSingular) => sum + node.position('y'), 0) / nodes.length;

      // Align all nodes in this rank to the same Y and sort by X
      nodes.forEach((node: cytoscape.NodeSingular) => {
        node.position('y', avgY);
      });
      
      // Sort by X and ensure proper horizontal spacing
      nodes.sort((a: cytoscape.NodeSingular, b: cytoscape.NodeSingular) => a.position('x') - b.position('x'));
      
      // Adjust X positions to ensure proper spacing (half a card width between cards)
      for (let i = 1; i < nodes.length; i++) {
        const prevNode = nodes[i - 1];
        const currentNode = nodes[i];
        const nodeWidth = prevNode.width();
        const gapWidth = nodeWidth / 2; // Half a card width for spacing
        const minSpacing = nodeWidth + gapWidth; // Full card width + gap = spacing between centers
        const currentSpacing = currentNode.position('x') - prevNode.position('x');
        
        if (currentSpacing < minSpacing) {
          currentNode.position('x', prevNode.position('x') + minSpacing);
        }
      }
    });

    cy.fit(undefined, 80);
  });

  return cy;
};


export function MermaidGraph({
  chains,
  showVisualization,
  isDarkMode,
  onHide,
  onEdgeClick,
  onEdgeHover,
  highlightedChainIds = []
}: MermaidGraphProps) {
  const graphRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const onEdgeClickRef = useRef(onEdgeClick);
  const onEdgeHoverRef = useRef(onEdgeHover);

  // Update refs when callbacks change
  useEffect(() => {
    onEdgeClickRef.current = onEdgeClick;
    onEdgeHoverRef.current = onEdgeHover;
  }, [onEdgeClick, onEdgeHover]);

  const handleDownload = () => {
    if (cyRef.current) {
      const png = cyRef.current.png({ 
        output: 'blob',
        bg: isDarkMode ? '#1f2937' : '#ffffff',
        full: true
      });
      
        const link = document.createElement('a');
      link.href = URL.createObjectURL(png);
      link.download = `hadith-chains-diagram-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
  };

  const handleResetZoom = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 80);
    }
  };

  // Render Cytoscape graph
  useEffect(() => {
    if (!showVisualization || chains.length === 0) {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      if (graphRef.current) {
        graphRef.current.innerHTML = '';
      }
      return;
    }

    if (graphRef.current) {
      // Destroy existing instance if any
      if (cyRef.current) {
        cyRef.current.destroy();
      }

      // Create new Cytoscape instance
      cyRef.current = createCytoscapeGraph(
        graphRef.current,
        chains,
        isDarkMode,
        onEdgeClickRef,
        onEdgeHoverRef
      );
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [showVisualization, chains, isDarkMode, highlightedChainIds]);

  // Update highlighting when highlightedChainIds changes
  useEffect(() => {
    if (!cyRef.current || !showVisualization) return;

    cyRef.current.edges().forEach((edge: cytoscape.EdgeSingular) => {
      const originalChainIndices = edge.data('originalChainIndices') || edge.data('chainIndices') || [];
      const belongsToHighlighted = originalChainIndices.some((idx: number) => {
        return chains[idx] && highlightedChainIds.includes(chains[idx].id);
      });

      if (belongsToHighlighted && highlightedChainIds.length > 0) {
        edge.style('opacity', '1');
        edge.style('width', '4px');
        edge.style('line-color', isDarkMode ? '#60a5fa' : '#2563eb');
        edge.style('target-arrow-color', isDarkMode ? '#60a5fa' : '#2563eb');
      } else {
        const originalColor = edge.data('color');
        edge.style('opacity', '0.6');
        edge.style('width', '3px');
        edge.style('line-color', originalColor);
        edge.style('target-arrow-color', originalColor);
      }
    });
  }, [highlightedChainIds, chains, isDarkMode, showVisualization]);


  if (!showVisualization || chains.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Chain Spider Diagram
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleResetZoom}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Reset zoom and pan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Reset View</span>
            <span className="sm:hidden">Reset</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
            title="Download chain diagram as PNG"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Download Diagram</span>
            <span className="sm:hidden">Download</span>
          </button>
          {onHide && (
            <button
              onClick={onHide}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Hide visualization"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Hide</span>
            </button>
          )}
        </div>
      </div>

      {/* Cytoscape Graph */}
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
        <div ref={graphRef} className="w-full h-[800px] border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"></div>

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          💡 Narrators are organized by rank (position in chain). Hover over nodes to see full details. Edges show chain connections - numbers indicate multiple chains sharing the same path. Pan by dragging, zoom with mouse wheel/pinch, or use Reset View to return to default.
        </div>
      </div>
    </div>
  );
}

