"use client";
import React, {
  useState,
  useRef,
  useEffect,
  FC,
  ChangeEvent,
} from "react";
import {
  MessageSquare,
  Eye,
  TrendingUp,
  Heart,
  MessageCircle,
  Plus,
  X,
  Send,
  Megaphone,
  Target,
  Users,
  Calendar,
  Lightbulb,
} from "lucide-react";

// 型定義
interface Vision {
  id: number;
  title: string;
  content: string;
  type: "short" | "long";
  priority: "high" | "medium" | "low";
  author: string;
  date: string;
  likes: number;
  views: number;
}

interface FeedbackMessage {
  id: number;
  content: string;
  category: "workplace" | "training" | "general";
  likes: number;
  replies: number;
  date: string;
  anonymous: boolean;
  author?: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "info" | "urgent" | "event";
  date: string;
  author: string;
  priority: "high" | "medium" | "low";
}

const CorporateCommunicationApp: FC = () => {
  const [activeTab, setActiveTab] = useState<"vision" | "feedback" | "announcements">("vision");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"message" | "vision" | "announcement">("message");
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [visions, setVisions] = useState<Vision[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newVision, setNewVision] = useState<
    Pick<Vision, "title" | "content" | "type" | "priority">
  >({
    title: "",
    content: "",
    type: "short",
    priority: "medium",
  });
  const [newAnnouncement, setNewAnnouncement] = useState<
    Pick<Announcement, "title" | "content" | "type" | "priority">
  >({
    title: "",
    content: "",
    type: "info",
    priority: "medium",
  });
  const [filter, setFilter] = useState<"all" | FeedbackMessage["category"]>("all");
  const [userRole, setUserRole] = useState<"employee" | "management">("employee");

  const modalRef = useRef<HTMLDivElement | null>(null);

  // 初期データ
  useEffect(() => {
    setVisions([
      {
        id: 1,
        title: "デジタル変革への挑戦",
        content:
          "来年度までに全部署でDXを推進し、業務効率を30%向上させる目標です。",
        type: "short",
        priority: "high",
        author: "経営陣",
        date: "2024-08-05",
        likes: 12,
        views: 45,
      },
      {
        id: 2,
        title: "2030年ビジョン: 持続可能な成長",
        content:
          "環境に配慮した事業運営により、社会に貢献する企業として成長していきます。",
        type: "long",
        priority: "medium",
        author: "CEO",
        date: "2024-08-03",
        likes: 28,
        views: 87,
      },
    ]);

    setMessages([
      {
        id: 1,
        content:
          "リモートワーク環境の改善をお願いしたいです。通信環境のサポートがあると助かります。",
        category: "workplace",
        likes: 15,
        replies: 3,
        date: "2024-08-06",
        anonymous: true,
      },
      {
        id: 2,
        content:
          "新人研修プログラムについて、もう少し実践的な内容を増やしていただけないでしょうか。",
        category: "training",
        likes: 8,
        replies: 1,
        date: "2024-08-04",
        anonymous: true,
      },
    ]);
  }, []);

  // スクロール制御
  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const openModal = (type: "message" | "vision" | "announcement") => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewMessage("");
    setNewVision({ title: "", content: "", type: "short", priority: "medium" });
  };

  const handleSubmitMessage = () => {
    if (!newMessage.trim()) return;
    const message: FeedbackMessage = {
      id: messages.length + 1,
      content: newMessage.trim(),
      category: "general",
      likes: 0,
      replies: 0,
      date: new Date().toISOString().split("T")[0],
      anonymous: true,
    };
    setMessages((prev) => [message, ...prev]);
    closeModal();
  };

  const handleSubmitVision = () => {
    if (!newVision.title.trim() || !newVision.content.trim()) return;
    const vision: Vision = {
      id: visions.length + 1,
      ...newVision,
      author: userRole === "management" ? "経営陣" : "マネージャー",
      date: new Date().toISOString().split("T")[0],
      likes: 0,
      views: 0,
    };
    setVisions((prev) => [vision, ...prev]);
    closeModal();
  };

  const handleSubmitAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    const announcement: Announcement = {
      id: announcements.length + 1,
      ...newAnnouncement,
      author: userRole === "management" ? "経営陣" : "部門長",
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements((prev) => [announcement, ...prev]);
    closeModal();
  };

  const toggleLike = (type: "vision" | "message", id: number) => {
    if (type === "vision") {
      setVisions((prev) =>
        prev.map((v) => (v.id === id ? { ...v, likes: v.likes + 1 } : v))
      );
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
      );
    }
  };

  const filteredMessages = messages.filter(
    (msg) => filter === "all" || msg.category === filter
  );

  const getPriorityColor = (priority: Vision["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeLabel = (type: Vision["type"]) =>
    type === "short" ? "短期" : "長期";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent select-none">
                Corporate Bridge
              </h1>
            </div>
            <select
              value={userRole}
              onChange={(e) =>
                setUserRole(e.target.value as "employee" | "management")
              }
              className="px-3 py-2 bg-white/50 backdrop-blur-md border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="employee">一般職</option>
              <option value="management">管理職</option>
            </select>
          </div>
        </div>
      </header>

      {/* タブ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/30 shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab("vision")}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                activeTab === "vision"
                  ? "bg-white shadow-md text-blue-600 transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>ビジョン・方針</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 ${
                activeTab === "feedback"
                  ? "bg-white shadow-md text-purple-600 transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>従業員の声</span>
              </span>
            </button>
          </div>
        </nav>
        {/* コンテンツ */}
{activeTab === "vision" && (
  <section className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">ビジョン一覧</h2>
      <button
        onClick={() => openModal("vision")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        <Plus className="w-4 h-4" /> 追加
      </button>
    </div>

    {visions.length === 0 ? (
      <p className="text-gray-500">まだ投稿がありません。</p>
    ) : (
      <ul className="grid md:grid-cols-2 gap-4">
        {visions.map(v => (
          <li key={v.id} className="p-4 bg-white rounded-xl shadow border border-white/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{v.title}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                {v.type === "short" ? "短期" : "長期"} / {v.priority}
              </span>
            </div>
            <p className="text-gray-700 mb-3">{v.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{v.author}・{v.date}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleLike("vision", v.id)} className="inline-flex items-center gap-1 hover:text-pink-600">
                  <Heart className="w-4 h-4" /> {v.likes}
                </button>
                <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" /> {v.views}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
)}

{activeTab === "feedback" && (
  <section className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-800">従業員の声</h2>
      <button
        onClick={() => openModal("message")}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
      >
        <Plus className="w-4 h-4" /> 投稿
      </button>
    </div>

    {filteredMessages.length === 0 ? (
      <p className="text-gray-500">まだ投稿がありません。</p>
    ) : (
      <ul className="space-y-3">
        {filteredMessages.map(m => (
          <li key={m.id} className="p-4 bg-white rounded-xl shadow border border-white/60">
            <p className="text-gray-800 mb-3">{m.content}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{m.date}・{m.anonymous ? "匿名" : (m.author || "社員")}</span>
              <button onClick={() => toggleLike("message", m.id)} className="inline-flex items-center gap-1 hover:text-pink-600">
                <Heart className="w-4 h-4" /> {m.likes}
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
)}

      </main>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === "message" ? "意見を投稿" :
                   modalType === "vision" ? "目標・ビジョンを投稿" : "お知らせを投稿"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalType === "message" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      rows={4}
                      placeholder="あなたの意見やフィードバックを入力してください..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmitMessage}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                      <span>投稿する</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {modalType === "vision" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={newVision.title}
                      onChange={(e) => setNewVision(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="目標・ビジョンのタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容
                    </label>
                    <textarea
                      value={newVision.content}
                      onChange={(e) => setNewVision(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      rows={4}
                      placeholder="目標の詳細や方針を入力してください..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        期間
                      </label>
                      <select
                        value={newVision.type}
                        onChange={(e) => setNewVision(prev => ({ ...prev, type: e.target.value as Vision["type"] }))}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="short">短期</option>
                        <option value="long">長期</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        優先度
                      </label>
                      <select
                        value={newVision.priority}
                        onChange={(e) => setNewVision(prev => ({ ...prev, priority: e.target.value as Vision["priority"] }))}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmitVision}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                      <span>投稿する</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {modalType === "announcement" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      placeholder="お知らせのタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      内容
                    </label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                      rows={4}
                      placeholder="お知らせの内容を入力してください..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        種類
                      </label>
                      <select
                        value={newAnnouncement.type}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as Announcement["type"] }))}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      >
                        <option value="info">お知らせ</option>
                        <option value="urgent">緊急</option>
                        <option value="event">イベント</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        重要度
                      </label>
                      <select
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value as Announcement["priority"] }))}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      >
                        <option value="low">参考</option>
                        <option value="medium">通常</option>
                        <option value="high">重要</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmitAnnouncement}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                      <Send className="w-4 h-4" />
                      <span>投稿する</span>
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        .animate-fade-in { animation: fade-in 0.5s ease-out }
      `}</style>
    </div>
  );
};

export default CorporateCommunicationApp;
