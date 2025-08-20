import React from 'react';

export interface Option {
  id: string;
  label: string;
  href: string;
  department: string;
  description?: string;
}