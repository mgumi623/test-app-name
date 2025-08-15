'use client';

import { useEffect, useState } from 'react';
import { useStaff } from '../contexts/StaffContext';
import ShiftTable from './ShiftTable';
import { Staff } from '../data/staff';
import { LoadingOverlay } from './LoadingOverlay';

interface TeamViewProps {
  teamName: string;
  currentDate: Date;
  onMonthChange?: (offset: number) => void;
}

export default function TeamView({ teamName, currentDate, onMonthChange }: TeamViewProps) {
  const { getStaffByTeam, loading } = useStaff();
  const [teamStaff, setTeamStaff] = useState<Staff[]>([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      const data = await getStaffByTeam(teamName);
      setTeamStaff(data);
    };

    fetchTeamData();
  }, [teamName, getStaffByTeam]);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <ShiftTable
      currentDate={currentDate}
      teamFilter={teamName}
      showTeamSelect={false}
      teamStaff={teamStaff}
      onMonthChange={onMonthChange}
    />
  );
}