"use client";

import React from 'react';
import { Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const SharePreview = ({ itinerary }) => {
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

export default SharePreview;