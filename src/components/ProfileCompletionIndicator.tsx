'use client';

import React from 'react';
import { UserProfile } from '@/lib/supabase';

export function ProfileCompletionIndicator({ profile }: { profile: Partial<UserProfile> }) {
  // Define the fields to check
  const fields = [
    { name: 'full_name', label: 'Full Name', completed: !!profile.full_name, required: true },
    { name: 'age', label: 'Age', completed: profile.age !== null, required: false },
    { name: 'gender', label: 'Gender', completed: !!profile.gender, required: false },
    { name: 'profession', label: 'Profession', completed: !!profile.profession, required: false },
    { name: 'organization_name', label: 'Organization', completed: !!profile.organization_name, required: false },
    { name: 'mobile_number', label: 'Mobile Number', completed: profile.mobile_number !== null, required: false }
  ];

  // Calculate completion percentage
  const completedFields = fields.filter(field => field.completed).length;
  const totalFields = fields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>Profile Completion</span>
        <span>{completionPercentage}%</span>
      </div>
      
      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 dark:bg-green-600 rounded-full"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {fields.map(field => (
          <div key={field.name} className="flex items-center gap-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${field.completed ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            <span className={field.completed ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}>
              {field.label}
              {field.required && !field.completed && <span className="text-red-500 ml-1">*</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 