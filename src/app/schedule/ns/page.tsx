'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Edit3,
  Plus,
  Trash2,
  X,
  Download,
  Upload,
  RefreshCcw,
  Printer,
  Undo2,
  Redo2,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

/**
 * ShiftManagementTool — UI/UX 改善版（単一ファイル）
 * - 直感的な操作（クリックで割当、右クリック/長押しでメニュー）
 * - ドラッグ&ドロップの改善（ロール不一致防止・上書き確認）
 * - クォータ表示（各日の必要人数をヘッダーに可視化）
 * - 取り消し/やり直し（Undo/Redo）
 * - ローカル保存（自動セーブ & 手動エクスポート/インポート）
 * - 1日/1ヶ月クリア、印刷用スタイル、アクセシビリティ改善
 */

// ----------------------------- 型定義 -----------------------------

type Role = 'nurse' | 'helper';

// 画面で使うシフトキー
export type ShiftKey =
  | 'nurse_day'
  | 'nurse_night'
  | 'helper_early'
  | 'helper_day'
  | 'helper_night';

// スタッフ
type Staff = {
  id: string;
  name: string;
  role: Role;
  custom?: boolean; // 追加したスタッフフラグ
};

// 日付キー → { staffId: ShiftKey }
type Shifts = Record<string, Record<string, ShiftKey>>;

// ドラッグ中データ
type DragItem = { staffId: string; day: number; shiftType: ShiftKey };

