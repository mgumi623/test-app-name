'use client';

import React, { useState, useEffect } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DebugInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [envInfo, setEnvInfo] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // サーバーサイドの環境変数は直接確認できないため、
    // APIエンドポイントで確認する
    const checkServerEnv = async () => {
      try {
        const response = await fetch('/api/dify-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'test', mode: '通常' })
        });
        
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.debug?.availableKeys) {
            setEnvInfo((prev: Record<string, unknown>) => ({
              ...prev,
              DIFY_API_KEY_NORMAL: errorData.debug.availableKeys.normal ? 'EXISTS' : 'MISSING',
              DIFY_API_KEY_CEREBROVASCULAR: errorData.debug.availableKeys.cerebrovascular ? 'EXISTS' : 'MISSING',
              DIFY_API_KEY_INFECTION: errorData.debug.availableKeys.infection ? 'EXISTS' : 'MISSING',
              DIFY_API_KEY_MINUTES: errorData.debug.availableKeys.minutes ? 'EXISTS' : 'MISSING',
              DIFY_API_KEY_LITERATURE: errorData.debug.availableKeys.literature ? 'EXISTS' : 'MISSING',
            }));
          }
        }
      } catch (error) {
        console.log('Could not check server env:', error);
      }
    };
    
    setEnvInfo({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING',
      DIFY_API_KEY_NORMAL: 'CHECKING...',
      DIFY_API_KEY_CEREBROVASCULAR: 'CHECKING...',
      DIFY_API_KEY_INFECTION: 'CHECKING...',
      DIFY_API_KEY_MINUTES: 'CHECKING...',
      DIFY_API_KEY_LITERATURE: 'CHECKING...',
      NODE_ENV: process.env.NODE_ENV,
      isMobile: isMobile ? 'YES' : 'NO',
      userAgent: navigator.userAgent.slice(0, 50) + '...',
      connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
      timestamp: new Date().toISOString(),
    });
    
    checkServerEnv();
  }, []);

  // プロダクションでも表示（デバッグ用）
  // if (process.env.NODE_ENV === 'production') {
  //   return null;
  // }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug
        {isOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </Button>

      {isOpen && (
        <div className="bg-card border border-border rounded-lg p-4 max-w-md text-xs font-mono">
          <h3 className="font-bold mb-2 text-foreground">Environment Variables</h3>
          <div className="space-y-1">
            {Object.entries(envInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="text-foreground ml-2 break-all">
                  {key.includes('KEY') ? 
                    (value === 'EXISTS' ? '✓ EXISTS' : '❌ MISSING') : 
                    String(value)
                  }
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-2 border-t border-border">
            <button
              onClick={() => {
                console.log('=== DETAILED DEBUG INFO ===');
                console.log('Environment variables:');
                Object.entries(envInfo).forEach(([key, value]) => {
                  console.log(`  ${key}:`, value);
                });
                console.log('Process.env keys:', Object.keys(process.env));
                console.log('All NEXT_PUBLIC env vars:');
                Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')).forEach(key => {
                  console.log(`  ${key}:`, process.env[key]);
                });
                console.log('Window location:', window.location.href);
                console.log('User agent:', navigator.userAgent);
                console.log('=== END DETAILED DEBUG INFO ===');
              }}
              className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;