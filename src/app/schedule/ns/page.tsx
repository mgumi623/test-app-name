'use client';
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, Sun, Moon, Sunrise, Sunset, Edit3, Plus, Trash2, X } from 'lucide-react';

type DragItem = {
  staffName: string;
  day: number;
  shiftType: string;
};

const ShiftManagementTool = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdmin, setIsAdmin] = useState(false);
  const [shifts, setShifts] = useState<Record<string, Record<string, string>>>({});
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null); 
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'nurse' or 'helper'
  const [newStaffName, setNewStaffName] = useState('');
  const [customNurses, setCustomNurses] = useState<string[]>([]);
  const [customHelpers, setCustomHelpers] = useState<string[]>([]);


  // スタッフデータ（初期値）
  const initialNurses = [
    '田中 美咲', '佐藤 花子', '高橋 恵美', '山田 優子', '伊藤 真理',
    '渡辺 かおり', '中村 由美', '小林 愛', '加藤 麻衣', '吉田 理恵',
    '松本 さくら', '井上 直美', '木村 千春', '林 みどり', '森 ひろみ'
  ];
  
  const initialHelpers = [
    '鈴木 太郎', '田村 次郎', '斎藤 三郎', '橋本 四郎',
    '青木 五郎', '石川 六郎', '山口 七郎'
  ];

  // 実際に使用するスタッフリスト（カスタム + 初期値）
  const nurses = [...initialNurses, ...customNurses];
  const helpers = [...initialHelpers, ...customHelpers];

  // シフトタイプ定義
  const shiftTypes = {
    nurse_day: { name: '日勤', color: 'bg-blue-500', textColor: 'text-white', time: '8:30-17:00', count: 6, icon: Sun },
    nurse_night: { name: '当直', color: 'bg-purple-600', textColor: 'text-white', time: '16:00-9:00', count: 2, icon: Moon },
    helper_early: { name: '早出', color: 'bg-orange-500', textColor: 'text-white', time: '6:00-16:00', count: 1, icon: Sunrise },
    helper_day: { name: 'H日勤', color: 'bg-green-500', textColor: 'text-white', time: '8:30-17:00', count: 2, icon: Sun },
    helper_night: { name: '夜勤', color: 'bg-indigo-600', textColor: 'text-white', time: '11:00-19:00', count: 1, icon: Sunset }
  };

  // 月の日数を取得
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };


  const getDayOfWeek = (date: Date, day: number): string => {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), day);
    return ['日', '月', '火', '水', '木', '金', '土'][targetDate.getDay()];
  };


  // 月を変更
  const changeMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // スタッフがカスタム追加されたものかチェック
  const isCustomStaff = (staffName: string, staffType: string): boolean => {
    if (staffType === 'nurse') {
      return customNurses.includes(staffName);
    } else if (staffType === 'helper') {
      return customHelpers.includes(staffName);
    }
    return false;
  };


  // スタッフ追加
  const addStaff = () => {
    if (!newStaffName.trim()) return;
    
    if (modalType === 'nurse') {
      setCustomNurses(prev => [...prev, newStaffName.trim()]);
    } else if (modalType === 'helper') {
      setCustomHelpers(prev => [...prev, newStaffName.trim()]);
    }
    
    setNewStaffName('');
    setShowStaffModal(false);
  };

  // スタッフ削除
  const removeStaff = (staffName: string, staffType: string): void => {
    // まずシフトからも削除
    const newShifts: Record<string, Record<string, string>> = { ...shifts };
    Object.keys(newShifts).forEach(dateKey => {
      if (newShifts[dateKey][staffName]) {
        delete newShifts[dateKey][staffName];
      }
    });
    setShifts(newShifts);

    // スタッフリストから削除
    if (staffType === 'nurse') {
      setCustomNurses(prev => prev.filter(name => name !== staffName));
    } else if (staffType === 'helper') {
      setCustomHelpers(prev => prev.filter(name => name !== staffName));
    }
  };

  // 自動シフト生成
  const generateAutoShift = () => {
    const newShifts: Record<string, Record<string, string>> = {};
    const daysInMonth = getDaysInMonth(currentDate);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
      newShifts[dateKey] = {};
      
      // 看護師のシフト割り当て
      const shuffledNurses = [...nurses].sort(() => Math.random() - 0.5);
      for (let i = 0; i < 6; i++) {
        newShifts[dateKey][shuffledNurses[i]] = 'nurse_day';
      }
      for (let i = 6; i < 8; i++) {
        newShifts[dateKey][shuffledNurses[i]] = 'nurse_night';
      }
      
      // ヘルパーのシフト割り当て
      const shuffledHelpers = [...helpers].sort(() => Math.random() - 0.5);
      newShifts[dateKey][shuffledHelpers[0]] = 'helper_early';
      newShifts[dateKey][shuffledHelpers[1]] = 'helper_day';
      newShifts[dateKey][shuffledHelpers[2]] = 'helper_day';
      newShifts[dateKey][shuffledHelpers[3]] = 'helper_night';
    }
    
    setShifts(newShifts);
  };

  // 現在の月の日付配列を生成
  const monthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [currentDate]);

  // 特定の日のシフト情報を取得
  const getDayShifts = (day: number): Record<string, string> => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return shifts[dateKey] || {};
  };

  // スタッフの特定日のシフトを取得
  const getStaffShift = (staffName: string, day: number): string | null => {
    const dayShifts = getDayShifts(day);
    return dayShifts[staffName] || null;
  };

  // ドラッグ開始
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    staffName: string,
    day: number,
    shiftType: string
  ): void => {
    if (!isAdmin) return;
    setDraggedItem({ staffName, day, shiftType }); // ✅ OK!
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドロップ処理
    const handleDrop = (
      e: React.DragEvent<HTMLTableCellElement>,
      targetStaffName: string,
      targetDay: number
    ): void => {
      e.preventDefault();
    if (!isAdmin || !draggedItem) return;

    const { staffName: sourceStaff, day: sourceDay, shiftType } = draggedItem;
    
    // 新しいシフト配置を作成
    const newShifts = { ...shifts };
    const sourceDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${sourceDay}`;
    const targetDateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${targetDay}`;
    
    // 初期化
    if (!newShifts[sourceDateKey]) newShifts[sourceDateKey] = {};
    if (!newShifts[targetDateKey]) newShifts[targetDateKey] = {};
    
    // 元の場所からシフトを削除
    delete newShifts[sourceDateKey][sourceStaff];
    
    // 新しい場所にシフトを配置
    newShifts[targetDateKey][targetStaffName] = shiftType;
    
    setShifts(newShifts);
    setDraggedItem(null);
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>): void => {
    e.preventDefault();
  };

  // シフトを削除
  const removeShift = (staffName: string, day: number): void => {
    if (!isAdmin) return;
    
    const newShifts = { ...shifts };
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    
    if (newShifts[dateKey]) {
      delete newShifts[dateKey][staffName];
    }
    
    setShifts(newShifts);
  };

  // シフト追加
  const addShift = (staffName: string, day: number, shiftType: string): void => {
    if (!isAdmin) return;
    
    const newShifts = { ...shifts };
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    
    if (!newShifts[dateKey]) {
      newShifts[dateKey] = {};
    }
    
    newShifts[dateKey][staffName] = shiftType;
    setShifts(newShifts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-full mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">シフト管理システム</h1>
                <p className="text-gray-600">看護師・ヘルパーシフト確認・作成ツール</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isAdmin 
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isAdmin ? '管理者モード' : '閲覧モード'}
              </button>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setModalType('nurse');
                      setShowStaffModal(true);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    看護師追加
                  </button>
                  <button
                    onClick={() => {
                      setModalType('helper');
                      setShowStaffModal(true);
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    ヘルパー追加
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 月選択とコントロール */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </h2>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {isAdmin && (
            <div className="text-center">
              <button
                onClick={generateAutoShift}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all duration-300"
              >
                自動シフト生成
              </button>
            </div>
          )}
        </div>

        {/* シフト凡例 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            シフト時間
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(shiftTypes).map(([key, type]) => {
              const Icon = type.icon;
              return (
                <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 ${type.color} rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{type.name}</div>
                    <div className="text-gray-600 text-xs">{type.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* シフト表 */}
        <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-left font-semibold text-gray-800 sticky left-0 bg-gray-50 z-10 min-w-[120px]">
                  スタッフ
                </th>
                {monthDays.map(day => {
                  const dayOfWeek = getDayOfWeek(currentDate, day);
                  const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';
                  return (
                    <th key={day} className={`p-2 text-center min-w-[80px] ${isWeekend ? 'bg-red-50' : ''}`}>
                      <div className="text-lg font-bold text-gray-800">{day}</div>
                      <div className={`text-xs ${isWeekend ? 'text-red-600' : 'text-gray-600'}`}>
                        {dayOfWeek}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* 看護師セクション */}
              <tr>
                <td colSpan={monthDays.length + 1} className="p-3 bg-blue-50 font-semibold text-blue-800 border-b">
                  <div className="flex items-center justify-between">
                    <span>看護師 ({nurses.length}名)</span>
                  </div>
                </td>
              </tr>
              {nurses.map((nurse, index) => (
                <tr key={nurse} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4 font-medium text-gray-800 sticky left-0 bg-white z-10 border-r">
                    <div className="flex items-center justify-between">
                      <span>{nurse}</span>
                      {isAdmin && isCustomStaff(nurse, 'nurse') && (
                        <button
                          onClick={() => removeStaff(nurse, 'nurse')}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                          title="スタッフを削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  {monthDays.map(day => {
                    const shift = getStaffShift(nurse, day);
                    const shiftInfo =
                      shift && shift in shiftTypes
                        ? shiftTypes[shift as keyof typeof shiftTypes]
                        : null;

                    const dayOfWeek = getDayOfWeek(currentDate, day);
                    const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';
                    
                    return (
                      <td 
                        key={day}
                        className={`p-1 text-center relative ${isWeekend ? 'bg-red-25' : ''}`}
                        onDrop={(e) => handleDrop(e, nurse, day)}
                        onDragOver={handleDragOver}
                      >
                        {shift && shiftInfo ? (
                          <div
                            draggable={isAdmin}
                            onDragStart={(e) => handleDragStart(e, nurse, day, shift)}
                            onClick={() => isAdmin && removeShift(nurse, day)}
                            className={`${shiftInfo.color} ${shiftInfo.textColor} px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isAdmin ? 'cursor-move hover:shadow-lg' : ''
                            }`}
                          >
                            {shiftInfo.name}
                          </div>
                        ) : isAdmin ? (
                          <div className="group">
                            <button
                              onClick={() => {
                                // 簡単なシフト選択メニュー（実際は適切なシフトタイプを選択）
                                const nurseShifts = ['nurse_day', 'nurse_night'];
                                const selectedShift = nurseShifts[Math.floor(Math.random() * nurseShifts.length)];
                                addShift(nurse, day, selectedShift);
                              }}
                              className="w-full h-8 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-4 h-4 mx-auto text-gray-400" />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* ヘルパーセクション */}
              <tr>
                <td colSpan={monthDays.length + 1} className="p-3 bg-green-50 font-semibold text-green-800 border-b">
                  <div className="flex items-center justify-between">
                    <span>ヘルパー ({helpers.length}名)</span>
                  </div>
                </td>
              </tr>
              {helpers.map((helper, index) => (
                <tr key={helper} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="p-4 font-medium text-gray-800 sticky left-0 bg-white z-10 border-r">
                    <div className="flex items-center justify-between">
                      <span>{helper}</span>
                      {isAdmin && isCustomStaff(helper, 'helper') && (
                        <button
                          onClick={() => removeStaff(helper, 'helper')}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                          title="スタッフを削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  {monthDays.map(day => {
                    const shift = getStaffShift(helper, day);
                    const shiftInfo =
                      shift && shift in shiftTypes
                        ? shiftTypes[shift as keyof typeof shiftTypes]
                        : null;

                    const dayOfWeek = getDayOfWeek(currentDate, day);
                    const isWeekend = dayOfWeek === '土' || dayOfWeek === '日';
                    
                    return (
                      <td 
                        key={day}
                        className={`p-1 text-center relative ${isWeekend ? 'bg-red-25' : ''}`}
                        onDrop={(e) => handleDrop(e, helper, day)}
                        onDragOver={handleDragOver}
                      >
                        {shift && shiftInfo ? (
                          <div
                            draggable={isAdmin}
                            onDragStart={(e) => handleDragStart(e, helper, day, shift)}
                            onClick={() => isAdmin && removeShift(helper, day)}
                            className={`${shiftInfo.color} ${shiftInfo.textColor} px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${
                              isAdmin ? 'cursor-move hover:shadow-lg' : ''
                            }`}
                          >
                            {shiftInfo.name}
                          </div>
                        ) : isAdmin ? (
                          <div className="group">
                            <button
                              onClick={() => {
                                // 簡単なシフト選択メニュー（実際は適切なシフトタイプを選択）
                                const helperShifts = ['helper_early', 'helper_day', 'helper_night'];
                                const selectedShift = helperShifts[Math.floor(Math.random() * helperShifts.length)];
                                addShift(helper, day, selectedShift);
                              }}
                              className="w-full h-8 bg-gray-100 hover:bg-green-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            >
                              <Edit3 className="w-4 h-4 mx-auto text-gray-400" />
                            </button>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">操作方法</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• シフトをドラッグ&ドロップで移動できます</li>
              <li>• シフトをクリックで削除できます</li>
              <li>• 空欄の編集アイコンをクリックでシフトを追加できます</li>
              <li>• 「看護師追加」「ヘルパー追加」ボタンで新しいスタッフを追加できます</li>
              <li>• 追加したスタッフは名前横のゴミ箱アイコンで削除できます</li>
            </ul>
          </div>
        )}

        {/* スタッフ追加モーダル */}
        {showStaffModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalType === 'nurse' ? '看護師' : 'ヘルパー'}を追加
                </h3>
                <button
                  onClick={() => {
                    setShowStaffModal(false);
                    setNewStaffName('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  スタッフ名
                </label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="例: 山田 太郎"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addStaff();
                    }
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={addStaff}
                  disabled={!newStaffName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setShowStaffModal(false);
                    setNewStaffName('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagementTool;