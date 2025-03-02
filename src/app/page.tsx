"use client";

import React, { useState } from 'react';
import { Calendar, Share2, PlusCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface SharePreviewProps {
  itinerary: Itinerary;
}

interface EditableFieldProps {
  type: 'itinerary' | 'place';
  id: number;
  field: string;
  value: string;
  itineraryId: number;
  className?: string;
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

interface NewPlace {
  time: string;
  name: string;
  note: string;
}

const SharePreview: React.FC<SharePreviewProps> = ({ itinerary }) => {
  const getFormattedText = () => `${itinerary.title}
日付: ${itinerary.date}

${itinerary.places.map(place => 
  `${place.time} ${place.name}
${place.note}`
).join('\n\n')}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedText())
      .then(() => alert('しおりをクリップボードにコピーしました！'));
  };

  const shareToLINE = () => {
    const text = getFormattedText();
    const encodedText = encodeURIComponent(text);
    const lineShareUrl = `https://line.me/R/share?text=${encodedText}`;
    window.open(lineShareUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Share2 className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>共有プレビュー</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg font-mono text-sm">
            {getFormattedText()}
          </pre>
        </div>
        <DialogFooter className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            クリップボードにコピー
          </button>
          <button
            onClick={shareToLINE}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            LINEで共有
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TravelPlanner: React.FC = () => {
  const sortPlacesByTime = (places: Place[]): Place[] => {
    return [...places].sort((a, b) => {
      const timeA = a.time.replace(':', '');
      const timeB = b.time.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  };

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
  const [editValue, setEditValue] = useState('');
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

  const cancelEdit = () => {
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

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, itineraryId: null, placeId: null });
  };

  const confirmDelete = () => {
    const { itineraryId, placeId } = deleteDialog;
    setItineraries(itineraries.map(itinerary => {
      if (itinerary.id === itineraryId) {
        return {
          ...itinerary,
          places: itinerary.places.filter(place => place.id !== placeId)
        };
      }
      return itinerary;
    }));
    closeDeleteDialog();
  };

  const EditableField: React.FC<EditableFieldProps> = ({ type, id, field, value, itineraryId, className }) => {
    const isEditing = editing.type === type && editing.id === id && editing.field === field;
    
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

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">旅のしおり</h1>
      
      {itineraries.map((itinerary) => (
        <Card key={itinerary.id} className="mb-4 sm:mb-6">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">
              <EditableField
                type="itinerary"
                id={itinerary.id}
                field="title"
                value={itinerary.title}
                itineraryId={itinerary.id}
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
                />
              </div>
              <SharePreview itinerary={itinerary} />
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {itinerary.places.map(place => (
                <div key={place.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 rounded hover:bg-gray-50">
                  <EditableField
                    type="place"
                    id={place.id}
                    field="time"
                    value={place.time}
                    itineraryId={itinerary.id}
                  />
                  <EditableField
                    type="place"
                    id={place.id}
                    field="name"
                    value={place.name}
                    itineraryId={itinerary.id}
                    className="flex-1 font-medium"
                  />
                  <EditableField
                    type="place"
                    id={place.id}
                    field="note"
                    value={place.note}
                    itineraryId={itinerary.id}
                    className="flex-1 text-gray-600"
                  />
                  <button
                    onClick={() => openDeleteDialog(itinerary.id, place.id)}
                    className="p-1 rounded-full hover:bg-gray-200 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
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
                  onClick={() => addPlace(itinerary.id)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(isOpen) => !isOpen && closeDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>予定を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。本当に削除してよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TravelPlanner;