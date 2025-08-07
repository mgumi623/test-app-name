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
} from "lucide-react";

/** ------------------------------------------------------------------
 *  型定義
 * -----------------------------------------------------------------*/
interface Vision {
  id: number;
  title: string;
  content: string;
  type: "short" | "long";
  priority: "high" | "medium" | "low";
  author: string;
  date: string; // ISO-8601 (YYYY-MM-DD)
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
}

/** ------------------------------------------------------------------
 *  公開コンポーネント
 * -----------------------------------------------------------------*/
const CorporateCommunicationApp: FC = () => {
  /** --------------------------------
   *  state
   * -------------------------------*/
  const [activeTab, setActiveTab] = useState<"vision" | "feedback">("vision");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"message" | "vision">("message");
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [visions, setVisions] = useState<Vision[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newVision, setNewVision] = useState<
    Pick<Vision, "title" | "content" | "type" | "priority">
  >({
    title: "",
    content: "",
    type: "short",
    priority: "medium",
  });
  const [filter, setFilter] = useState<"all" | FeedbackMessage["category"]>("all");
  const [userRole, setUserRole] = useState<"employee" | "management">(
    "employee"
  );

  const modalRef = useRef<HTMLDivElement | null>(null);

  /** --------------------------------
   *  初期ダミーデータ
   * --------------------------------*/
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

  /** --------------------------------
   *  bodyスクロール制御
   * --------------------------------*/
  useEffect(() => {
    if (showModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  /** --------------------------------
   *  モーダル操作
   * --------------------------------*/
  const openModal = (type: "message" | "vision") => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewMessage("");
    setNewVision({ title: "", content: "", type: "short", priority: "medium" });
  };

  /** --------------------------------
   *  投稿ハンドラ
   * --------------------------------*/
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

  /** --------------------------------
   *  いいね! トグル  (functional updateで競合防止)
   * --------------------------------*/
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

  /** --------------------------------
   *  フィルタリング
   * --------------------------------*/
  const filteredMessages = messages.filter(
    (msg) => filter === "all" || msg.category === filter
  );

  /** ------------------------------------------------------------------
   *  Util
   * -----------------------------------------------------------------*/
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

  const getTypeLabel = (type: Vision["type"]) => (type === "short" ? "短期" : "長期");

  /** ------------------------------------------------------------------
   *  JSX
   * -----------------------------------------------------------------*/
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* ------------------------- ヘッダー ------------------------ */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare aria-hidden className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent select-none">
                Corporate Bridge
              </h1>
            </div>

            <div>
              <label className="sr-only" htmlFor="role-select">
                Role select
              </label>
              <select
                id="role-select"
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
        </div>
      </header>

      {/* ----------------------- メイン ------------------------ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ------- タブナビゲーション ------- */}
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

        {/* ------------- ビジョンタブ ------------- */}
        {activeTab === "vision" && (
          <section className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  会社のビジョン・方針
                </h2>
                <p className="text-gray-600 mt-2">
                  経営陣からの重要なメッセージをご確認ください
                </p>
              </div>

              {userRole === "management" && (
                <button
                  type="button"
                  onClick={() => openModal("vision")}
                  className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600/50"
                >
                  <Plus className="w-4 h-4" />
                  <span>新しいビジョン</span>
                </button>
              )}
            </header>

            <div className="grid gap-6 lg:grid-cols-2">
              {visions.map((vision, idx) => (
                <article
                  key={vision.id}
                  className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <header className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vision.type === "short"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {getTypeLabel(vision.type)}ビジョン
                      </span>
                      <span
                        aria-label="priority"
                        className={`w-2 h-2 rounded-full ${getPriorityColor(
                          vision.priority
                        )} bg-current`}
                      ></span>
                    </div>
                    <time className="text-xs text-gray-500" dateTime={vision.date}>
                      {vision.date}
                    </time>
                  </header>

                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {vision.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed whitespace-pre-line">
                    {vision.content}
                  </p>

                  <footer className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => toggleLike("vision", vision.id)}
                        aria-label="いいね"
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm select-none">{vision.likes}</span>
                      </button>
                      <span className="flex items-center space-x-1 text-gray-500 select-none">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{vision.views}</span>
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 select-none">by {vision.author}</span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ------------- 従業員の声タブ ------------- */}
        {activeTab === "feedback" && (
          <section className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">従業員の声</h2>
                <p className="text-gray-600 mt-2">匿名で安心してご意見をお聞かせください</p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="sr-only" htmlFor="feedback-filter">
                  カテゴリフィルター
                </label>
                <select
                  id="feedback-filter"
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value as typeof filter)
                  }
                  className="px-3 py-2 bg-white/50 backdrop-blur-md border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="all">すべて</option>
                  <option value="workplace">職場環境</option>
                  <option value="training">研修・教育</option>
                  <option value="general">その他</option>
                </select>

                <button
                  type="button"
                  onClick={() => openModal("message")}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600/50"
                >
                  <Plus className="w-4 h-4" />
                  <span>意見を投稿</span>
                </button>
              </div>
            </header>

            <div className="space-y-4">
              {filteredMessages.map((message, idx) => (
                <article
                  key={message.id}
                  className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-101 transition-all duration-300"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <header className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium select-none">
                      匿名投稿
                    </span>
                    <time className="text-xs text-gray-500" dateTime={message.date}>
                      {message.date}
                    </time>
                  </header>

                  <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>

                  <footer className="flex items-center space-x-6">
                    <button
                      type="button"
                      onClick={() => toggleLike("message", message.id)}
                      aria-label="いいね"
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200 focus:outline-none"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm select-none">{message.likes}</span>
                    </button>
                    <span className="flex items-center space-x-1 text-gray-500 select-none">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{message.replies} 件の返信</span>
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ----------------------- モーダル ---------------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div
            ref={modalRef}
            className="relative bg-white/80 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl transform transition-all sm:max-w-lg w-full mx-4 p-6 animate-modalSlideIn"
          >
            <header className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {modalType === "message" ? "新しい意見を投稿" : "新しいビジョンを投稿"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            {modalType === "message" ? (
              <div className="space-y-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="ご意見やご要望をお聞かせください..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitMessage}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600/50"
                  >
                    投稿する
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  value={newVision.title}
                  onChange={(e) =>
                    setNewVision({ ...newVision, title: e.target.value })
                  }
                  placeholder="ビジョンのタイトル"
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <textarea
                  value={newVision.content}
                  onChange={(e) =>
                    setNewVision({ ...newVision, content: e.target.value })
                  }
                  placeholder="ビジョンの詳細を記入してください..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <div className="flex space-x-4">
                  <select
                    value={newVision.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setNewVision({ ...newVision, type: e.target.value as "short" | "long" })
                    }
                    className="flex-1 px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="short">短期ビジョン</option>
                    <option value="long">長期ビジョン</option>
                  </select>
                  <select
                    value={newVision.priority}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      setNewVision({
                        ...newVision,
                        priority: e.target.value as Vision["priority"],
                      })
                    }
                    className="flex-1 px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="high">高優先度</option>
                    <option value="medium">中優先度</option>
                    <option value="low">低優先度</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors focus:outline-none"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitVision}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50"
                  >
                    投稿する
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------- スタイル ---------------------- */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s ease-out;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        .hover\\:scale-101:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
};

export default CorporateCommunicationApp;