import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { FaceletArray, NotationMove, Face, CubeColor, ViewPreset } from '../../types/cube';
import { CubeRenderer } from './CubeRenderer';
import { soundEffects } from '../../cube/audio';
import { RotateCw, ZoomIn, ZoomOut, Eye, Compass, RefreshCw } from 'lucide-react';

interface CubeCanvasProps {
  facelets: FaceletArray;
  onMoveExecuted?: (move: NotationMove) => void;
  onFaceletClicked?: (faceletIndex: number) => void;
  activeFaceHighlight?: Face | null;
  activeMoveArrow?: NotationMove | null;
  isPaintingMode?: boolean;
  activePaintColor?: CubeColor;
  animationSpeed?: number; // 0.25 to 2.0 or 0 for instant
  triggerMoveRef?: React.MutableRefObject<((move: NotationMove, speed?: number) => Promise<void>) | null>;
  resetViewTrigger?: number;
}

export const CubeCanvas: React.FC<CubeCanvasProps> = ({
  facelets,
  onMoveExecuted,
  onFaceletClicked,
  activeFaceHighlight = null,
  activeMoveArrow = null,
  isPaintingMode = false,
  activePaintColor = 'white',
  animationSpeed = 1.0,
  triggerMoveRef,
  resetViewTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CubeRenderer | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const glRendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Interaction & camera orbit state
  const isDraggingRef = useRef(false);
  const isStickerDragRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startStickerRef = useRef<{ faceletIndex: number; face: Face; screenX: number; screenY: number } | null>(null);

  // Camera spherical angles
  const cameraDistanceRef = useRef(6.8);
  const cameraThetaRef = useRef(Math.PI / 4.2); // azimuth
  const cameraPhiRef = useRef(Math.PI / 3.4);   // polar angle

  const [currentPreset, setCurrentPreset] = useState<ViewPreset>('default');

  // Animation move queue
  const isBusyAnimatingRef = useRef(false);
  const moveQueueRef = useRef<{ move: NotationMove; speedMs: number; resolve: () => void }[]>([]);

  const processQueue = useCallback(() => {
    if (isBusyAnimatingRef.current || moveQueueRef.current.length === 0 || !rendererRef.current) return;
    isBusyAnimatingRef.current = true;
    const item = moveQueueRef.current.shift()!;
    const isDouble = item.move.includes('2');
    const isPrime = item.move.includes('\'');
    soundEffects.playTurn(isDouble, isPrime);

    rendererRef.current.animateMove(item.move, item.speedMs, () => {
      isBusyAnimatingRef.current = false;
      item.resolve();
      processQueue();
    });
  }, []);

  const queueMove = useCallback((move: NotationMove, speedMultiplier: number = 1.0): Promise<void> => {
    return new Promise(resolve => {
      const baseDuration = 220;
      const durationMs = speedMultiplier <= 0 ? 0 : Math.round(baseDuration / speedMultiplier);
      moveQueueRef.current.push({ move, speedMs: durationMs, resolve });
      processQueue();
    });
  }, [processQueue]);

  if (triggerMoveRef) {
    triggerMoveRef.current = queueMove;
  }

  // Update camera position from spherical angles
  const updateCameraTransform = useCallback(() => {
    if (!cameraRef.current) return;
    const phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhiRef.current));
    const theta = cameraThetaRef.current;
    const r = cameraDistanceRef.current;

    cameraRef.current.position.x = r * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = r * Math.cos(phi);
    cameraRef.current.position.z = r * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Set Camera Preset
  const setCameraPreset = useCallback((preset: ViewPreset) => {
    setCurrentPreset(preset);
    switch (preset) {
      case 'default':
        cameraThetaRef.current = Math.PI / 4.2;
        cameraPhiRef.current = Math.PI / 3.4;
        cameraDistanceRef.current = 6.8;
        break;
      case 'front':
        cameraThetaRef.current = 0;
        cameraPhiRef.current = Math.PI / 2;
        cameraDistanceRef.current = 6.5;
        break;
      case 'top':
        cameraThetaRef.current = 0;
        cameraPhiRef.current = 0.12;
        cameraDistanceRef.current = 6.5;
        break;
      case 'right':
        cameraThetaRef.current = Math.PI / 2;
        cameraPhiRef.current = Math.PI / 2;
        cameraDistanceRef.current = 6.5;
        break;
      case 'left':
        cameraThetaRef.current = -Math.PI / 2;
        cameraPhiRef.current = Math.PI / 2;
        cameraDistanceRef.current = 6.5;
        break;
      case 'back':
        cameraThetaRef.current = Math.PI;
        cameraPhiRef.current = Math.PI / 2;
        cameraDistanceRef.current = 6.5;
        break;
      case 'bottom':
        cameraThetaRef.current = 0;
        cameraPhiRef.current = Math.PI - 0.12;
        cameraDistanceRef.current = 6.5;
        break;
    }
    updateCameraTransform();
  }, [updateCameraTransform]);

  useEffect(() => {
    setCameraPreset('default');
  }, [resetViewTrigger, setCameraPreset]);

  // Initial WebGL Three.js Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    threeSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraTransform();

    const glRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    glRenderer.setSize(width, height);
    glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    glRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    glRenderer.toneMappingExposure = 1.15;
    glRenderer.shadowMap.enabled = true;
    glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    glRendererRef.current = glRenderer;

    container.innerHTML = '';
    container.appendChild(glRenderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    // Key Light (top right front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (bottom left back)
    const fillLight = new THREE.DirectionalLight(0x90b0e0, 1.1);
    fillLight.position.set(-6, -4, -5);
    scene.add(fillLight);

    // Rim Light (back top)
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    // Build speedcube
    const cubeRenderer = new CubeRenderer(scene);
    rendererRef.current = cubeRenderer;
    cubeRenderer.updateStickersFromFacelets(facelets);

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      glRenderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const updateSize = () => {
      if (!container || !camera || !glRenderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 520;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        glRenderer.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
      cubeRenderer.dispose();
      glRenderer.dispose();
      if (container.contains(glRenderer.domElement)) {
        container.removeChild(glRenderer.domElement);
      }
    };
  }, []); // Run once on mount

  // Sync state changes with 3D cube
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateStickersFromFacelets(facelets);
    }
  }, [facelets]);

  // Sync active face highlight
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.highlightFace(activeFaceHighlight);
    }
  }, [activeFaceHighlight]);

  // Sync 3D curved arrow overlay
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.showMoveArrow(activeMoveArrow);
    }
  }, [activeMoveArrow]);

  // Raycasting helper
  const getIntersectedSticker = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = rendererRef.current.stickers.map(s => s.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      return rendererRef.current.stickers.find(s => s.mesh === hitMesh) || null;
    }
    return null;
  };

  // Determine gesture turn from drag on a face
  const calculateGestureTurn = (
    face: Face,
    deltaX: number,
    deltaY: number
  ): NotationMove | null => {
    const threshold = 22;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < threshold && absY < threshold) return null;

    // Based on the face and drag direction:
    if (face === 'F') {
      if (absX > absY) {
        return deltaX > 0 ? 'U\'' : 'U';
      } else {
        return deltaY > 0 ? 'R' : 'R\'';
      }
    } else if (face === 'U') {
      if (absX > absY) {
        return deltaX > 0 ? 'F\'' : 'F';
      } else {
        return deltaY > 0 ? 'R' : 'R\'';
      }
    } else if (face === 'R') {
      if (absX > absY) {
        return deltaX > 0 ? 'B\'' : 'B';
      } else {
        return deltaY > 0 ? 'F' : 'F\'';
      }
    } else if (face === 'L') {
      if (absX > absY) {
        return deltaX > 0 ? 'F\'' : 'F';
      } else {
        return deltaY > 0 ? 'B' : 'B\'';
      }
    } else if (face === 'D') {
      if (absX > absY) {
        return deltaX > 0 ? 'F' : 'F\'';
      } else {
        return deltaY > 0 ? 'R\'' : 'R';
      }
    } else if (face === 'B') {
      if (absX > absY) {
        return deltaX > 0 ? 'U' : 'U\'';
      } else {
        return deltaY > 0 ? 'L' : 'L\'';
      }
    }

    return null;
  };

  // Mouse & Touch Event Handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    lastMousePosRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = true;

    const hit = getIntersectedSticker(e);

    if (hit && isPaintingMode) {
      // Painting directly on 3D cube
      onFaceletClicked?.(hit.faceletIndex);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const deltaX = clientX - lastMousePosRef.current.x;
    const deltaY = clientY - lastMousePosRef.current.y;

    lastMousePosRef.current = { x: clientX, y: clientY };

    // Smooth Orbit Controls to freely inspect all sides of the 3D cube
    const rotSpeed = 0.007;
    cameraThetaRef.current -= deltaX * rotSpeed;
    cameraPhiRef.current -= deltaY * rotSpeed;
    updateCameraTransform();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.003;
    cameraDistanceRef.current = Math.max(4.5, Math.min(11.0, cameraDistanceRef.current + e.deltaY * zoomSpeed));
    updateCameraTransform();
  };

  const handleZoom = (delta: number) => {
    cameraDistanceRef.current = Math.max(4.5, Math.min(11.0, cameraDistanceRef.current + delta));
    updateCameraTransform();
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[580px] min-h-[380px] select-none overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1320] via-[#090d16] to-[#06080e] border border-slate-800/80 shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating View Presets & Zoom Toolbars */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setCameraPreset('default')}
          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
            currentPreset === 'default'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="3D Isometric View"
        >
          <Compass className="w-3.5 h-3.5 inline mr-1" />
          3D
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
            currentPreset === 'front' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Front (F)
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
            currentPreset === 'top' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Top (U)
        </button>
        <button
          onClick={() => setCameraPreset('right')}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
            currentPreset === 'right' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Right (R)
        </button>
        <button
          onClick={() => setCameraPreset('back')}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
            currentPreset === 'back' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Back (B)
        </button>
      </div>

      {/* Floating Zoom & Reset View on Right */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
        <button
          onClick={() => handleZoom(-0.8)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-700/60 my-0.5" />
        <button
          onClick={() => setCameraPreset('default')}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset Camera View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800/80 text-[11px] text-slate-400 font-medium tracking-wide">
        <span>Drag to rotate</span>
        <span className="text-slate-600">•</span>
        <span>Swipe face to turn</span>
        <span className="text-slate-600">•</span>
        <span>Scroll to zoom</span>
      </div>
    </div>
  );
};
