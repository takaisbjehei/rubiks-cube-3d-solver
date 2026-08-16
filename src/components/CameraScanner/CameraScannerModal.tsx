import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Face, CubeColor, FaceletArray } from '../../types/cube';
import { COLOR_HEX, FACE_NAMES, FACE_BASE_INDICES, CENTER_INDICES } from '../../cube/constants';
import { samplePatch, classifyColor } from './colorDetection';
import { validateCubeState } from '../../cube/validation';
import { soundEffects } from '../../cube/audio';
import {
  Camera,
  X,
  RotateCw,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  SwitchCamera,
  RefreshCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScannedFacelets: (scannedFacelets: FaceletArray) => void;
}

interface FaceScanStep {
  face: Face;
  name: string;
  expectedCenterColor: CubeColor;
  instruction: string;
  orientationTip: string;
}

const SCAN_STEPS: FaceScanStep[] = [
  {
    face: 'U',
    name: 'Top Face (Up)',
    expectedCenterColor: 'white',
    instruction: 'Scan the WHITE face',
    orientationTip: 'Hold the cube with Green facing you, tilt top to camera.',
  },
  {
    face: 'F',
    name: 'Front Face',
    expectedCenterColor: 'green',
    instruction: 'Scan the GREEN face',
    orientationTip: 'Hold with White on top, Green facing camera.',
  },
  {
    face: 'R',
    name: 'Right Face',
    expectedCenterColor: 'red',
    instruction: 'Scan the RED face',
    orientationTip: 'Turn cube left so Red faces camera, White on top.',
  },
  {
    face: 'B',
    name: 'Back Face',
    expectedCenterColor: 'blue',
    instruction: 'Scan the BLUE face',
    orientationTip: 'Turn cube so Blue faces camera, White on top.',
  },
  {
    face: 'L',
    name: 'Left Face',
    expectedCenterColor: 'orange',
    instruction: 'Scan the ORANGE face',
    orientationTip: 'Turn cube so Orange faces camera, White on top.',
  },
  {
    face: 'D',
    name: 'Bottom Face (Down)',
    expectedCenterColor: 'yellow',
    instruction: 'Scan the YELLOW face',
    orientationTip: 'Tilt bottom up to camera with Green facing forward.',
  },
];

