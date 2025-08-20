'use client';
import React from 'react';

const backgroundImages = [
  '/image/岸和田リハ.jpg',
  '/image/宇治脳卒中リハ.png',
  '/image/川西リハ.jpg',
  '/image/阪神リハ.png',
  '/image/伊丹せいふう.png',
  '/image/大阪たつみ.jpg',
  '/image/奈良町りは.jpg',
  '/image/登美ヶ丘リハ.jpg',
  '/image/彩都リハ.jpg'
];

interface BackgroundImagesProps {
  className?: string;
}

const BackgroundImages: React.FC<BackgroundImagesProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* グリッドレイアウトで画像を均等配置 */}
      <div className="grid grid-cols-3 grid-rows-3 h-full w-full opacity-50 gap-4 p-4">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transform: `rotate(${Math.random() * 8 - 4}deg) scale(${1.0 + Math.random() * 0.1})`
            }}
          />
        ))}
      </div>
      
      {/* オーバーレイで背景を少し暗くする */}
      <div className="absolute inset-0 bg-white/45 dark:bg-neutral-950/45" />
    </div>
  );
};

export default BackgroundImages;
