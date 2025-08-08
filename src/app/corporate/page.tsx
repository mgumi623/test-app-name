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
}

const CorporateCommunicationApp: FC = () => {
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

  const openModal = (type: "message" | "vision") => {
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
        {/* ここから先は元のJSXを維持 */}
      </main>

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
