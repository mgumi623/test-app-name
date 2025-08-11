import React from 'react';

export type Option = {
  id: string;
  department: string;
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
};