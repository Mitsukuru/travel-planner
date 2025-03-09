"use client";

import React from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import EditableField from './EditableField';
import SharePreview from './SharePreview';
import PlaceItem from './PlaceItem';
import AddPlaceForm from './AddPlaceForm';

const ItineraryCard = ({ 
  itinerary, 
  editing, 
  editValue, 
  setEditValue, 
  startEditing, 
  saveEdit, 
  cancelEdit, 
  newPlace, 
  setNewPlace, 
  addPlace, 
  openDeleteDialog 
}) => {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle className="text-lg sm:text-xl">
          <EditableField
            type="itinerary"
            id={itinerary.id}
            field="title"
            value={itinerary.title}
            itineraryId={itinerary.id}
            isEditing={editing.type === 'itinerary' && editing.id === itinerary.id && editing.field === 'title'}
            editValue={editValue}
            setEditValue={setEditValue}
            startEditing={startEditing}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
          />
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <EditableField
              type="itinerary"
              id={itinerary.id}
              field="date"
              value={itinerary.date}
              itineraryId={itinerary.id}
              isEditing={editing.type === 'itinerary' && editing.id === itinerary.id && editing.field === 'date'}
              editValue={editValue}
              setEditValue={setEditValue}
              startEditing={startEditing}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
            />
          </div>
          <SharePreview itinerary={itinerary} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {itinerary.places.map(place => (
            <PlaceItem
              key={place.id}
              place={place}
              itineraryId={itinerary.id}
              editing={editing}
              editValue={editValue}
              setEditValue={setEditValue}
              startEditing={startEditing}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              openDeleteDialog={openDeleteDialog}
            />
          ))}
          
          <AddPlaceForm
            newPlace={newPlace}
            setNewPlace={setNewPlace}
            addPlace={addPlace}
            itineraryId={itinerary.id}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ItineraryCard;