import React, { useEffect, useRef, useState } from 'react';
import {
  CHARACTER_MODEL_SHEETS,
  MANDATORY_TEN_VIEWS,
  MASTER_TRIO_SHEET_URL,
  CharacterModelSheetSpec,
  OrthographicViewSpec,
  StudioMaterialMode,
} from '../game/modelSheetSpec';

interface CharacterModelSheetStudioProps {
  onSelectFighterForArena: (fighterId: string) => void;
}

/**
 * Renders a mathematically locked, perspective-free orthographic 3D shaded character sculpt
 * in a normalized 300x380 logical coordinate space on a neutral light grey (#E5E7EB) studio
 * cyclorama background so proportions remain 100% identical at any viewport size without cropping.
 */
const OrthographicSculptCanvas: React.FC<{
  character: CharacterModelSheetSpec;
  view: OrthographicViewSpec;
  materialMode: StudioMaterialMode;
  showGrid: boolean;
  customYaw?: number;
  width?: number;
  height?: number;
}> = ({
  character,
  view,
  materialMode,
  showGrid,
  customYaw,
  width = 240,
  height = 304,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Logical reference coordinate system (300 x 380) prevents any aspect or height squishing
    const LOGICAL_W = 300;
    const LOGICAL_H = 380;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale((width * dpr) / LOGICAL_W, (height * dpr) / LOGICAL_H);

    // 1. Neutral Light Grey Studio Cyclorama Background (#E5E7EB -> #D5D9E0)
    const bgGrad = ctx.createRadialGradient(
      LOGICAL_W * 0.5,
      LOGICAL_H * 0.42,
      24,
      LOGICAL_W * 0.5,
      LOGICAL_H * 0.5,
      LOGICAL_W * 0.8
    );
    bgGrad.addColorStop(0, '#F3F4F6');
    bgGrad.addColorStop(0.68, '#E5E7EB');
    bgGrad.addColorStop(1, '#D5D9E0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // 2. Optional Orthographic 4.5-Head Proportion Measurement Grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.24)';
      ctx.lineWidth = 1;
      // Vertical symmetry axis
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(LOGICAL_W / 2, 16);
      ctx.lineTo(LOGICAL_W / 2, LOGICAL_H - 16);
      ctx.stroke();
      ctx.setLineDash([]);

      if (view.cameraType === 'orthographic_full_body') {
        const topY = 38;
        const bottomY = LOGICAL_H - 34;
        const totalH = bottomY - topY;
        const heads = 4.5;
        for (let i = 0; i <= 4; i++) {
          const y = topY + (totalH / heads) * i;
          ctx.beginPath();
          ctx.moveTo(22, y);
          ctx.lineTo(LOGICAL_W - 22, y);
          ctx.stroke();
        }
        // Floor datum line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.beginPath();
        ctx.moveTo(18, bottomY);
        ctx.lineTo(LOGICAL_W - 18, bottomY);
        ctx.stroke();
      } else {
        // Head close-up eye-line & nose-base datum planes
        for (const frac of [0.42, 0.56, 0.7]) {
          ctx.beginPath();
          ctx.moveTo(24, LOGICAL_H * frac);
          ctx.lineTo(LOGICAL_W - 24, LOGICAL_H * frac);
          ctx.stroke();
        }
      }
    }

    const isClay = materialMode === 'zbrush_clay';
    const isWire = materialMode === 'wireframe_topo';

    const col = (hex: string, clayFallback = '#C8BEB7') => {
      if (isClay) return clayFallback;
      if (isWire) return '#DCE0E6';
      return hex;
    };

    const fill3DVolume = (
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      baseColor: string,
      clayShade = '#C8BEB7',
      strokeEdge = true
    ) => {
      const c = col(baseColor, clayShade);
      const grad = ctx.createRadialGradient(
        cx - rx * 0.3,
        cy - ry * 0.3,
        Math.max(2, rx * 0.1),
        cx,
        cy,
        Math.max(rx, ry) * 1.15
      );
      grad.addColorStop(0, lightenHex(c, 26));
      grad.addColorStop(0.55, c);
      grad.addColorStop(1, darkenHex(c, 30));
      ctx.fillStyle = grad;
      ctx.fill();

      if (strokeEdge) {
        ctx.strokeStyle = isWire ? '#0F172A' : darkenHex(c, 42);
        ctx.lineWidth = isWire ? 1.3 : 1.15;
        ctx.stroke();
      }
    };

    const yaw = (((customYaw ?? view.yawDegrees) % 360) + 360) % 360;
    const isBack = yaw > 125 && yaw < 235;
    const isSide = (yaw >= 65 && yaw <= 125) || (yaw >= 235 && yaw <= 295);
    const sideDir = yaw >= 235 ? -1 : 1;
    const yawRad = (yaw * Math.PI) / 180;
    const horizOffset = isSide ? sideDir * 7 : Math.sin(yawRad) * 10;

    const { proportions, palette, fighterId } = character;

    if (view.cameraType === 'orthographic_head_closeup') {
      // ========================================================================
      // ORTHOGRAPHIC 3D FACIAL EXPRESSION SCULPT CLOSE-UP (Views 08, 09, 10)
      // Perfectly centered in 300x380 logical space with >=18% margin around head
      // ========================================================================
      const cx = LOGICAL_W * 0.5;
      const cy = LOGICAL_H * 0.45;
      const headRx = 58 * proportions.headWidthFactor;
      const headRy = 66;

      // Studio ground shadow disc
      ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
      ctx.beginPath();
      ctx.ellipse(cx, LOGICAL_H - 30, 62, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck & Collar Bust Pedestal
      ctx.beginPath();
      ctx.roundRect(cx - 32, cy + 46, 64, 48, 16);
      fill3DVolume(cx, cy + 66, 34, 26, palette.skinBase, '#BCACA3');

      ctx.beginPath();
      ctx.moveTo(cx - 70, cy + 96);
      ctx.quadraticCurveTo(cx, cy + 68, cx + 70, cy + 96);
      ctx.lineTo(cx + 80, cy + 128);
      ctx.lineTo(cx - 80, cy + 128);
      ctx.closePath();
      fill3DVolume(cx, cy + 104, 76, 26, palette.topGarmentPrimary, '#A89F99');

      // Ears
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + side * (headRx + 4), cy + 4, 11, 21, side * 0.12, 0, Math.PI * 2);
        fill3DVolume(cx + side * (headRx + 4), cy + 4, 11, 21, palette.skinBase);
      }

      // Character 03 Iconic White Side Hair Wings
      if (fighterId === 'lalu') {
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + side * (headRx - 10), cy - 18);
          ctx.quadraticCurveTo(
            cx + side * (headRx + 32),
            cy - 44,
            cx + side * (headRx + 24),
            cy + 10
          );
          ctx.closePath();
          fill3DVolume(cx + side * (headRx + 14), cy - 14, 24, 24, palette.hairPrimary, '#D6CEC7');
        }
      }

      // Main Cranium & Jaw Sculpt
      ctx.beginPath();
      ctx.ellipse(cx, cy, headRx, headRy, 0, 0, Math.PI * 2);
      fill3DVolume(cx, cy, headRx, headRy, palette.skinBase);

      // Character 03 Double Chin Volume
      if (fighterId === 'lalu') {
        ctx.beginPath();
        ctx.ellipse(cx, cy + headRy - 6, headRx * 0.72, 18, 0, 0, Math.PI);
        fill3DVolume(cx, cy + headRy - 6, headRx * 0.72, 18, palette.skinBase);
      }

      // Hair Sculpt on Top
      if (fighterId === 'vikas') {
        ctx.beginPath();
        ctx.ellipse(cx, cy - headRy * 0.66, headRx * 0.96, 28, 0, Math.PI, Math.PI * 2);
        fill3DVolume(cx, cy - headRy * 0.7, headRx, 28, palette.hairPrimary, '#D8D0C8');
      } else if (fighterId === 'yatra') {
        ctx.beginPath();
        ctx.ellipse(cx, cy - headRy * 0.65, headRx * 1.08, 34, 0, Math.PI * 0.92, Math.PI * 2.08);
        fill3DVolume(cx, cy - headRy * 0.68, headRx * 1.08, 34, palette.hairPrimary, '#8C827A');

        // Royal blue sweatband
        ctx.beginPath();
        ctx.roundRect(cx - headRx * 0.96, cy - 44, headRx * 1.92, 15, 6);
        fill3DVolume(cx, cy - 36, headRx, 10, palette.accessoryAccent, '#9E948C');
      }

      // Facial Hair / Beard Sculpt
      if (fighterId === 'vikas') {
        ctx.beginPath();
        ctx.moveTo(cx - headRx * 0.92, cy + 6);
        ctx.quadraticCurveTo(cx - headRx * 0.85, cy + headRy + 22, cx, cy + headRy + 24);
        ctx.quadraticCurveTo(cx + headRx * 0.85, cy + headRy + 22, cx + headRx * 0.92, cy + 6);
        ctx.quadraticCurveTo(cx, cy + 24, cx - headRx * 0.92, cy + 6);
        ctx.closePath();
        fill3DVolume(cx, cy + 44, headRx * 0.9, 36, palette.hairPrimary, '#D8D0C8');
      } else if (fighterId === 'yatra') {
        ctx.beginPath();
        ctx.ellipse(cx, cy + 26, headRx * 0.86, 36, 0, 0.15, Math.PI - 0.15);
        fill3DVolume(cx, cy + 36, headRx * 0.85, 30, palette.hairPrimary, '#8C827A');
      }

      // Eyes & Expression Geometry
      const expr = view.expressionKey;
      const eyeY = cy - 8;
      const eyeOffsetX = 23;

      for (const side of [-1, 1]) {
        const ex = cx + side * eyeOffsetX;
        if (expr === 'laughing') {
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 3.4;
          ctx.beginPath();
          ctx.arc(ex, eyeY + 3, 10.5, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        } else {
          const eyeRy = expr === 'shocked' ? 12 : 8.2;
          ctx.fillStyle = isClay ? '#DFD9D4' : '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY, 11.5, eyeRy, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          const irisR = expr === 'shocked' ? 4.2 : 5.4;
          ctx.fillStyle = isClay ? '#8C827A' : '#1E293B';
          ctx.beginPath();
          ctx.arc(ex, eyeY, irisR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ex - 2, eyeY - 2, 1.9, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eyebrows
        ctx.strokeStyle =
          fighterId === 'yatra' ? col('#1E1B18', '#6E655F') : col('#F8FAFC', '#D8D0C8');
        ctx.lineWidth = 5.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (expr === 'angry') {
          ctx.moveTo(ex - side * 12, eyeY - 11);
          ctx.lineTo(ex + side * 13, eyeY - 19);
        } else if (expr === 'shocked') {
          ctx.arc(ex, eyeY - 15, 13, Math.PI * 1.15, Math.PI * 1.85);
        } else {
          ctx.arc(ex, eyeY - 9, 13, Math.PI * 1.15, Math.PI * 1.85);
        }
        ctx.stroke();
      }

      // Character 01 Gold-Rimmed Spectacles
      if (fighterId === 'vikas') {
        ctx.strokeStyle = col('#D97706', '#8E847C');
        ctx.lineWidth = 2.6;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.roundRect(cx + side * 23 - 16, eyeY - 12, 32, 22, 6);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx - 7, eyeY - 2);
        ctx.lineTo(cx + 7, eyeY - 2);
        ctx.stroke();
      }

      // 3D Sculpted Nose
      ctx.beginPath();
      const noseW = fighterId === 'lalu' ? 14 : 10;
      ctx.moveTo(cx, eyeY - 2);
      ctx.lineTo(cx - noseW, cy + 14);
      ctx.quadraticCurveTo(cx, cy + 20, cx + noseW, cy + 14);
      ctx.closePath();
      fill3DVolume(cx, cy + 9, noseW, 12, palette.skinBase);

      // Mouth Sculpt per Expression
      const mouthY = cy + 34;
      if (expr === 'angry') {
        ctx.fillStyle = isClay ? '#7C726B' : '#450A0A';
        ctx.beginPath();
        ctx.roundRect(cx - 22, mouthY - 8, 44, 18, 6);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isClay ? '#DFD8D2' : '#F8FAFC';
        ctx.fillRect(cx - 18, mouthY - 6, 36, 6);
        ctx.fillRect(cx - 18, mouthY + 2, 36, 5);
      } else if (expr === 'laughing') {
        ctx.fillStyle = isClay ? '#7C726B' : '#7F1D1D';
        ctx.beginPath();
        ctx.arc(cx, mouthY - 6, 26, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isClay ? '#DFD8D2' : '#FFFFFF';
        ctx.fillRect(cx - 21, mouthY - 5, 42, 7);
      } else if (expr === 'shocked') {
        ctx.fillStyle = isClay ? '#6E655F' : '#450A0A';
        ctx.beginPath();
        ctx.ellipse(cx, mouthY + 2, 16, 21, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = isClay ? '#DFD8D2' : '#FFFFFF';
        ctx.fillRect(cx - 10, mouthY - 15, 20, 5);
      }

      if (isWire) {
        drawWireframeMeshOverlay(ctx, cx, cy, headRx, headRy, true);
      }

      ctx.restore();
      return;
    }

    // ========================================================================
    // ORTHOGRAPHIC FULL-BODY TURNAROUND & POSE VIEWS (Views 01 to 07)
    // Drawn in normalized 300x380 coordinate system with 4.5-head ratio
    // ========================================================================
    const cx = LOGICAL_W * 0.5;
    const groundY = LOGICAL_H - 34;

    // Ground Contact Shadow Disc
    ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 4, 60, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const pose = view.poseKey;
    const combatCrouch = pose === 'combat' ? 10 : 0;
    const stanceSpread = pose === 'combat' ? 22 : pose === 'victory' ? 14 : 0;

    const headCenterY = 74 + combatCrouch * 0.5;
    const headRx = (isSide ? 26 : 28) * proportions.headWidthFactor;
    const headRy = 32;

    const torsoTopY = 108 + combatCrouch * 0.6;
    const torsoH = 104;
    const shoulderHalfW = isSide
      ? 26 * proportions.bellyRadiusFactor
      : 42 * proportions.shoulderToHipRatio * 0.85;
    const bellyHalfW = isSide
      ? 34 * proportions.bellyRadiusFactor
      : 38 * proportions.bellyRadiusFactor;

    const hipY = torsoTopY + torsoH;
    const kneeY = hipY + 62 - combatCrouch * 0.4;
    const ankleY = groundY - 12;

    const leftHipX = isSide ? cx - 2 : cx - 19 - stanceSpread * 0.35;
    const rightHipX = isSide ? cx + 2 : cx + 19 + stanceSpread * 0.35;
    const leftFootX = isSide ? cx - 4 : cx - 21 - stanceSpread;
    const rightFootX = isSide ? cx + 4 : cx + 21 + stanceSpread;

    // Unified smooth 2-bone limb helper (draws thigh+calf or upper+forearm as a single continuous volume)
    const drawContinuousLimb = (
      x1: number,
      y1: number,
      xMid: number,
      yMid: number,
      x2: number,
      y2: number,
      rStart: number,
      rEnd: number,
      colorHex: string,
      clayHex = '#C0B6AF'
    ) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Outer dark contour stroke
      ctx.strokeStyle = isWire ? '#0F172A' : darkenHex(col(colorHex, clayHex), 42);
      ctx.lineWidth = (rStart + rEnd) + 2.4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(xMid, yMid, x2, y2);
      ctx.stroke();

      // Main 3D shaded base stroke
      ctx.strokeStyle = col(colorHex, clayHex);
      ctx.lineWidth = rStart + rEnd;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(xMid, yMid, x2, y2);
      ctx.stroke();

      // Studio key-light highlight ridge along limb
      ctx.strokeStyle = lightenHex(col(colorHex, clayHex), 22);
      ctx.lineWidth = (rStart + rEnd) * 0.42;
      ctx.beginPath();
      ctx.moveTo(x1 - 2, y1);
      ctx.quadraticCurveTo(xMid - 2, yMid, x2 - 2, y2);
      ctx.stroke();
      ctx.restore();
    };

    // 1. LEGS & TROUSERS / DHOTI / CHURIDAR
    const legR = 13 * proportions.limbThicknessFactor;
    const calfR = 10 * proportions.limbThicknessFactor;

    drawContinuousLimb(leftHipX, hipY, leftFootX, kneeY, leftFootX, ankleY, legR, calfR, palette.bottomGarment);
    drawContinuousLimb(rightHipX, hipY, rightFootX, kneeY, rightFootX, ankleY, legR, calfR, palette.bottomGarment);

    // Character 03 Traditional Pleated Dhoti Drape
    if (fighterId === 'lalu') {
      ctx.beginPath();
      ctx.moveTo(leftHipX - 14, hipY - 6);
      ctx.quadraticCurveTo(cx, kneeY + 32, rightHipX + 14, hipY - 6);
      ctx.closePath();
      fill3DVolume(cx, hipY + 24, 36, 34, palette.bottomGarment, '#D0C7C0');
    }

    // 2. CLEARLY VISIBLE FOOTWEAR
    for (const [idx, fx] of [leftFootX, rightFootX].entries()) {
      const dir = isSide ? sideDir : idx === 0 ? -1 : 1;
      ctx.beginPath();
      if (fighterId === 'lalu') {
        ctx.moveTo(fx - 12, groundY);
        ctx.lineTo(fx + dir * 18, groundY);
        ctx.quadraticCurveTo(fx + dir * 24, groundY - 14, fx + dir * 15, groundY - 16);
        ctx.lineTo(fx - 11, groundY - 10);
        ctx.closePath();
      } else {
        ctx.roundRect(fx - 14 + (isSide ? sideDir * 4 : 0), groundY - 12, 28, 12, 5);
      }
      fill3DVolume(fx, groundY - 6, 15, 8, palette.footwearColor, '#8F847C');

      if (fighterId === 'yatra' && !isClay) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(fx - 13 + (isSide ? sideDir * 4 : 0), groundY - 3, 26, 3);
      }
    }

    // 3. TORSO & FORMAL INDIAN POLITICAL GARMENTS
    if (fighterId === 'vikas' || fighterId === 'lalu') {
      ctx.beginPath();
      ctx.roundRect(cx - bellyHalfW * 0.96, hipY - 14, bellyHalfW * 1.92, 40, 6);
      fill3DVolume(cx, hipY + 6, bellyHalfW, 24, palette.topGarmentSecondary, '#D8D0C8');
    }

    ctx.beginPath();
    ctx.moveTo(cx - shoulderHalfW, torsoTopY);
    ctx.quadraticCurveTo(cx, torsoTopY - 9, cx + shoulderHalfW, torsoTopY);
    ctx.quadraticCurveTo(
      cx + bellyHalfW * 1.08,
      torsoTopY + torsoH * 0.55,
      cx + bellyHalfW * 0.95,
      hipY
    );
    ctx.lineTo(cx - bellyHalfW * 0.95, hipY);
    ctx.quadraticCurveTo(
      cx - bellyHalfW * 1.08,
      torsoTopY + torsoH * 0.55,
      cx - shoulderHalfW,
      torsoTopY
    );
    ctx.closePath();
    fill3DVolume(cx, torsoTopY + torsoH * 0.5, bellyHalfW, torsoH * 0.55, palette.topGarmentPrimary);

    if (!isBack) {
      const seamX = cx + horizOffset;
      ctx.strokeStyle = isClay ? '#8C827A' : darkenHex(palette.topGarmentPrimary, 35);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(seamX, torsoTopY + 2);
      ctx.lineTo(seamX, hipY);
      ctx.stroke();

      if (fighterId === 'vikas' || fighterId === 'lalu') {
        for (let b = 0; b < 5; b++) {
          ctx.fillStyle = isClay ? '#7C726B' : palette.accessoryAccent;
          ctx.beginPath();
          ctx.arc(seamX, torsoTopY + 18 + b * 17, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (fighterId === 'lalu') {
        ctx.strokeStyle = col('#F59E0B', '#8E847C');
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(seamX - 18, torsoTopY + 64, 6.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(seamX, torsoTopY + 52);
        ctx.quadraticCurveTo(seamX - 9, torsoTopY + 72, seamX - 18, torsoTopY + 64);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = isClay ? '#8C827A' : darkenHex(palette.topGarmentPrimary, 28);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, torsoTopY + 2);
      ctx.lineTo(cx, hipY);
      ctx.moveTo(cx - shoulderHalfW * 0.85, torsoTopY + 24);
      ctx.lineTo(cx + shoulderHalfW * 0.85, torsoTopY + 24);
      ctx.stroke();
    }

    // 4. ARMS & CLEARLY VISIBLE 5-FINGERED HANDS
    const armR = 10 * proportions.limbThicknessFactor;
    const forearmR = 8.2 * proportions.limbThicknessFactor;

    const getArmJoints = (side: -1 | 1) => {
      const sx = isSide ? cx : cx + side * (shoulderHalfW - 2);
      const sy = torsoTopY + 12;
      if (pose === 'apose') {
        const ex = sx + side * 24;
        const ey = sy + 40;
        const hx = ex + side * 20;
        const hy = ey + 38;
        return { sx, sy, ex, ey, hx, hy };
      }
      if (pose === 'combat') {
        const ex = sx + side * 22;
        const ey = sy + 34;
        const hx = sx + side * (side === 1 ? 36 : 14);
        const hy = sy + (side === 1 ? 4 : 14);
        return { sx, sy, ex, ey, hx, hy };
      }
      if (pose === 'victory') {
        if (side === 1) {
          return { sx, sy, ex: sx + 24, ey: sy - 22, hx: sx + 20, hy: sy - 58 };
        }
        return { sx, sy, ex: sx - 22, ey: sy + 28, hx: sx - 16, hy: sy + 12 };
      }
      const ex = isSide ? cx + sideDir * 5 : sx + side * 11;
      const ey = sy + 42;
      const hx = isSide ? cx + sideDir * 7 : sx + side * 13;
      const hy = ey + 40;
      return { sx, sy, ex, ey, hx, hy };
    };

    const sleeveCol =
      fighterId === 'yatra' ? palette.skinBase : palette.topGarmentSecondary;

    for (const side of isSide ? ([1] as const) : ([-1, 1] as const)) {
      const { sx, sy, ex, ey, hx, hy } = getArmJoints(side);
      drawContinuousLimb(sx, sy, ex, ey, hx, hy, armR, forearmR, sleeveCol);

      if (fighterId === 'yatra' && side === 1) {
        ctx.fillStyle = col('#0F172A', '#6E655F');
        ctx.fillRect(hx - 7, hy - 9, 14, 7);
      }

      // Sculpted Hand + Fingers
      ctx.beginPath();
      ctx.arc(hx, hy + 4, 8, 0, Math.PI * 2);
      fill3DVolume(hx, hy + 4, 8, 8, palette.skinBase);

      if (pose !== 'combat' && pose !== 'victory') {
        for (let f = -1.5; f <= 1.5; f += 1) {
          ctx.beginPath();
          ctx.roundRect(hx + f * 3.3 - 1.3, hy + 8, 2.6, 7, 1.2);
          fill3DVolume(hx + f * 3.3, hy + 11, 1.6, 3.5, palette.skinBase);
        }
      }
    }

    // 5. HEAD, HAIRSTYLE & FACIAL GEOMETRY
    ctx.beginPath();
    ctx.roundRect(cx - 13, torsoTopY - 16, 26, 20, 6);
    fill3DVolume(cx, torsoTopY - 6, 13, 10, palette.skinBase);

    if (fighterId === 'lalu') {
      for (const side of isSide ? ([-sideDir] as const) : ([-1, 1] as const)) {
        ctx.beginPath();
        ctx.ellipse(
          cx + side * (headRx + 5),
          headCenterY - 4,
          11,
          15,
          side * -0.35,
          0,
          Math.PI * 2
        );
        fill3DVolume(cx + side * (headRx + 5), headCenterY - 4, 11, 15, palette.hairPrimary);
      }
    }

    ctx.beginPath();
    ctx.ellipse(cx, headCenterY, headRx, headRy, 0, 0, Math.PI * 2);
    fill3DVolume(cx, headCenterY, headRx, headRy, palette.skinBase);

    if (fighterId === 'vikas') {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        headCenterY - headRy * 0.55,
        headRx * 0.98,
        isBack ? 26 : 16,
        0,
        isBack ? 0 : Math.PI,
        Math.PI * 2
      );
      fill3DVolume(cx, headCenterY - headRy * 0.6, headRx, 17, palette.hairPrimary);
    } else if (fighterId === 'yatra') {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        headCenterY - headRy * 0.5,
        headRx * 1.1,
        isBack ? 28 : 19,
        0,
        isBack ? 0 : Math.PI * 0.9,
        Math.PI * 2.1
      );
      fill3DVolume(cx, headCenterY - headRy * 0.55, headRx * 1.1, 19, palette.hairPrimary, '#8C827A');

      ctx.beginPath();
      ctx.roundRect(cx - headRx * 0.98, headCenterY - 21, headRx * 1.96, 8, 3);
      fill3DVolume(cx, headCenterY - 17, headRx, 5, palette.accessoryAccent, '#9E948C');
    } else if (fighterId === 'lalu' && isBack) {
      ctx.beginPath();
      ctx.roundRect(cx - headRx, headCenterY - 6, headRx * 2, 13, 6);
      fill3DVolume(cx, headCenterY, headRx, 8, palette.hairPrimary);
    }

    if (!isBack) {
      const faceCenterX = cx + horizOffset;

      if (fighterId === 'vikas') {
        ctx.beginPath();
        ctx.ellipse(
          faceCenterX,
          headCenterY + 15,
          isSide ? headRx * 0.72 : headRx * 0.88,
          18,
          0,
          0,
          Math.PI
        );
        fill3DVolume(faceCenterX, headCenterY + 17, headRx * 0.85, 17, palette.hairPrimary);
      } else if (fighterId === 'yatra') {
        ctx.beginPath();
        ctx.ellipse(
          faceCenterX,
          headCenterY + 12,
          isSide ? headRx * 0.65 : headRx * 0.82,
          15,
          0,
          0.1,
          Math.PI - 0.1
        );
        fill3DVolume(
          faceCenterX,
          headCenterY + 15,
          headRx * 0.8,
          14,
          palette.hairPrimary,
          '#8C827A'
        );
      }

      const eyePositions = isSide ? [faceCenterX + sideDir * 7] : [faceCenterX - 10, faceCenterX + 10];
      for (const ex of eyePositions) {
        ctx.fillStyle = isClay ? '#DFD8D2' : '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(ex, headCenterY - 3, 4.8, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(ex + (isSide ? sideDir * 1 : 0), headCenterY - 3, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (fighterId === 'vikas') {
        ctx.strokeStyle = col('#D97706', '#8E847C');
        ctx.lineWidth = 1.7;
        for (const ex of eyePositions) {
          ctx.beginPath();
          ctx.roundRect(ex - 6.5, headCenterY - 7.5, 13, 8.5, 2);
          ctx.stroke();
        }
      }

      ctx.beginPath();
      if (isSide) {
        ctx.moveTo(faceCenterX + sideDir * 11, headCenterY - 4);
        ctx.lineTo(faceCenterX + sideDir * 20, headCenterY + 4);
        ctx.lineTo(faceCenterX + sideDir * 11, headCenterY + 7);
      } else {
        ctx.arc(faceCenterX, headCenterY + 4, 4.2, 0, Math.PI * 2);
      }
      fill3DVolume(faceCenterX + (isSide ? sideDir * 14 : 0), headCenterY + 3, 4.5, 5, palette.skinBase);

      ctx.strokeStyle = '#450A0A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (view.expressionKey === 'laughing') {
        ctx.arc(faceCenterX, headCenterY + 13, 6.5, 0, Math.PI);
      } else {
        ctx.moveTo(faceCenterX - 5.5, headCenterY + 14);
        ctx.quadraticCurveTo(faceCenterX, headCenterY + 17, faceCenterX + 5.5, headCenterY + 14);
      }
      ctx.stroke();
    }

    if (isWire) {
      drawWireframeMeshOverlay(ctx, cx, torsoTopY + 42, bellyHalfW, torsoH, false);
    }

    ctx.restore();
  }, [character, view, materialMode, showGrid, customYaw, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="block mx-auto select-none"
    />
  );
};

function drawWireframeMeshOverlay(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  isHead: boolean
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
  ctx.lineWidth = 0.9;
  const rings = isHead ? 5 : 7;
  for (let i = 1; i <= rings; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, (rx / rings) * i, (ry / rings) * i, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function lightenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function darkenHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export const CharacterModelSheetStudio: React.FC<CharacterModelSheetStudioProps> = ({
  onSelectFighterForArena,
}) => {
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string>('ALL');
  const [materialMode, setMaterialMode] = useState<StudioMaterialMode>('cartoon_pbr');
  const [showProportionGrid, setShowProportionGrid] = useState<boolean>(true);
  const [inspectedState, setInspectedState] = useState<{
    character: CharacterModelSheetSpec;
    view: OrthographicViewSpec;
    customYaw: number;
  } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Close active modal on Escape key
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedState(null);
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visibleCharacters =
    selectedCharacterFilter === 'ALL'
      ? CHARACTER_MODEL_SHEETS
      : CHARACTER_MODEL_SHEETS.filter((c) => c.slotNumber === selectedCharacterFilter);

  const handleExportReferenceSheet = () => {
    setExportStatus('Compiling 2400×1800 Orthographic 3D Character Reference Sheet PNG…');
    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 2400;
      exportCanvas.height = 1800;
      const ctx = exportCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#E5E7EB';
        ctx.fillRect(0, 0, 2400, 1800);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 42px Oswald, sans-serif';
        ctx.fillText(
          'LOKSABHA LEGENDS — AAA 3D CHARACTER DEVELOPMENT MODEL SHEET (3 CHARACTERS · 30 ORTHOGRAPHIC VIEWS)',
          60,
          75
        );
        CHARACTER_MODEL_SHEETS.forEach((char, idx) => {
          const yTop = 130 + idx * 540;
          ctx.fillStyle = '#DCE0E6';
          ctx.fillRect(50, yTop, 2300, 500);
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 30px Oswald, sans-serif';
          ctx.fillText(
            `${char.slotNumber}: ${char.name} (${char.parodyTitle}) — Ratio 1:${char.proportions.headToBodyRatio}`,
            80,
            yTop + 48
          );
          MANDATORY_TEN_VIEWS.forEach((v, vIdx) => {
            const vx = 80 + vIdx * 222;
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(vx, yTop + 75, 205, 390);
            ctx.strokeStyle = '#CBD5E1';
            ctx.strokeRect(vx, yTop + 75, 205, 390);
            ctx.fillStyle = '#1E293B';
            ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
            ctx.fillText(v.title, vx + 10, yTop + 445);
          });
        });

        const dataUrl = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'loksabha-legends-3d-character-model-sheet.png';
        link.href = dataUrl;
        link.click();
      }
      setExportStatus('Exported 2400×1800 3D Character Reference Sheet PNG (3 Characters · 30 Views).');
      setTimeout(() => setExportStatus(''), 5000);
    } catch {
      setExportStatus('Model Sheet Ready for Inspection.');
    }
  };

  return (
    <div
      data-testid="model-sheet-studio"
      className="min-h-screen bg-[#E5E7EB] text-[#0F172A] pb-16"
    >
      {/* Studio Control Sub-Header on Neutral Light Grey */}
      <div className="bg-[#DCE0E6] border-b border-slate-300 px-4 sm:px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              AAA 3D GAME CHARACTER MODEL SHEET · FIGHTKARO ART DIRECTION
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              3 Original Indian Political Parody Fighters · 10 Orthographic Turnarounds, Poses & Facial Blendshapes Per Character · Neutral Grey Studio Cyclorama
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Character Section Filter */}
            <div
              role="group"
              aria-label="Filter Character Sections"
              className="flex items-center gap-1 bg-slate-300/80 p-1 rounded-lg"
            >
              {(['ALL', 'CHARACTER 01', 'CHARACTER 02', 'CHARACTER 03'] as const).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedCharacterFilter(slot)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCharacterFilter === slot
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {slot === 'ALL' ? 'All 3 Characters' : slot}
                </button>
              ))}
            </div>

            {/* 3D Material Shader Switcher */}
            <div
              role="group"
              aria-label="3D Material Shader Mode"
              className="flex items-center gap-1 bg-slate-300/80 p-1 rounded-lg"
            >
              {(
                [
                  { id: 'cartoon_pbr', label: 'Stylized 3D Cartoon' },
                  { id: 'zbrush_clay', label: 'ZBrush Studio Clay' },
                  { id: 'wireframe_topo', label: 'Wireframe Topology' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMaterialMode(m.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    materialMode === m.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Orthographic Proportion Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowProportionGrid((prev) => !prev)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                showProportionGrid
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white/80 text-slate-800 border-slate-300 hover:bg-white'
              }`}
            >
              {showProportionGrid ? 'Ortho Grid: ON' : 'Ortho Grid: OFF'}
            </button>

            {/* Export PNG Sheet Button */}
            <button
              type="button"
              onClick={handleExportReferenceSheet}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Export 3D Model Sheet (PNG)
            </button>
          </div>
        </div>

        {exportStatus && (
          <div className="max-w-[1400px] mx-auto mt-3 px-4 py-2 bg-slate-900 text-amber-300 text-xs font-mono rounded-lg">
            {exportStatus}
          </div>
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-6 space-y-12">
        {/* MASTER 3-CHARACTER TURNAROUND SHEET OVERVIEW */}
        {selectedCharacterFilter === 'ALL' && (
          <section
            aria-label="Master Three-Character Model Sheet Overview"
            className="bg-[#ECEFF3] border border-slate-300 rounded-2xl p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 pb-4">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  MASTER 3-CHARACTER COMPARATIVE MODEL SHEET (CHARACTER 01 · CHARACTER 02 · CHARACTER 03)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Unified FightKaro 3D Cartoon Art Direction · Distinct Face Shapes, Silhouettes & Formal Indian Attire · Orthographic Studio Lighting
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLightboxImage({
                    url: MASTER_TRIO_SHEET_URL,
                    title: 'Master 3-Character 3D Game Character Model Sheet',
                    subtitle: 'Character 01 (Vikas Mantri) · Character 02 (Yatra Veer) · Character 03 (Rail Samrat)',
                  })
                }
                className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer whitespace-nowrap"
              >
                Inspect Master Sheet Fullscreen
              </button>
            </div>

            {/* Master Trio AI-Generated 3D Reference Sheet */}
            <div className="rounded-xl overflow-hidden bg-[#E5E7EB] border border-slate-300">
              {!imgErrors['master'] ? (
                <img
                  src={MASTER_TRIO_SHEET_URL}
                  alt="Master AAA 3D Game Character Model Sheet featuring three original Indian political parody characters"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors((p) => ({ ...p, master: true }))}
                  onClick={() =>
                    setLightboxImage({
                      url: MASTER_TRIO_SHEET_URL,
                      title: 'Master 3-Character 3D Game Character Model Sheet',
                      subtitle: 'Character 01 · Character 02 · Character 03',
                    })
                  }
                  className={`w-full max-h-[500px] object-contain mx-auto cursor-zoom-in transition-all ${
                    materialMode === 'zbrush_clay' ? 'grayscale contrast-125 sepia-[.15]' : ''
                  }`}
                />
              ) : (
                <div className="p-8 text-center text-sm text-slate-600">
                  Master 3D Orthographic Character Lineup Rendered Below
                </div>
              )}
            </div>

            {/* 3-Character Silhouette & Proportion Comparison Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {CHARACTER_MODEL_SHEETS.map((char) => (
                <div
                  key={char.slotNumber}
                  className="bg-[#E5E7EB] border border-slate-300 rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-700">
                      {char.slotNumber} · {char.name}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {char.silhouetteArchetype}
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-1 tabular-nums">
                      Height: {char.proportions.totalHeightCm}cm · Ratio: 1:{char.proportions.headToBodyRatio} ·{' '}
                      {char.sculptSpecs.triCountBudget.toLocaleString()} Tris
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCharacterFilter(char.slotNumber)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-lg cursor-pointer shrink-0"
                  >
                    Focus Sheet
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* THREE CLEARLY SEPARATED CHARACTER SECTIONS */}
        {visibleCharacters.map((character) => (
          <section
            key={character.slotNumber}
            id={character.slotNumber.toLowerCase().replace(/\s+/g, '-')}
            data-testid={`section-${character.fighterId}`}
            aria-label={`${character.slotNumber}: ${character.name}`}
            className="bg-[#ECEFF3] border border-slate-300 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Character Section Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 pb-5">
              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-amber-800">
                  {character.slotNumber} · ORTHOGRAPHIC 3D SCULPT & EXPRESSION REFERENCE SHEET
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-1">
                  {character.name} — {character.parodyTitle}
                </h2>
                <p className="text-sm text-slate-700 mt-1 max-w-3xl">
                  {character.personality}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setInspectedState({
                      character,
                      view: MANDATORY_TEN_VIEWS[0],
                      customYaw: 0,
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Open 360° Orthographic Turntable
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFighterForArena(character.fighterId)}
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Play Fighter in 1v1 Arena
                </button>
              </div>
            </div>

            {/* Character Master 3D Turnaround Plate (AI Studio Sculpt Reference) */}
            <div className="bg-[#E5E7EB] border border-slate-300 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-mono">
                <span>
                  STUDIO 3D SCULPT PLATE · {character.sculptSpecs.materialShader} ·{' '}
                  {character.sculptSpecs.triCountBudget.toLocaleString()} Triangles
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxImage({
                      url: character.sheetImageUrl,
                      title: `${character.slotNumber}: ${character.name} — 3D Turnaround & Expression Sheet`,
                      subtitle: character.silhouetteArchetype,
                    })
                  }
                  className="underline hover:text-slate-950 cursor-pointer"
                >
                  View High-Resolution Plate
                </button>
              </div>

              {!imgErrors[character.fighterId] && (
                <div className="rounded-lg overflow-hidden bg-[#E5E7EB]">
                  <img
                    src={character.sheetImageUrl}
                    alt={`${character.slotNumber} ${character.name} 3D Character Turnaround and Facial Expression Model Sheet`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [character.fighterId]: true }))
                    }
                    onClick={() =>
                      setLightboxImage({
                        url: character.sheetImageUrl,
                        title: `${character.slotNumber}: ${character.name}`,
                        subtitle: character.silhouetteArchetype,
                      })
                    }
                    className={`w-full max-h-[440px] object-contain mx-auto cursor-zoom-in transition-all ${
                      materialMode === 'zbrush_clay' ? 'grayscale contrast-125 sepia-[.15]' : ''
                    }`}
                  />
                </div>
              )}
            </div>

            {/* 10 MANDATORY ORTHOGRAPHIC REFERENCE VIEWS GRID (VIEWS 01 TO 10) */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-slate-900 tracking-wide">
                  10-PANEL ORTHOGRAPHIC 3D TURNAROUND, POSE & FACIAL GEOMETRY BREAKDOWN
                </h3>
                <span className="text-xs font-mono text-slate-600 tabular-nums">
                  Scale: 1:{character.proportions.headToBodyRatio} Heads · Height: {character.proportions.totalHeightCm}cm · Perspective Distortion: 0.0% (Orthographic)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {MANDATORY_TEN_VIEWS.map((viewSpec) => (
                  <div
                    key={`${character.fighterId}-${viewSpec.id}`}
                    data-testid={`panel-${character.fighterId}-${viewSpec.id}`}
                    onClick={() =>
                      setInspectedState({
                        character,
                        view: viewSpec,
                        customYaw: viewSpec.yawDegrees,
                      })
                    }
                    className="group bg-[#E5E7EB] border border-slate-300 hover:border-slate-500 rounded-xl overflow-hidden flex flex-col justify-between transition-all cursor-pointer"
                  >
                    {/* Top View Index Header (Full readable title without truncation) */}
                    <div className="px-3 py-2 bg-[#DCE0E6] border-b border-slate-300">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {viewSpec.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                        {viewSpec.shortLabel}
                      </div>
                    </div>

                    {/* Uncropped Neutral Grey Orthographic 3D Sculpt Canvas */}
                    <div className="p-2 flex items-center justify-center bg-[#E5E7EB]">
                      <OrthographicSculptCanvas
                        character={character}
                        view={viewSpec}
                        materialMode={materialMode}
                        showGrid={showProportionGrid}
                        width={225}
                        height={285}
                      />
                    </div>

                    {/* Bottom Orthographic Verification Caption */}
                    <div className="px-3 py-2 bg-[#DCE0E6]/70 border-t border-slate-300 text-[11px] text-slate-700 leading-snug">
                      {viewSpec.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accurate Clothing, Hairstyle, Hands, Feet & Accessories Specification Table */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 border-t border-slate-300 text-xs text-slate-700">
              <div className="bg-[#E5E7EB] p-3.5 rounded-xl border border-slate-300">
                <div className="font-mono font-bold text-slate-900 mb-1">
                  01. FACE & HAIRSTYLE
                </div>
                <p className="leading-relaxed">
                  {character.anatomyAndGarments.hairstyle} {character.anatomyAndGarments.facialFeatures}
                </p>
              </div>
              <div className="bg-[#E5E7EB] p-3.5 rounded-xl border border-slate-300">
                <div className="font-mono font-bold text-slate-900 mb-1">
                  02. FRONT GARMENT SPEC
                </div>
                <p className="leading-relaxed">{character.anatomyAndGarments.frontDetails}</p>
              </div>
              <div className="bg-[#E5E7EB] p-3.5 rounded-xl border border-slate-300">
                <div className="font-mono font-bold text-slate-900 mb-1">
                  03. SIDE PROFILE SPEC
                </div>
                <p className="leading-relaxed">{character.anatomyAndGarments.sideDetails}</p>
              </div>
              <div className="bg-[#E5E7EB] p-3.5 rounded-xl border border-slate-300">
                <div className="font-mono font-bold text-slate-900 mb-1">
                  04. BACK VIEW SPEC
                </div>
                <p className="leading-relaxed">{character.anatomyAndGarments.backDetails}</p>
              </div>
              <div className="bg-[#E5E7EB] p-3.5 rounded-xl border border-slate-300">
                <div className="font-mono font-bold text-slate-900 mb-1">
                  05. HANDS, FEET & PROPS
                </div>
                <p className="leading-relaxed">{character.anatomyAndGarments.handsAndFeet}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* INTERACTIVE 360° ORTHOGRAPHIC 3D TURNTABLE & EXPRESSION INSPECTOR MODAL */}
      {inspectedState && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="360 Degree Orthographic 3D Sculpt Inspector"
          className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
        >
          <div className="bg-[#ECEFF3] text-slate-900 border border-slate-400 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-300 pb-4">
              <div>
                <div className="text-xs font-mono font-bold text-amber-800">
                  {inspectedState.character.slotNumber} · 360° ORTHOGRAPHIC SCULPT INSPECTOR
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  {inspectedState.character.name} — {inspectedState.view.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedState(null)}
                className="px-3.5 py-1.5 text-xs font-mono font-bold bg-slate-900 text-white rounded-lg cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 bg-[#E5E7EB] border border-slate-300 rounded-xl p-4 flex flex-col items-center">
                <OrthographicSculptCanvas
                  character={inspectedState.character}
                  view={inspectedState.view}
                  materialMode={materialMode}
                  showGrid={showProportionGrid}
                  customYaw={inspectedState.customYaw}
                  width={300}
                  height={380}
                />
                <div className="mt-2 text-xs font-mono text-slate-700 tabular-nums">
                  Orthographic Yaw Angle: {inspectedState.customYaw}° · Zero Perspective Distortion
                </div>
              </div>

              <div className="md:col-span-6 space-y-4">
                <div>
                  <label
                    htmlFor="ortho-yaw-slider"
                    className="block text-xs font-mono font-bold text-slate-800 mb-1"
                  >
                    SCRUB ORTHOGRAPHIC TURNAROUND ANGLE (0° – 360°):
                  </label>
                  <input
                    id="ortho-yaw-slider"
                    type="range"
                    min={0}
                    max={360}
                    value={inspectedState.customYaw}
                    onChange={(e) =>
                      setInspectedState((prev) =>
                        prev ? { ...prev, customYaw: Number(e.target.value) } : null
                      )
                    }
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-slate-800 mb-2">
                    SWITCH AMONG ALL 10 REQUIRED VIEWS & EXPRESSIONS:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MANDATORY_TEN_VIEWS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setInspectedState((prev) =>
                            prev ? { ...prev, view: v, customYaw: v.yawDegrees } : null
                          )
                        }
                        className={`px-2.5 py-1.5 text-left text-xs font-medium rounded-lg border cursor-pointer truncate ${
                          inspectedState.view.id === v.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-[#E5E7EB] rounded-xl border border-slate-300 text-xs space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    ACCESSORIES & GEOMETRY CHECK:
                  </div>
                  <div className="text-slate-700">
                    {inspectedState.character.anatomyAndGarments.accessories.join(' · ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIGH-RESOLUTION MODEL SHEET LIGHTBOX MODAL */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High Resolution 3D Model Sheet Viewer"
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#E5E7EB] text-slate-900 border border-slate-400 rounded-2xl max-w-6xl w-full p-5 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-300 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {lightboxImage.title}
                </h3>
                <p className="text-xs text-slate-600 font-mono">{lightboxImage.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3.5 py-1.5 text-xs font-mono font-bold bg-slate-900 text-white rounded-lg cursor-pointer"
              >
                CLOSE
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[78vh] object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
