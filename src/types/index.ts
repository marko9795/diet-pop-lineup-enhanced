export interface Pop {
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

export interface HockeyPosition {
  id: string;
  name: string; // "Left Wing", "Center", "Right Wing", etc.
  line: number; // 1-4 for forwards, 1-3 for defense
  type: 'forward' | 'defense';
  coordinates: { x: number; y: number }; // for lineup grid positioning
}

export interface UserLineup {
  id: string;
  name: string;
  assignments: Record<string, string>; // positionId -> popId
  createdAt: Date;
  updatedAt: Date;
}