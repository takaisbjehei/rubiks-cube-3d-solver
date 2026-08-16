import React from 'react';
import { Face, CubeColor, FaceletArray } from '../../types/cube';
import { COLOR_HEX, CENTER_INDICES, FACE_NAMES } from '../../cube/constants';
import { Lock } from 'lucide-react';

interface CubeNetProps {
  facelets: FaceletArray;
  activeColor: CubeColor;
  onStickerClick: (faceletIndex: number) => void;
  onFillFace?: (face: Face, color: CubeColor) => void;
}

export const CubeNet: React.FC<CubeNetProps> = ({
  facelets,
  activeColor,
  onStickerClick,
  onFillFace,
}) => {
  // Render a 3x3 face grid
  const renderFaceGrid = (face: Face, baseIndex: number, label: string) => {
    const centerIdx = CENTER_INDICES[face];

    return (
      <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          {onFillFace && (
            <button
              onClick={() => onFillFace(face, activeColor)}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
              title={`Fill entire ${label} face with selected color`}
            >
              Fill
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-black/60 rounded-lg border border-slate-800">
          {Array.from({ length: 9 }).map((_, i) => {
            const index = baseIndex + i;
            const isCenter = index === centerIdx;
            const color = facelets[index] || 'white';

            return (
              <button
                key={index}
                onClick={() => !isCenter && onStickerClick(index)}
                disabled={isCenter}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-md transition-transform flex items-center justify-center border border-black/30 shadow-sm ${
                  isCenter
                    ? 'cursor-not-allowed ring-1 ring-slate-700'
                    : 'hover:scale-105 active:scale-95 cursor-pointer'
                }`}
                style={{ backgroundColor: COLOR_HEX[color] }}
                title={
                  isCenter
                    ? `Fixed ${label} center sticker (defines orientation)`
                    : `Facelet #${index + 1}`
                }
              >
                {isCenter && (
                  <Lock
                    className={`w-3 h-3 ${
                      color === 'white' || color === 'yellow' ? 'text-slate-800' : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
      {/* Top Face: U */}
      <div className="flex justify-center w-full">
        {renderFaceGrid('U', 0, 'Top (U)')}
      </div>

      {/* Middle Row: L, F, R, B */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-2xl justify-center">
        {renderFaceGrid('L', 36, 'Left (L)')}
        {renderFaceGrid('F', 18, 'Front (F)')}
        {renderFaceGrid('R', 9, 'Right (R)')}
        {renderFaceGrid('B', 45, 'Back (B)')}
      </div>

      {/* Bottom Face: D */}
      <div className="flex justify-center w-full">
        {renderFaceGrid('D', 27, 'Bottom (D)')}
      </div>
    </div>
  );
};
