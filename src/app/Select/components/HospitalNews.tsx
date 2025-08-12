import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Users, 
  FileText, 
  Star,
  Clock,
  Heart,
  Calendar
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'policy' | 'staff' | 'announcement' | 'achievement';
  date: string;
  priority: 'high' | 'medium' | 'low';
  author?: string;
  department?: string;
}

interface HospitalNewsProps {
  className?: string;
}

const newsData: NewsItem[] = [
  {
    id: '1',
    title: '2025年度 患者満足度向上プロジェクト開始',
    content: '患者様により良い医療サービスを提供するため、全部署協力による満足度向上プロジェクトを開始いたします。月次アンケートの実施と改善活動を推進してまいります。',
    category: 'policy',
    date: '2025-01-15',
    priority: 'high',
    author: '病院長',
    department: '院長室'
  },
  {
    id: '2',
    title: '看護部：夜勤体制の改善について',
    content: '看護師の労働環境改善のため、夜勤体制を見直しました。2月より新体制で運用開始し、スタッフの負担軽減と患者ケアの質向上を図ります。',
    category: 'staff',
    date: '2025-01-14',
    priority: 'medium',
    author: '看護部長',
    department: '看護部'
  },
  {
    id: '3',
    title: '新年度研修プログラムの募集開始',
    content: '医療技術向上と職員スキルアップのため、新年度研修プログラムの募集を開始します。各部署からの積極的な参加をお待ちしております。',
    category: 'announcement',
    date: '2025-01-13',
    priority: 'medium',
    author: '人事部',
    department: '人事部'
  },
  {
    id: '4',
    title: '地域医療連携表彰を受賞',
    content: '当院の地域医療連携の取り組みが評価され、県医師会より表彰を受けました。今後も地域の皆様に信頼される医療機関を目指してまいります。',
    category: 'achievement',
    date: '2025-01-12',
    priority: 'high',
    author: '広報室',
    department: '事務部'
  },
  {
    id: '5',
    title: 'リハビリ部：新機器導入のお知らせ',
    content: '患者様のリハビリ効果向上のため、最新のリハビリ機器を導入いたしました。より効果的な訓練プログラムの提供が可能になります。',
    category: 'announcement',
    date: '2025-01-11',
    priority: 'medium',
    author: 'リハビリ部長',
    department: 'リハビリテーション部'
  },
  {
    id: '6',
    title: 'スタッフ提案：業務効率化システム導入決定',
    content: '現場スタッフからの提案により、新しい業務効率化システムの導入が決定しました。皆様のご意見が病院運営の改善につながっています。',
    category: 'staff',
    date: '2025-01-10',
    priority: 'medium',
    author: 'IT推進委員会',
    department: '全部署'
  }
];

const getCategoryInfo = (category: NewsItem['category']) => {
  switch (category) {
    case 'policy':
      return { 
        label: '病院方針', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Megaphone
      };
    case 'staff':
      return { 
        label: 'スタッフ', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Users
      };
    case 'announcement':
      return { 
        label: 'お知らせ', 
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: FileText
      };
    case 'achievement':
      return { 
        label: '表彰・実績', 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Star
      };
    default:
      return { 
        label: 'その他', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: FileText
      };
  }
};

const getPriorityColor = (priority: NewsItem['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-blue-500';
    case 'low':
      return 'border-l-gray-300';
    default:
      return 'border-l-gray-300';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric'
  });
};

export default function HospitalNews({ className }: HospitalNewsProps) {
  return (
    <div className={`mt-8 space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">病院ニュース</h2>
        </div>
        <p className="text-muted-foreground">最新の病院方針、スタッフからの意見、お知らせをお届けします</p>
      </div>


      {/* ニュースリスト */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            最新ニュース
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsData.map((news) => {
              const categoryInfo = getCategoryInfo(news.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <div 
                  key={news.id} 
                  className={`p-4 border-l-4 ${getPriorityColor(news.priority)} bg-card rounded-r-lg hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(news.date)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {news.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {news.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {news.author && (
                        <span>投稿者: {news.author}</span>
                      )}
                      {news.department && (
                        <span className="ml-2">部署: {news.department}</span>
                      )}
                    </div>
                    {news.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        重要
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* フィードバック促進 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6 text-center">
          <Heart className="w-12 h-12 mx-auto text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            あなたの声を聞かせてください
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            病院運営や患者ケアの改善に向けたご意見・ご提案をお待ちしております
          </p>
          <div className="text-xs text-blue-600">
            意見投稿は「意見交流」ページから行えます
          </div>
        </CardContent>
      </Card>
    </div>
  );
}