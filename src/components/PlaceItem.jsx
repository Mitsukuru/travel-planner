"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import EditableField from './EditableField';

const PlaceItem = ({ place, itineraryId, editing, editValue, setEditValue, startEditing, saveEdit, cancelEdit, openDeleteDialog }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 rounded hover:bg-gray-50">
      <EditableField
        type="place"
        id={place.id}
        field="time"
        value={place.time}
        itineraryId={itineraryId}
        isEditing={editing.type === 'place' && editing.id === place.id && editing.field === 'time'}
        editValue={editValue}
        setEditValue={setEditValue}
        startEditing={startEditing}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
      />
      <EditableField
        type="place"
        id={place.id}
        field="name"
        value={place.name}
        itineraryId={itineraryId}
        className="flex-1 font-medium"
        isEditing={editing.type === 'place' && editing.id === place.id && editing.field === 'name'}
        editValue={editValue}
        setEditValue={setEditValue}
        startEditing={startEditing}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
      />
      <EditableField
        type="place"
        id={place.id}
        field="note"
        value={place.note}
        itineraryId={itineraryId}
        className="flex-1 text-gray-600"
        isEditing={editing.type === 'place' && editing.id === place.id && editing.field === 'note'}
        editValue={editValue}
        setEditValue={setEditValue}
        startEditing={startEditing}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
      />
      <button
        onClick={() => openDeleteDialog(itineraryId, place.id)}
        className="p-1 rounded-full hover:bg-gray-200 text-red-500 hover:text-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PlaceItem;