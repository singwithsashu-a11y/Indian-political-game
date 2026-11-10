import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  MANDATORY_TEN_VIEWS,
  ModelSheetViewId,
  OrthographicViewSpec,
  StudioMaterialMode,
} from './modelSheetSpec';

interface CachedGlbAsset {
  gltf: GLTF;
  animations: THREE.AnimationClip[];
  meshNames: string[];
  triangleCount: number;
}

const glbPromiseCache = new Map<string, Promise<CachedGlbAsset>>();
const renderedSheetCache = new Map<string, Record<ModelSheetViewId, string>>();

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedEnvMap: THREE.Texture | null = null;
let sharedLoader: GLTFLoader | null = null;

function getLoader(): GLTFLoader {
  if (!sharedLoader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    sharedLoader = loader;
  }
  return sharedLoader;
}

function getSharedRenderer(width: number, height: number): {
  renderer: THREE.WebGLRenderer;
  envMap: THREE.Texture;
} {
  if (!sharedRenderer) {
    sharedRenderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;
    sharedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    sharedRenderer.toneMappingExposure = 1.12;
    sharedRenderer.shadowMap.enabled = true;
    sharedRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(sharedRenderer);
    sharedEnvMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  sharedRenderer.setPixelRatio(1);
  sharedRenderer.setSize(width, height, false);
  return { renderer: sharedRenderer, envMap: sharedEnvMap! };
}

export function loadFightKaroGlb(glbUrl: string): Promise<CachedGlbAsset> {
  const existing = glbPromiseCache.get(glbUrl);
  if (existing) return existing;

  const promise = new Promise<CachedGlbAsset>((resolve, reject) => {
    getLoader().load(
      glbUrl,
      (gltf) => {
        const meshNames: string[] = [];
        let triangleCount = 0;
        gltf.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            if (m.name) meshNames.push(m.name);
            const geom = m.geometry;
            if (geom) {
              if (geom.index) {
                triangleCount += Math.round(geom.index.count / 3);
              } else if (geom.attributes.position) {
                triangleCount += Math.round(geom.attributes.position.count / 3);
              }
            }
          }
        });
        resolve({
          gltf,
          animations: gltf.animations || [],
          meshNames,
          triangleCount,
        });
      },
      undefined,
      (err) => reject(err)
    );
  });

  glbPromiseCache.set(glbUrl, promise);
  return promise;
}

function applyMaterialOverride(root: THREE.Object3D, mode: StudioMaterialMode) {
  if (mode === 'cartoon_pbr') {
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    return;
  }

  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mode === 'zbrush_clay') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0xc87d65,
          roughness: 0.58,
          metalness: 0.06,
        });
      } else if (mode === 'wireframe_topo') {
        mesh.material = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.4,
          metalness: 0.1,
          wireframe: true,
        });
      }
    }
  });
}

function applyExpressionAndPoseAdjustments(
  clonedRoot: THREE.Object3D,
  animations: THREE.AnimationClip[],
  view: OrthographicViewSpec
) {
  const mixer = new THREE.AnimationMixer(clonedRoot);

  // Pick a matching clip if specified
  let chosenClip: THREE.AnimationClip | undefined;
  for (const preferredName of view.preferredClips) {
    chosenClip = animations.find(
      (a) => a.name.toLowerCase() === preferredName.toLowerCase()
    );
    if (chosenClip) break;
  }

  if (chosenClip && chosenClip.duration > 0) {
    const action = mixer.clipAction(chosenClip);
    action.play();
    const targetTime = chosenClip.duration * view.clipTimeNormalized;
    mixer.setTime(targetTime);
  } else {
    mixer.update(0);
  }

  clonedRoot.updateMatrixWorld(true);

  // Locate common rig bones for fine pose/expression sculpting
  const bones: Record<string, THREE.Bone> = {};
  clonedRoot.traverse((obj) => {
    if ((obj as THREE.Bone).isBone) {
      const b = obj as THREE.Bone;
      const cleanName = b.name.toLowerCase().replace(/^mixamorig:?/, '');
      bones[cleanName] = b;
    }
  });

  const headBone =
    bones['head'] ||
    Object.values(bones).find((b) => b.name.toLowerCase().includes('head'));
  const neckBone =
    bones['neck'] ||
    Object.values(bones).find((b) => b.name.toLowerCase().includes('neck'));
  const jawBone =
    bones['jaw'] ||
    Object.values(bones).find((b) => b.name.toLowerCase().includes('jaw'));
  const spineBone =
    bones['spine2'] ||
    bones['spine1'] ||
    bones['spine'] ||
    Object.values(bones).find((b) => b.name.toLowerCase().includes('spine'));

  if (view.poseKey === 'victory') {
    if (spineBone) {
      spineBone.rotation.x -= 0.08;
    }
    if (headBone) {
      headBone.rotation.x -= 0.1;
      headBone.rotation.y += 0.08;
    }
  }

  if (view.cameraType === 'orthographic_head_closeup') {
    if (view.expressionKey === 'angry') {
      if (headBone) {
        headBone.rotation.x += 0.14; // Forward fierce brow tilt
        headBone.rotation.z -= 0.04;
      }
      if (jawBone) {
        jawBone.rotation.x += 0.12;
      }
    } else if (view.expressionKey === 'laughing') {
      if (headBone) {
        headBone.rotation.x -= 0.12; // Head tilted back laughing
        headBone.rotation.z += 0.06;
      }
      if (neckBone) {
        neckBone.rotation.x -= 0.06;
      }
      if (jawBone) {
        jawBone.rotation.x += 0.28; // Open mouth laugh
      }
    } else if (view.expressionKey === 'shocked') {
      if (headBone) {
        headBone.rotation.x -= 0.08; // Stunned recoil
        headBone.scale.set(1.03, 1.06, 1.03);
      }
      if (jawBone) {
        jawBone.rotation.x += 0.35; // Dropped jaw
      }
    }
  }

  // Also check if any meshes have morphTargetInfluences
  clonedRoot.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh;
    if (mesh.isMesh && mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 0) {
      for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
        if (view.expressionKey === 'angry') {
          mesh.morphTargetInfluences[i] = i % 2 === 0 ? 0.65 : 0.2;
        } else if (view.expressionKey === 'laughing') {
          mesh.morphTargetInfluences[i] = i % 2 === 1 ? 0.75 : 0.3;
        } else if (view.expressionKey === 'shocked') {
          mesh.morphTargetInfluences[i] = 0.85;
        }
      }
    }
  });

  clonedRoot.updateMatrixWorld(true);
}

function compositeOrthographicOverlay(
  sourceCanvas: HTMLCanvasElement,
  view: OrthographicViewSpec,
  width: number,
  height: number
): string {
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/jpeg', 0.92);

  // Draw the WebGL render first
  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  // Draw subtle orthographic reference registration lines & ruler marks on top
  ctx.save();
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.26)';
  ctx.lineWidth = 1;

  // Vertical center registration ticks (top and bottom margins)
  const cx = width * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, 6);
  ctx.lineTo(cx, 22);
  ctx.moveTo(cx, height - 22);
  ctx.lineTo(cx, height - 6);
  ctx.stroke();

  if (view.cameraType === 'orthographic_full_body') {
    const topMargin = height * view.cropMarginRatio;
    const bottomMargin = height * (1 - view.cropMarginRatio);

    // Crown & ground baseline reference ticks
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.32)';
    ctx.beginPath();
    ctx.moveTo(14, topMargin);
    ctx.lineTo(width - 14, topMargin);
    ctx.moveTo(14, bottomMargin);
    ctx.lineTo(width - 14, bottomMargin);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left scale ticks
    ctx.fillStyle = 'rgba(51, 65, 85, 0.65)';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillText('CROWN', 14, topMargin - 4);
    ctx.fillText('GROUND 0.0m', 14, bottomMargin + 11);
  } else {
    // Head close-up orthographic corner brackets & expression callout
    const pad = 18;
    const bLen = 14;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // TL
    ctx.moveTo(pad, pad + bLen);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + bLen, pad);
    // TR
    ctx.moveTo(width - pad - bLen, pad);
    ctx.lineTo(width - pad, pad);
    ctx.lineTo(width - pad, pad + bLen);
    // BL
    ctx.moveTo(pad, height - pad - bLen);
    ctx.lineTo(pad, height - pad);
    ctx.lineTo(pad + bLen, height - pad);
    // BR
    ctx.moveTo(width - pad - bLen, height - pad);
    ctx.lineTo(width - pad, height - pad);
    ctx.lineTo(width - pad, height - pad - bLen);
    ctx.stroke();

    ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    const tag =
      view.expressionKey === 'angry'
        ? 'HEAD RIG: ANGRY FURROW'
        : view.expressionKey === 'laughing'
        ? 'HEAD RIG: LAUGHING GRIN'
        : 'HEAD RIG: SHOCKED RECOIL';
    ctx.fillText(tag, pad + 6, height - pad - 6);
  }

  ctx.restore();
  return out.toDataURL('image/jpeg', 0.92);
}

export async function renderTenViewsForGlb(
  glbUrl: string,
  materialMode: StudioMaterialMode = 'cartoon_pbr',
  views: OrthographicViewSpec[] = MANDATORY_TEN_VIEWS
): Promise<{
  snapshots: Record<ModelSheetViewId, string>;
  meshNames: string[];
  animationNames: string[];
  triangleCount: number;
}> {
  const cacheKey = `${glbUrl}::${materialMode}`;
  const asset = await loadFightKaroGlb(glbUrl);

  const cachedSnapshots = renderedSheetCache.get(cacheKey);
  if (cachedSnapshots) {
    return {
      snapshots: cachedSnapshots,
      meshNames: asset.meshNames,
      animationNames: asset.animations.map((a) => a.name),
      triangleCount: asset.triangleCount,
    };
  }

  const width = 420;
  const height = 500;
  const { renderer, envMap } = getSharedRenderer(width, height);

  const scene = new THREE.Scene();
  // Clean neutral light grey studio background (#E5E7EB)
  scene.background = new THREE.Color(0xe5e7eb);
  scene.environment = envMap;

  // 3-Point Studio Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
  keyLight.position.set(2.5, 4.2, 3.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.95);
  fillLight.position.set(-3.0, 2.2, 2.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.75);
  rimLight.position.set(0, 3.5, -3.5);
  scene.add(rimLight);

  // Subtle shadow-catching studio pedestal disc
  const shadowGeo = new THREE.CircleGeometry(0.65, 48);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0xcbd5e1,
    transparent: true,
    opacity: 0.65,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  scene.add(shadowDisc);

  const snapshots = {} as Record<ModelSheetViewId, string>;
  const aspect = width / height;

  for (const view of views) {
    const cloned = SkeletonUtils.clone(asset.gltf.scene);
    applyMaterialOverride(cloned, materialMode);
    applyExpressionAndPoseAdjustments(cloned, asset.animations, view);

    // Apply requested orthographic turntable yaw
    cloned.rotation.y = THREE.MathUtils.degToRad(view.yawDegrees);
    cloned.updateMatrixWorld(true);

    const group = new THREE.Group();
    group.add(cloned);
    scene.add(group);
    group.updateMatrixWorld(true);

    // Compute accurate bounding box of the posed character
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Place shadow disc right under the character's feet
    shadowDisc.position.set(center.x, box.min.y + 0.002, center.z);
    shadowDisc.visible = view.cameraType === 'orthographic_full_body';

    let camTargetY = center.y;
    let orthoHalfHeight = (size.y * (1 + view.cropMarginRatio * 2)) / 2;

    if (view.cameraType === 'orthographic_head_closeup') {
      // Try to find exact Head mesh or Head bone world position for tight facial framing
      let headBox = new THREE.Box3();
      let foundHeadMesh = false;
      cloned.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const n = obj.name.toLowerCase();
          if (
            n.includes('head') ||
            n.includes('glasses') ||
            n.includes('eye') ||
            n.includes('teeth')
          ) {
            headBox.expandByObject(obj);
            foundHeadMesh = true;
          }
        }
      });

      if (foundHeadMesh && !headBox.isEmpty()) {
        const headCenter = new THREE.Vector3();
        const headSize = new THREE.Vector3();
        headBox.getCenter(headCenter);
        headBox.getSize(headSize);
        camTargetY = headCenter.y;
        orthoHalfHeight = Math.max(headSize.y, headSize.x) * 0.72;
      } else {
        // Fallback: top 26% of full character height is the head & collar
        camTargetY = box.max.y - size.y * 0.14;
        orthoHalfHeight = size.y * 0.17;
      }
    } else {
      // Ensure horizontal width never clips on wide stances or side profiles
      const halfWidthNeeded = (size.x * (1 + view.cropMarginRatio * 2)) / 2;
      if (halfWidthNeeded / aspect > orthoHalfHeight) {
        orthoHalfHeight = halfWidthNeeded / aspect;
      }
    }

    const orthoHalfWidth = orthoHalfHeight * aspect;
    const camera = new THREE.OrthographicCamera(
      -orthoHalfWidth,
      orthoHalfWidth,
      orthoHalfHeight,
      -orthoHalfHeight,
      0.05,
      50
    );

    camera.position.set(center.x, camTargetY, center.z + 6.0);
    camera.lookAt(center.x, camTargetY, center.z);
    camera.updateProjectionMatrix();

    renderer.render(scene, camera);

    snapshots[view.id] = compositeOrthographicOverlay(
      renderer.domElement,
      view,
      width,
      height
    );

    scene.remove(group);
  }

  renderedSheetCache.set(cacheKey, snapshots);

  return {
    snapshots,
    meshNames: asset.meshNames,
    animationNames: asset.animations.map((a) => a.name),
    triangleCount: asset.triangleCount,
  };
}
