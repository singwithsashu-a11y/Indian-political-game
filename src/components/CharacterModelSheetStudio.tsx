import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ALL_FIGHTKARO_CHARACTER_SPECS,
  CHARACTER_MODEL_SHEETS,
  CharacterModelSheetSpec,
  FIGHTKARO_ROSTER_ENTRIES,
  MANDATORY_TEN_VIEWS,
  MBAPU_BOSS_STATS_TABLE,
  ModelSheetViewId,
  OrthographicViewSpec,
  StudioMaterialMode,
  validateModelSheetConsistency,
} from '../game/modelSheetSpec';
import {
  loadFightKaroGlb,
  renderTenViewsForGlb,
} from '../game/glbStudioRenderer';
import {
  POLITICAL_SCENE_AUDIO_CATALOG,
  PoliticalAudioSceneItem,
  sound,
} from '../game/sound';
import {
  Box,
  CheckCircle2,
  Eye,
  Filter,
  Layers,
  Maximize2,
  Music,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Swords,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LiveGlbTurntableProps {
  glbUrl: string;
  materialMode: StudioMaterialMode;
  initialYawDeg?: number;
  initialClip?: string;
}

const LiveGlbTurntable: React.FC<LiveGlbTurntableProps> = ({
  glbUrl,
  materialMode,
  initialYawDeg = 25,
  initialClip = 'guardbounce',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [animNames, setAnimNames] = useState<string[]>([]);
  const [activeClip, setActiveClip] = useState<string>(initialClip);
  const [yawDeg, setYawDeg] = useState<number>(initialYawDeg);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [headCloseup, setHeadCloseup] = useState<boolean>(false);
  const [triCount, setTriCount] = useState<number>(0);

  const stateRef = useRef({
    yawDeg: initialYawDeg,
    autoRotate: true,
    headCloseup: false,
    activeClip: initialClip,
    materialMode,
  });

  useEffect(() => {
    setActiveClip(initialClip);
    stateRef.current.activeClip = initialClip;
  }, [initialClip]);

  useEffect(() => {
    stateRef.current.yawDeg = yawDeg;
    stateRef.current.autoRotate = autoRotate;
    stateRef.current.headCloseup = headCloseup;
    stateRef.current.activeClip = activeClip;
    stateRef.current.materialMode = materialMode;
  }, [yawDeg, autoRotate, headCloseup, activeClip, materialMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;

    const width = container.clientWidth || 420;
    const height = container.clientHeight || 360;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe5e7eb);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xfffbeb, 1.8);
    key.position.set(2.5, 4.2, 3.8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe0f2fe, 0.95);
    fill.position.set(-3.0, 2.2, 2.5);
    scene.add(fill);

    const ped = new THREE.Mesh(
      new THREE.CircleGeometry(0.68, 48),
      new THREE.MeshBasicMaterial({ color: 0xcbd5e1 })
    );
    ped.rotation.x = -Math.PI / 2;
    scene.add(ped);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 50);
    let modelGroup: THREE.Object3D | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let clips: THREE.AnimationClip[] = [];
    let currentPlayingClip = '';
    let charBox = new THREE.Box3();

    loadFightKaroGlb(glbUrl)
      .then((asset) => {
        if (disposed) return;
        const cloned = SkeletonUtils.clone(asset.gltf.scene);
        modelGroup = cloned;
        scene.add(cloned);
        clips = asset.animations;
        const names = clips.map((c) => c.name);
        setAnimNames(names);
        setTriCount(asset.triangleCount);

        mixer = new THREE.AnimationMixer(cloned);
        const defaultClip =
          clips.find((c) => c.name === stateRef.current.activeClip) ||
          clips.find((c) => c.name === 'guardbounce') ||
          clips[0];
        if (defaultClip) {
          currentPlayingClip = defaultClip.name;
          setActiveClip(defaultClip.name);
          mixer.clipAction(defaultClip).play();
        }

        cloned.updateMatrixWorld(true);
        charBox = new THREE.Box3().setFromObject(cloned);
        const center = new THREE.Vector3();
        charBox.getCenter(center);
        ped.position.set(center.x, charBox.min.y + 0.002, center.z);
      })
      .catch(() => {});

    let lastTime = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (modelGroup && mixer) {
        if (
          stateRef.current.activeClip &&
          stateRef.current.activeClip !== currentPlayingClip
        ) {
          const nextClip = clips.find(
            (c) => c.name === stateRef.current.activeClip
          );
          if (nextClip) {
            mixer.stopAllAction();
            mixer.clipAction(nextClip).reset().play();
            currentPlayingClip = nextClip.name;
          }
        }

        mixer.update(dt);

        if (stateRef.current.autoRotate) {
          stateRef.current.yawDeg = (stateRef.current.yawDeg + dt * 32) % 360;
        }
        modelGroup.rotation.y = THREE.MathUtils.degToRad(
          stateRef.current.yawDeg
        );

        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        charBox.getSize(size);
        charBox.getCenter(center);

        const cW = container.clientWidth || 420;
        const cH = container.clientHeight || 360;
        const aspect = cW / cH;

        let targetY = center.y;
        let halfH = Math.max(size.y * 0.64, 0.9);
        if (stateRef.current.headCloseup) {
          targetY = charBox.max.y - size.y * 0.14;
          halfH = Math.max(size.y * 0.19, 0.25);
        }

        camera.left = -halfH * aspect;
        camera.right = halfH * aspect;
        camera.top = halfH;
        camera.bottom = -halfH;
        camera.position.set(center.x, targetY, center.z + 6);
        camera.lookAt(center.x, targetY, center.z);
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      renderer.dispose();
    };
  }, [glbUrl]);

  return (
    <div className="bg-[#D4D8DF] border border-slate-300 rounded-lg p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-bold uppercase">
            LIVE THREE.JS GLB RIG ({glbUrl})
          </span>
          {triCount > 0 && (
            <span className="font-mono text-[10px] text-slate-700 font-bold">
              {triCount.toLocaleString()} TRIS · {animNames.length} CLIPS
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition ${
              autoRotate
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {autoRotate ? '360° TURNTABLE: ON' : '360° TURNTABLE: OFF'}
          </button>
          <button
            type="button"
            onClick={() => setHeadCloseup((v) => !v)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition ${
              headCloseup
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {headCloseup ? 'HEAD CLOSEUP' : 'FULL BODY'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        <div
          ref={mountRef}
          className="lg:col-span-5 h-[280px] w-full rounded border border-slate-300 bg-[#E5E7EB] overflow-hidden"
        />
        <div className="lg:col-span-7 space-y-2.5">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1">
              Orthographic Camera Angle ({Math.round(yawDeg)}°)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Front (0°)', deg: 0 },
                { label: '3/4 View (35°)', deg: 35 },
                { label: 'Side (90°)', deg: 90 },
                { label: 'Back (180°)', deg: 180 },
                { label: 'Left Side (270°)', deg: 270 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setAutoRotate(false);
                    setYawDeg(preset.deg);
                  }}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-300 font-mono text-[10px] font-bold transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1">
              Embedded FightKaro Skeletal Animations ({animNames.length} clips in {glbUrl})
            </div>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pr-1">
              {animNames.map((clipName) => (
                <button
                  key={clipName}
                  type="button"
                  onClick={() => setActiveClip(clipName)}
                  className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition flex items-center gap-1 ${
                    activeClip === clipName
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                >
                  <Play className="w-2.5 h-2.5" />
                  {clipName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CharacterSectionProps {
  character: CharacterModelSheetSpec;
  slotIndex: number;
  materialMode: StudioMaterialMode;
  showGridOverlay: boolean;
  onChangeSlotFighter: (slotIndex: number, fighterId: string) => void;
  onInspectModal: (
    character: CharacterModelSheetSpec,
    view: OrthographicViewSpec,
    snapshotUrl?: string
  ) => void;
}

const CharacterModelSheetSection: React.FC<CharacterSectionProps> = ({
  character,
  slotIndex,
  materialMode,
  showGridOverlay,
  onChangeSlotFighter,
  onInspectModal,
}) => {
  const [snapshots, setSnapshots] = useState<Record<ModelSheetViewId, string>>(
    {} as Record<ModelSheetViewId, string>
  );
  const [loadingGlb, setLoadingGlb] = useState<boolean>(true);
  const [meshList, setMeshList] = useState<string[]>(
    character.sculptSpecs.glbMeshGroups
  );
  const [animList, setAnimList] = useState<string[]>(
    character.sculptSpecs.glbAnimations
  );
  const [actualTris, setActualTris] = useState<number>(
    character.sculptSpecs.triCountBudget
  );
  const [showLiveTurntable, setShowLiveTurntable] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingGlb(true);
    renderTenViewsForGlb(character.glbUrl, materialMode, MANDATORY_TEN_VIEWS)
      .then((res) => {
        if (cancelled) return;
        setSnapshots(res.snapshots);
        if (res.meshNames.length > 0) setMeshList(res.meshNames);
        if (res.animationNames.length > 0) setAnimList(res.animationNames);
        if (res.triangleCount > 0) setActualTris(res.triangleCount);
        setLoadingGlb(false);
      })
      .catch(() => {
        if (!cancelled) setLoadingGlb(false);
      });
    return () => {
      cancelled = true;
    };
  }, [character.glbUrl, materialMode]);

  const turnaroundViews = MANDATORY_TEN_VIEWS.filter((v) => v.index <= 5);
  const poseAndExpressionViews = MANDATORY_TEN_VIEWS.filter((v) => v.index >= 6);

  const handlePanelClick = (view: OrthographicViewSpec, snap?: string) => {
    // Also play matching voice/meme audio for pose & expression views!
    if (view.id === 'victory_pose' || view.id === 'fighting_stance') {
      sound.playCharacterSuperVoice(character.fighterId);
    } else if (view.id === 'expr_angry') {
      sound.playMp3('/audio/memes/rom_rom_bhaiyo.mp3', 0.9, true);
    } else if (view.id === 'expr_laughing') {
      sound.playMp3('/audio/memes/waah_kya_scene_hai.mp3', 0.9, true);
    } else if (view.id === 'expr_shocked') {
      sound.playMp3('/audio/memes/aayein.mp3', 0.9, true);
    } else {
      sound.playFighterMemeClip(character.fighterId);
    }
    onInspectModal(character, view, snap);
  };

  const renderPanelCard = (view: OrthographicViewSpec) => {
    const snap = snapshots[view.id];
    const badgeColor =
      view.category === 'turnaround'
        ? 'bg-slate-800 text-white'
        : view.category === 'pose'
        ? 'bg-amber-700 text-white'
        : 'bg-indigo-800 text-white';

    return (
      <div
        key={view.id}
        data-testid={`sheet-panel-${character.fighterId}-${view.id}`}
        onClick={() => handlePanelClick(view, snap)}
        className="group relative flex flex-col rounded-md border border-slate-300 bg-[#E5E7EB] overflow-hidden shadow-xs hover:border-slate-600 transition cursor-pointer"
      >
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#D5D9E0] border-b border-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${badgeColor}`}
            >
              {String(view.index).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-900 truncate">
              {view.title.replace(/^\d+\.\s*/, '')}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Volume2 className="w-3 h-3 text-amber-700 opacity-75 group-hover:opacity-100" />
            <Maximize2 className="w-3 h-3 text-slate-600 opacity-60 group-hover:opacity-100" />
          </div>
        </div>

        <div className="relative w-full aspect-[5/6] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
          {snap ? (
            <img
              src={snap}
              alt={`${character.name} - ${view.title}`}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-600 p-4 text-center">
              <div className="w-6 h-6 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-[10px] font-bold uppercase">
                Rendering 3D GLB ({character.glbUrl})...
              </span>
            </div>
          )}

          {showGridOverlay && (
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}
        </div>

        <div className="px-2.5 py-1.5 bg-[#DCE0E6] border-t border-slate-300 flex items-center justify-between text-[9px] font-mono text-slate-700">
          <span className="font-bold">{view.shortLabel}</span>
          <span className="uppercase text-slate-600">
            {view.cameraType === 'orthographic_head_closeup'
              ? 'HEAD ORTHO + AUDIO'
              : `YAW ${view.yawDegrees}°`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section
      data-testid={`character-section-${character.fighterId}`}
      className="rounded-xl border-2 border-slate-400 bg-[#E5E7EB] text-slate-900 shadow-md overflow-hidden"
    >
      {/* Top Character Sheet Banner */}
      <div className="bg-[#D0D5DD] border-b-2 border-slate-400 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="w-14 h-14 rounded-lg object-cover border-2 border-slate-800 bg-slate-900 shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                {character.slotNumber}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-700/40 text-slate-900 font-mono text-[10px] font-bold">
                3D ASSET: {character.glbUrl}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono text-[10px] font-bold">
                {character.teamName} · SUPER: {character.superMove}
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-slate-950 uppercase mt-0.5">
              {character.name}{' '}
              <span className="text-sm font-sans font-semibold text-slate-700 normal-case">
                — {character.parodyTitle}
              </span>
            </h2>
          </div>
        </div>

        {/* Audio Triggers + Switch Character in this Sheet Slot + Toggle Live 3D Turntable */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => sound.playCharacterSuperVoice(character.fighterId)}
            className="px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono text-xs font-bold border border-amber-700 transition flex items-center gap-1.5 shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Super Voice (.mp3)
          </button>

          <button
            type="button"
            onClick={() => sound.playFighterMemeClip(character.fighterId)}
            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-900 transition flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5" />
            Meme Dialogue
          </button>

          <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded border border-slate-300 text-xs font-mono font-bold text-slate-800">
            <span>Swap 3D Model:</span>
            <select
              value={character.fighterId}
              onChange={(e) => onChangeSlotFighter(slotIndex, e.target.value)}
              className="bg-transparent font-bold text-slate-950 focus:outline-none cursor-pointer"
            >
              {Object.values(ALL_FIGHTKARO_CHARACTER_SPECS).map((spec) => (
                <option key={spec.fighterId} value={spec.fighterId}>
                  {spec.name} ({spec.glbUrl})
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setShowLiveTurntable((v) => !v)}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold border transition flex items-center gap-1.5 ${
              showLiveTurntable
                ? 'bg-slate-900 text-amber-400 border-slate-900'
                : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {showLiveTurntable ? 'Hide Live 3D Rig' : 'Interactive 3D Turntable'}
          </button>
        </div>
      </div>

      {/* Optional Live Interactive Three.js GLB Turntable */}
      {showLiveTurntable && (
        <div className="p-4 bg-[#DCE0E6] border-b border-slate-300">
          <LiveGlbTurntable
            glbUrl={character.glbUrl}
            materialMode={materialMode}
          />
        </div>
      )}

      {/* 10 Mandatory Orthographic Views Grid (Rendered from real .glb 3D mesh) */}
      <div className="p-4 space-y-3 bg-[#E5E7EB]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-700 border-b border-slate-300 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Box className="w-4 h-4 text-amber-700" />
            <span>
              10 ORTHOGRAPHIC 3D GLB REFERENCE VIEWS · CLICK ANY VIEW TO PLAY SCENE AUDIO & INSPECT 3D RIG
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>
              TRIANGLES: <strong>{actualTris.toLocaleString()}</strong>
            </span>
            <span>
              MESH GROUPS: <strong>{meshList.length}</strong>
            </span>
            <span>
              RIG CLIPS: <strong>{animList.length}</strong>
            </span>
            {loadingGlb && (
              <span className="text-amber-800 font-bold animate-pulse">
                Baking 3D Orthographic Views...
              </span>
            )}
          </div>
        </div>

        {/* Row 1: Views 01 to 05 (Front, Side, Back, 3/4, Neutral Standing Pose) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {turnaroundViews.map(renderPanelCard)}
        </div>

        {/* Row 2: Views 06 to 10 (Fighting Stance, Victory Pose, Angry, Laughing, Shocked) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {poseAndExpressionViews.map(renderPanelCard)}
        </div>
      </div>

      {/* Footer Specs: GLB Sub-Meshes, Proportions & Clothing Details */}
      <div className="bg-[#D5D9E0] border-t border-slate-300 px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-800">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase text-slate-600 mb-1">
            Front / Side / Back Clothing & Anatomy
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong>Front:</strong> {character.anatomyAndGarments.frontDetails}{' '}
            <strong>Side:</strong> {character.anatomyAndGarments.sideDetails}{' '}
            <strong>Back:</strong> {character.anatomyAndGarments.backDetails}
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase text-slate-600 mb-1">
            Face, Hairstyle, Hands & Footwear
          </div>
          <p className="text-[11px] leading-relaxed">
            <strong>Face & Hair:</strong> {character.anatomyAndGarments.hairstyle}{' '}
            <strong>Hands/Feet:</strong> {character.anatomyAndGarments.handsAndFeet}
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase text-slate-600 mb-1">
            Official {character.glbUrl} Sub-Meshes
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {meshList.map((m) => (
              <span
                key={m}
                className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold text-slate-800"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface CharacterModelSheetStudioProps {
  onSelectFighterForMatch?: (fighterId: string) => void;
}

export const CharacterModelSheetStudio: React.FC<
  CharacterModelSheetStudioProps
> = ({ onSelectFighterForMatch }) => {
  // 3 Character Slots on the Model Sheet (defaulting to MitraMan, Yatra Boy, Dozer Dada)
  const [slotFighterIds, setSlotFighterIds] = useState<[string, string, string]>([
    'vikas',
    'yatra',
    'yogi',
  ]);
  const [materialMode, setMaterialMode] =
    useState<StudioMaterialMode>('cartoon_pbr');
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);

  // Scene & Viral Political Audio Soundboard State
  const [sceneCategoryFilter, setSceneCategoryFilter] = useState<
    'all' | 'viral_meme' | 'character_super' | 'stage_scene'
  >('all');
  const [activeScene, setActiveScene] = useState<PoliticalAudioSceneItem>(
    POLITICAL_SCENE_AUDIO_CATALOG[0]
  );
  const [playingSceneId, setPlayingSceneId] = useState<string | null>(null);

  // Fight Karo Characters Roster Filter & Sort (matching https://fightfightkaro.com/characters/)
  const [rosterFilter, setRosterFilter] = useState<'all' | 'boss' | 'selectable'>(
    'all'
  );
  const [rosterSort, setRosterSort] = useState<
    'game_order' | 'name_az' | 'status_group'
  >('game_order');

  // Modal state for high-res orthographic inspection
  const [modalData, setModalData] = useState<{
    character: CharacterModelSheetSpec;
    view: OrthographicViewSpec;
    snapshotUrl?: string;
  } | null>(null);

  const activeThreeCharacters: CharacterModelSheetSpec[] = useMemo(() => {
    const slots: ('CHARACTER 01' | 'CHARACTER 02' | 'CHARACTER 03')[] = [
      'CHARACTER 01',
      'CHARACTER 02',
      'CHARACTER 03',
    ];
    return slotFighterIds.map((id, idx) => {
      const spec =
        ALL_FIGHTKARO_CHARACTER_SPECS[id] || ALL_FIGHTKARO_CHARACTER_SPECS.vikas;
      return {
        slotNumber: slots[idx],
        ...spec,
      };
    });
  }, [slotFighterIds]);

  const validation = useMemo(
    () =>
      validateModelSheetConsistency(
        CHARACTER_MODEL_SHEETS,
        MANDATORY_TEN_VIEWS
      ),
    []
  );

  const filteredScenes = useMemo(() => {
    if (sceneCategoryFilter === 'all') return POLITICAL_SCENE_AUDIO_CATALOG;
    return POLITICAL_SCENE_AUDIO_CATALOG.filter(
      (s) => s.category === sceneCategoryFilter
    );
  }, [sceneCategoryFilter]);

  const filteredAndSortedRoster = useMemo(() => {
    const filtered = FIGHTKARO_ROSTER_ENTRIES.filter((entry) => {
      if (rosterFilter === 'boss') return entry.status === 'Boss';
      if (rosterFilter === 'selectable') return entry.status === 'Playable';
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (rosterSort === 'name_az') {
        return a.name.localeCompare(b.name);
      }
      if (rosterSort === 'status_group') {
        const rank = { Playable: 1, Boss: 2, Special: 3 };
        if (rank[a.status] !== rank[b.status]) {
          return rank[a.status] - rank[b.status];
        }
        return a.order - b.order;
      }
      return a.order - b.order;
    });
  }, [rosterFilter, rosterSort]);

  const handleSlotChange = (slotIdx: number, newFighterId: string) => {
    setSlotFighterIds((prev) => {
      const next: [string, string, string] = [...prev] as [
        string,
        string,
        string,
      ];
      next[slotIdx] = newFighterId;
      return next;
    });
  };

  const handleLoadIntoSheet = (fighterId: string) => {
    if (!ALL_FIGHTKARO_CHARACTER_SPECS[fighterId]) return;
    if (slotFighterIds.includes(fighterId)) {
      const el = document.querySelector(
        `[data-testid="character-section-${fighterId}"]`
      );
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSlotFighterIds((prev) => [prev[0], prev[1], fighterId]);
  };

  const handleTriggerScene = (sceneItem: PoliticalAudioSceneItem) => {
    setActiveScene(sceneItem);
    setPlayingSceneId(sceneItem.id);
    sound.playSceneAudio(sceneItem);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Studio Control Header */}
      <div className="rounded-xl border border-white/15 bg-[#1B110C] p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-[#FF9933] text-[#120A06] font-mono text-[11px] font-bold uppercase tracking-wider">
                OFFICIAL FIGHTKARO 3D GLB MODEL SHEET & POLITICAL AUDIO SCENES
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {validation.characterCount} CHARACTERS × {validation.viewsPerCharacter} ORTHO GLB VIEWS + 28 POLITICAL AUDIO SCENES
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-white uppercase">
              Fight Karo 3D Character Model Sheet & Viral Political Scene Audio Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-4xl">
              Rendered directly from the authentic FightKaro 3D{' '}
              <code className="text-amber-300 font-mono">.glb</code> character
              meshes (<code className="text-amber-300 font-mono">/models/*.glb</code>),{' '}
              <code className="text-amber-300 font-mono">/faces/*.webp</code> portraits, and{' '}
              <code className="text-amber-300 font-mono">80+ .mp3</code> Indian political comedy & meme audio clips.
            </p>
          </div>

          {/* 3D Shader & Grid Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-lg bg-black/40 p-1 border border-white/10">
              {(
                [
                  { id: 'cartoon_pbr', label: '3D Cartoon PBR' },
                  { id: 'zbrush_clay', label: 'ZBrush Sculpt Clay' },
                  { id: 'wireframe_topo', label: '3D Wireframe Topo' },
                ] as { id: StudioMaterialMode; label: string }[]
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setMaterialMode(mode.id)}
                  className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition ${
                    materialMode === mode.id
                      ? 'bg-[#FF9933] text-[#120A06]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowGridOverlay((v) => !v)}
              className={`px-3 py-2 rounded-lg font-mono text-xs font-bold border transition flex items-center gap-1.5 ${
                showGridOverlay
                  ? 'bg-white/15 text-white border-white/30'
                  : 'bg-black/30 text-slate-400 border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Ortho Grid: {showGridOverlay ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE 3D POLITICAL AUDIO & SCENE THEATER (Matching All Viral Political & FightKaro Scenes) */}
      <section
        data-testid="political-scene-audio-theater"
        className="rounded-xl border border-amber-500/35 bg-[#19100B] p-4 sm:p-5 shadow-2xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF9933] text-[#120A06] font-mono text-[10px] font-bold uppercase mb-1">
              <Volume2 className="w-3.5 h-3.5" />
              All Indian Political Meme Audio & FightKaro Scene Re-Creator
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white uppercase tracking-wide">
              Viral Political Soundboard & Live 3D Scene Stage ({POLITICAL_SCENE_AUDIO_CATALOG.length} Scenes)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: 'All Scenes (28)' },
                { id: 'viral_meme', label: '15 Viral Political Memes' },
                { id: 'character_super', label: 'FightKaro Super Scenes' },
                { id: 'stage_scene', label: 'Budget & Stage Hazards' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSceneCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition ${
                  sceneCategoryFilter === tab.id
                    ? 'bg-[#FF9933] text-[#120A06] border-amber-300'
                    : 'bg-black/40 text-slate-300 border-white/15 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                sound.stopActiveVoice();
                setPlayingSceneId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold flex items-center gap-1"
            >
              <VolumeX className="w-3.5 h-3.5" />
              Stop Audio
            </button>
          </div>
        </div>

        {/* Live 3D Scene Stage + Soundboard Buttons Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Left: Active 3D Scene Stage with Speech Bubbles & Comic Popups */}
          <div className="xl:col-span-5 rounded-xl border border-white/15 bg-[#120A06] p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase text-slate-950"
                  style={{ backgroundColor: activeScene.accentColor }}
                >
                  ACTIVE 3D SCENE · {activeScene.audioUrl}
                </span>
                <h3 className="font-display text-lg font-bold text-white uppercase mt-1">
                  {activeScene.title}
                </h3>
                <p className="text-xs text-slate-400">{activeScene.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => handleTriggerScene(activeScene)}
                className="px-3 py-2 rounded-lg bg-[#FF9933] hover:bg-amber-400 text-[#120A06] font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                REPLAY SCENE
              </button>
            </div>

            {/* Comic Popups Banner */}
            <div className="flex flex-wrap gap-1.5">
              {activeScene.scenePopups.map((pop, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300 font-display text-xs font-bold uppercase tracking-wider animate-pulse"
                >
                  💥 {pop}
                </span>
              ))}
            </div>

            {/* Live Three.js 3D Character performing the Scene Animation */}
            <LiveGlbTurntable
              glbUrl={activeScene.glbUrl}
              materialMode={materialMode}
              initialYawDeg={15}
              initialClip={activeScene.glbClip}
            />

            {/* Scene Dialogue Speech Bubbles */}
            <div className="space-y-1.5 bg-black/40 rounded-lg p-3 border border-white/10">
              <div className="font-mono text-[10px] font-bold uppercase text-amber-400">
                Scene Dialogue Script & Captions
              </div>
              {activeScene.sceneQuotes.map((q, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded bg-white/10 border-l-4 border-[#FF9933] text-xs sm:text-sm font-medium text-white"
                >
                  &ldquo;{q}&rdquo;
                </div>
              ))}
            </div>
          </div>

          {/* Right: 28 Interactive Political Audio & Scene Cards */}
          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredScenes.map((sceneItem) => {
              const isSelected = activeScene.id === sceneItem.id;
              const isPlaying = playingSceneId === sceneItem.id;
              return (
                <button
                  key={sceneItem.id}
                  type="button"
                  data-testid={`scene-audio-btn-${sceneItem.id}`}
                  onClick={() => handleTriggerScene(sceneItem)}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-[#FF9933] shadow-lg'
                      : 'bg-[#221610] border-white/10 hover:border-amber-400/50 hover:bg-[#2B1C14]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase text-slate-950"
                        style={{ backgroundColor: sceneItem.accentColor }}
                      >
                        {sceneItem.category === 'viral_meme'
                          ? 'VIRAL MEME AUDIO'
                          : sceneItem.category === 'character_super'
                          ? 'FIGHTKARO SUPER'
                          : 'STAGE HAZARD'}
                      </span>
                      <span className="font-mono text-[10px] text-amber-300 flex items-center gap-1">
                        <Volume2
                          className={`w-3.5 h-3.5 ${
                            isPlaying ? 'animate-bounce text-[#FF9933]' : ''
                          }`}
                        />
                        {sceneItem.glbClip}
                      </span>
                    </div>
                    <div className="font-display text-sm sm:text-base font-bold text-white uppercase leading-snug">
                      {sceneItem.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {sceneItem.subtitle}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-white/10 w-full">
                    <div className="text-[11px] italic text-amber-200/90 truncate">
                      &ldquo;{sceneItem.sceneQuotes[0]}&rdquo;
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sceneItem.scenePopups.slice(0, 3).map((p, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[9px] font-bold text-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* THREE SEPARATED CHARACTER MODEL SHEET SECTIONS (Neutral Light Grey #E5E7EB Studio Sheet) */}
      <div className="space-y-8">
        {activeThreeCharacters.map((character, idx) => (
          <CharacterModelSheetSection
            key={`${character.slotNumber}-${character.fighterId}`}
            character={character}
            slotIndex={idx}
            materialMode={materialMode}
            showGridOverlay={showGridOverlay}
            onChangeSlotFighter={handleSlotChange}
            onInspectModal={(c, v, snap) =>
              setModalData({ character: c, view: v, snapshotUrl: snap })
            }
          />
        ))}
      </div>

      {/* OFFICIAL FIGHT KARO CHARACTERS ROSTER & MBAPU BOSS GUIDE (Matching https://fightfightkaro.com/characters/) */}
      <section className="rounded-xl border border-white/15 bg-[#160E0A] p-5 sm:p-6 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold uppercase mb-2">
              <Users className="w-3.5 h-3.5" />
              Fight Karo Characters Roster & Guide
            </div>
            <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wide">
              Fight Karo Characters — Roster, Teams, Supers & Boss Mbapu
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Playable fighters, teams, super moves, and how to unlock and defeat{' '}
              <strong className="text-amber-300">Mbapu</strong> (Final Boss of{' '}
              <em>Shanti Akhada</em>) via KO or the peaceful{' '}
              <strong className="text-emerald-300">&quot;SHANTI KI JEET&quot;</strong>{' '}
              route.
            </p>
          </div>

          {/* Interactive Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs text-slate-400">Filter:</span>
              {(['all', 'boss', 'selectable'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRosterFilter(f)}
                  className={`px-2 py-0.5 rounded font-mono text-xs font-bold capitalize transition ${
                    rosterFilter === f
                      ? 'bg-[#FF9933] text-[#120A06]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-300">
              <span className="text-slate-400">Sort:</span>
              <select
                value={rosterSort}
                onChange={(e) =>
                  setRosterSort(
                    e.target.value as 'game_order' | 'name_az' | 'status_group'
                  )
                }
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="game_order" className="bg-slate-900">
                  Game order
                </option>
                <option value="name_az" className="bg-slate-900">
                  Name A–Z
                </option>
                <option value="status_group" className="bg-slate-900">
                  Selectable, boss, random
                </option>
              </select>
            </label>
          </div>
        </div>

        {/* Character Portrait Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredAndSortedRoster.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-white/15 bg-[#211510] p-3 flex flex-col justify-between gap-2 hover:border-amber-400/60 transition"
            >
              <div>
                <div className="relative aspect-square rounded-lg overflow-hidden bg-black/50 border border-white/10 mb-2">
                  <img
                    src={entry.portraitUrl}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      entry.status === 'Boss'
                        ? 'bg-amber-500 text-slate-950'
                        : entry.status === 'Special'
                        ? 'bg-purple-500 text-white'
                        : 'bg-emerald-500/90 text-slate-950'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="font-display text-base font-bold text-white uppercase">
                  {entry.name}
                </div>
                <div className="text-[11px] font-mono text-amber-300/90">
                  {entry.team}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Super: <strong className="text-slate-200">{entry.superMove}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                {entry.id !== 'random' && (
                  <button
                    type="button"
                    onClick={() => sound.playCharacterSuperVoice(entry.id)}
                    className="w-full py-1 px-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    Play Voice (.mp3)
                  </button>
                )}
                {entry.glbUrl && ALL_FIGHTKARO_CHARACTER_SPECS[entry.id] && (
                  <button
                    type="button"
                    onClick={() => handleLoadIntoSheet(entry.id)}
                    className="w-full py-1 px-2 rounded bg-white/10 hover:bg-[#FF9933] hover:text-[#120A06] text-white font-mono text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Load 3D Sheet
                  </button>
                )}
                {entry.id !== 'random' && onSelectFighterForMatch && (
                  <button
                    type="button"
                    onClick={() => onSelectFighterForMatch(entry.id)}
                    className="w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Swords className="w-3 h-3" />
                    Pick Fighter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Official Fight Karo Roster Table */}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-black/50 text-amber-300 font-mono text-[11px] uppercase border-b border-white/10">
                <th className="py-2.5 px-3">Fighter</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Super Move</th>
                <th className="py-2.5 px-3">How You Get Them</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Theme & Play Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {filteredAndSortedRoster.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold flex items-center gap-2.5">
                    <img
                      src={entry.portraitUrl}
                      alt={entry.name}
                      className="w-8 h-8 rounded object-cover border border-white/20 shrink-0"
                    />
                    <span>{entry.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-amber-200">
                    {entry.team}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs font-bold text-white">
                    {entry.superMove}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-300">
                    {entry.unlockMethod}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        entry.status === 'Boss'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : entry.status === 'Special'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-300">
                    {entry.themeAndNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to Face Mbapu & Peace Route Statistics Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          <div className="lg:col-span-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
              <ShieldAlert className="w-4 h-4" />
              How to Face Mbapu (Shanti Akhada Final Boss)
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200 list-disc list-inside leading-relaxed">
              <li>
                <strong>Unlock Requirement:</strong> Play <strong>1P vs CPU</strong> and win{' '}
                <strong>3 matches in a row</strong>. After the third victory, the game triggers the boss intro and loads{' '}
                <strong>Shanti Akhada</strong> against <strong>Mbapu</strong>.
              </li>
              <li>
                <strong>Standard Route (KO):</strong> Drain Mbapu&apos;s{' '}
                <strong>200 HP</strong> bar before the timer runs out. Be careful: Mbapu regenerates{' '}
                <strong>2.5 HP/s</strong> if you do not hit him for 3 seconds, and his super{' '}
                <strong>MANCH CHHODO</strong> deals 40% max HP damage!
              </li>
              <li>
                <strong>Peace Route (&quot;SHANTI KI JEET&quot;):</strong> Never press punch, kick, or super. Stay within close range for{' '}
                <strong>20 seconds</strong> and block at least{' '}
                <strong>5 attacks</strong> to win peacefully!
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase mb-2.5">
              <Sparkles className="w-4 h-4" />
              Mbapu Boss Rules & Peace Thresholds
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase">
                  <th className="py-1.5 pr-3">Rule</th>
                  <th className="py-1.5">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {MBAPU_BOSS_STATS_TABLE.map((row) => (
                  <tr key={row.rule}>
                    <td className="py-2 pr-3 font-mono font-bold text-amber-200">
                      {row.rule}
                    </td>
                    <td className="py-2 text-slate-100">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* High-Resolution 3D Orthographic View Modal */}
      {modalData && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalData(null)}
        >
          <div
            className="max-w-3xl w-full rounded-xl bg-[#E5E7EB] text-slate-900 border-2 border-slate-500 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] text-amber-400 uppercase">
                  {modalData.character.slotNumber} · {modalData.character.name} ({modalData.character.glbUrl})
                </div>
                <div className="font-display text-lg font-bold uppercase">
                  {modalData.view.title} — {modalData.view.shortLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 font-mono text-xs font-bold"
              >
                CLOSE [ESC]
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#E5E7EB]">
              <div className="md:col-span-7 bg-[#E5E7EB] border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center">
                {modalData.snapshotUrl && (
                  <img
                    src={modalData.snapshotUrl}
                    alt={modalData.view.title}
                    className="max-h-[460px] w-auto object-contain"
                  />
                )}
              </div>
              <div className="md:col-span-5 space-y-3 text-xs text-slate-800">
                <div className="p-3 rounded bg-white border border-slate-300 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase text-slate-500">
                    Orthographic Camera Specification
                  </div>
                  <p className="font-semibold">{modalData.view.description}</p>
                  <div className="font-mono text-[11px] text-slate-700 pt-1">
                    <div>Camera: {modalData.view.cameraType}</div>
                    <div>Turntable Yaw: {modalData.view.yawDegrees}°</div>
                    <div>Safe Margin: {Math.round(modalData.view.cropMarginRatio * 100)}%</div>
                  </div>
                </div>
                <LiveGlbTurntable
                  glbUrl={modalData.character.glbUrl}
                  materialMode={materialMode}
                  initialYawDeg={modalData.view.yawDegrees}
                  initialClip={modalData.view.preferredClips[0] || 'guardbounce'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
