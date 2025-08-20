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
    <div className="mb-6">
      <div className="bg-white/85 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">病院ニュース</h2>
        </div>
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors truncate">
                    {item.title}
                  </h4>
                  {item.isNew && (
                    <Badge className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5">
                      NEW
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{item.date}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors">
            すべてのニュースを見る →
          </button>
        </div>
      </div>
    </div>
  );
}