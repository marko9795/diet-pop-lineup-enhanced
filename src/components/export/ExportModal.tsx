import React, { useState, useMemo } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { X, Download, Eye, FileText, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFGenerator from './PDFGenerator';
import { useLineupStore } from '../../stores/lineupStore';
import { usePopStore } from '../../stores/popStore';
import positionsData from '../../data/positions.json';
import { HockeyPosition } from '../../types';
import { estimatePDFSize, validatePDFData } from '../../utils/pdfUtils';
import { PDFExportLoadingIndicator, StepProgress, useNotifications } from '../ui';
import { ErrorBoundary, PDFExportFallback } from '../error';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportType = 'first-line' | 'full-lineup';

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [exportType, setExportType] = useState<ExportType>('full-lineup');
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [exportStage, setExportStage] = useState<'preparing' | 'generating' | 'optimizing' | 'finalizing'>('preparing');
  const [exportProgress, setExportProgress] = useState(0);

  
  const { success, error: showError } = useNotifications();

  const { currentLineup, assignments } = useLineupStore();
  const { pops } = usePopStore();
  const positions = positionsData as HockeyPosition[];

  // Filter positions based on export type
  const filteredPositions = exportType === 'first-line' 
    ? positions.filter(pos => pos.line === 1 && pos.type === 'forward')
    : positions;

  const assignedCount = filteredPositions.filter(pos => assignments[pos.id]).length;
  const totalPositions = filteredPositions.length;

  // Calculate file size estimate and validation
  const sizeEstimate = useMemo(() => 
    estimatePDFSize(assignedCount, exportType), 
    [assignedCount, exportType]
  );

  const validation = useMemo(() => 
    validatePDFData(assignments, positions, pops),
    [assignments, positions, pops]
  );

  const handleExportTypeChange = (type: ExportType) => {
    setExportType(type);
    setShowPreview(false);
    setPreviewError(null);
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    setPreviewError(null);
    setExportProgress(0);
    
    try {
      // Simulate multi-stage PDF generation with progress
      setExportStage('preparing');
      setExportProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExportStage('generating');
      setExportProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExportStage('optimizing');
      setExportProgress(70);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setExportStage('finalizing');
      setExportProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setExportProgress(100);
      setIsGenerating(false);
      setShowPreview(true);
      
      success('Preview Generated', 'PDF preview is ready for viewing');
      
    } catch (err) {
      setIsGenerating(false);
      setPreviewError('Failed to generate PDF preview. Please try again.');
      showError('Preview Failed', 'There was an error generating the PDF preview');
    }
  };

  const handleDownloadStart = () => {
    success('Download Started', 'Your PDF is being prepared for download');
  };







  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export Lineup</h2>
              <p className="text-gray-600 mt-1">
                Generate a PDF of your {currentLineup.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Panel - Options */}
            <div className="lg:w-1/3 p-6 border-r border-gray-200">
              <div className="space-y-6">
                {/* Export Type Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="first-line"
                        checked={exportType === 'first-line'}
                        onChange={() => handleExportTypeChange('first-line')}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">First Line Only</div>
                          <div className="text-sm text-gray-600">Top 3 forwards</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="exportType"
                        value="full-lineup"
                        checked={exportType === 'full-lineup'}
                        onChange={() => handleExportTypeChange('full-lineup')}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Full Lineup</div>
                          <div className="text-sm text-gray-600">All 18 positions</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Lineup Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Lineup Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Positions Filled:</span>
                      <span className="font-medium">
                        {assignedCount} / {totalPositions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Export Type:</span>
                      <span className="font-medium capitalize">
                        {exportType.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Size:</span>
                      <span className="font-medium">
                        ~{sizeEstimate.estimatedSizeKB} KB
                      </span>
                    </div>
                  </div>
                  
                  {/* Size warning */}
                  {sizeEstimate.warning && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="flex items-start">
                        <AlertTriangle className="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-yellow-700">{sizeEstimate.warning}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePreview}
                    disabled={isGenerating || !validation.isValid}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {exportStage === 'preparing' && 'Preparing...'}
                        {exportStage === 'generating' && 'Generating...'}
                        {exportStage === 'optimizing' && 'Optimizing...'}
                        {exportStage === 'finalizing' && 'Finalizing...'}
                      </div>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview PDF
                      </>
                    )}
                  </button>

                  {/* Progress indicator during generation */}
                  {isGenerating && (
                    <div className="mt-2">
                      <StepProgress
                        steps={[
                          { label: 'Prepare', completed: exportProgress > 10, current: exportStage === 'preparing' },
                          { label: 'Generate', completed: exportProgress > 40, current: exportStage === 'generating' },
                          { label: 'Optimize', completed: exportProgress > 70, current: exportStage === 'optimizing' },
                          { label: 'Finalize', completed: exportProgress >= 100, current: exportStage === 'finalizing' },
                        ]}
                      />
                    </div>
                  )}

                  <div className="w-full">
                    <ErrorBoundary
                      fallback={
                        <PDFExportFallback
                          onRetry={() => window.location.reload()}
                          onClose={onClose}
                          error="PDF generation failed"
                        />
                      }
                    >
                      <PDFDownloadLink
                        document={
                          <PDFGenerator
                            lineupName={currentLineup.name}
                            assignments={assignments}
                            positions={positions}
                            pops={pops}
                            exportType={exportType}
                          />
                        }
                        fileName={`${currentLineup.name.replace(/\s+/g, '-').toLowerCase()}-${exportType}.pdf`}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        onClick={handleDownloadStart}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </PDFDownloadLink>
                    </ErrorBoundary>
                  </div>
                </div>

                {/* Validation warnings */}
                {!validation.isValid && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-red-600 text-sm">
                        <strong>Validation Errors:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for empty positions */}
                {assignedCount === 0 && validation.isValid && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-yellow-600 text-sm">
                        <strong>Note:</strong> Your lineup is empty. The PDF will show placeholder positions.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:w-2/3 bg-gray-50">
              {isGenerating ? (
                <div className="h-full flex items-center justify-center">
                  <PDFExportLoadingIndicator
                    stage={exportStage}
                    progress={exportProgress}
                  />
                </div>
              ) : previewError ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Preview Error
                    </h4>
                    <p className="text-red-600 mb-4">{previewError}</p>
                    <button
                      onClick={handlePreview}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : showPreview ? (
                <div className="h-full">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">PDF Preview</h4>
                    <p className="text-sm text-gray-600">
                      Preview of your {exportType.replace('-', ' ')} export
                    </p>
                  </div>
                  <div className="h-full overflow-auto">
                    <div className="h-[600px]">
                      <PDFViewer
                        width="100%"
                        height="100%"
                        className="border-none"
                        showToolbar={false}
                      >
                        <PDFGenerator
                          lineupName={currentLineup.name}
                          assignments={assignments}
                          positions={positions}
                          pops={pops}
                          exportType={exportType}
                        />
                      </PDFViewer>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      PDF Preview
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Click "Preview PDF" to see how your lineup will look
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Current selection: {exportType.replace('-', ' ')}</p>
                      <p>{assignedCount} of {totalPositions} positions filled</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportModal;