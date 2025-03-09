"use client";

import React from 'react';
import { PlusCircle } from 'lucide-react';

const AddPlaceForm = ({ newPlace, setNewPlace, addPlace, itineraryId }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
      <input
        type="time"
        value={newPlace.time}
        onChange={(e) => setNewPlace({...newPlace, time: e.target.value})}
        className="w-32 p-2 border rounded"
      />
      <input
        type="text"
        value={newPlace.name}
        onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
        placeholder="場所"
        className="flex-1 p-2 border rounded"
      />
      <input
        type="text"
        value={newPlace.note}
        onChange={(e) => setNewPlace({...newPlace, note: e.target.value})}
        placeholder="メモ"
        className="flex-1 p-2 border rounded"
      />
      <button
        onClick={() => addPlace(itineraryId)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <PlusCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AddPlaceForm;