import React from 'react';
import { X, BookOpen, RotateCw, RotateCcw, Compass, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const NOTATIONS = [
    { move: 'U', name: 'Up (Top)', desc: 'Turn top face clockwise 90°' },
    { move: 'U\'', name: 'Up Prime', desc: 'Turn top face counter-clockwise 90°' },
    { move: 'U2', name: 'Up Double', desc: 'Turn top face 180° (half turn)' },
    { move: 'D', name: 'Down (Bottom)', desc: 'Turn bottom face clockwise 90°' },
    { move: 'R', name: 'Right', desc: 'Turn right face clockwise 90°' },
    { move: 'L', name: 'Left', desc: 'Turn left face clockwise 90°' },
    { move: 'F', name: 'Front', desc: 'Turn front face clockwise 90°' },
    { move: 'B', name: 'Back', desc: 'Turn back face clockwise 90°' },
    { move: 'M', name: 'Middle Slice', desc: 'Turn slice between L and R (follows L direction)' },
    { move: 'E', name: 'Equator Slice', desc: 'Turn slice between U and D (follows D direction)' },
    { move: 'S', name: 'Standing Slice', desc: 'Turn slice between F and B (follows F direction)' },
    { move: 'x, y, z', name: 'Cube Rotations', desc: 'Rotate the entire cube around X, Y, or Z axes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Rubik's Cube Guide & Notation</h3>
              <p className="text-xs text-slate-400">Standard Singmaster 3×3 puzzle notation reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 mt-5">
          {/* Orientation Tip */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-3">
            <Compass className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-300">
              <strong className="text-blue-300 block mb-1">Standard Orientation Convention:</strong>
              Hold your cube with <span className="text-emerald-400 font-semibold">Green in Front (F)</span> and{' '}
              <span className="text-white font-semibold">White on Top (U)</span>. The right side is Red (R), left side is Orange (L), bottom is Yellow (D), and back is Blue (B).
            </div>
          </div>

          {/* Notation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {NOTATIONS.map(item => (
              <div
                key={item.move}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-base text-blue-300 shrink-0">
                  {item.move}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">{item.name}</h5>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Keyboard Controls */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">U, D, L, R, F, B</kbd> : Clockwise Turn</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">Shift + [Key]</kbd> : Counter-Clockwise (')</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">Spacebar</kbd> : Play / Pause / Timer</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">← / →</kbd> : Step Backward / Forward</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">S</kbd> : Random Scramble</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-blue-300">Ctrl + Z</kbd> : Undo Move</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            Got it, Let's Solve!
          </button>
        </div>
      </div>
    </div>
  );
};