const COLOR_CYCLE: CubeColor[] = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyScannedFacelets,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveColors, setLiveColors] = useState<CubeColor[]>(Array(9).fill('white'));
  
  // Scanned facelets array (54 elements initialized to white)
  const [scannedFaces, setScannedFaces] = useState<Record<Face, CubeColor[]>>({
    U: Array(9).fill('white'),
    R: Array(9).fill('red'),
    F: Array(9).fill('green'),
    D: Array(9).fill('yellow'),
    L: Array(9).fill('orange'),
    B: Array(9).fill('blue'),
  });

  const [capturedStatus, setCapturedStatus] = useState<Record<Face, boolean>>({
    U: false,
    R: false,
    F: false,
    D: false,
    L: false,
    B: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    setCameraError(null);

    const startCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera access was denied. Please allow camera permissions in your browser.'
            : 'Could not connect to camera device. Ensure no other application is using it.'
        );
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, facingMode]);

  // Real-time video processing loop
  useEffect(() => {
    if (!isOpen || cameraError) return;

    const processVideoFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          canvas.width = vw;
          canvas.height = vh;

          // Draw current video frame to canvas
          ctx.drawImage(video, 0, 0, vw, vh);

          // Calculate 3x3 grid bounding box in center of viewfinder
          const size = Math.min(vw, vh) * 0.58;
          const startX = (vw - size) / 2;
          const startY = (vh - size) / 2;
          const cellSize = size / 3;

          const detected: CubeColor[] = [];

          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              const centerX = startX + c * cellSize + cellSize / 2;
              const centerY = startY + r * cellSize + cellSize / 2;
              const sample = samplePatch(ctx, centerX, centerY, Math.round(cellSize * 0.15));
              const color = classifyColor(sample);
              detected.push(color);
            }
          }

          setLiveColors(detected);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processVideoFrame);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, cameraError]);

  const currentStep = SCAN_STEPS[currentStepIdx];

  // Capture current face
  const handleCaptureFace = () => {
    soundEffects.playTurn();
    const face = currentStep.face;
    const captured = [...liveColors];

    // Ensure center is locked to expected orientation center color
    captured[4] = currentStep.expectedCenterColor;

    setScannedFaces(prev => ({
      ...prev,
      [face]: captured,
    }));

    setCapturedStatus(prev => ({
      ...prev,
      [face]: true,
    }));

    // Advance to next step if not on last
    if (currentStepIdx < SCAN_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  // Toggle single sticker color manually on thumbnail
  const handleToggleStickerColor = (face: Face, index: number) => {
    if (index === 4) return; // Locked center
    soundEffects.playTurn();
    setScannedFaces(prev => {
      const faceArray = [...prev[face]];
      const curColor = faceArray[index];
      const curIdx = COLOR_CYCLE.indexOf(curColor);
      const nextColor = COLOR_CYCLE[(curIdx + 1) % COLOR_CYCLE.length];
      faceArray[index] = nextColor;
      return {
        ...prev,
        [face]: faceArray,
      };
    });
  };

  // Assemble full 54-facelet array
  const assembleFacelets = (): FaceletArray => {
    return [
      ...scannedFaces.U,
      ...scannedFaces.R,
      ...scannedFaces.F,
      ...scannedFaces.D,
      ...scannedFaces.L,
      ...scannedFaces.B,
    ];
  };

  const fullFacelets = assembleFacelets();
  const validation = validateCubeState(fullFacelets);
  const allCaptured = Object.values(capturedStatus).every(Boolean);

  const handleApplyToSolver = () => {
    onApplyScannedFacelets(fullFacelets);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-6 text-slate-200 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Live AI Camera Cube Scanner
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Computer Vision
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Align each face inside the 3×3 viewfinder grid to capture automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Guide Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl shadow-inner border border-black/30 flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: COLOR_HEX[currentStep.expectedCenterColor] }}
            >
              <span
                className={
                  currentStep.expectedCenterColor === 'white' ||
                  currentStep.expectedCenterColor === 'yellow'
                    ? 'text-black'
                    : 'text-white'
                }
              >
                {currentStep.face}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Step {currentStepIdx + 1} of 6: {currentStep.instruction}
              </h4>
              <p className="text-xs text-blue-300/80">{currentStep.orientationTip}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Switch Camera (Front/Rear)"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
          {cameraError ? (
            <div className="flex flex-col items-center p-6 text-center text-rose-400 gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="text-xs font-semibold max-w-sm">{cameraError}</p>
            </div>
          ) : (
            <>
              {/* Hidden raw video & canvas */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* 3x3 Scanning Alignment Overlay */}
              <div className="relative z-10 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] grid grid-cols-3 gap-2 p-2 rounded-2xl border-2 border-blue-400/80 shadow-[0_0_25px_rgba(59,130,246,0.3)] bg-black/30 backdrop-blur-[2px]">
                {liveColors.map((color, idx) => {
                  const isCenter = idx === 4;
                  return (
                    <div
                      key={idx}
                      className="relative rounded-xl flex items-center justify-center border-2 border-white/80 shadow-md transition-all duration-150"
                      style={{
                        backgroundColor: COLOR_HEX[color],
                        opacity: 0.88,
                      }}
                    >
                      {isCenter && (
                        <span
                          className={`text-xs font-black uppercase ${
                            color === 'white' || color === 'yellow'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        >
                          {currentStep.face}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Viewfinder Target Reticle Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[236px] h-[236px] sm:w-[276px] sm:h-[276px] border-2 border-dashed border-white/50 rounded-3xl" />
              </div>
            </>
          )}
        </div>

        {/* Capture Action Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
            disabled={currentStepIdx <= 0}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev Face
          </button>

          <button
            onClick={handleCaptureFace}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            Capture {currentStep.name}
          </button>

          <button
            onClick={() => setCurrentStepIdx(prev => Math.min(SCAN_STEPS.length - 1, prev + 1))}
            disabled={currentStepIdx >= SCAN_STEPS.length - 1}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            Next Face
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Face Thumbnails Review Strip */}
        <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Scanned Faces ({Object.values(capturedStatus).filter(Boolean).length}/6)
            </span>
            <span className="text-[11px] text-slate-500">Tap any face to jump, tap sticker to change</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SCAN_STEPS.map((step, sIdx) => {
              const isSelected = sIdx === currentStepIdx;
              const isCaptured = capturedStatus[step.face];
              const stickers = scannedFaces[step.face];

              return (
                <div
                  key={step.face}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                      : isCaptured
                      ? 'bg-slate-950/80 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                  onClick={() => setCurrentStepIdx(sIdx)}
                >
                  <span className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    {step.face} Face
                    {isCaptured && <Check className="w-3 h-3 text-emerald-400" />}
                  </span>

                  <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-black rounded border border-slate-800">
                    {stickers.map((col, stIdx) => (
                      <div
                        key={stIdx}
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleStickerColor(step.face, stIdx);
                        }}
                        className="w-3.5 h-3.5 rounded-[2px] border border-black/30 hover:scale-110 transition-transform"
                        style={{ backgroundColor: COLOR_HEX[col] }}
                        title={stIdx === 4 ? 'Locked center' : 'Click to cycle color'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Status & Apply Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            {validation.isValid ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 100% Valid Physically
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                {validation.errors[0] || 'Capture all 6 faces to validate'}
              </span>
            )}
          </div>

          <button
            onClick={handleApplyToSolver}
            disabled={!validation.isValid}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              validation.isValid
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Apply Scanned Cube & Solve
          </button>
        </div>
      </div>
    </div>
  );
};
