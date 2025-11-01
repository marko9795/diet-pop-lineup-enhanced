# Design Document

## Overview

The enhanced Diet Pop NHL Lineup application is a React TypeScript web application that combines sports-themed organization with immersive 3D visualization and professional export capabilities. The system prioritizes user experience through smooth 3D interactions, detailed product information, and beautiful shareable content generation.

## Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Three.js/React Three Fiber** for 3D pop can rendering and interactions
- **Zustand** for lightweight state management of lineups and pop data
- **Tailwind CSS** for responsive styling and consistent design system
- **React PDF** for client-side PDF generation and export
- **Framer Motion** for smooth UI animations and transitions

### Data Layer
- **Local Storage** for persistent lineup and user preference data
- **Static JSON** for pop database with structured product information
- **Asset Management** for 3D models, textures, and brand imagery

### Component Structure
```
src/
├── components/
│   ├── lineup/
│   │   ├── LineupGrid.tsx
│   │   ├── PositionSlot.tsx
│   │   └── PopSelector.tsx
│   ├── 3d/
│   │   ├── PopModel3D.tsx
│   │   ├── PopViewer.tsx
│   │   └── ModelControls.tsx
│   ├── cards/
│   │   ├── PopCard.tsx
│   │   └── PopStats.tsx
│   └── export/
│       ├── PDFGenerator.tsx
│       └── ExportModal.tsx
├── stores/
│   ├── lineupStore.ts
│   └── popStore.ts
├── data/
│   ├── pops.json
│   └── positions.json
└── assets/
    ├── models/
    ├── textures/
    └── logos/
```

## Components and Interfaces

### Core Data Models

```typescript
interface Pop {
  id: string;
  name: string;
  brand: string;
  parentCompany: string;
  caffeine: number; // mg per 12oz
  calories: number;
  brandColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  modelAssets: {
    geometry: string; // path to 3D model
    texture: string; // path to texture file
    normalMap?: string;
  };
  nutritionFacts: {
    sodium: number;
    totalCarbs: number;
    sugars: number;
  };
}

interface HockeyPosition {
  id: string;
  name: string; // "Left Wing", "Center", "Right Wing", etc.
  line: number; // 1-4 for forwards, 1-3 for defense
  type: 'forward' | 'defense';
  coordinates: { x: number; y: number }; // for lineup grid positioning
}

interface UserLineup {
  id: string;
  name: string;
  assignments: Record<string, string>; // positionId -> popId
  createdAt: Date;
  updatedAt: Date;
}
```

### 3D Visualization System

The 3D pop model system uses React Three Fiber for WebGL rendering:

**PopModel3D Component:**
- Loads GLTF/GLB models for realistic can geometry
- Applies dynamic textures based on pop branding
- Implements PBR (Physically Based Rendering) materials for metallic appearance
- Supports interactive rotation and zoom controls
- Optimized LOD (Level of Detail) for mobile performance

**PopViewer Modal:**
- Full-screen 3D model display with orbital controls
- Integrated PopCard overlay showing detailed information
- Smooth enter/exit animations using Framer Motion
- Touch-optimized controls for mobile devices

### PDF Export System

**Export Functionality:**
- Client-side PDF generation using React PDF
- Two export modes: First Line (top 3 forwards) and Full Lineup (all 18 positions)
- Professional card design with pop images and position layouts
- Automatic image optimization for PDF file size management

**Design Templates:**
- Hockey rink background with position markers
- Pop images arranged in formation layout
- Team name and creation date headers
- Consistent branding and typography

## Data Models

### Pop Database Structure
The pop database contains comprehensive information for each diet soda:
- **Product Information**: Name, brand, parent company
- **Nutritional Data**: Caffeine content, calories, sodium, carbs
- **Visual Assets**: Brand colors, logo paths, 3D model references
- **Metadata**: Release date, availability status, custom flag

### Lineup Management
- **Position Mapping**: 18 predefined hockey positions with grid coordinates
- **Assignment Tracking**: Real-time updates of pop-to-position assignments
- **Persistence**: Automatic saving to localStorage with conflict resolution
- **Validation**: Ensures no duplicate assignments and position constraints

## Error Handling

### 3D Model Loading
- **Fallback Models**: Default can geometry when specific models fail to load
- **Progressive Loading**: Show low-poly models while high-detail versions load
- **Error Boundaries**: Graceful degradation when WebGL is unavailable
- **Performance Monitoring**: Automatic quality reduction on low-end devices

### PDF Generation
- **Memory Management**: Chunked processing for large lineup exports
- **Image Optimization**: Automatic compression and format conversion
- **Fallback Rendering**: Text-based export when image processing fails
- **Progress Indicators**: User feedback during PDF generation process

### Data Persistence
- **Storage Validation**: Check localStorage availability and quota limits
- **Backup Strategies**: Export/import functionality for lineup data
- **Conflict Resolution**: Handle concurrent modifications across browser tabs
- **Migration Support**: Version compatibility for data structure updates

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for UI component behavior
- **Store Testing**: Zustand store actions and state management
- **Utility Testing**: PDF generation and data transformation functions
- **3D Testing**: Mock Three.js components for rendering logic validation

### Integration Testing
- **User Workflows**: Complete lineup creation and export processes
- **3D Interactions**: Model loading, rotation, and zoom functionality
- **Cross-Device Testing**: Responsive behavior across screen sizes
- **Performance Testing**: 3D rendering performance on various devices

### Visual Testing
- **Screenshot Comparison**: Automated visual regression testing
- **3D Model Validation**: Ensure accurate brand representation
- **PDF Output Testing**: Verify export quality and layout consistency
- **Accessibility Testing**: Screen reader compatibility and keyboard navigation

## Performance Considerations

### 3D Optimization
- **Model Compression**: Optimized GLTF files with Draco compression
- **Texture Streaming**: Progressive texture loading based on viewport
- **Instancing**: Reuse geometry for similar can shapes
- **Culling**: Hide models outside camera view

### Bundle Optimization
- **Code Splitting**: Lazy load 3D components and PDF generation
- **Asset Optimization**: WebP images with fallbacks
- **Tree Shaking**: Remove unused Three.js modules
- **Caching Strategy**: Service worker for 3D assets and pop data

### Mobile Performance
- **Adaptive Quality**: Reduce 3D complexity on mobile devices
- **Touch Optimization**: Gesture-based 3D controls
- **Battery Awareness**: Reduce frame rate when device is low on battery
- **Memory Management**: Dispose of 3D resources when not in use