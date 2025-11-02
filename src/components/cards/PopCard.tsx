import { Pop } from '../../types';
import { motion } from 'framer-motion';

interface PopCardProps {
  pop: Pop;
  className?: string;
}

export function PopCard({ pop, className = '' }: PopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {pop.name}
        </h2>
        <p className="text-lg text-gray-600">
          {pop.brand} • {pop.parentCompany}
        </p>
      </div>

      {/* Brand Colors */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Brand Colors</h3>
        <div className="flex space-x-2">
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: pop.brandColors.primary }}
            title="Primary"
          />
          <div 
            className="w-8 h-8 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: pop.brandColors.secondary }}
            title="Secondary"
          />
          {pop.brandColors.accent && (
            <div 
              className="w-8 h-8 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: pop.brandColors.accent }}
              title="Accent"
            />
          )}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {pop.caffeine}
            <span className="text-sm font-normal text-gray-600 ml-1">mg</span>
          </div>
          <div className="text-sm text-gray-600">Caffeine</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {pop.calories}
          </div>
          <div className="text-sm text-gray-600">Calories</div>
        </div>
      </div>

      {/* Nutrition Facts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Nutrition Facts</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sodium</span>
            <span className="font-medium">{pop.nutritionFacts.sodium}mg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Carbs</span>
            <span className="font-medium">{pop.nutritionFacts.totalCarbs}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sugars</span>
            <span className="font-medium">{pop.nutritionFacts.sugars}g</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}