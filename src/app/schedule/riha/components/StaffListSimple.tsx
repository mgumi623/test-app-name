'use client';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaff } from '../contexts/StaffContext';
import { useMemo } from 'react';

interface StaffListSimpleProps {
  team: string;
}

export default function StaffListSimple({ team }: StaffListSimpleProps) {
  const { getSortedStaff } = useStaff();

  const sortedStaffList = useMemo(() => {
    const allStaff = getSortedStaff('position', 'desc');
    return allStaff.filter(staff => staff.team === team);
  }, [getSortedStaff, team]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名前</TableHead>
          <TableHead>職種</TableHead>
          <TableHead>役職</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedStaffList.map((staff) => (
          <TableRow key={staff.id}>
            <TableCell>{staff.name}</TableCell>
            <TableCell>{staff.profession}</TableCell>
            <TableCell>{staff.position}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}