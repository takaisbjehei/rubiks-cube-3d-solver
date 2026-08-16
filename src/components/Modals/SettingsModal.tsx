import React from 'react';
import { X, Settings as SettingsIcon, Volume2, VolumeX, Gauge, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../cube/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  soundVolume: number;
  onChangeVolume: (vol: number) => void;
  defaultSpeed: number;
  onChangeDefaultSpeed: (speed: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  soundVolume,
  onChangeVolume,
  defaultSpeed,
  onChangeDefaultSpeed,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Application Settings</h3>
              <p className="text-xs text-slate-400">Preferences & Audio configuration</p>
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
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <h5 className="text-xs font-bold text-slate-200">Speedcube Audio Effects</h5>
                <p className="text-[11px] text-slate-400">Crisp mechanical turn clicks & solved chime</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                onToggleSound(next);
                soundEffects.setEnabled(next);
                if (next) soundEffects.playTurn();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {soundEnabled && (
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Volume</span>
                <span className="font-mono text-slate-400">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  onChangeVolume(val);
                  soundEffects.setVolume(val);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          {/* Default Animation Speed */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-blue-400" />
                Default Animation Speed
              </span>
              <span className="font-mono text-blue-400 font-bold">{defaultSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[0.5, 1.0, 1.5, 2.0].map(spd => (
                <button
                  key={spd}
                  onClick={() => onChangeDefaultSpeed(spd)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    defaultSpeed === spd
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
