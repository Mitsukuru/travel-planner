"use client";

import React, { useState } from 'react';
import ItineraryCard from '@/components/ItineraryCard';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { sortPlacesByTime } from '../utils/itineraryHelpers';

// 型定義
interface Place {
  id: number;
  time: string;
  name: string;
  note: string;
}

interface Itinerary {
  id: number;
  title: string;
  date: string;
  places: Place[];
}

interface NewPlace {
  time: string;
  name: string;
  note: string;
}

interface EditingState {
  type: 'itinerary' | 'place' | null;
  id: number | null;
  field: string | null;
}

interface DeleteDialogState {
  isOpen: boolean;
  itineraryId: number | null;
  placeId: number | null;
}
export default function TravelPlanner() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    {
      id: 1,
      title: '東京観光プラン',
      date: '2025-03-15',
      places: sortPlacesByTime([
        { id: 1, time: '09:00', name: '浅草寺', note: '雷門から入場' },
        { id: 2, time: '12:00', name: 'スカイツリー', note: '展望デッキまで上る' },
        { id: 3, time: '15:00', name: '上野公園', note: '美術館に立ち寄る' }
      ])
    }
  ]);

  const [newPlace, setNewPlace] = useState<NewPlace>({ time: '', name: '', note: '' });
  const [editing, setEditing] = useState<EditingState>({ type: null, id: null, field: null });
  const [editValue, setEditValue] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ isOpen: false, itineraryId: null, placeId: null });

  const startEditing = (type: 'itinerary' | 'place', id: number, field: string, value: string): void => {
    setEditing({ type, id, field });
    setEditValue(value);
  };

  const saveEdit = (itineraryId: number): void => {
    if (editing.type === 'itinerary' && editing.field) {
      setItineraries(itineraries.map(itinerary => {
        if (itinerary.id === itineraryId) {
          return {
            ...itinerary,
            [editing.field as keyof Itinerary]: editValue
          };
        }
        return itinerary;
      }));
    } else if (editing.type === 'place' && editing.field) {
      setItineraries(itineraries.map(itinerary => {
        if (itinerary.id === itineraryId) {
          const updatedPlaces = itinerary.places.map(place => {
            if (place.id === editing.id) {
              return {
                ...place,
                [editing.field as keyof Place]: editValue
              };
            }
            return place;
          });
          return {
            ...itinerary,
            places: sortPlacesByTime(updatedPlaces)
          };
        }
        return itinerary;
      }));
    }
    setEditing({ type: null, id: null, field: null });
  };

  const cancelEdit = (): void => {
    setEditing({ type: null, id: null, field: null });
  };

  const addPlace = (itineraryId: number): void => {
    if (!newPlace.time || !newPlace.name) return;
    
    setItineraries(itineraries.map(itinerary => {
      if (itinerary.id === itineraryId) {
        const updatedPlaces = [...itinerary.places, {
          id: Date.now(),
          ...newPlace
        }];
        return {
          ...itinerary,
          places: sortPlacesByTime(updatedPlaces)
        };
      }
      return itinerary;
    }));
    setNewPlace({ time: '', name: '', note: '' });
  };

  const openDeleteDialog = (itineraryId: number, placeId: number): void => {
    setDeleteDialog({ isOpen: true, itineraryId, placeId });
  };

  const closeDeleteDialog = (): void => {
    setDeleteDialog({ isOpen: false, itineraryId: null, placeId: null });
  };

  const confirmDelete = (): void => {
    const { itineraryId, placeId } = deleteDialog;
    if (itineraryId !== null && placeId !== null) {
      setItineraries(itineraries.map(itinerary => {
        if (itinerary.id === itineraryId) {
          return {
            ...itinerary,
            places: itinerary.places.filter(place => place.id !== placeId)
          };
        }
        return itinerary;
      }));
    }
    closeDeleteDialog();
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">旅のしおり</h1>
      
      {itineraries.map((itinerary) => (
        <ItineraryCard
          key={itinerary.id}
          itinerary={itinerary}
          editing={editing}
          editValue={editValue}
          setEditValue={setEditValue}
          startEditing={startEditing}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          newPlace={newPlace}
          setNewPlace={setNewPlace}
          addPlace={addPlace}
          openDeleteDialog={openDeleteDialog}
        />
      ))}

      <DeleteConfirmDialog 
        isOpen={deleteDialog.isOpen} 
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
};