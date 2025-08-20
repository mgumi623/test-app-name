'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  counts: Record<string, number>;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  counts 
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "secondary"}
          className={`
            cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200
            ${selectedCategory === category 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          onClick={() => onCategoryChange(category)}
        >
          {category}
          <span className="ml-2 text-xs opacity-75">
            ({counts[category] || 0})
          </span>
        </Badge>
      ))}
    </div>
  );
}