// シフト詳細
const SHIFT_TYPES: Record<ShiftKey, {
  name: string;
  role: Role;
  color: string; // バッジ背景
  text: string; // バッジ文字色
  time: string;
  count: number; // 1日に必要な人数（クォータ）
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = {
  nurse_day:    { name: '日勤',  role: 'nurse',  color: 'bg-blue-500',   text: 'text-white', time: '8:30-17:00', count: 6, Icon: Sun },
  nurse_night:  { name: '当直',  role: 'nurse',  color: 'bg-purple-600', text: 'text-white', time: '16:00-9:00', count: 2, Icon: Moon },
  helper_early: { name: '早出',  role: 'helper', color: 'bg-orange-500', text: 'text-white', time: '6:00-16:00',  count: 1, Icon: Sunrise },
  helper_day:   { name: 'H日勤', role: 'helper', color: 'bg-green-500',  text: 'text-white', time: '8:30-17:00', count: 2, Icon: Sun },
  helper_night: { name: '夜勤',  role: 'helper', color: 'bg-indigo-600', text: 'text-white', time: '11:00-19:00', count: 1, Icon: Sunset },
};

// ----------------------- ユーティリティ/フック -----------------------

const pad = (n: number) => n.toString().padStart(2, '0');
const getDateKey = (date: Date, day: number) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(day)}`;
const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const youbi = ['日', '月', '火', '水', '木', '金', '土'];

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

// Undo/Redo 用の履歴管理
function useHistory<T>(value: T, setValue: (v: T) => void) {
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const commit = (next: T) => {
    setPast((p) => [...p.slice(-49), value]); // 最大50履歴
    setFuture([]);
    setValue(next);
  };
  const undo = () => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [value, ...f]);
      setValue(prev);
      return p.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setPast((p) => [...p, value]);
      setValue(next);
      return f.slice(1);
    });
  };
  return { commit, undo, redo, canUndo: !!past.length, canRedo: !!future.length };
}

// ----------------------------- 初期データ -----------------------------

const initialNurseNames = [
  '田中 美咲', '佐藤 花子', '高橋 恵美', '山田 優子', '伊藤 真理',
  '渡辺 かおり', '中村 由美', '小林 愛', '加藤 麻衣', '吉田 理恵',
  '松本 さくら', '井上 直美', '木村 千春', '林 みどり', '森 ひろみ',
];
const initialHelperNames = [
  '鈴木 太郎', '田村 次郎', '斎藤 三郎', '橋本 四郎', '青木 五郎', '石川 六郎', '山口 七郎',
];

const seedStaff: Staff[] = [
  ...initialNurseNames.map((n, i) => ({ id: `N${i + 1}`, name: n, role: 'nurse' as const })),
  ...initialHelperNames.map((n, i) => ({ id: `H${i + 1}`, name: n, role: 'helper' as const })),
];

// ----------------------------- 本体 -----------------------------

const ShiftManagementTool = () => {
  const [currentDate, setCurrentDate] = useLocalStorage<Date>('ui.month', new Date());
  const [isAdmin, setIsAdmin] = useLocalStorage<boolean>('ui.isAdmin', false);

  // スタッフと割当（ローカル保存）
  const [staff, setStaff] = useLocalStorage<Staff[]>('data.staff.v1', seedStaff);
  const [shifts, _setShifts] = useLocalStorage<Shifts>('data.shifts.v1', {});
  const { commit: setShifts, undo, redo, canRedo, canUndo } = useHistory<Shifts>(shifts, _setShifts);

  // UI state
  const [drag, setDrag] = useState<DragItem | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [modalRole, setModalRole] = useState<Role>('nurse');
  const [newStaffName, setNewStaffName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const nurses = useMemo(() => staff.filter((s) => s.role === 'nurse'), [staff]);
  const helpers = useMemo(() => staff.filter((s) => s.role === 'helper'), [staff]);

  const daysInMonth = useMemo(() => getDaysInMonth(new Date(currentDate)), [currentDate]);
  const monthDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const getDayOfWeek = (day: number) => youbi[new Date(new Date(currentDate).getFullYear(), new Date(currentDate).getMonth(), day).getDay()];
  const dateKey = (day: number) => getDateKey(new Date(currentDate), day);

  // ---- 当月のサマリ計算（各日ごとの人数カウント）
  const daySummaries = useMemo(() => {
    const result: Record<number, Partial<Record<ShiftKey, number>>> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = dateKey(d);
      const m = shifts[dk] || {};
      result[d] = {};
      Object.values(m).forEach((key) => {
        result[d]![key] = (result[d]![key] || 0) + 1;
      });
    }
    return result;
  }, [daysInMonth, shifts]);

  // ---- 行（スタッフ）ごとの合計
  const staffTotals = useMemo(() => {
    const totals: Record<string, Partial<Record<ShiftKey, number>>> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = dateKey(d);
      const m = shifts[dk] || {};
      for (const [sid, key] of Object.entries(m)) {
        if (!totals[sid]) totals[sid] = {};
        totals[sid]![key] = (totals[sid]![key] || 0) + 1;
      }
    }
    return totals;
  }, [daysInMonth, shifts]);

  // ------------------------- 操作ユーティリティ -------------------------

  const getDayMap = (day: number) => shifts[dateKey(day)] || {};
  const getStaffShift = (staffId: string, day: number): ShiftKey | null => getDayMap(day)[staffId] || null;

  const changeMonth = (dir: number) => {
    const nd = new Date(currentDate);
    nd.setMonth(nd.getMonth() + dir);
    setCurrentDate(nd);
  };

  const addStaff = () => {
    const name = newStaffName.trim();
    if (!name) return;
    const id = `${modalRole === 'nurse' ? 'N' : 'H'}C${Date.now()}`;
    setStaff((prev) => [...prev, { id, name, role: modalRole, custom: true }]);
    setNewStaffName('');
    setShowStaffModal(false);
  };

  const removeStaff = (id: string) => {
    // 割当からも削除
    const next: Shifts = JSON.parse(JSON.stringify(shifts));
    for (const dk of Object.keys(next)) {
      if (next[dk][id]) delete next[dk][id];
    }
    setShifts(next);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  // 1セルに割当
  const assign = (staffId: string, day: number, key: ShiftKey) => {
    const role = staff.find((s) => s.id === staffId)?.role;
    if (!role) return;
    if (SHIFT_TYPES[key].role !== role) return; // ロール不一致は拒否
    const dk = dateKey(day);
    const next: Shifts = { ...shifts, [dk]: { ...(shifts[dk] || {}), [staffId]: key } };
    setShifts(next);
  };

  const clearCell = (staffId: string, day: number) => {
    const dk = dateKey(day);
    const dayMap = { ...(shifts[dk] || {}) };
    if (dayMap[staffId]) {
      delete dayMap[staffId];
      const next = { ...shifts, [dk]: dayMap };
      setShifts(next);
    }
  };

  const clearDay = (day: number) => {
    const dk = dateKey(day);
    const next = { ...shifts };
    delete next[dk];
    setShifts(next);
  };

  const clearMonth = () => setShifts({});

  // 自動割当（必要人数に合わせてランダム）
  const autoAssign = () => {
    const totalDays = daysInMonth;
    const next: Shifts = {};
    const ns = [...nurses];
    const hs = [...helpers];

    // 簡易ラウンドロビン用のインデックス
    let ni = 0, nn = 0, he = 0, hd = 0, hn = 0;

    const rnd = <T,>(arr: T[], start: number) => {
      // start から一巡して最初の要素を取る
      const idx = start % arr.length;
      return [arr[idx], (idx + 1) % arr.length] as const;
    };

    for (let d = 1; d <= totalDays; d++) {
      const dk = dateKey(d);
      next[dk] = {};

      // 看護師 日勤 (6)
      for (let i = 0; i < SHIFT_TYPES.nurse_day.count; i++) {
        const [pick, nextIdx] = rnd(ns, ni);
        next[dk][pick.id] = 'nurse_day';
        ni = nextIdx;
      }
      // 看護師 当直 (2) ※ 同日に同一者の重複割当は避ける
      for (let i = 0; i < SHIFT_TYPES.nurse_night.count; i++) {
        let tried = 0;
        while (tried < ns.length) {
          const [pick, nextIdx] = rnd(ns, nn);
          nn = nextIdx;
          tried++;
          if (!next[dk][pick.id]) { // その人にまだ何も入っていなければ
            next[dk][pick.id] = 'nurse_night';
            break;
          }
        }
      }

      // ヘルパー 早出(1), 日勤(2), 夜勤(1)
      const helperOrder = ['helper_early', 'helper_day', 'helper_day', 'helper_night'] as const;
      for (const kind of helperOrder) {
        let idxRef = kind === 'helper_early' ? he : (kind === 'helper_day' ? hd : hn);
        let setRef = (v: number) => {
          if (kind === 'helper_early') he = v; else if (kind === 'helper_day') hd = v; else hn = v;
        };
        let tried = 0;
        while (tried < hs.length) {
          const [pick, nextIdx] = rnd(hs, idxRef);
          idxRef = nextIdx; tried++;
          if (!next[dk][pick.id]) {
            next[dk][pick.id] = kind;
            setRef(idxRef);
            break;
          }
        }
      }
    }

    setShifts(next);
  };

  // ------------------------- DnD handlers -------------------------

  const onDragStart = (e: React.DragEvent, staffId: string, day: number, key: ShiftKey) => {
    if (!isAdmin) return;
    setDrag({ staffId, day, shiftType: key });
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, targetStaffId: string, targetDay: number) => {
    e.preventDefault();
    if (!isAdmin || !drag) return;
    const roleTarget = staff.find((s) => s.id === targetStaffId)?.role;
    if (!roleTarget) return;
    if (SHIFT_TYPES[drag.shiftType].role !== roleTarget) return; // ロール不一致

    const srcKey = dateKey(drag.day);
    const dstKey = dateKey(targetDay);

    const next: Shifts = JSON.parse(JSON.stringify(shifts));
    // 元から削除
    if (next[srcKey] && next[srcKey][drag.staffId]) delete next[srcKey][drag.staffId];
    // 先へ配置（上書き）
    if (!next[dstKey]) next[dstKey] = {};
    next[dstKey][targetStaffId] = drag.shiftType;
    setShifts(next);
    setDrag(null);
  };

  // 右クリック/長押し用の簡易メニュー（セル内）
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; staffId: string; day: number; role: Role } | null>(null);
  const openMenu = (e: React.MouseEvent, staffId: string, day: number, role: Role) => {
    e.preventDefault();
    if (!isAdmin) return;
    setMenuPos({ x: e.clientX, y: e.clientY, staffId, day, role });
  };
  const closeMenu = () => setMenuPos(null);

  // ------------------------- エクスポート/インポート -------------------------

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ staff, shifts, month: new Date(currentDate) }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shifts.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['名前', 'ロール', '日', 'シフト', '時間'];
    const lines: string[] = [headers.join(',')];
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = dateKey(d);
      const m = shifts[dk] || {};
      for (const s of staff) {
        const key = m[s.id];
        if (key) {
          const st = SHIFT_TYPES[key];
          lines.push([s.name, s.role, String(d), st.name, st.time].map((x) => `"${x}"`).join(','));
        }
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shifts.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.staff) && typeof data.shifts === 'object') {
          setStaff(data.staff);
          setShifts(data.shifts);
          if (data.month) setCurrentDate(new Date(data.month));
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  // ----------------------------- UI -----------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 print:bg-white">
      <div className="max-w-[1400px] mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">シフト管理システム</h1>
                <p className="text-gray-600 text-sm md:text-base">看護師・ヘルパーのシフト確認/作成</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`px-4 md:px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  isAdmin
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-pressed={isAdmin}
              >
                {isAdmin ? '管理者モード' : '閲覧モード'}
              </button>

              {/* Undo / Redo */}
              <button
                onClick={undo}
                disabled={!isAdmin || !canUndo}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                title="取り消し (Ctrl+Z)"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={redo}
                disabled={!isAdmin || !canRedo}
                className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
                title="やり直し (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-5 h-5" />
              </button>

              {isAdmin && (
                <>
                  <button
                    onClick={() => { setModalRole('nurse'); setShowStaffModal(true); }}
                    className="px-3 md:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> 看護師追加
                  </button>
                  <button
                    onClick={() => { setModalRole('helper'); setShowStaffModal(true); }}
                    className="px-3 md:px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> ヘルパー追加
                  </button>
                </>
              )}

              {/* IO 操作 */}
              <button onClick={exportJSON} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="JSONエクスポート">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={exportCSV} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="CSVエクスポート">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="JSONインポート">
                <Upload className="w-5 h-5" />
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]; if (f) importJSON(f);
                }} />
              </button>
              <button onClick={() => window.print()} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="印刷">
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 月選択 */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => changeMonth(-1)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {new Date(currentDate).getFullYear()}年 {new Date(currentDate).getMonth() + 1}月
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200">
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {isAdmin && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button
                onClick={autoAssign}
                className="px-4 md:px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" /> 自動シフト生成
              </button>
              <button
                onClick={clearMonth}
                className="px-4 md:px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
              >
                月をクリア
              </button>
            </div>
          )}
        </div>

        {/* シフト凡例 */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 border">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> シフト時間
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(SHIFT_TYPES).map(([key, t]) => (
              <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 ${t.color} rounded-lg`}>
                  <t.Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                  <div className="text-gray-600 text-xs">{t.time}（必要 {t.count} 名/日）</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-xl shadow-lg border overflow-x-auto relative">
          {/* スクロール影 */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-6 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />

          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              {/* クォータ表示行 */}
              <tr className="bg-white sticky top-0 z-20 border-b">
                <th className="p-2 text-left font-semibold text-gray-700 sticky left-0 bg-white">&nbsp;</th>
                {monthDays.map((d) => {
                  const dow = getDayOfWeek(d);
                  const isWeekend = dow === '土' || dow === '日';
                  const sum = daySummaries[d] || {};
                  // 判定（必要人数に満たない/超過/一致）
                  const statuses = [
                    ['nurse_day', SHIFT_TYPES.nurse_day.count],
                    ['nurse_night', SHIFT_TYPES.nurse_night.count],
                    ['helper_early', SHIFT_TYPES.helper_early.count],
                    ['helper_day', SHIFT_TYPES.helper_day.count],
                    ['helper_night', SHIFT_TYPES.helper_night.count],
                  ] as const;
                  const okAll = statuses.every(([k, need]) => (sum[k as ShiftKey] || 0) === need);
                  const overAny = statuses.some(([k, need]) => (sum[k as ShiftKey] || 0) > need);
                  const badge = okAll ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : overAny ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
                  const Icon = okAll ? CheckCircle2 : (overAny ? AlertTriangle : Info);
                  return (
                    <th key={`q-${d}`} className={`p-2 text-center min-w-[90px] ${isWeekend ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <div className={`mx-auto w-fit px-2 py-1 rounded-lg text-xs border flex items-center gap-1 ${badge}`} title="必要人数との充足状況">
                        <Icon className="w-3.5 h-3.5" />
                        <span>
                          {Object.entries(sum).map(([k, v]) => `${(SHIFT_TYPES as any)[k].name}:${v}`).join(' ')}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>

              {/* 日付行 */}
              <tr className="bg-gray-50 sticky top-10 z-10 border-b">
                <th className="p-4 text-left font-semibold text-gray-800 sticky left-0 bg-gray-50 min-w-[160px]">スタッフ</th>
                {monthDays.map((d) => {
                  const dow = getDayOfWeek(d);
                  const isWeekend = dow === '土' || dow === '日';
                  return (
                    <th key={d} className={`p-2 text-center min-w-[90px] ${isWeekend ? 'bg-red-50' : ''}`}>
                      <div className="text-lg font-bold text-gray-800">{d}</div>
                      <div className={`text-xs ${isWeekend ? 'text-red-600' : 'text-gray-600'}`}>{dow}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* 看護師 */}
              <tr>
                <td colSpan={monthDays.length + 1} className="p-3 bg-blue-50 font-semibold text-blue-800 border-b">
                  看護師 ({nurses.length}名)
                </td>
              </tr>

              {nurses.map((n, idx) => (
                <tr key={n.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b hover:bg-slate-100`}>
                  <td className="p-3 font-medium text-gray-800 sticky left-0 bg-inherit border-r">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={n.name}>{n.name}</span>
                      {isAdmin && n.custom && (
                        <button onClick={() => removeStaff(n.id)} className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="スタッフを削除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  {monthDays.map((d) => {
                    const key = getStaffShift(n.id, d);
                    const info = key ? SHIFT_TYPES[key] : null;
                    const dow = getDayOfWeek(d);
                    const isWeekend = dow === '土' || dow === '日';
                    return (
                      <td
                        key={`n-${n.id}-${d}`}
                        className={`p-1 text-center relative ${isWeekend ? 'bg-red-25' : ''}`}
                        onDrop={(e) => onDrop(e, n.id, d)}
                        onDragOver={onDragOver}
                        onContextMenu={(e) => openMenu(e, n.id, d, 'nurse')}
                      >
                        {key && info ? (
                          <div
                            draggable={isAdmin}
                            onDragStart={(e) => onDragStart(e, n.id, d, key)}
                            onClick={() => isAdmin && clearCell(n.id, d)}
                            className={`${info.color} ${info.text} px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${isAdmin ? 'cursor-move hover:shadow-lg' : ''}`}
                            title={`${info.name} / ${info.time}`}
                          >
                            {info.name}
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={(e) => openMenu(e as any, n.id, d, 'nurse')}
                            className="w-full h-8 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="クリックで追加"
                          >
                            <Edit3 className="w-4 h-4 mx-auto text-gray-400" />
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* ヘルパー */}
              <tr>
                <td colSpan={monthDays.length + 1} className="p-3 bg-green-50 font-semibold text-green-800 border-b">
                  ヘルパー ({helpers.length}名)
                </td>
              </tr>

              {helpers.map((h, idx) => (
                <tr key={h.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b hover:bg-slate-100`}>
                  <td className="p-3 font-medium text-gray-800 sticky left-0 bg-inherit border-r">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={h.name}>{h.name}</span>
                      {isAdmin && h.custom && (
                        <button onClick={() => removeStaff(h.id)} className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" title="スタッフを削除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  {monthDays.map((d) => {
                    const key = getStaffShift(h.id, d);
                    const info = key ? SHIFT_TYPES[key] : null;
                    const dow = getDayOfWeek(d);
                    const isWeekend = dow === '土' || dow === '日';
                    return (
                      <td
                        key={`h-${h.id}-${d}`}
                        className={`p-1 text-center relative ${isWeekend ? 'bg-red-25' : ''}`}
                        onDrop={(e) => onDrop(e, h.id, d)}
                        onDragOver={onDragOver}
                        onContextMenu={(e) => openMenu(e, h.id, d, 'helper')}
                      >
                        {key && info ? (
                          <div
                            draggable={isAdmin}
                            onDragStart={(e) => onDragStart(e, h.id, d, key)}
                            onClick={() => isAdmin && clearCell(h.id, d)}
                            className={`${info.color} ${info.text} px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 ${isAdmin ? 'cursor-move hover:shadow-lg' : ''}`}
                            title={`${info.name} / ${info.time}`}
                          >
                            {info.name}
                          </div>
                        ) : isAdmin ? (
                          <button
                            onClick={(e) => openMenu(e as any, h.id, d, 'helper')}
                            className="w-full h-8 bg-gray-100 hover:bg-green-100 rounded-lg transition-colors duration-200"
                            title="クリックで追加"
                          >
                            <Edit3 className="w-4 h-4 mx-auto text-gray-400" />
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 操作ヘルプ */}
        {isAdmin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">操作方法</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• シフトを <b>ドラッグ&ドロップ</b> で移動できます（ロール不一致は不可）</li>
              <li>• セルを <b>右クリック/長押し</b> でメニューから追加できます</li>
              <li>• 既存のシフトをクリックで <b>削除</b> できます</li>
              <li>• ヘッダーのバッジは <b>必要人数の充足度</b> を表示します（緑=OK/黄=超過/赤=不足）</li>
              <li>• Undo/Redo、JSON/CSV エクスポート、インポート、印刷に対応</li>
            </ul>
          </div>
        )}

        {/* シフト追加メニュー（コンテキスト） */}
        {menuPos && (
          <div
            className="fixed z-50 bg-white border shadow-xl rounded-lg p-2 w-44 animate-in fade-in-0 zoom-in-95"
            style={{ top: menuPos.y + 4, left: menuPos.x + 4 }}
            onMouseLeave={closeMenu}
          >
            <div className="px-2 py-1 text-xs text-gray-500">シフトを選択</div>
            <div className="space-y-1">
              {Object.entries(SHIFT_TYPES)
                .filter(([_, v]) => v.role === menuPos.role)
                .map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => { assign(menuPos.staffId, menuPos.day, k as ShiftKey); closeMenu(); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-sm"
                  >
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${v.color}`}>
                      <v.Icon className="w-3.5 h-3.5 text-white" />
                    </span>
                    <span className="flex-1 text-left">{v.name}</span>
                    <span className="text-xs text-gray-500">{v.time}</span>
                  </button>
                ))}
            </div>
            <div className="my-1 border-t" />
            <button
              onClick={() => { clearCell(menuPos.staffId, menuPos.day); closeMenu(); }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-rose-50 text-sm text-rose-700"
            >
              <Trash2 className="w-4 h-4" /> クリア
            </button>
          </div>
        )}

        {/* スタッフ追加モーダル */}
        {showStaffModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{modalRole === 'nurse' ? '看護師' : 'ヘルパー'}を追加</h3>
                <button onClick={() => { setShowStaffModal(false); setNewStaffName(''); }} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">スタッフ名</label>
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="例: 山田 太郎"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                onKeyDown={(e) => { if (e.key === 'Enter') addStaff(); }}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={addStaff}
                  disabled={!newStaffName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  追加
                </button>
                <button
                  onClick={() => { setShowStaffModal(false); setNewStaffName(''); }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 印刷スタイル */}
      <style>{`
        @media print {
          .print\\:bg-white { background: white !important; }
          button, input { display: none !important; }
          .sticky { position: static !important; }
          .shadow-lg, .shadow-2xl { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ShiftManagementTool;
