'use client';
import React, { useState } from 'react';
import { Heart, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DepartmentSelection = () => {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOptionSelect = (department: string, option: string) => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      // ページ遷移
      if (department === '看護部' && option === 'シフト') {
        router.push('/schedule/ns');
      } else if (department === 'リハビリテーション部' && option === '予定表') {
        router.push('/schedule/riha');
      } else if (department === '地域連携部' && option === '作成中') {
        router.push('/test');
      } else if (department === '全部署' && option === 'AI Chat') {
        router.push('/AIchat');
      }
    }, 800);
  };

  const options = [
    { department: '全部署',           option: 'AI Chat', Icon: Activity },
    { department: '看護部',           option: 'シフト',   Icon: Heart },
    { department: 'リハビリテーション部', option: '予定表',   Icon: Activity },
    { department: '地域連携部',       option: '作成中',   Icon: Activity }, 
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 背景の演出はそのまま */}

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
         <div className="w-full max-w-4xl">
          <div
            className={`backdrop-blur-xl bg-gradient-to-br from-emerald-500/90 via-teal-600/90 to-cyan-700/90
              border border-emerald-200/50 rounded-3xl p-8 shadow-2xl transform transition-all duration-500
              ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
          >
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-full mb-4 backdrop-blur-sm border border-white/40">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">項目選択</h1>
              <p className="text-white/80">確認した項目を選択してください</p>
            </div>

            {/* オプション（1→2 列） */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
              {options.map(({ department, option, Icon }) => (
                <div key={`${department}-${option}`} className="bg-white/20 border border-white/30 backdrop-blur-sm rounded-2xl p-6">  {/* パディング増量 */}
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

            {/* リンクやローディング表示は元コードを踏襲 */}
          </div>

          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">© 2025 Koreha Maenaka ga tukutta. www.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
