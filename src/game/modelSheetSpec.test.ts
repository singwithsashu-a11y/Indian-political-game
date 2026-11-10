import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_MODEL_SHEETS,
  MANDATORY_TEN_VIEWS,
  validateModelSheetConsistency,
} from './modelSheetSpec';

test('model sheet defines exactly three original Indian political parody characters', () => {
  assert.equal(CHARACTER_MODEL_SHEETS.length, 3);
  assert.equal(CHARACTER_MODEL_SHEETS[0].slotNumber, 'CHARACTER 01');
  assert.equal(CHARACTER_MODEL_SHEETS[1].slotNumber, 'CHARACTER 02');
  assert.equal(CHARACTER_MODEL_SHEETS[2].slotNumber, 'CHARACTER 03');
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
