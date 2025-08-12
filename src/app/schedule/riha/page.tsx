'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Users, Clock, Plus, Edit3, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// リハビリテーション管理システム
export default function RehabilitationSchedule() {
  const [isLoading, setIsLoading] = useState(true);

  // 初期化
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 animate-pulse">リハビリテーションシステムを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* AIchatスタイルのグローバルCSS */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3) } 50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6) } }
        .animate-fade-in { animation: fade-in 0.5s ease-out }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite }
        ::-webkit-scrollbar { width: 8px }
        ::-webkit-scrollbar-track { background: #f1f5f9 }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8 }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden">
          {/* メインコンテンツエリア */}
          <div className="flex-1 flex flex-col">
            {/* ヘッダー */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center animate-pulse-glow">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">リハビリテーション管理</h1>
                    <p className="text-sm text-gray-600">患者スケジュール管理システム</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    オンライン
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    新規予約
                  </Button>
                </div>
              </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 p-6 overflow-auto">
              <div className="space-y-6 animate-fade-in-up">
                {/* ダッシュボード統計 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">今日の予約</p>
                          <p className="text-2xl font-bold text-gray-900">24</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">担当患者</p>
                          <p className="text-2xl font-bold text-gray-900">156</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">セラピスト</p>
                          <p className="text-2xl font-bold text-gray-900">8</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 今日のスケジュール */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          今日のスケジュール
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          2025年1月12日（日曜日）
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit3 className="w-4 h-4 mr-2" />
                        編集
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {/* 時間スロット */}
                      {[
                        { time: '09:00', patient: '田中 太郎', therapist: 'PT 山田', type: 'PT', status: '進行中' },
                        { time: '09:30', patient: '佐藤 花子', therapist: 'OT 鈴木', type: 'OT', status: '予定' },
                        { time: '10:00', patient: '高橋 一郎', therapist: 'ST 田中', type: 'ST', status: '予定' },
                        { time: '10:30', patient: '伊藤 美咲', therapist: 'PT 山田', type: 'PT', status: '予定' },
                        { time: '11:00', patient: '渡辺 健一', therapist: 'OT 鈴木', type: 'OT', status: '予定' },
                      ].map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-16 text-center">
                              <div className="text-sm font-medium text-gray-900">{slot.time}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                slot.type === 'PT' ? 'bg-blue-500' :
                                slot.type === 'OT' ? 'bg-green-500' : 'bg-purple-500'
                              }`} />
                              <div>
                                <div className="font-medium text-gray-900">{slot.patient}</div>
                                <div className="text-sm text-gray-600">{slot.therapist}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.status === '進行中' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {slot.status}
                            </span>
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 患者一覧 */}
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      患者一覧
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      リハビリテーション対象患者
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {[
                        { name: '田中 太郎', age: 68, room: '301', condition: '脳梗塞後遺症', therapy: ['PT', 'OT'] },
                        { name: '佐藤 花子', age: 75, room: '205', condition: '大腿骨骨折術後', therapy: ['PT'] },
                        { name: '高橋 一郎', age: 82, room: '104', condition: '失語症', therapy: ['ST'] },
                        { name: '伊藤 美咲', age: 45, room: '308', condition: '腰椎椎間板ヘルニア', therapy: ['PT'] },
                      ].map((patient, index) => (
                        <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-600">{patient.age}歳 • 病室{patient.room}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{patient.condition}</div>
                              <div className="flex gap-1 mt-1">
                                {patient.therapy.map((type) => (
                                  <span key={type} className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    type === 'PT' ? 'bg-blue-100 text-blue-700' :
                                    type === 'OT' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              詳細
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}