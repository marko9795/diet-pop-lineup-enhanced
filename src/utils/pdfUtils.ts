import { Pop } from '../types';

/**
 * Utility functions for PDF generation and optimization
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Convert image to base64 with optimization
 */
export const optimizeImageForPDF = async (
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<string> => {
  const {
    maxWidth = 100,
    maxHeight = 120,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };

    img.src = imageUrl;
  });
};

/**
 * Get optimized image URL for pop with fallback handling
 */
export const getOptimizedPopImage = async (pop: Pop): Promise<string> => {
  const fallbackImage = generateFallbackImage(pop);
  
  try {
    // Try to load the actual texture image
    const textureUrl = pop.modelAssets.texture;
    
    // Check if the image exists and is accessible
    if (textureUrl && textureUrl !== '/placeholder-can.png') {
      try {
        const optimizedImage = await optimizeImageForPDF(textureUrl, {
          maxWidth: 80,
          maxHeight: 100,
          quality: 0.7,
          format: 'jpeg'
        });
        return optimizedImage;
      } catch {
        // If texture fails, try to use a brand-colored fallback
        return fallbackImage;
      }
    }
    
    return fallbackImage;
  } catch {
    return fallbackImage;
  }
};

/**
 * Generate a fallback image based on pop brand colors
 */
export const generateFallbackImage = (pop: Pop): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '/placeholder-can.png';
  }

  canvas.width = 80;
  canvas.height = 100;

  // Create gradient background using brand colors
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, pop.brandColors.primary);
  gradient.addColorStop(0.5, pop.brandColors.secondary);
  gradient.addColorStop(1, pop.brandColors.accent || pop.brandColors.primary);

  // Draw can shape
  ctx.fillStyle = gradient;
  ctx.fillRect(10, 10, 60, 80);

  // Add rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(10, 10, 60, 80, 8);
  ctx.fill();

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  // Add brand name text
  ctx.fillStyle = getContrastColor(pop.brandColors.primary);
  ctx.font = 'bold 8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(pop.brand, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/jpeg', 0.8);
};

/**
 * Get contrasting color for text readability
 */
export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Validate PDF generation requirements
 */
export const validatePDFData = (
  assignments: Record<string, string>,
  positions: any[],
  pops: Pop[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if we have positions
  if (!positions || positions.length === 0) {
    errors.push('No positions data available');
  }

  // Check if we have pops data
  if (!pops || pops.length === 0) {
    errors.push('No pops data available');
  }

  // Check for invalid assignments
  Object.entries(assignments).forEach(([positionId, popId]) => {
    const position = positions.find(p => p.id === positionId);
    const pop = pops.find(p => p.id === popId);
    
    if (!position) {
      errors.push(`Invalid position ID: ${positionId}`);
    }
    
    if (!pop) {
      errors.push(`Invalid pop ID: ${popId}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate estimated PDF file size
 */
export const estimatePDFSize = (
  assignedCount: number,
  _exportType: 'first-line' | 'full-lineup'
): { estimatedSizeKB: number; warning?: string } => {
  // Base PDF size (structure, fonts, etc.)
  let baseSize = 50; // KB
  
  // Add size for each assigned position (image + text)
  const imageSize = 8; // KB per optimized image
  const textSize = 1; // KB per position text
  
  const totalSize = baseSize + (assignedCount * (imageSize + textSize));
  
  const result = { estimatedSizeKB: totalSize };
  
  if (totalSize > 1000) {
    return {
      ...result,
      warning: 'Large file size expected. Consider reducing image quality or using first-line export.'
    };
  }
  
  return result;
};