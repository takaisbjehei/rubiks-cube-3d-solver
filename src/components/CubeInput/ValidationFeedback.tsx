import React from 'react';
import { ValidationDetail } from '../../types/cube';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface ValidationFeedbackProps {
  validation: ValidationDetail;
  onSolveClick: () => void;
  isSolving?: boolean;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  onSolveClick,
  isSolving = false,
}) => {
  const { isValid, errors, warnings, counts, parityStatus } = validation;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
      {/* Header Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
          <span className="text-sm font-bold text-slate-200">
            {isValid ? 'Cube Configuration Valid' : 'Validation Diagnostic'}
          </span>
        </div>

        <span
          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            isValid
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {isValid ? 'Ready to Solve' : `${errors.length} Issue${errors.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Errors or Success Message */}
      {isValid ? (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex flex-col gap-1">
          <p className="font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            All 54 facelets, corners, edges, and parity equations are 100% physically possible.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2"
            >
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action CTA Button */}
      <button
        onClick={onSolveClick}
        disabled={!isValid || isSolving}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
          isValid && !isSolving
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        {isSolving ? 'Calculating Optimal Solution...' : 'Generate 3D Solution'}
      </button>
    </div>
  );
};
