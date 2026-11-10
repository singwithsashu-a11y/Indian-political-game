import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_MODEL_SHEETS,
  FIGHTKARO_ROSTER_ENTRIES,
  MANDATORY_TEN_VIEWS,
  MBAPU_BOSS_STATS_TABLE,
  validateModelSheetConsistency,
} from './modelSheetSpec';
import { POLITICAL_SCENE_AUDIO_CATALOG } from './sound';

test('model sheet defines exactly three FightKaro 3D GLB characters', () => {
  assert.equal(CHARACTER_MODEL_SHEETS.length, 3);
  assert.equal(CHARACTER_MODEL_SHEETS[0].slotNumber, 'CHARACTER 01');
  assert.equal(CHARACTER_MODEL_SHEETS[1].slotNumber, 'CHARACTER 02');
  assert.equal(CHARACTER_MODEL_SHEETS[2].slotNumber, 'CHARACTER 03');
  for (const c of CHARACTER_MODEL_SHEETS) {
    assert.ok(c.glbUrl.startsWith('/models/') && c.glbUrl.endsWith('.glb'));
    assert.ok(c.portraitUrl.startsWith('/faces/') && c.portraitUrl.endsWith('.webp'));
  }
});

test('all three characters have distinct face shapes, body proportions, and outfits', () => {
  const [c1, c2, c3] = CHARACTER_MODEL_SHEETS;
  assert.notEqual(c1.proportions.jawShape, c2.proportions.jawShape);
  assert.notEqual(c2.proportions.jawShape, c3.proportions.jawShape);
  assert.notEqual(c1.proportions.bellyRadiusFactor, c2.proportions.bellyRadiusFactor);
  assert.notEqual(c2.proportions.bellyRadiusFactor, c3.proportions.bellyRadiusFactor);
  assert.notEqual(c1.palette.topGarmentPrimary, c2.palette.topGarmentPrimary);
  assert.notEqual(c2.palette.topGarmentPrimary, c3.palette.topGarmentPrimary);
});

test('each character has all 10 required orthographic views, poses, and expressions', () => {
  assert.equal(MANDATORY_TEN_VIEWS.length, 10);
  const expectedIds = [
    'front',
    'side',
    'back',
    'three_quarter',
    'neutral_pose',
    'fighting_stance',
    'victory_pose',
    'expr_angry',
    'expr_laughing',
    'expr_shocked',
  ];
  assert.deepEqual(
    MANDATORY_TEN_VIEWS.map((v) => v.id),
    expectedIds
  );
});

test('validateModelSheetConsistency passes with 30 total orthographic panels and zero cropping', () => {
  const report = validateModelSheetConsistency();
  assert.equal(report.valid, true);
  assert.equal(report.characterCount, 3);
  assert.equal(report.viewsPerCharacter, 10);
  assert.equal(report.totalPanels, 30);
  assert.equal(report.errors.length, 0);
});

test('FightKaro roster and Mbapu boss rules match official character guide', () => {
  assert.ok(FIGHTKARO_ROSTER_ENTRIES.length >= 8);
  const mbapu = FIGHTKARO_ROSTER_ENTRIES.find((r) => r.id === 'mbapu');
  assert.ok(mbapu);
  assert.equal(mbapu.status, 'Boss');
  assert.equal(mbapu.superMove, 'MANCH CHHODO');
  assert.equal(MBAPU_BOSS_STATS_TABLE.length, 6);
});

test('Political scene audio catalog maps all 15 viral meme clips and 13 FightKaro super scenes', () => {
  assert.equal(POLITICAL_SCENE_AUDIO_CATALOG.length, 28);
  const viralCount = POLITICAL_SCENE_AUDIO_CATALOG.filter(
    (s) => s.category === 'viral_meme'
  ).length;
  assert.equal(viralCount, 15);
  for (const scene of POLITICAL_SCENE_AUDIO_CATALOG) {
    assert.ok(scene.audioUrl.startsWith('/audio/') && scene.audioUrl.endsWith('.mp3'));
    assert.ok(scene.glbUrl.startsWith('/models/') && scene.glbUrl.endsWith('.glb'));
    assert.ok(scene.sceneQuotes.length >= 1);
    assert.ok(scene.scenePopups.length >= 1);
  }
});
