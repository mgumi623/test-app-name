'use client';
import React, { useState, useReducer, useRef } from 'react';
import { Plus, Calendar, Users, Clock, RefreshCw, Printer, Trash2, UserPlus, Lock, Eye, Edit, User, Menu, X } from 'lucide-react';

// 基本的な型定義
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男性' | '女性';
  room: string;
  condition: string;
  admissionDate: string;
  diagnosis: string;
  notes: string;
  pt: boolean;
  ot: boolean;
  st: boolean;
}

interface Therapist {
  id: string;
  name: string;
  type: 'PT' | 'OT' | 'ST';
  color: string;
}

interface TimeSlot {
  time: string;
  therapistId: string;
  patientId: string;
}

interface Sheet {
  id: string;
  name: string;
  date: string;
  isReadOnly: boolean;
  patients: Patient[];
  therapists: Therapist[];
  schedule: TimeSlot[];
}

interface AppState {
  sheets: Sheet[];
  activeSheetId: string;
  isAuthenticated: boolean;
}

// アクション型
type Action =
  | { type: 'ADD_SHEET'; payload: Sheet }
  | { type: 'SET_ACTIVE_SHEET'; payload: string }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'ADD_PATIENT'; payload: { sheetId: string; patient: Patient } }
  | { type: 'UPDATE_PATIENT'; payload: { sheetId: string; patientId: string; updates: Partial<Patient> } }
  | { type: 'DELETE_PATIENT'; payload: { sheetId: string; patientId: string } }
  | { type: 'ADD_THERAPIST'; payload: { sheetId: string; therapist: Therapist } }
  | { type: 'AUTO_ASSIGN_PATIENTS'; payload: { sheetId: string } }
  | { type: 'CLEAR_ALL_SCHEDULE'; payload: { sheetId: string } }
  | { type: 'DELETE_SHEET'; payload: string }
  | { type: 'TOGGLE_EDIT_MODE'; payload: { sheetId: string } }
  | { type: 'MOVE_SCHEDULE'; payload: { sheetId: string; fromPatientId: string; fromTime: string; toPatientId: string; toTime: string; therapistId: string } }
  | { type: 'DELETE_THERAPIST'; payload: { sheetId: string; therapistId: string } }
  | { type: 'REORDER_THERAPISTS'; payload: { sheetId: string; therapists: Therapist[] } }
  | { type: 'MOVE_SCHEDULE_BLOCK'; payload: { sheetId: string; fromPatientId: string; fromTime: string; toPatientId: string; toTime: string; therapistId: string } };

// リデューサー
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_SHEET':
      return {
        ...state,
        sheets: [...state.sheets, action.payload],
        activeSheetId: action.payload.id
      };
    
    case 'SET_ACTIVE_SHEET':
      return { ...state, activeSheetId: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'ADD_PATIENT':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? { ...sheet, patients: [...sheet.patients, action.payload.patient] }
            : sheet
        )
      };
    
    case 'UPDATE_PATIENT':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? {
                ...sheet,
                patients: sheet.patients.map(patient =>
                  patient.id === action.payload.patientId
                    ? { ...patient, ...action.payload.updates }
                    : patient
                )
              }
            : sheet
        )
      };
    
    case 'DELETE_PATIENT':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? {
                ...sheet,
                patients: sheet.patients.filter(p => p.id !== action.payload.patientId),
                schedule: sheet.schedule.filter(s => s.patientId !== action.payload.patientId)
              }
            : sheet
        )
      };

    case 'ADD_THERAPIST':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? { ...sheet, therapists: [...sheet.therapists, action.payload.therapist] }
            : sheet
        )
      };

    case 'DELETE_THERAPIST':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? {
                ...sheet,
                therapists: sheet.therapists.filter(t => t.id !== action.payload.therapistId),
                schedule: sheet.schedule.filter(s => s.therapistId !== action.payload.therapistId)
              }
            : sheet
        )
      };

    case 'REORDER_THERAPISTS':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? { ...sheet, therapists: action.payload.therapists }
            : sheet
        )
      };

    case 'AUTO_ASSIGN_PATIENTS':
      return {
        ...state,
        sheets: state.sheets.map(sheet => {
          if (sheet.id === action.payload.sheetId) {
            const newSchedule: TimeSlot[] = [];
            
            // 実際のテーブルの時間帯を使用
            const allTimeSlots = [
              '8:40', '9:00', '9:20', '9:45', '10:05', '10:25', '10:50', '11:10', '11:30', '12:00', '12:15', '12:30',
              '12:45', '13:05', '13:25', '13:50', '14:10', '14:30', '14:55', '15:15', '15:35', '16:00', '16:20', '16:40'
            ];
            
            const amSlots = allTimeSlots.slice(0, 12);
            const pmSlots = allTimeSlots.slice(12);
            
            sheet.patients.forEach(patient => {
              const eligibleTherapists = sheet.therapists.filter(therapist => {
                if (therapist.type === 'PT') return patient.pt;
                if (therapist.type === 'OT') return patient.ot;
                if (therapist.type === 'ST') return patient.st;
                return false;
              });
              
              if (eligibleTherapists.length > 0) {
                // 患者の点数を取得
                const targetPoints = patient.condition === '脳' ? 9 : 
                                   patient.condition === '運' ? 6 : 
                                   patient.condition === '廃' ? 9 : 6;
                
                // 点数に達するまで3セル単位で配置
                let currentPoints = 0;
                while (currentPoints < targetPoints && eligibleTherapists.length > 0) {
                  const randomTherapist = eligibleTherapists[Math.floor(Math.random() * eligibleTherapists.length)];
                  
                  // AMまたはPMをランダムに選択
                  const useAM = Math.random() < 0.5;
                  const timeSlots = useAM ? amSlots : pmSlots;
                  
                  // 利用可能な開始位置を探す（3セル連続で配置可能な位置）
                  const availableStarts = [];
                  for (let i = 0; i <= timeSlots.length - 3; i++) {
                    const canPlace = timeSlots.slice(i, i + 3).every(time => 
                      !newSchedule.some(s => s.time === time && (s.patientId === patient.id || s.therapistId === randomTherapist.id))
                    );
                    if (canPlace) {
                      availableStarts.push(i);
                    }
                  }
                  
                  if (availableStarts.length > 0) {
                    const randomStart = availableStarts[Math.floor(Math.random() * availableStarts.length)];
                    
                    // 3つの連続する時間帯に配置
                    for (let i = 0; i < 3; i++) {
                      const timeSlot = timeSlots[randomStart + i];
                      newSchedule.push({
                        time: timeSlot,
                        therapistId: randomTherapist.id,
                        patientId: patient.id
                      });
                    }
                    currentPoints += 3;
                  } else {
                    // 配置できない場合はループを抜ける
                    break;
                  }
                }
              }
            });
            
            return { ...sheet, schedule: newSchedule };
          }
          return sheet;
        })
      };

    case 'CLEAR_ALL_SCHEDULE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? { ...sheet, schedule: [] }
            : sheet
        )
      };
    
    case 'DELETE_SHEET':
      const filteredSheets = state.sheets.filter(s => s.id !== action.payload);
      return {
        ...state,
        sheets: filteredSheets,
        activeSheetId: filteredSheets.length > 0 ? filteredSheets[0].id : ''
      };
    
    case 'TOGGLE_EDIT_MODE':
      return {
        ...state,
        sheets: state.sheets.map(sheet =>
          sheet.id === action.payload.sheetId
            ? { ...sheet, isReadOnly: !sheet.isReadOnly }
            : sheet
        )
      };

    case 'MOVE_SCHEDULE':
      return {
        ...state,
        sheets: state.sheets.map(sheet => {
          if (sheet.id === action.payload.sheetId) {
            // 元の位置のスケジュールを削除
            let newSchedule = sheet.schedule.filter(s => 
              !(s.patientId === action.payload.fromPatientId && s.time === action.payload.fromTime)
            );
            
            // ターゲット位置の既存スケジュールを削除
            newSchedule = newSchedule.filter(s => 
              !(s.patientId === action.payload.toPatientId && s.time === action.payload.toTime)
            );
            
            // 新しい位置にスケジュールを追加
            newSchedule.push({
              patientId: action.payload.toPatientId,
              time: action.payload.toTime,
              therapistId: action.payload.therapistId
            });
            
            return { ...sheet, schedule: newSchedule };
          }
          return sheet;
        })
      };
    
    case 'MOVE_SCHEDULE_BLOCK':
      return {
        ...state,
        sheets: state.sheets.map(sheet => {
          if (sheet.id === action.payload.sheetId) {
            const allTimeSlots = [
              '8:40', '9:00', '9:20', '9:45', '10:05', '10:25', '10:50', '11:10', '11:30', '12:00', '12:15', '12:30',
              '12:45', '13:05', '13:25', '13:50', '14:10', '14:30', '14:55', '15:15', '15:35', '16:00', '16:20', '16:40'
            ];
            
            const fromTimeIndex = allTimeSlots.indexOf(action.payload.fromTime);
            const toTimeIndex = allTimeSlots.indexOf(action.payload.toTime);
            
            if (fromTimeIndex === -1 || toTimeIndex === -1) return sheet;
            
            let newSchedule = [...sheet.schedule];
            
            // 元の3セル連続のスケジュールを削除
            for (let i = 0; i < 3; i++) {
              if (fromTimeIndex + i < allTimeSlots.length) {
                const timeSlot = allTimeSlots[fromTimeIndex + i];
                newSchedule = newSchedule.filter(s => 
                  !(s.patientId === action.payload.fromPatientId && s.time === timeSlot)
                );
              }
            }
            
            // ターゲット位置の既存3セル連続スケジュールを削除
            for (let i = 0; i < 3; i++) {
              if (toTimeIndex + i < allTimeSlots.length) {
                const timeSlot = allTimeSlots[toTimeIndex + i];
                newSchedule = newSchedule.filter(s => 
                  !(s.patientId === action.payload.toPatientId && s.time === timeSlot)
                );
              }
            }
            
            // 新しい位置に3セル連続でスケジュールを追加
            for (let i = 0; i < 3; i++) {
              if (toTimeIndex + i < allTimeSlots.length) {
                const timeSlot = allTimeSlots[toTimeIndex + i];
                newSchedule.push({
                  patientId: action.payload.toPatientId,
                  time: timeSlot,
                  therapistId: action.payload.therapistId
                });
              }
            }
            
            return { ...sheet, schedule: newSchedule };
          }
          return sheet;
        })
      };
    
    default:
      return state;
  }
};

const PatientScheduleSystem = () => {
  const [state, dispatch] = useReducer(appReducer, {
    sheets: [{
      id: '1',
      name: '12/25',
      date: '2024/12/25',
      isReadOnly: false,
      patients: [
        { 
          id: '1', 
          name: '高橋 幸介', 
          age: 72,
          gender: '男性',
          room: '201A',
          condition: '脳', 
          admissionDate: '2024-12-15',
          diagnosis: '脳梗塞',
          notes: '左片麻痺',
          pt: true, 
          ot: false, 
          st: false 
        },
        { 
          id: '2', 
          name: '鈴木 洋一', 
          age: 68,
          gender: '男性',
          room: '203B',
          condition: '脳', 
          admissionDate: '2024-12-10',
          diagnosis: '脳出血',
          notes: '右片麻痺、失語症',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '3', 
          name: '山本 美子', 
          age: 75,
          gender: '女性',
          room: '205A',
          condition: '脳', 
          admissionDate: '2024-12-20',
          diagnosis: 'くも膜下出血',
          notes: '構音障害',
          pt: false, 
          ot: true, 
          st: true 
        },
        { 
          id: '4', 
          name: '田中 一郎', 
          age: 65,
          gender: '男性',
          room: '207B',
          condition: '運', 
          admissionDate: '2024-12-18',
          diagnosis: '脊髄損傷',
          notes: '下肢麻痺',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '5', 
          name: '佐藤 花子', 
          age: 58,
          gender: '女性',
          room: '209A',
          condition: '脳', 
          admissionDate: '2024-12-22',
          diagnosis: '脳梗塞',
          notes: '失語症',
          pt: true, 
          ot: false, 
          st: true 
        },
        { 
          id: '6', 
          name: '伊藤 次郎', 
          age: 73,
          gender: '男性',
          room: '211B',
          condition: '廃', 
          admissionDate: '2024-12-16',
          diagnosis: '廃用症候群',
          notes: '全身筋力低下',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '7', 
          name: '渡辺 恵子', 
          age: 69,
          gender: '女性',
          room: '213A',
          condition: '脳', 
          admissionDate: '2024-12-14',
          diagnosis: '脳出血',
          notes: '構音障害、嚥下障害',
          pt: false, 
          ot: true, 
          st: true 
        },
        { 
          id: '8', 
          name: '中村 三郎', 
          age: 66,
          gender: '男性',
          room: '215B',
          condition: '運', 
          admissionDate: '2024-12-19',
          diagnosis: '脊柱管狭窄症',
          notes: '歩行困難',
          pt: true, 
          ot: false, 
          st: false 
        },
        { 
          id: '9', 
          name: '小林 静子', 
          age: 71,
          gender: '女性',
          room: '217A',
          condition: '脳', 
          admissionDate: '2024-12-21',
          diagnosis: 'くも膜下出血',
          notes: '高次脳機能障害',
          pt: true, 
          ot: true, 
          st: true 
        },
        { 
          id: '10', 
          name: '加藤 四郎', 
          age: 74,
          gender: '男性',
          room: '219B',
          condition: '医', 
          admissionDate: '2024-12-17',
          diagnosis: '心筋梗塞',
          notes: '心機能低下',
          pt: true, 
          ot: false, 
          st: false 
        }
      ],
      therapists: [
        { id: '1', name: '田中', type: 'PT', color: '#8b5cf6' },
        { id: '2', name: '佐藤', type: 'OT', color: '#06b6d4' },
        { id: '3', name: '鈴木', type: 'ST', color: '#10b981' },
        { id: '4', name: '高橋', type: 'PT', color: '#f59e0b' },
        { id: '5', name: '山田', type: 'OT', color: '#ef4444' },
        { id: '6', name: '伊藤', type: 'ST', color: '#8b5cf6' },
        { id: '7', name: '渡辺', type: 'PT', color: '#06b6d4' },
        { id: '8', name: '中村', type: 'OT', color: '#10b981' },
        { id: '9', name: '小林', type: 'ST', color: '#f59e0b' },
        { id: '10', name: '加藤', type: 'PT', color: '#ef4444' }
      ],
      schedule: []
    }],
    activeSheetId: '1',
    isAuthenticated: true
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [createMode, setCreateMode] = useState<'readonly' | 'edit'>('readonly');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draggedSchedule, setDraggedSchedule] = useState<{patientId: string, time: string, therapistId: string, isBlock?: boolean} | null>(null);
  const [dropTarget, setDropTarget] = useState<{patientId: string, time: string} | null>(null);
  
  const [newTherapist, setNewTherapist] = useState({ 
    name: '', 
    type: 'PT' as 'PT' | 'OT' | 'ST', 
    color: '#6366f1' 
  });

  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: '男性',
    room: '',
    condition: '脳',
    admissionDate: '',
    diagnosis: '',
    notes: '',
    pt: false,
    ot: false,
    st: false
  });

  const activeSheet = state.sheets.find(sheet => sheet.id === state.activeSheetId);

  // 翌日の日付を取得
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('ja-JP');
  };

  // パスワード認証
  const authenticate = () => {
    if (password === '1111') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError('');
      if (createMode === 'edit') {
        createNewSheet(false);
      }
    } else {
      setPasswordError('パスワードが間違っています');
    }
  };

  // 新しいシートを作成
  const createNewSheet = (isReadOnly: boolean = true) => {
    const tomorrowStr = getTomorrowDate();
    
    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: tomorrowStr,
      date: tomorrowStr,
      isReadOnly: isReadOnly,
      patients: [
        { 
          id: '1', 
          name: '高橋 幸介', 
          age: 72,
          gender: '男性',
          room: '201A',
          condition: '脳', 
          admissionDate: '2024-12-15',
          diagnosis: '脳梗塞',
          notes: '左片麻痺',
          pt: true, 
          ot: false, 
          st: false 
        },
        { 
          id: '2', 
          name: '鈴木 洋一', 
          age: 68,
          gender: '男性',
          room: '203B',
          condition: '脳', 
          admissionDate: '2024-12-10',
          diagnosis: '脳出血',
          notes: '右片麻痺、失語症',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '3', 
          name: '山本 美子', 
          age: 75,
          gender: '女性',
          room: '205A',
          condition: '脳', 
          admissionDate: '2024-12-20',
          diagnosis: 'くも膜下出血',
          notes: '構音障害',
          pt: false, 
          ot: true, 
          st: true 
        },
        { 
          id: '4', 
          name: '田中 一郎', 
          age: 65,
          gender: '男性',
          room: '207B',
          condition: '運', 
          admissionDate: '2024-12-18',
          diagnosis: '脊髄損傷',
          notes: '下肢麻痺',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '5', 
          name: '佐藤 花子', 
          age: 58,
          gender: '女性',
          room: '209A',
          condition: '脳', 
          admissionDate: '2024-12-22',
          diagnosis: '脳梗塞',
          notes: '失語症',
          pt: true, 
          ot: false, 
          st: true 
        },
        { 
          id: '6', 
          name: '伊藤 次郎', 
          age: 73,
          gender: '男性',
          room: '211B',
          condition: '廃', 
          admissionDate: '2024-12-16',
          diagnosis: '廃用症候群',
          notes: '全身筋力低下',
          pt: true, 
          ot: true, 
          st: false 
        },
        { 
          id: '7', 
          name: '渡辺 恵子', 
          age: 69,
          gender: '女性',
          room: '213A',
          condition: '脳', 
          admissionDate: '2024-12-14',
          diagnosis: '脳出血',
          notes: '構音障害、嚥下障害',
          pt: false, 
          ot: true, 
          st: true 
        },
        { 
          id: '8', 
          name: '中村 三郎', 
          age: 66,
          gender: '男性',
          room: '215B',
          condition: '運', 
          admissionDate: '2024-12-19',
          diagnosis: '脊柱管狭窄症',
          notes: '歩行困難',
          pt: true, 
          ot: false, 
          st: false 
        },
        { 
          id: '9', 
          name: '小林 静子', 
          age: 71,
          gender: '女性',
          room: '217A',
          condition: '脳', 
          admissionDate: '2024-12-21',
          diagnosis: 'くも膜下出血',
          notes: '高次脳機能障害',
          pt: true, 
          ot: true, 
          st: true 
        },
        { 
          id: '10', 
          name: '加藤 四郎', 
          age: 74,
          gender: '男性',
          room: '219B',
          condition: '医', 
          admissionDate: '2024-12-17',
          diagnosis: '心筋梗塞',
          notes: '心機能低下',
          pt: true, 
          ot: false, 
          st: false 
        }
      ],
      therapists: [
        { id: '1', name: '田中', type: 'PT', color: '#8b5cf6' },
        { id: '2', name: '佐藤', type: 'OT', color: '#06b6d4' },
        { id: '3', name: '鈴木', type: 'ST', color: '#10b981' },
        { id: '4', name: '高橋', type: 'PT', color: '#f59e0b' },
        { id: '5', name: '山田', type: 'OT', color: '#ef4444' },
        { id: '6', name: '伊藤', type: 'ST', color: '#8b5cf6' },
        { id: '7', name: '渡辺', type: 'PT', color: '#06b6d4' },
        { id: '8', name: '中村', type: 'OT', color: '#10b981' },
        { id: '9', name: '小林', type: 'ST', color: '#f59e0b' },
        { id: '10', name: '加藤', type: 'PT', color: '#ef4444' }
      ],
      schedule: []
    };
    dispatch({ type: 'ADD_SHEET', payload: newSheet });
    setShowCreateModal(false);
    setSidebarOpen(false);
  };

  // モード選択処理
  const handleModeSelection = (mode: 'readonly' | 'edit') => {
    setCreateMode(mode);
    setShowCreateModal(false);
    
    if (mode === 'readonly') {
      createNewSheet(true);
    } else {
      if (state.isAuthenticated) {
        createNewSheet(false);
      } else {
        setShowPasswordModal(true);
      }
    }
  };

  // 患者追加
  const addNewPatient = () => {
    if (!activeSheet || !newPatient.name?.trim()) return;

    const patient: Patient = {
      id: Date.now().toString(),
      name: newPatient.name.trim(),
      age: newPatient.age || 0,
      gender: newPatient.gender || '男性',
      room: newPatient.room || '',
      condition: newPatient.condition || '脳',
      admissionDate: newPatient.admissionDate || '',
      diagnosis: newPatient.diagnosis || '',
      notes: newPatient.notes || '',
      pt: newPatient.pt || false,
      ot: newPatient.ot || false,
      st: newPatient.st || false
    };

    dispatch({
      type: 'ADD_PATIENT',
      payload: { sheetId: activeSheet.id, patient }
    });

    // フォームリセット
    setNewPatient({
      name: '',
      age: 0,
      gender: '男性',
      room: '',
      condition: '脳',
      admissionDate: '',
      diagnosis: '',
      notes: '',
      pt: false,
      ot: false,
      st: false
    });
    setShowPatientDetail(false);
  };

  // 患者更新
  const updatePatient = (patientId: string, field: keyof Patient, value: string | boolean | number) => {
    if (!activeSheet || activeSheet.isReadOnly) return;
    
    dispatch({
      type: 'UPDATE_PATIENT',
      payload: {
        sheetId: activeSheet.id,
        patientId,
        updates: { [field]: value }
      }
    });
  };

  // 患者削除
  const deletePatient = (patientId: string) => {
    if (!activeSheet || activeSheet.isReadOnly) return;
    
    const patient = activeSheet.patients.find(p => p.id === patientId);
    if (!patient) return;
    
    if (window.confirm(`患者「${patient.name}」を削除しますか？`)) {
      dispatch({
        type: 'DELETE_PATIENT',
        payload: { sheetId: activeSheet.id, patientId }
      });
    }
  };

  // セラピスト削除
  const deleteTherapist = (therapistId: string) => {
    if (!activeSheet || activeSheet.isReadOnly) return;
    
    const therapist = activeSheet.therapists.find(t => t.id === therapistId);
    if (!therapist) return;
    
    if (window.confirm(`セラピスト「${therapist.name}」を削除しますか？関連するスケジュールも削除されます。`)) {
      dispatch({
        type: 'DELETE_THERAPIST',
        payload: { sheetId: activeSheet.id, therapistId }
      });
    }
  };

  // セラピスト追加
  const addTherapist = () => {
    if (!activeSheet || !newTherapist.name.trim() || activeSheet.isReadOnly) return;

    const therapist: Therapist = {
      id: Date.now().toString(),
      name: newTherapist.name.trim(),
      type: newTherapist.type,
      color: newTherapist.color
    };

    dispatch({
      type: 'ADD_THERAPIST',
      payload: { sheetId: activeSheet.id, therapist }
    });

    setNewTherapist({ name: '', type: 'PT', color: '#6366f1' });
    setShowAddTherapist(false);
  };

  // 自動割り振り
  const autoAssignPatients = () => {
    if (!activeSheet || activeSheet.isReadOnly) return;
    dispatch({ type: 'AUTO_ASSIGN_PATIENTS', payload: { sheetId: activeSheet.id } });
    setSidebarOpen(false);
  };

  // 全削除
  const clearAllSchedule = () => {
    if (!activeSheet || activeSheet.isReadOnly) return;
    if (window.confirm('すべてのスケジュールを削除しますか？')) {
      dispatch({ type: 'CLEAR_ALL_SCHEDULE', payload: { sheetId: activeSheet.id } });
      setSidebarOpen(false);
    }
  };

  // 編集モード切り替え
  const toggleEditMode = () => {
    if (!activeSheet) return;
    
    if (activeSheet.isReadOnly) {
      if (state.isAuthenticated) {
        dispatch({ type: 'TOGGLE_EDIT_MODE', payload: { sheetId: activeSheet.id } });
      } else {
        setShowPasswordModal(true);
      }
    } else {
      dispatch({ type: 'TOGGLE_EDIT_MODE', payload: { sheetId: activeSheet.id } });
    }
  };

  // スケジュール数カウント
  const getPatientScheduleCount = (patientId: string, period: 'AM' | 'PM') => {
    if (!activeSheet) return 0;
    
    const periodTimes = period === 'AM' 
      ? ['8:40', '9:00', '9:20', '9:45', '10:05', '10:25', '10:50', '11:10', '11:30', '12:00', '12:15', '12:30']
      : ['12:45', '13:05', '13:25', '13:50', '14:10', '14:30', '14:55', '15:15', '15:35', '16:00', '16:20', '16:40'];
    
    return activeSheet.schedule.filter(s => 
      s.patientId === patientId && periodTimes.includes(s.time)
    ).length;
  };

  // セラピスト取得
  const getPatientTherapist = (patientId: string, time: string) => {
    if (!activeSheet) return null;
    
    const schedule = activeSheet.schedule.find(s => s.time === time && s.patientId === patientId);
    if (!schedule) return null;
    
    return activeSheet.therapists.find(t => t.id === schedule.therapistId);
  };

  // セラピストの担当患者取得
  const getTherapistPatient = (therapistId: string, time: string) => {
    if (!activeSheet) return null;
    
    const schedule = activeSheet.schedule.find(s => s.time === time && s.therapistId === therapistId);
    if (!schedule) return null;
    
    return activeSheet.patients.find(p => p.id === schedule.patientId);
  };

  // セラピスト行にスケジュールがあるかチェック
  const hasTherapistSchedule = (therapistId: string, time: string) => {
    if (!activeSheet) return false;
    return activeSheet.schedule.some(s => s.time === time && s.therapistId === therapistId);
  };

  // 3セル連続のスケジュールかチェック
  const isBlockSchedule = (patientId: string, time: string, therapistId: string) => {
    if (!activeSheet) return false;
    
    const allTimeSlots = [
      '8:40', '9:00', '9:20', '9:45', '10:05', '10:25', '10:50', '11:10', '11:30', '12:00', '12:15', '12:30',
      '12:45', '13:05', '13:25', '13:50', '14:10', '14:30', '14:55', '15:15', '15:35', '16:00', '16:20', '16:40'
    ];
    
    const timeIndex = allTimeSlots.indexOf(time);
    if (timeIndex === -1) return false;
    
    // 連続する3つの時間帯に同じセラピストと患者のスケジュールがあるかチェック
    let consecutiveCount = 0;
    for (let i = timeIndex; i < Math.min(timeIndex + 3, allTimeSlots.length); i++) {
      const hasSchedule = activeSheet.schedule.some(s => 
        s.time === allTimeSlots[i] && s.patientId === patientId && s.therapistId === therapistId
      );
      if (hasSchedule) {
        consecutiveCount++;
      } else {
        break;
      }
    }
    
    return consecutiveCount === 3;
  };

  // 患者名の幅を動的に計算
  const getPatientNameWidth = (name: string) => {
    const baseWidth = 80;
    const extraWidth = Math.max(0, (name.length - 4) * 8);
    return baseWidth + extraWidth;
  };

  // ドラッグ開始
  const handleDragStart = (e: React.DragEvent, patientId: string, time: string, therapistId: string, isTherapistRow?: boolean) => {
    if (activeSheet?.isReadOnly) return;
    
    const isBlock = isBlockSchedule(patientId, time, therapistId);
    setDraggedSchedule({ patientId, time, therapistId, isBlock });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent, targetId: string, time: string, isTherapistRow?: boolean) => {
    if (activeSheet?.isReadOnly || !draggedSchedule) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (isTherapistRow) {
      // セラピスト行では、targetIdはtherapistId
      setDropTarget({ patientId: draggedSchedule.patientId, time });
    } else {
      // 患者行では、targetIdはpatientId
      setDropTarget({ patientId: targetId, time });
    }
  };

  // ドロップ
  const handleDrop = (e: React.DragEvent, targetId: string, targetTime: string, isTherapistRow?: boolean) => {
    if (activeSheet?.isReadOnly || !draggedSchedule) return;
    
    e.preventDefault();
    
    let targetPatientId = targetId;
    
    if (isTherapistRow) {
      // セラピスト行でのドロップの場合、targetIdはtherapistIdなので
      // 元の患者IDをそのまま使用
      targetPatientId = draggedSchedule.patientId;
    }
    
    // 同じ場所にドロップした場合は何もしない
    if (draggedSchedule.patientId === targetPatientId && draggedSchedule.time === targetTime) {
      setDraggedSchedule(null);
      setDropTarget(null);
      return;
    }

    // 3セル連続のスケジュールかどうかで処理を分岐
    if (!activeSheet) return;
        if (draggedSchedule.isBlock) {
        dispatch({
            type: 'MOVE_SCHEDULE_BLOCK',
            payload: {
            sheetId: activeSheet.id,
            fromPatientId: draggedSchedule.patientId,
            fromTime: draggedSchedule.time,
            toPatientId: targetPatientId,
            toTime: targetTime,
            therapistId: isTherapistRow ? targetId : draggedSchedule.therapistId
            }
        });
        } else {
        dispatch({
            type: 'MOVE_SCHEDULE',
            payload: {
            sheetId: activeSheet.id,
            fromPatientId: draggedSchedule.patientId,
            fromTime: draggedSchedule.time,
            toPatientId: targetPatientId,
            toTime: targetTime,
            therapistId: isTherapistRow ? targetId : draggedSchedule.therapistId
            }
        });
        }

    setDraggedSchedule(null);
    setDropTarget(null);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedSchedule(null);
    setDropTarget(null);
  };

  const conditions = ['脳', '運', '廃', '医'];
  const timeSlots = ['8:40', '9:00', '9:20', '9:45', '10:05', '10:25', '10:50', '11:10', '11:30', '12:00', '12:15', '12:30'];
  const afternoonSlots = ['12:45', '13:05', '13:25', '13:50', '14:10', '14:30', '14:55', '15:15', '15:35', '16:00', '16:20', '16:40'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-100 flex">
      {/* サイドバー */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              患者予定表システム
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* 新規作成 */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl hover:from-violet-700 hover:to-indigo-700 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus size={20} />
              <span className="font-medium">新規作成</span>
            </button>

            {/* 読み取り専用 */}
            {activeSheet && (
              <button
                onClick={toggleEditMode}
                disabled={!state.isAuthenticated && activeSheet.isReadOnly}
                className={`w-full p-4 rounded-2xl flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 ${
                  activeSheet.isReadOnly 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                }`}
              >
                {activeSheet.isReadOnly ? <Edit size={20} /> : <Eye size={20} />}
                <span className="font-medium">
                  {activeSheet.isReadOnly ? '読み取り専用' : '編集モード'}
                </span>
              </button>
            )}

            {/* 編集モード時のボタン */}
            {activeSheet && !activeSheet.isReadOnly && (
              <>
                <button
                  onClick={autoAssignPatients}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl hover:from-orange-600 hover:to-red-600 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw size={20} />
                  <span className="font-medium">自動割り振り</span>
                </button>

                <button
                  onClick={clearAllSchedule}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-2xl hover:from-red-600 hover:to-pink-600 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Trash2 size={20} />
                  <span className="font-medium">全削除</span>
                </button>
              </>
            )}
          </div>

          {/* 登録済みセラピスト */}
          {activeSheet && activeSheet.therapists.length > 0 && (
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
              <div className="font-semibold text-blue-900 mb-3">👥 登録済みセラピスト</div>
              <div className="space-y-2">
                {activeSheet.therapists.map(therapist => (
                  <div 
                    key={therapist.id}
                    className="flex items-center gap-3 p-2 rounded-xl group"
                    style={{ backgroundColor: therapist.color + '20' }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: therapist.color }}
                    />
                    <span className="text-sm font-medium flex-1">
                      {therapist.name} ({therapist.type})
                    </span>
                    {!activeSheet.isReadOnly && (
                      <button
                        onClick={() => deleteTherapist(therapist.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 rounded transition-all"
                        title="削除"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* サイドバーオーバーレイ */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 w-full overflow-x-auto">
        {/* ヘッダー */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                患者予定表システム
              </h1>
            </div>
            
            {activeSheet && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>モード:</span>
                <span className={`px-3 py-1 rounded-full text-white ${
                  activeSheet.isReadOnly 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}>
                  {activeSheet.isReadOnly ? '読み取り専用' : '編集可能'}
                </span>
              </div>
            )}
          </div>

          {/* シートタブ */}
          <div className="flex gap-3 overflow-x-auto">
            {state.sheets.map(sheet => (
              <div key={sheet.id} className="relative flex-shrink-0">
                <button
                  onClick={() => dispatch({ type: 'SET_ACTIVE_SHEET', payload: sheet.id })}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center gap-3 ${
                    sheet.id === state.activeSheetId
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl scale-105'
                      : 'bg-white/60 text-gray-700 hover:bg-white/80 shadow-lg hover:shadow-xl backdrop-blur-sm'
                  }`}
                >
                  {sheet.isReadOnly ? <Eye size={16} /> : <Edit size={16} />}
                  {sheet.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('このシートを削除しますか？')) {
                      dispatch({ type: 'DELETE_SHEET', payload: sheet.id });
                    }
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full text-xs flex items-center justify-center shadow-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {activeSheet ? (
          <div className="max-w-full mx-auto p-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              
              {/* ヘッダー情報 - スタイリッシュな横配置 */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-8">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <Calendar className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">2B班</h2>
                        <p className="text-blue-200 text-sm">病棟</p>
                      </div>
                    </div>
                    
                    <div className="h-12 w-px bg-white/30"></div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold">患者予定表</h2>
                        <p className="text-blue-200 text-sm">{activeSheet.date}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20 min-w-[100px]">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <User className="w-5 h-5 text-blue-300" />
                        <span className="text-blue-200 text-sm">患者数</span>
                      </div>
                      <p className="text-3xl font-bold">{activeSheet.patients.filter(p => p.name && p.name.trim()).length}</p>
                    </div>
                    
                    <div className="text-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20 min-w-[100px]">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <Users className="w-5 h-5 text-green-300" />
                        <span className="text-blue-200 text-sm">セラピスト</span>
                      </div>
                      <p className="text-3xl font-bold">{activeSheet.therapists.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 患者リストテーブル */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-violet-100 via-indigo-100 to-purple-100">
                      {timeSlots.map(time => (
                        <th key={time} className="border border-white/30 p-2 font-semibold text-slate-700 bg-white/50 backdrop-blur-sm min-w-[60px]">{time}</th>
                      ))}
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold min-w-[50px]">AM</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold min-w-[50px]">病名</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold min-w-[100px]">氏名</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold min-w-[50px]">年齢</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold min-w-[60px]">部屋</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold min-w-[40px]">PT</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold min-w-[40px]">OT</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold min-w-[40px]">ST</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold min-w-[40px]">点数</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold min-w-[50px]">終日</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold min-w-[50px]">PM</th>
                      {afternoonSlots.map(time => (
                        <th key={time} className="border border-white/30 p-2 font-semibold text-slate-700 bg-white/50 backdrop-blur-sm min-w-[60px]">{time}</th>
                      ))}
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold min-w-[50px]">平均</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold min-w-[50px]">実績</th>
                      <th className="border border-white/30 p-2 bg-gradient-to-r from-gray-500 to-slate-500 text-white font-semibold min-w-[60px]">加算率</th>
                      {!activeSheet.isReadOnly && (
                        <th className="border border-white/30 p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold min-w-[50px]">削除</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 患者データ */}
                    {activeSheet.patients.filter(p => p.name && p.name.trim()).map((patient) => {
                      const amCount = getPatientScheduleCount(patient.id, 'AM');
                      const pmCount = getPatientScheduleCount(patient.id, 'PM');
                      
                      return (
                        <tr key={patient.id} className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-all duration-200 group">
                          {/* 午前の時間セル */}
                          {timeSlots.map(time => {
                            const therapist = getPatientTherapist(patient.id, time);
                            const isDropTarget = dropTarget?.patientId === patient.id && dropTarget?.time === time;
                            const isDraggedFrom = draggedSchedule?.patientId === patient.id && draggedSchedule?.time === time;
                            
                            return (
                              <td 
                                key={time} 
                                className={`border border-white/30 p-1 h-8 text-center transition-all duration-200 ${
                                  isDropTarget ? 'bg-violet-200 border-violet-400' : 'bg-white/40'
                                } ${isDraggedFrom ? 'opacity-50' : ''} ${
                                  !activeSheet.isReadOnly ? 'hover:bg-violet-50' : ''
                                }`}
                                onDragOver={(e) => handleDragOver(e, patient.id, time)}
                                onDrop={(e) => handleDrop(e, patient.id, time)}
                                onDragLeave={() => setDropTarget(null)}
                              >
                                {therapist && (
                                  <div 
                                    className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm cursor-move"
                                    style={{ backgroundColor: therapist.color }}
                                    draggable={!activeSheet.isReadOnly}
                                    onDragStart={(e) => handleDragStart(e, patient.id, time, therapist.id)}
                                    onDragEnd={handleDragEnd}
                                  >
                                    {therapist.name}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          
                          {/* AM カウント */}
                          <td className="border border-white/30 p-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-center text-white font-bold">
                            {amCount}
                          </td>
                          
                          {/* 病名 */}
                          <td className="border border-white/30 p-1 text-center">
                            <select 
                              value={patient.condition}
                              onChange={(e) => updatePatient(patient.id, 'condition', e.target.value)}
                              disabled={activeSheet.isReadOnly}
                              className="w-full px-2 py-1 rounded-lg text-xs text-center font-medium border-none shadow-sm"
                              style={{ 
                                backgroundColor: patient.condition === '脳' ? '#fef3c7' : 
                                                patient.condition === '運' ? '#dbeafe' : 
                                                patient.condition === '廃' ? '#fce7f3' : '#f3f4f6'
                              }}
                            >
                              {conditions.map(condition => (
                                <option key={condition} value={condition}>{condition}</option>
                              ))}
                            </select>
                          </td>
                          
                          {/* 患者名 */}
                          <td 
                            className="border border-white/30 p-1"
                            style={{ minWidth: `${getPatientNameWidth(patient.name)}px` }}
                          >
                            <input
                              type="text"
                              value={patient.name}
                              onChange={(e) => updatePatient(patient.id, 'name', e.target.value)}
                              disabled={activeSheet.isReadOnly}
                              className="w-full text-xs border-none bg-transparent font-medium"
                              title={`診断: ${patient.diagnosis}\n備考: ${patient.notes}`}
                            />
                          </td>
                          
                          {/* 年齢 */}
                          <td className="border border-white/30 p-1 text-center">
                            <input
                              type="number"
                              value={patient.age}
                              onChange={(e) => updatePatient(patient.id, 'age', parseInt(e.target.value))}
                              disabled={activeSheet.isReadOnly}
                              className="w-full text-xs border-none bg-transparent text-center"
                              min="0"
                              max="120"
                            />
                          </td>
                          
                          {/* 部屋 */}
                          <td className="border border-white/30 p-1 text-center">
                            <input
                              type="text"
                              value={patient.room}
                              onChange={(e) => updatePatient(patient.id, 'room', e.target.value)}
                              disabled={activeSheet.isReadOnly}
                              className="w-full text-xs border-none bg-transparent text-center"
                            />
                          </td>
                          
                          {/* チェックボックス */}
                          <td className="border border-white/30 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={patient.pt}
                              onChange={(e) => updatePatient(patient.id, 'pt', e.target.checked)}
                              disabled={activeSheet.isReadOnly}
                              className="w-4 h-4 accent-violet-600"
                            />
                          </td>
                          <td className="border border-white/30 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={patient.ot}
                              onChange={(e) => updatePatient(patient.id, 'ot', e.target.checked)}
                              disabled={activeSheet.isReadOnly}
                              className="w-4 h-4 accent-violet-600"
                            />
                          </td>
                          <td className="border border-white/30 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={patient.st}
                              onChange={(e) => updatePatient(patient.id, 'st', e.target.checked)}
                              disabled={activeSheet.isReadOnly}
                              className="w-4 h-4 accent-violet-600"
                            />
                          </td>
                          
                          {/* 点数 */}
                          <td className="border border-white/30 p-2 text-center">
                            <span className="text-red-600 font-bold">
                              {patient.condition === '脳' ? '9' : 
                               patient.condition === '運' ? '6' : 
                               patient.condition === '廃' ? '9' : ''}
                            </span>
                          </td>
                          
                          {/* 終日 */}
                          <td className="border border-white/30 p-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-center text-white font-bold">
                            {amCount + pmCount}
                          </td>
                          
                          {/* PM カウント */}
                          <td className="border border-white/30 p-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-center text-white font-bold">
                            {pmCount}
                          </td>
                          
                          {/* 午後の時間セル */}
                          {afternoonSlots.map(time => {
                            const therapist = getPatientTherapist(patient.id, time);
                            const isDropTarget = dropTarget?.patientId === patient.id && dropTarget?.time === time;
                            const isDraggedFrom = draggedSchedule?.patientId === patient.id && draggedSchedule?.time === time;
                            
                            return (
                              <td 
                                key={time} 
                                className={`border border-white/30 p-1 h-8 text-center transition-all duration-200 ${
                                  isDropTarget ? 'bg-violet-200 border-violet-400' : 'bg-white/40'
                                } ${isDraggedFrom ? 'opacity-50' : ''} ${
                                  !activeSheet.isReadOnly ? 'hover:bg-violet-50' : ''
                                }`}
                                onDragOver={(e) => handleDragOver(e, patient.id, time)}
                                onDrop={(e) => handleDrop(e, patient.id, time)}
                                onDragLeave={() => setDropTarget(null)}
                              >
                                {therapist && (
                                  <div 
                                    className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm cursor-move"
                                    style={{ backgroundColor: therapist.color }}
                                    draggable={!activeSheet.isReadOnly}
                                    onDragStart={(e) => handleDragStart(e, patient.id, time, therapist.id)}
                                    onDragEnd={handleDragEnd}
                                  >
                                    {therapist.name}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          
                          {/* 統計 */}
                          <td className="border border-white/30 p-2 text-center bg-white/60">
                            {amCount + pmCount > 0 ? Math.round((amCount + pmCount) / 2 * 10) / 10 : '-'}
                          </td>
                          <td className="border border-white/30 p-2 text-center bg-white/60">
                            {amCount + pmCount}
                          </td>
                          <td className="border border-white/30 p-2 bg-white/60">
                            {amCount + pmCount > 0 ? ((amCount + pmCount) / 24 * 100).toFixed(1) + '%' : '0.0%'}
                          </td>
                          
                          {/* 削除ボタン */}
                          {!activeSheet.isReadOnly && (
                            <td className="border border-white/30 p-2 text-center">
                              <button
                                onClick={() => deletePatient(patient.id)}
                                className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                title="患者を削除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    
                    {/* 新規患者追加行 */}
                    {!activeSheet.isReadOnly && (
                      <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100">
                        <td colSpan={timeSlots.length + 1} className="border border-white/30 p-3 text-center">
                          <button
                            onClick={() => setShowPatientDetail(true)}
                            className="flex items-center justify-center gap-2 text-emerald-700 w-full hover:text-emerald-800 transition-colors"
                          >
                            <Plus size={16} />
                            新しい患者を追加
                          </button>
                        </td>
                        <td colSpan={6} className="border border-white/30 p-1 text-center text-emerald-600 text-xs">
                          詳細情報を入力して患者を追加
                        </td>
                        <td colSpan={afternoonSlots.length + 4} className="border border-white/30 p-1 text-center text-emerald-600 text-xs">
                          患者追加後、PT/OT/STをチェックして自動割り振りを実行
                        </td>
                      </tr>
                    )}
                    
                    {/* セラピスト行 */}
                    {activeSheet.therapists.map((therapist) => (
                      <tr key={`therapist-${therapist.id}`} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group" style={{ backgroundColor: therapist.color + '10' }}>
                        {/* 午前の時間セル */}
                        {timeSlots.map(time => {
                          const hasSchedule = hasTherapistSchedule(therapist.id, time);
                          const patient = getTherapistPatient(therapist.id, time);
                          const isDropTarget = dropTarget?.patientId === patient?.id && dropTarget?.time === time;
                          const isDraggedFrom = draggedSchedule?.therapistId === therapist.id && draggedSchedule?.time === time;
                          
                          return (
                            <td 
                              key={time} 
                              className={`border border-white/30 p-1 h-8 text-center transition-all duration-200 ${
                                isDropTarget ? 'bg-violet-200 border-violet-400' : ''
                              } ${isDraggedFrom ? 'opacity-50' : ''} ${
                                !activeSheet.isReadOnly ? 'hover:bg-violet-50' : ''
                              }`}
                              onDragOver={(e) => handleDragOver(e, therapist.id, time, true)}
                              onDrop={(e) => handleDrop(e, therapist.id, time, true)}
                              onDragLeave={() => setDropTarget(null)}
                            >
                              {hasSchedule ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm cursor-move"
                                  style={{ backgroundColor: therapist.color }}
                                  draggable={!activeSheet.isReadOnly}
                                  onDragStart={(e) => handleDragStart(e, patient?.id || '', time, therapist.id, true)}
                                  onDragEnd={handleDragEnd}
                                  title={patient ? `${patient.name} (${patient.room})` : ''}
                                >
                                  {/* 空白表示 */}
                                </div>
                              ) : (
                                <div 
                                  className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm"
                                  style={{ backgroundColor: therapist.color + '40' }}
                                >
                                  {therapist.name}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        
                        {/* AM カウント */}
                        <td className="border border-white/30 p-2 text-center text-white font-bold" style={{ backgroundColor: therapist.color }}>
                          {timeSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length}
                        </td>
                        
                        {/* セラピスト情報列 */}
                        <td className="border border-white/30 p-1 text-center">
                          <span className="px-2 py-1 rounded-lg text-white text-xs font-bold" style={{ backgroundColor: therapist.color }}>
                            {therapist.type}
                          </span>
                        </td>
                        
                        {/* セラピスト名 */}
                        <td className="border border-white/30 p-1 font-medium" style={{ backgroundColor: therapist.color + '20' }}>
                          <div 
                            className="flex items-center gap-2 cursor-move"
                            draggable={!activeSheet.isReadOnly}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', `therapist:${therapist.id}`);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              if (e.dataTransfer.types.includes('text/plain')) {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                              }
                            }}
                            onDrop={(e) => {
                              const data = e.dataTransfer.getData('text/plain');
                              if (data.startsWith('therapist:') && !activeSheet.isReadOnly) {
                                const draggedTherapistId = data.replace('therapist:', '');
                                if (draggedTherapistId !== therapist.id) {
                                  // セラピスト位置の入れ替え処理
                                  const newTherapists = [...activeSheet.therapists];
                                  const draggedIndex = newTherapists.findIndex(t => t.id === draggedTherapistId);
                                  const targetIndex = newTherapists.findIndex(t => t.id === therapist.id);
                                  
                                  if (draggedIndex !== -1 && targetIndex !== -1) {
                                    [newTherapists[draggedIndex], newTherapists[targetIndex]] = 
                                    [newTherapists[targetIndex], newTherapists[draggedIndex]];
                                    
                                    dispatch({
                                      type: 'REORDER_THERAPISTS',
                                      payload: { sheetId: activeSheet.id, therapists: newTherapists }
                                    });
                                  }
                                }
                              }
                            }}
                            title="ドラッグして順序を変更"
                          >
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: therapist.color }}
                            />
                            {therapist.name}
                          </div>
                        </td>
                        
                        {/* 空白列（年齢、部屋、チェックボックス、点数） */}
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>-</td>
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>-</td>
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>
                          {therapist.type === 'PT' ? '✓' : '-'}
                        </td>
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>
                          {therapist.type === 'OT' ? '✓' : '-'}
                        </td>
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>
                          {therapist.type === 'ST' ? '✓' : '-'}
                        </td>
                        <td className="border border-white/30 p-1 text-center" style={{ backgroundColor: therapist.color + '10' }}>-</td>
                        
                        {/* 終日 */}
                        <td className="border border-white/30 p-2 text-center text-white font-bold" style={{ backgroundColor: therapist.color }}>
                          {timeSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length + 
                           afternoonSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length}
                        </td>
                        
                        {/* PM カウント */}
                        <td className="border border-white/30 p-2 text-center text-white font-bold" style={{ backgroundColor: therapist.color }}>
                          {afternoonSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length}
                        </td>
                        
                        {/* 午後の時間セル */}
                        {afternoonSlots.map(time => {
                          const hasSchedule = hasTherapistSchedule(therapist.id, time);
                          const patient = getTherapistPatient(therapist.id, time);
                          const isDropTarget = dropTarget?.patientId === patient?.id && dropTarget?.time === time;
                          const isDraggedFrom = draggedSchedule?.therapistId === therapist.id && draggedSchedule?.time === time;
                          
                          return (
                            <td 
                              key={time} 
                              className={`border border-white/30 p-1 h-8 text-center transition-all duration-200 ${
                                isDropTarget ? 'bg-violet-200 border-violet-400' : ''
                              } ${isDraggedFrom ? 'opacity-50' : ''} ${
                                !activeSheet.isReadOnly ? 'hover:bg-violet-50' : ''
                              }`}
                              onDragOver={(e) => handleDragOver(e, therapist.id, time, true)}
                              onDrop={(e) => handleDrop(e, therapist.id, time, true)}
                              onDragLeave={() => setDropTarget(null)}
                            >
                              {hasSchedule ? (
                                <div 
                                  className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm cursor-move"
                                  style={{ backgroundColor: therapist.color }}
                                  draggable={!activeSheet.isReadOnly}
                                  onDragStart={(e) => handleDragStart(e, patient?.id || '', time, therapist.id, true)}
                                  onDragEnd={handleDragEnd}
                                  title={patient ? `${patient.name} (${patient.room})` : ''}
                                >
                                  {/* 空白表示 */}
                                </div>
                              ) : (
                                <div 
                                  className="w-full h-full flex items-center justify-center rounded-lg font-medium text-white text-xs shadow-sm"
                                  style={{ backgroundColor: therapist.color + '40' }}
                                >
                                  {therapist.name}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        
                        {/* 統計 */}
                        <td className="border border-white/30 p-2 text-center" style={{ backgroundColor: therapist.color + '20' }}>
                          {Math.round((timeSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length + 
                                      afternoonSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length) / 2 * 10) / 10}
                        </td>
                        <td className="border border-white/30 p-2 text-center" style={{ backgroundColor: therapist.color + '20' }}>
                          {timeSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length + 
                           afternoonSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length}
                        </td>
                        <td className="border border-white/30 p-2" style={{ backgroundColor: therapist.color + '20' }}>
                          {((timeSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length + 
                             afternoonSlots.filter(time => hasTherapistSchedule(therapist.id, time)).length) / 24 * 100).toFixed(1)}%
                        </td>
                        
                        {/* 削除ボタン列（セラピスト行） */}
                        {!activeSheet.isReadOnly && (
                          <td className="border border-white/30 p-2 text-center" style={{ backgroundColor: therapist.color + '10' }}>
                            <button
                              onClick={() => deleteTherapist(therapist.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                              title="セラピストを削除"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 操作パネル */}
              {!activeSheet.isReadOnly && (
                <div className="p-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowAddTherapist(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Users size={18} />
                      セラピスト追加
                    </button>
                    <button
                      onClick={() => setShowPatientDetail(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-teal-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <UserPlus size={18} />
                      患者追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20">
                <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl mb-6">
                  <Calendar size={64} className="mx-auto text-white mb-4" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  予定表を作成しましょう
                </h2>
                <p className="text-gray-600 mb-6">新しい患者予定表を作成して、効率的なリハビリテーション管理を始めましょう。</p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Menu size={20} />
                  メニューを開く
                </button>
              </div>
            </div>
          </div>
        )}

        {/* モード選択モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar size={24} />
                  作成モードを選択
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <button
                  onClick={() => handleModeSelection('readonly')}
                  className="w-full p-4 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">読み取り専用モード</h4>
                      <p className="text-sm text-gray-600">データの閲覧のみ可能。編集はできません。</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleModeSelection('edit')}
                  className="w-full p-4 border-2 border-emerald-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Edit className="text-emerald-600 group-hover:scale-110 transition-transform" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-800">編集モード</h4>
                      <p className="text-sm text-gray-600">データの編集・追加・削除が可能。（パスワード必要）</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="flex gap-3 p-6 bg-gray-50/80">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-2xl font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* パスワード入力モーダル */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock size={24} />
                  パスワード認証
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワードを入力してください</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && authenticate()}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-center text-lg tracking-widest focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    placeholder="1111"
                    maxLength={4}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-2">{passwordError}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-gray-50/80">
                <button
                  onClick={authenticate}
                  disabled={!password}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-medium transition-all"
                >
                  認証
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-2xl font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 患者詳細追加モーダル */}
        {showPatientDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User size={24} />
                  患者情報入力
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">患者名 *</label>
                    <input
                      type="text"
                      value={newPatient.name || ''}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                    <input
                      type="number"
                      value={newPatient.age || ''}
                      onChange={(e) => setNewPatient({...newPatient, age: parseInt(e.target.value) || 0})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                      min="0"
                      max="120"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                    <select
                      value={newPatient.gender || '男性'}
                      onChange={(e) => setNewPatient({...newPatient, gender: e.target.value as '男性' | '女性'})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    >
                      <option value="男性">男性</option>
                      <option value="女性">女性</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">部屋番号</label>
                    <input
                      type="text"
                      value={newPatient.room || ''}
                      onChange={(e) => setNewPatient({...newPatient, room: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                      placeholder="201A"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">病名</label>
                    <select
                      value={newPatient.condition || '脳'}
                      onChange={(e) => setNewPatient({...newPatient, condition: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    >
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">入院日</label>
                    <input
                      type="date"
                      value={newPatient.admissionDate || ''}
                      onChange={(e) => setNewPatient({...newPatient, admissionDate: e.target.value})}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">診断名</label>
                  <input
                    type="text"
                    value={newPatient.diagnosis || ''}
                    onChange={(e) => setNewPatient({...newPatient, diagnosis: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    placeholder="脳梗塞"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                  <textarea
                    value={newPatient.notes || ''}
                    onChange={(e) => setNewPatient({...newPatient, notes: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    rows={3}
                    placeholder="症状や特記事項など"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">リハビリテーション</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPatient.pt || false}
                        onChange={(e) => setNewPatient({...newPatient, pt: e.target.checked})}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span>PT (理学療法)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPatient.ot || false}
                        onChange={(e) => setNewPatient({...newPatient, ot: e.target.checked})}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span>OT (作業療法)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newPatient.st || false}
                        onChange={(e) => setNewPatient({...newPatient, st: e.target.checked})}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span>ST (言語療法)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-gray-50/80">
                <button
                  onClick={addNewPatient}
                  disabled={!newPatient.name?.trim()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:bg-gray-400 text-white py-3 rounded-2xl font-medium transition-all"
                >
                  患者を追加
                </button>
                <button
                  onClick={() => {
                    setShowPatientDetail(false);
                    setNewPatient({
                      name: '',
                      age: 0,
                      gender: '男性',
                      room: '',
                      condition: '脳',
                      admissionDate: '',
                      diagnosis: '',
                      notes: '',
                      pt: false,
                      ot: false,
                      st: false
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-2xl font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* セラピスト追加モーダル */}
        {showAddTherapist && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users size={24} />
                  セラピスト追加
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">セラピスト名</label>
                  <input
                    type="text"
                    placeholder="山田 太郎"
                    value={newTherapist.name}
                    onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">専門分野</label>
                  <select
                    value={newTherapist.type}
                    onChange={(e) => setNewTherapist({...newTherapist, type: e.target.value as 'PT' | 'OT' | 'ST'})}
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
                  >
                    <option value="PT">PT (理学療法士)</option>
                    <option value="OT">OT (作業療法士)</option>
                    <option value="ST">ST (言語聴覚士)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">識別カラー</label>
                  <input
                    type="color"
                    value={newTherapist.color}
                    onChange={(e) => setNewTherapist({...newTherapist, color: e.target.value})}
                    className="w-16 h-12 border-2 border-gray-200 rounded-2xl cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 bg-gray-50/80">
                <button
                  onClick={addTherapist}
                  disabled={!newTherapist.name.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 text-white py-3 rounded-2xl font-medium transition-all"
                >
                  追加
                </button>
                <button
                  onClick={() => setShowAddTherapist(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-2xl font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientScheduleSystem;