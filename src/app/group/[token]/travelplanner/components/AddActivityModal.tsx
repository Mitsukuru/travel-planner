import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { INSERT_ACTIVITIES } from "@/graphql/mutates";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary_id: number;
  defaultDate?: string;
}

const typeOptions = [
  { label: "交通", value: "transport" },
  { label: "観光スポット", value: "sightseeing" },
  { label: "飲食店", value: "restaurant" },
  { label: "ホテル", value: "hotel" },
  { label: "アクティビティ", value: "activity" },
  { label: "エリア", value: "area" },
];

const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, itinerary_id, defaultDate }) => {
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState(typeOptions[0].value);

  const [insertActivity] = useMutation(INSERT_ACTIVITIES);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await insertActivity({
        variables: {
          itinerary_id,
          date,
          time,
          location,
          name,
          notes,
          type,
        },
      });
      onClose();
      setDate(defaultDate || "");
      setTime("");
      setLocation("");
      setName("");
      setNotes("");
      setType(typeOptions[0].value);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">アクティビティを追加</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">日付</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">時間</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">場所</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">タイトル</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">説明</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">タイプ</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={type}
              onChange={e => setType(e.target.value)}
              required
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 text-gray-700"
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white font-bold"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivityModal; 