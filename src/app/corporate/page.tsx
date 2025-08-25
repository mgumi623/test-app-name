'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from './components/Header';
import { VisionCard } from './components/VisionCard';
import { FeedbackCard } from './components/FeedbackCard';
import { CreatePostDialog } from './components/CreatePostDialog';
import { ReplyDialog } from './components/ReplyDialog';

// 型定義
interface Vision {
  id: number;
  title: string;
  content: string;
  type: 'short' | 'long';
  priority: 'high' | 'medium' | 'low';
  author: string;
  date: string;
  likes: number;
  views: number;
}

interface Reply {
  author: string;
  content: string;
  date: string;
}

interface FeedbackMessage {
  id: number;
  content: string;
  category: 'workplace' | 'training' | 'general';
  likes: number;
  replyCount: number;
  date: string;
  anonymous: boolean;
  author?: string;
  replies?: Reply[];
}

export default function CorporatePage() {
  const [userRole, setUserRole] = useState<'employee' | 'management'>('employee');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<FeedbackMessage | null>(null);
  const [postType, setPostType] = useState<'message' | 'vision'>('message');
  const [visions, setVisions] = useState<Vision[]>([
    {
      id: 1,
      title: 'デジタル変革への挑戦',
      content: '来年度までに全部署でDXを推進し、業務効率を30%向上させる目標です。',
      type: 'short',
      priority: 'high',
      author: '経営陣',
      date: '2024-08-05',
      likes: 12,
      views: 45,
    },
    {
      id: 2,
      title: '2030年ビジョン: 持続可能な成長',
      content: '環境に配慮した事業運営により、社会に貢献する企業として成長していきます。',
      type: 'long',
      priority: 'medium',
      author: 'CEO',
      date: '2024-08-03',
      likes: 28,
      views: 87,
    },
  ]);
  const [messages, setMessages] = useState<FeedbackMessage[]>([
    {
      id: 1,
      content: 'リモートワーク環境の改善をお願いしたいです。通信環境のサポートがあると助かります。',
      category: 'workplace',
      likes: 15,
      replyCount: 3,
      date: '2024-08-06',
      anonymous: true,
      replies: [
        {
          author: '経営陣',
          content: 'ご提案ありがとうございます。通信環境の改善について検討を始めました。具体的な案がまとまり次第、ご報告させていただきます。',
          date: '2024-08-07'
        }
      ]
    },
    {
      id: 2,
      content: '新人研修プログラムについて、もう少し実践的な内容を増やしていただけないでしょうか。',
      category: 'training',
      likes: 8,
      replyCount: 1,
      date: '2024-08-04',
      anonymous: true,
    },
  ]);

  const handleCreatePost = (type: 'message' | 'vision') => {
    setPostType(type);
    setShowPostDialog(true);
  };

  const handleSubmitPost = (data: {
    title?: string;
    content: string;
    type?: 'short' | 'long';
    priority?: 'high' | 'medium' | 'low';
  }) => {
    if (postType === 'vision') {
      const newVision: Vision = {
        id: visions.length + 1,
        title: data.title || '無題のビジョン',
        content: data.content,
        type: data.type || 'short',
        priority: data.priority || 'medium',
        author: userRole === 'management' ? '経営陣' : 'マネージャー',
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        views: 0,
      };
      setVisions([newVision, ...visions]);
    } else {
      const newMessage: FeedbackMessage = {
        id: messages.length + 1,
        content: data.content,
        category: 'general',
        likes: 0,
        replyCount: 0,
        replies: [],
        date: new Date().toISOString().split('T')[0],
        anonymous: true,
      };
      setMessages([newMessage, ...messages]);
    }
    setShowPostDialog(false);
  };

  const handleLikeVision = (id: number) => {
    setVisions(
      visions.map((vision) =>
        vision.id === id ? { ...vision, likes: vision.likes + 1 } : vision
      )
    );
  };

  const handleReply = (message: FeedbackMessage) => {
    setSelectedMessage(message);
    setShowReplyDialog(true);
  };

  const handleSubmitReply = (content: string) => {
    if (selectedMessage) {
      const newReply: Reply = {
        author: userRole === 'management' ? '経営陣' : '管理職',
        content,
        date: new Date().toISOString().split('T')[0],
      };

      setMessages(messages.map(message =>
        message.id === selectedMessage.id
          ? {
              ...message,
              replies: [...(message.replies || []), newReply]
            }
          : message
      ));
    }
  };

  const handleLikeMessage = (id: number) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, likes: message.likes + 1 } : message
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} onRoleChange={(role) => setUserRole(role as 'employee' | 'management')} />

      <main className="container py-8 px-4 bg-gradient-to-b from-green-50/50 to-transparent">
        <Tabs defaultValue="vision" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="vision" className="relative">
                ビジョン・方針
              </TabsTrigger>
              <TabsTrigger value="feedback" className="relative">
                従業員の声
              </TabsTrigger>
            </TabsList>

            <CreatePostDialog
              open={showPostDialog}
              onOpenChange={setShowPostDialog}
              type={postType}
              onSubmit={handleSubmitPost}
            />
          </div>

          <TabsContent value="vision" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-800">経営方針への提案</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-600">経営陣への提案や改善点を共有できます</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">部署間コラボレーション</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">他部署との協力案や連携のアイデアを投稿</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-teal-800">実績共有</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-teal-600">成功事例や良い取り組みを共有しましょう</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">ビジョン一覧</h2>
              <Button onClick={() => handleCreatePost('vision')}>
                <Plus className="w-4 h-4 mr-2" />
                投稿
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {visions.map((vision) => (
                <VisionCard
                  key={vision.id}
                  {...vision}
                  onLike={handleLikeVision}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-800">匿名フィードバック</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-emerald-600">安心して意見を共有できる匿名投稿機能</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">経営陣からの返信</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">経営陣が直接フィードバックにお答えします</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border-green-100">
                <CardHeader>
                  <CardTitle className="text-lg text-teal-800">アクション報告</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-teal-600">提案に基づいて実施された改善内容を確認</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">従業員の声</h2>
              <Button onClick={() => handleCreatePost('message')}>
                <Plus className="w-4 h-4 mr-2" />
                投稿
              </Button>
            </div>

            <div className="grid gap-6">
              {messages.map((message) => (
                <FeedbackCard
                  key={message.id}
                  {...message}
                  onLike={handleLikeMessage}
                  onReply={() => handleReply(message)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedMessage && (
          <ReplyDialog
            open={showReplyDialog}
            onOpenChange={setShowReplyDialog}
            onSubmit={handleSubmitReply}
            messageContent={selectedMessage.content}
          />
        )}
      </main>
    </div>
  );
}