import React, { useState } from 'react';
import { ZoomIn, X, Image as ImageIcon } from 'lucide-react';

interface QuestionImageRendererProps {
  imageUrl?: string;
  diagramSvg?: string;
  caption?: string;
  className?: string;
}

export const QuestionImageRenderer: React.FC<QuestionImageRendererProps> = ({
  imageUrl,
  diagramSvg,
  caption,
  className = '',
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!imageUrl && !diagramSvg) return null;

  return (
    <>
      <div className={`my-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs ${className}`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-blue-700">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>รูปภาพประกอบโจทย์ / แผนภาพวิศวกรรม</span>
          </span>
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3 h-3" />
            <span>ขยายภาพ</span>
          </button>
        </div>

        <div
          onClick={() => setIsZoomed(true)}
          className="cursor-pointer group flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-slate-100 min-h-[140px] hover:border-blue-300 transition-all"
        >
          {diagramSvg ? (
            <div
              className="w-full max-w-xl mx-auto flex items-center justify-center py-2 transition-transform group-hover:scale-[1.01]"
              dangerouslySetInnerHTML={{ __html: diagramSvg }}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={caption || 'Question Diagram'}
              className="max-h-72 w-auto object-contain rounded-lg transition-transform group-hover:scale-[1.01]"
            />
          ) : null}
        </div>

        {caption && (
          <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
            {caption}
          </p>
        )}
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>แผนภาพประกอบโจทย์ (ขนาดใหญ่)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full py-4 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100">
              {diagramSvg ? (
                <div
                  className="w-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: diagramSvg }}
                />
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={caption || 'Zoomed Diagram'}
                  className="max-h-[65vh] w-auto object-contain rounded-xl"
                />
              ) : null}
            </div>

            {caption && (
              <p className="text-xs text-center text-slate-600 font-medium">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
