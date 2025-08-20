'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ScrollingBackground: React.FC = () => {
  const images = [
    '/image/岸和田リハ.jpg',
    '/image/宇治脳卒中リハ.png',
    '/image/川西リハ.jpg',
    '/image/阪神リハ.png',
    '/image/伊丹せいふう.png',
    '/image/大阪たつみ.jpg',
    '/image/奈良町りは.jpg',
    '/image/登美ヶ丘リハ.jpg',
    '/image/彩都リハ.jpg',
  ];

  // 4枚と5枚に分割
  const firstRow = images.slice(0, 4); // 最初の4枚
  const secondRow = images.slice(4, 9); // 残りの5枚

  return (
         <div className="fixed inset-0 overflow-hidden z-0">
               {/* クローバー背景（最背面） */}
        <div className="absolute inset-0 z-[-10] flex items-center justify-center">
          <img
            src="/image/clover.svg"
            alt="Clover Background"
            className="w-[60%] h-auto object-contain opacity-70"
          />
        </div>
       
       {/* メインコンテンツエリア（全画面） */}
       <div className="h-full w-full">
                                                                                                                                               {/* S-BOTロゴとテキスト（中央上部） */}
            <div className="absolute top-[36%] left-1/2 transform -translate-x-1/2 z-20 text-center w-full">
           <div className="flex flex-col items-center justify-center">
             <img
               src="/logoimage/s-bot-logo.png"
               alt="S-BOT Logo"
               className="h-28 w-auto drop-shadow-lg mb-2"
             />
             <div className="drop-shadow-lg text-center">
               <div className="text-xl font-bold mb-1 text-black">生和会グループ 業務改善統合アプリケーション</div>
             </div>
           </div>
         </div>
        
                                   {/* ログインボタン（中央配置） */}
          <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
           <div className="relative group">
             {/* 背景のオーバーレイ */}
             <div className="absolute inset-0 bg-black/10 rounded-3xl backdrop-blur-sm"></div>
             
                           {/* メインボタン */}
              <Link href="/login">
                <Button 
                  size="lg"
                  className="login-button relative text-xl px-20 py-6 bg-white text-emerald-700 rounded-full hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center gap-4 border-2 border-emerald-600 backdrop-blur-md transform hover:scale-105 active:scale-95"
                >
                               <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                ログイン
                                 <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                 </svg>
               </Button>
             </Link>
           </div>
         </div>
      
        <div className="scrolling-images-container">
          {/* 1行目（4枚） - シームレスリピート */}
          <div className="scrolling-row first-row">
            {/* 最初のセット */}
            {firstRow.map((image, index) => (
              <div key={`first-${index}`} className="image-item">
                <img
                  src={image}
                  alt={`病院画像 ${index + 1}`}
                  className="scrolling-image"
                  loading="lazy"
                />
              </div>
            ))}
            {/* 複製セット（シームレス用） */}
            {firstRow.map((image, index) => (
              <div key={`first-duplicate-${index}`} className="image-item">
                <img
                  src={image}
                  alt={`病院画像 ${index + 1}`}
                  className="scrolling-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          
          {/* 2行目（5枚） - シームレスリピート */}
          <div className="scrolling-row second-row">
            {/* 最初のセット */}
            {secondRow.map((image, index) => (
              <div key={`second-${index}`} className="image-item">
                <img
                  src={image}
                  alt={`病院画像 ${index + 5}`}
                  className="scrolling-image"
                  loading="lazy"
                />
              </div>
            ))}
            {/* 複製セット（シームレス用） */}
            {secondRow.map((image, index) => (
              <div key={`second-duplicate-${index}`} className="image-item">
                <img
                  src={image}
                  alt={`病院画像 ${index + 5}`}
                  className="scrolling-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
                                                                                                                                                                                                                               <style jsx>{`
        /* ログインボタンの幅を大きくして万人受けのデザイン */
        .login-button {
          min-width: 380px !important;
          width: auto !important;
          font-weight: 600 !important;
        }
            .scrolling-images-container {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 80px 0 80px 0;
              overflow: hidden;
            }
        
                                     .scrolling-row {
             display: flex;
             width: max-content;
           }
           
           .scrolling-row:last-child {
             margin-bottom: 0;
           }
       
        .first-row {
          animation: scrollLeft 60s linear infinite;
        }
        
        .second-row {
          animation: scrollRight 60s linear infinite;
        }
       
        .image-item {
          flex-shrink: 0;
          margin-right: 30px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .image-item:last-child {
          margin-right: 0;
        }
        
        .image-item:hover {
          transform: scale(1.05);
        }
       
        .scrolling-image {
          width: 300px;
          height: 200px;
          object-fit: cover;
          display: block;
        }
       
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
       
        /* レスポンシブ対応 */
        @media (max-width: 1024px) {
          .scrolling-images-container {
            margin-left: 0;
          }
          
          .scrolling-image {
            width: 250px;
            height: 170px;
          }
          
          .image-item {
            margin-right: 25px;
          }
        }
        
        @media (max-width: 768px) {
          .scrolling-image {
            width: 200px;
            height: 140px;
          }
          
          .image-item {
            margin-right: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .scrolling-image {
            width: 150px;
            height: 100px;
          }
          
          .image-item {
            margin-right: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollingBackground;
