'use client';
import React, { useState } from 'react';
import { Heart, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DepartmentSelection = () => {
  const router = useRouter(); // ✅ コンポーネントの中に移動
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOptionSelect = (department: string, option: string) => {
    if (isAnimating) return;

    setSelectedDepartment(`${department} - ${option}`);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);

      // ✅ ページ遷移のルーティング
      if (department === '看護部' && option === 'シフト') {
        router.push('/schedule/ns');
      } else if (department === 'リハビリテーション部' && option === '予定表') {
        router.push('/schedule/riha');
      } else if (department === '地域連携部' && option === '作成中') {
        router.push('/test');
      }
    }, 800);
  };

  const options = [
    { department: '看護部', option: 'シフト', Icon: Heart },
    { department: 'リハビリテーション部', option: '予定表', Icon: Activity },
    { department: '地域連携部', option: '作成中', Icon: Activity }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-100/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-100/35 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className={`backdrop-blur-xl bg-gradient-to-br from-emerald-500/90 via-teal-600/90 to-cyan-700/90 border border-emerald-200/50 rounded-3xl p-8 shadow-2xl transform transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-full mb-4 backdrop-blur-sm border border-white/40">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">項目選択</h1>
              <p className="text-white/80">確認した項目を選択してください</p>
            </div>

            {/* Option Buttons */}
            <div className="space-y-6 mb-6">
              {options.map(({ department, option, Icon }) => (
                <div key={department} className="bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-white text-lg font-semibold">{department}</h3>
                  </div>
                  <button
                    onClick={() => handleOptionSelect(department, option)}
                    className={`w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl ${
                      isAnimating ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={isAnimating}
                  >
                    {option}
                  </button>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="text-center space-y-3">
              <button className="text-white/80 hover:text-white text-sm font-medium">管理者の方はこちら</button>
              <button className="text-white/80 hover:text-white text-sm font-medium block">システムについて</button>
            </div>

            {/* Loading Indicator */}
            {isAnimating && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl backdrop-blur-sm">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">選択中...</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">© 2025 Koreha Maenaka ga tukutta. www.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
