'use client';

import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HospitalNews() {
  const news = [
    {
      id: 1,
      title: '新型コロナウイルス感染症対策の更新について',
      date: '2024-12-15',
      category: '重要',
      isNew: true
    },
    {
      id: 2,
      title: '年末年始の診療体制について',
      date: '2024-12-10',
      category: 'お知らせ',
      isNew: false
    },
    {
      id: 3,
      title: '院内研修の開催予定',
      date: '2024-12-08',
      category: '研修',
      isNew: false
    }
  ];

  return (
    <div className="mb-4">
      <div className="bg-white/85 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-900">病院ニュース</h2>
        </div>
        <div className="space-y-2">
          {news.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-3 bg-white rounded-md border border-gray-100 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors truncate">
                    {item.title}
                  </h4>
                  {item.isNew && (
                    <Badge className="bg-red-100 text-red-800 text-xs px-1 py-0">
                      NEW
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.date}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50 px-1 py-0">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <button className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
            すべてのニュースを見る →
          </button>
        </div>
      </div>
    </div>
  );
}