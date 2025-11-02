import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Pop, HockeyPosition } from '../../types';
import { getOptimizedPopImage, generateFallbackImage, validatePDFData } from '../../utils/pdfUtils';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  rinkContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: 8,
    padding: 20,
    minHeight: 500,
  },
  rinkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  // Hockey rink markings
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#ef4444',
    marginLeft: -1,
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 80,
    height: 80,
    borderRadius: 40,
    border: '2px solid #ef4444',
    marginLeft: -40,
    marginTop: -40,
  },
  goalLine: {
    position: 'absolute',
    width: 2,
    top: 20,
    bottom: 20,
    backgroundColor: '#dc2626',
  },
  leftGoalLine: {
    left: 60,
  },
  rightGoalLine: {
    right: 60,
  },
  positionGrid: {
    position: 'relative',
    zIndex: 1,
    flex: 1,
    paddingTop: 40,
  },
  lineSection: {
    marginBottom: 30,
  },
  lineHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  positionSlot: {
    width: 120,
    height: 80,
    backgroundColor: '#ffffff',
    border: '2px solid #d1d5db',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  assignedSlot: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  emptySlot: {
    borderStyle: 'dashed',
    borderColor: '#9ca3af',
  },
  popImage: {
    width: 30,
    height: 40,
    marginBottom: 4,
  },
  popName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  popBrand: {
    fontSize: 6,
    color: '#6b7280',
    textAlign: 'center',
  },
  positionName: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 9,
    color: '#6b7280',
  },
  statsValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
});

interface PDFGeneratorProps {
  lineupName: string;
  assignments: Record<string, string>;
  positions: HockeyPosition[];
  pops: Pop[];
  exportType: 'first-line' | 'full-lineup';
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  lineupName,
  assignments,
  positions,
  pops,
  exportType,
}) => {
  const [optimizedImages, setOptimizedImages] = useState<Record<string, string>>({});
  const [isOptimizing, setIsOptimizing] = useState(true);

  // Validate PDF data
  const validation = validatePDFData(assignments, positions, pops);
  
  useEffect(() => {
    const optimizeImages = async () => {
      setIsOptimizing(true);
      const imagePromises: Record<string, Promise<string>> = {};
      
      // Get all assigned pops
      const assignedPops = Object.values(assignments)
        .map(popId => pops.find(p => p.id === popId))
        .filter(Boolean) as Pop[];

      // Optimize images for each assigned pop
      for (const pop of assignedPops) {
        imagePromises[pop.id] = getOptimizedPopImage(pop).catch(() => 
          generateFallbackImage(pop)
        );
      }

      try {
        const resolvedImages = await Promise.all(
          Object.entries(imagePromises).map(async ([popId, promise]) => [
            popId,
            await promise
          ])
        );
        
        const imageMap = Object.fromEntries(resolvedImages);
        setOptimizedImages(imageMap);
      } catch (error) {
        console.error('Error optimizing images:', error);
        // Use fallback images for all pops
        const fallbackImages = assignedPops.reduce((acc, pop) => {
          acc[pop.id] = generateFallbackImage(pop);
          return acc;
        }, {} as Record<string, string>);
        setOptimizedImages(fallbackImages);
      } finally {
        setIsOptimizing(false);
      }
    };

    optimizeImages();
  }, [assignments, pops]);
  // Filter positions based on export type
  const filteredPositions = exportType === 'first-line' 
    ? positions.filter(pos => pos.line === 1 && pos.type === 'forward')
    : positions;

  // Group positions by line and type
  const groupedPositions = filteredPositions.reduce((acc, position) => {
    const key = position.type === 'forward' ? `Line ${position.line}` : `Defense ${position.line}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(position);
    return acc;
  }, {} as Record<string, HockeyPosition[]>);

  // Calculate lineup statistics
  const assignedPositions = filteredPositions.filter(pos => assignments[pos.id]);
  const totalCaffeine = assignedPositions.reduce((sum, pos) => {
    const pop = pops.find(p => p.id === assignments[pos.id]);
    return sum + (pop?.caffeine || 0);
  }, 0);

  const uniqueBrands = new Set(
    assignedPositions.map(pos => {
      const pop = pops.find(p => p.id === assignments[pos.id]);
      return pop?.brand;
    }).filter(Boolean)
  ).size;

  const getPopImageUrl = (pop: Pop): string => {
    // Use optimized image if available, otherwise fallback
    return optimizedImages[pop.id] || generateFallbackImage(pop);
  };

  // Show loading state while optimizing images
  if (isOptimizing) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Optimizing images for PDF...
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Show error state if validation fails
  if (!validation.isValid) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#ef4444', marginBottom: 10 }}>
              PDF Generation Error
            </Text>
            {validation.errors.map((error, index) => (
              <Text key={index} style={{ fontSize: 12, color: '#6b7280', marginBottom: 5 }}>
                • {error}
              </Text>
            ))}
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{lineupName}</Text>
          <Text style={styles.subtitle}>
            {exportType === 'first-line' ? 'First Line' : 'Full Lineup'} • Diet Pop Hockey Lineup
          </Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Hockey Rink Container */}
        <View style={styles.rinkContainer}>
          {/* Rink Background and Markings */}
          <View style={styles.rinkBackground} />
          <View style={styles.centerLine} />
          <View style={styles.centerCircle} />
          <View style={[styles.goalLine, styles.leftGoalLine]} />
          <View style={[styles.goalLine, styles.rightGoalLine]} />

          {/* Position Grid */}
          <View style={styles.positionGrid}>
            {Object.entries(groupedPositions).map(([lineKey, linePositions]) => (
              <View key={lineKey} style={styles.lineSection}>
                <Text style={styles.lineHeader}>{lineKey}</Text>
                <View style={styles.positionRow}>
                  {linePositions
                    .sort((a, b) => a.coordinates.x - b.coordinates.x)
                    .map((position) => {
                      const assignedPopId = assignments[position.id];
                      const assignedPop = assignedPopId ? pops.find(p => p.id === assignedPopId) : null;
                      
                      return (
                        <View
                          key={position.id}
                          style={[
                            styles.positionSlot,
                            assignedPop ? styles.assignedSlot : styles.emptySlot,
                          ]}
                        >
                          {assignedPop ? (
                            <>
                              <Image
                                style={styles.popImage}
                                src={getPopImageUrl(assignedPop)}
                              />
                              <Text style={styles.popName}>{assignedPop.name}</Text>
                              <Text style={styles.popBrand}>{assignedPop.brand}</Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.emptyText}>Empty</Text>
                              <Text style={styles.positionName}>{position.name}</Text>
                            </>
                          )}
                        </View>
                      );
                    })}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Lineup Statistics</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Positions Filled:</Text>
            <Text style={styles.statsValue}>
              {assignedPositions.length} / {filteredPositions.length}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Caffeine:</Text>
            <Text style={styles.statsValue}>{totalCaffeine}mg</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Unique Brands:</Text>
            <Text style={styles.statsValue}>{uniqueBrands}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average Caffeine per Pop:</Text>
            <Text style={styles.statsValue}>
              {assignedPositions.length > 0 ? Math.round(totalCaffeine / assignedPositions.length) : 0}mg
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Diet Pop NHL Lineup</Text>
          <Text style={styles.footerText}>
            Created with ❤️ for diet pop enthusiasts
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFGenerator;