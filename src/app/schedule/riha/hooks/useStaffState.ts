'use client';

import { useState, useEffect } from 'react';
import { Staff } from '../data/staff';

// グローバルなスタッフリストの状態を管理するためのカスタムフック
export function useStaffState() {
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // ローカルストレージからスタッフリストを読み込む
  useEffect(() => {
    const savedStaff = localStorage.getItem('riha-staff-list');
    if (savedStaff) {
      setStaffList(JSON.parse(savedStaff));
    }
  }, []);

  // スタッフリストが更新されたらローカルストレージに保存
  useEffect(() => {
    if (staffList.length > 0) {
      localStorage.setItem('riha-staff-list', JSON.stringify(staffList));
    }
  }, [staffList]);

  return {
    staffList,
    setStaffList,
  };
}