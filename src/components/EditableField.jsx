"use client";

import React from 'react';
import { Check, X, Edit2 } from 'lucide-react';

const EditableField = ({ type, id, field, value, itineraryId, className, isEditing, editValue, setEditValue, startEditing, saveEdit, cancelEdit }) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="p-1 border rounded"
          autoFocus
        />
        <button onClick={() => saveEdit(itineraryId)} className="p-1 rounded-full hover:bg-green-100">
          <Check className="w-4 h-4 text-green-600" />
        </button>
        <button onClick={cancelEdit} className="p-1 rounded-full hover:bg-red-100">
          <X className="w-4 h-4 text-red-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className={className}>{value}</span>
      <button
        onClick={() => startEditing(type, id, field, value)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditableField;