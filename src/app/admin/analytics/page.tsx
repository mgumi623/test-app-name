'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loading } from '@/components/ui/loading';

// シンプルなチャート代替コンポーネント
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SimpleChart = ({ data, type }: { data: any[]; type: string }) => (
  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
    <div className="text-center">
      <div className="text-4xl mb-2">📊</div>
      <p className="text-gray-600">Chart ({type})</p>
      <p className="text-sm text-gray-500">{data?.length || 0} data points</p>
    </div>
  </div>
);
import { Users, MessageCircle, AlertTriangle, TrendingUp, Eye, Clock, Smartphone, Shield, Activity, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { analyticsService } from '../../../lib/analyticsService';

interface AnalyticsData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessions: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[];
}

interface DashboardStats {
  totalSessions: number;
  totalPageViews: number;
  totalChatMessages: number;
  totalErrors: number;
  avgSessionDuration: number;
  topPages: { path: string; views: number }[];
  topPagesByPermission: { path: string; permission: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  dailyActivity: { date: string; sessions: number; pageViews: number }[];
  errorTypes: { type: string; count: number }[];
  permissionBreakdown: { permission: string; count: number }[];
  permissionFeatureUsage: { permission: string; feature: string; count: number }[];
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const calculateStats = useCallback((data: AnalyticsData): DashboardStats => {
    const now = new Date();
    const timeRangeMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    const cutoffTime = new Date(now.getTime() - timeRangeMs[timeRange]);

    // Filter data by time range
    const recentSessions = data.sessions.filter(s => 
      new Date(s.start_time) >= cutoffTime
    );
    const recentEvents = data.events.filter(e => 
      new Date(e.timestamp) >= cutoffTime
    );
    const recentErrors = data.errors.filter(e => 
      new Date(e.timestamp) >= cutoffTime
    );

    // Calculate basic stats
    const totalSessions = recentSessions.length;
    const totalPageViews = recentEvents.filter(e => e.event_type === 'page_view').length;
    const totalChatMessages = recentEvents.filter(e => e.event_type === 'chat_message').length;
    const totalErrors = recentErrors.length;

    // Average session duration
    const sessionsWithDuration = recentSessions.filter(s => s.duration_seconds);
    const avgSessionDuration = sessionsWithDuration.length > 0
      ? Math.round(sessionsWithDuration.reduce((acc, s) => acc + s.duration_seconds, 0) / sessionsWithDuration.length)
      : 0;

    // Top pages
    const pageViewCounts = recentEvents
      .filter(e => e.event_type === 'page_view' && e.page_path)
      .reduce((acc, e) => {
        acc[e.page_path] = (acc[e.page_path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPages = Object.entries(pageViewCounts)
      .map(([path, views]) => ({ path, views: Number(views) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top pages by permission
    const pagePermissionCounts = recentEvents
      .filter(e => e.event_type === 'page_view' && e.page_path && e.user_permission)
      .reduce((acc, e) => {
        const key = `${e.page_path}|||${e.user_permission}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPagesByPermission = Object.entries(pagePermissionCounts)
      .map(([key, views]) => {
        const [path, permission] = key.split('|||');
        return { path: path || '', permission: permission || '', views: Number(views) };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Device breakdown
    const deviceCounts = recentSessions.reduce((acc, s) => {
      const device = s.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceBreakdown = Object.entries(deviceCounts)
      .map(([device, count]) => ({ device, count: Number(count) }));

    // Daily activity
    const dailyActivity: { date: string; sessions: number; pageViews: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = recentSessions.filter(s => {
        if (!s.start_time) return false;
        try {
          return new Date(s.start_time).toISOString().split('T')[0] === dateStr;
        } catch {
          return false;
        }
      }).length;
      
      const dayPageViews = recentEvents.filter(e => {
        if (e.event_type !== 'page_view' || !e.timestamp) return false;
        try {
          return new Date(e.timestamp).toISOString().split('T')[0] === dateStr;
        } catch {
          return false;
        }
      }).length;

      dailyActivity.push({
        date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        sessions: daySessions,
        pageViews: dayPageViews,
      });
    }

    // Error types
    const errorTypeCounts = recentErrors.reduce((acc, e) => {
      const errorType = e.error_type || 'unknown';
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorTypes = Object.entries(errorTypeCounts)
      .map(([type, count]) => ({ type, count: Number(count) }))
      .sort((a, b) => b.count - a.count);

    // Permission breakdown
    const permissionCounts = recentSessions.reduce((acc, s) => {
      const permission = s.user_permission || 'unknown';
      acc[permission] = (acc[permission] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const permissionBreakdown = Object.entries(permissionCounts)
      .map(([permission, count]) => ({ permission, count: Number(count) }));

    // Permission-based feature usage
    const permissionFeatureUsage = recentEvents
      .filter(e => e.event_type === 'feature_use' || e.event_type === 'page_view')
      .reduce((acc, e) => {
        const permission = e.user_permission || 'unknown';
        const feature = e.event_type === 'page_view' 
          ? (e.page_path || 'unknown')
          : (e.event_data?.feature_name || 'unknown');
        
          
        const existing = acc.find((item: { permission: string; feature: string; count: number }) => 
          item.permission === permission && item.feature === feature
        );
        if (existing) {
          existing.count++;
        } else {
          acc.push({ permission, feature: String(feature), count: 1 });
        }
        return acc;
      }, [] as { permission: string; feature: string; count: number }[])
      .sort((a: { permission: string; feature: string; count: number }, b: { permission: string; feature: string; count: number }) => b.count - a.count);

    return {
      totalSessions,
      totalPageViews,
      totalChatMessages,
      totalErrors,
      avgSessionDuration,
      topPages,
      topPagesByPermission,
      deviceBreakdown,
      dailyActivity,
      errorTypes,
      permissionBreakdown,
      permissionFeatureUsage,
    };
  }, [timeRange]);

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const analyticsData = await analyticsService.getAnalyticsSummary();
      setStats(calculateStats(analyticsData));
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <Loading size="md" className="mx-auto mb-4" />
          <p className="text-gray-600">分析データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">分析ダッシュボード</h1>
                <p className="text-sm text-gray-600">サイト利用状況とパフォーマンス分析</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === '24h' ? '24時間' : range === '7d' ? '7日間' : '30日間'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">総セッション数</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSessions.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">総ページビュー</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPageViews.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">チャットメッセージ</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalChatMessages.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">エラー数</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalErrors.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">日別アクティビティ</h3>
            <SimpleChart data={stats?.dailyActivity || []} type="line" />
          </Card>

          {/* Device Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">デバイス別利用状況</h3>
            <SimpleChart data={stats?.deviceBreakdown || []} type="pie" />
          </Card>
        </div>

        {/* Permission Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permission Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">役職別利用状況</h3>
            <SimpleChart data={stats?.permissionBreakdown || []} type="pie" />
          </Card>

          {/* Permission Feature Usage */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">役職別機能使用状況</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats?.permissionFeatureUsage.slice(0, 10).map((usage) => (
                <div key={`${usage.permission}-${usage.feature}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700">{usage.permission}</span>
                    </div>
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 text-sm">{usage.feature}</span>
                  </div>
                  <span className="text-sm text-purple-600">{usage.count} 回</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Page Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">人気ページ</h3>
            <div className="space-y-3">
              {stats?.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{page.path}</span>
                  </div>
                  <span className="text-sm text-gray-600">{page.views} views</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Pages by Permission */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">職種別ページアクセス</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats?.topPagesByPermission.map((item) => (
                <div key={`${item.path}-${item.permission}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">{item.permission}</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900 text-sm">{item.path}</span>
                  </div>
                  <span className="text-sm text-green-600">{item.views} views</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Error Types */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">エラータイプ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats?.errorTypes.slice(0, 6).map((error) => (
              <div key={error.type} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-gray-900 text-sm">{error.type}</span>
                </div>
                <span className="text-sm text-red-600">{error.count} 件</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">追加統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{Math.floor((stats?.avgSessionDuration || 0) / 60)}分</p>
              <p className="text-sm text-gray-600">平均セッション時間</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalPageViews && stats?.totalSessions 
                  ? (stats.totalPageViews / stats.totalSessions).toFixed(1)
                  : '0'}
              </p>
              <p className="text-sm text-gray-600">セッションあたりページビュー</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {stats?.deviceBreakdown.find(d => d.device === 'mobile')?.count || 0}
              </p>
              <p className="text-sm text-gray-600">モバイルセッション</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}