export type ModelSheetViewId =
  | 'front'
  | 'side'
  | 'back'
  | 'three_quarter'
  | 'neutral_pose'
  | 'fighting_stance'
  | 'victory_pose'
  | 'expr_angry'
  | 'expr_laughing'
  | 'expr_shocked';

export type StudioMaterialMode = 'cartoon_pbr' | 'zbrush_clay' | 'wireframe_topo';

export interface OrthographicViewSpec {
  id: ModelSheetViewId;
  index: number; // 1 to 10
  title: string;
  shortLabel: string;
  category: 'turnaround' | 'pose' | 'expression';
  cameraType: 'orthographic_full_body' | 'orthographic_head_closeup';
  yawDegrees: number;
  poseKey: 'neutral' | 'apose' | 'combat' | 'victory';
  expressionKey: 'confident' | 'angry' | 'laughing' | 'shocked';
  cropMarginRatio: number; // >= 0.12 to ensure zero cropping
  description: string;
}

export interface CharacterModelSheetSpec {
  slotNumber: 'CHARACTER 01' | 'CHARACTER 02' | 'CHARACTER 03';
  fighterId: string;
  name: string;
  parodyTitle: string;
  personality: string;
  silhouetteArchetype: string;
  sheetImageUrl: string;
  portraitUrl: string;
  proportions: {
    totalHeightCm: number;
    headToBodyRatio: number; // e.g. 4.5 heads tall (FightKaro stylized 3D ratio)
    shoulderToHipRatio: number;
    bellyRadiusFactor: number;
    limbThicknessFactor: number;
    headWidthFactor: number;
    jawShape: 'squared_bearded' | 'angular_athletic' | 'round_jovial';
  };
  palette: {
    skinBase: string;
    skinSubsurface: string;
    skinShadow: string;
    hairPrimary: string;
    hairHighlight: string;
    topGarmentPrimary: string;
    topGarmentSecondary: string;
    bottomGarment: string;
    footwearColor: string;
    accessoryAccent: string;
  };
  anatomyAndGarments: {
    hairstyle: string;
    facialFeatures: string;
    frontDetails: string;
    sideDetails: string;
    backDetails: string;
    handsAndFeet: string;
    accessories: string[];
  };
  sculptSpecs: {
    triCountBudget: number;
    materialShader: string;
    subsurfaceScattering: number;
    clothRoughness: number;
    skinRoughness: number;
  };
}

export const MASTER_TRIO_SHEET_URL =
  '/src/assets/images/model_sheet_master_trio_1794291943817.jpg';

export const MANDATORY_TEN_VIEWS: OrthographicViewSpec[] = [
  {
    id: 'front',
    index: 1,
    title: '01. Full-Body Front View',
    shortLabel: 'Front (0° Ortho)',
    category: 'turnaround',
    cameraType: 'orthographic_full_body',
    yawDegrees: 0,
    poseKey: 'neutral',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: 'True 0° orthographic front plane showing symmetrical face, chest placket, hands, and footwear.',
  },
  {
    id: 'side',
    index: 2,
    title: '02. Full-Body Side View',
    shortLabel: 'Side (90° Ortho)',
    category: 'turnaround',
    cameraType: 'orthographic_full_body',
    yawDegrees: 90,
    poseKey: 'neutral',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: 'True 90° orthographic right profile showing nose/beard projection, posture curve, and shoe sole profile.',
  },
  {
    id: 'back',
    index: 3,
    title: '03. Full-Body Back View',
    shortLabel: 'Back (180° Ortho)',
    category: 'turnaround',
    cameraType: 'orthographic_full_body',
    yawDegrees: 180,
    poseKey: 'neutral',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: 'True 180° orthographic rear plane showing occipital hairline, back collar seams, garment drape, and heels.',
  },
  {
    id: 'three_quarter',
    index: 4,
    title: '04. Three-Quarter View',
    shortLabel: '3/4 View (35° Ortho)',
    category: 'turnaround',
    cameraType: 'orthographic_full_body',
    yawDegrees: 35,
    poseKey: 'neutral',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: '35° orthographic three-quarter turnaround verifying volumetric depth of cheekbones, chest, and accessories.',
  },
  {
    id: 'neutral_pose',
    index: 5,
    title: '05. Neutral Standing Pose',
    shortLabel: 'Neutral Rig A-Pose',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 0,
    poseKey: 'apose',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: 'Relaxed 35° arm-spread A-pose rigging reference with separated fingers, clear joint pivots, and planted feet.',
  },
  {
    id: 'fighting_stance',
    index: 6,
    title: '06. Fighting Stance',
    shortLabel: 'Combat Ready Stance',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 25,
    poseKey: 'combat',
    expressionKey: 'confident',
    cropMarginRatio: 0.14,
    description: 'Signature FightKaro arcade combat idle stance with raised guard fists, lowered center of gravity, and readable silhouette.',
  },
  {
    id: 'victory_pose',
    index: 7,
    title: '07. Victory Pose',
    shortLabel: 'Win Celebration Pose',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 15,
    poseKey: 'victory',
    expressionKey: 'laughing',
    cropMarginRatio: 0.14,
    description: 'Exaggerated political comedy match-winning celebration pose showcasing personality and triumph gesture.',
  },
  {
    id: 'expr_angry',
    index: 8,
    title: '08. Angry Facial Expression',
    shortLabel: 'Angry Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: 0,
    poseKey: 'neutral',
    expressionKey: 'angry',
    cropMarginRatio: 0.16,
    description: 'Detailed facial blendshape: compressed corrugator brow furrow, flared nostrils, and fierce shouting mouth geometry.',
  },
  {
    id: 'expr_laughing',
    index: 9,
    title: '09. Funny Laughing Expression',
    shortLabel: 'Funny Laughing Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: 0,
    poseKey: 'neutral',
    expressionKey: 'laughing',
    cropMarginRatio: 0.16,
    description: 'Detailed facial blendshape: crescent squinted eyes, raised zygomatic cheek volumes, and booming open-mouth grin.',
  },
  {
    id: 'expr_shocked',
    index: 10,
    title: '10. Shocked Expression',
    shortLabel: 'Shocked Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: 0,
    poseKey: 'neutral',
    expressionKey: 'shocked',
    cropMarginRatio: 0.16,
    description: 'Detailed facial blendshape: high arched eyebrows, wide exposed sclera, and comical dropped mandible.',
  },
];

export const CHARACTER_MODEL_SHEETS: CharacterModelSheetSpec[] = [
  {
    slotNumber: 'CHARACTER 01',
    fighterId: 'vikas',
    name: 'VIKAS MANTRI',
    parodyTitle: 'MitraMan · The Barrel-Chested Masterstroke Brawler',
    personality: 'Commanding, chest-puffing, theatrical orator with booming rally poise and dramatic hand gestures.',
    silhouetteArchetype: 'Broad-Shouldered Barrel-Chested All-Rounder (4.5-Head Stylized Ratio)',
    sheetImageUrl: '/src/assets/images/char01_vikas_modelsheet_1794291944925.jpg',
    portraitUrl: '/src/assets/images/fighter_vikas_mantri_1794237658789.jpg',
    proportions: {
      totalHeightCm: 174,
      headToBodyRatio: 4.5,
      shoulderToHipRatio: 1.42,
      bellyRadiusFactor: 1.12,
      limbThicknessFactor: 1.15,
      headWidthFactor: 1.08,
      jawShape: 'squared_bearded',
    },
    palette: {
      skinBase: '#DDA77B',
      skinSubsurface: '#E9967A',
      skinShadow: '#9E6B47',
      hairPrimary: '#F1F5F9',
      hairHighlight: '#FFFFFF',
      topGarmentPrimary: '#EA7B26', // Saffron Bandhgala Nehru Jacket
      topGarmentSecondary: '#F8F1E1', // Cream Silk Kurta
      bottomGarment: '#EFE6D5', // Fitted Churidar Pajama
      footwearColor: '#5C341E', // Brown Leather Chappal Sandals
      accessoryAccent: '#D97706', // Gold-rimmed spectacles
    },
    anatomyAndGarments: {
      hairstyle: 'Swept-back silver-white hair with sculpted side volume and full manicured rounded white beard.',
      facialFeatures: 'Prominent brow ridge, warm rounded cheeks, expressive eyes framed by rimless/gold-bridge spectacles.',
      frontDetails: 'Tailored saffron-orange Modi jacket with 5 tonal buttons, left breast pocket square, mandarin collar over cream half-kurta.',
      sideDetails: 'Barrel-chested forward ribcage silhouette, rounded beard profile, side vents on kurta hem, open-toe leather strap sandals.',
      backDetails: 'Clean vertical center back seam on saffron jacket, smooth tapered back shoulders, neatly cropped silver nape hairline.',
      handsAndFeet: 'Sturdy five-fingered stylized hands with sculpted knuckles; bare ankles in brown double-strap leather sandals.',
      accessories: ['Gold-Bridge Spectacles', '5-Button Saffron Bandhgala Vest', 'Pocket Square Trim', 'Traditional Leather Chappals'],
    },
    sculptSpecs: {
      triCountBudget: 28400,
      materialShader: 'Stylized PBR Subsurface Skin + Woven Khadi Micro-Normal',
      subsurfaceScattering: 0.42,
      clothRoughness: 0.78,
      skinRoughness: 0.45,
    },
  },
  {
    slotNumber: 'CHARACTER 02',
    fighterId: 'yatra',
    name: 'YATRA VEER',
    parodyTitle: 'Yatra Boy · The 4000km Marathon Rushdown Speedster',
    personality: 'Hyper-energetic, restless cross-country sprinter who shadow-boxes between press conferences.',
    silhouetteArchetype: 'Lean Athletic V-Taper Sprinter (4.6-Head Stylized Ratio)',
    sheetImageUrl: '/src/assets/images/char02_yatra_modelsheet_1794291950135.jpg',
    portraitUrl: '/src/assets/images/fighter_yatra_veer_1794237661002.jpg',
    proportions: {
      totalHeightCm: 178,
      headToBodyRatio: 4.6,
      shoulderToHipRatio: 1.28,
      bellyRadiusFactor: 0.86,
      limbThicknessFactor: 0.94,
      headWidthFactor: 0.96,
      jawShape: 'angular_athletic',
    },
    palette: {
      skinBase: '#E3B083',
      skinSubsurface: '#F09D82',
      skinShadow: '#A4714E',
      hairPrimary: '#2D211B',
      hairHighlight: '#4A372E',
      topGarmentPrimary: '#F8FAFC', // Fitted White Polo T-Shirt
      topGarmentSecondary: '#E2E8F0', // Rolled Sleeve Cuff & Collar
      bottomGarment: '#5C6B46', // Olive Tactical Cargo Trousers
      footwearColor: '#2563EB', // Blue & White Marathon Running Sneakers
      accessoryAccent: '#1D4ED8', // Royal Blue Sweatband & Fitness Tracker Watch
    },
    anatomyAndGarments: {
      hairstyle: 'Tousled dark brown wavy curls held back by an elastic royal-blue marathon sweatband.',
      facialFeatures: 'Angular jawline with short groomed dark beard, pronounced dimples, thick expressive eyebrows, and high bridge nose.',
      frontDetails: 'Crisp white cotton polo shirt with 2-button open placket, subtle chest emblem, olive cargo pants with thigh pockets.',
      sideDetails: 'Lean athletic torso, rolled short-sleeve cuff showing toned forearms, side cargo pocket flaps, cushioned running sole wedge.',
      backDetails: 'Tapered athletic back in white pique polo, blue sweatband knot at occiput, rear patch pockets on olive trousers.',
      handsAndFeet: 'Agile taped-wrist fighter hands, black digital fitness watch on left wrist, blue-and-white mesh marathon sneakers.',
      accessories: ['Royal Blue Sweatband', 'Digital Fitness Smartwatch', 'Multi-Pocket Olive Cargo Pants', 'Cushioned Marathon Sneakers'],
    },
    sculptSpecs: {
      triCountBudget: 26900,
      materialShader: 'Stylized PBR Subsurface Skin + Cotton Pique & Ripstop Cargo Shader',
      subsurfaceScattering: 0.45,
      clothRoughness: 0.82,
      skinRoughness: 0.42,
    },
  },
  {
    slotNumber: 'CHARACTER 03',
    fighterId: 'lalu',
    name: 'RAIL SAMRAT',
    parodyTitle: 'Rail Raja · The Jovial Heavyweight Folk Trickster',
    personality: 'Boisterous, theatrical folk wit who weaponizes belly laughs, railway whistles, and comedic feints.',
    silhouetteArchetype: 'Wide Round-Bellied Comedic Heavyweight (4.3-Head Stylized Ratio)',
    sheetImageUrl: '/src/assets/images/char03_rail_modelsheet_1794291949153.jpg',
    portraitUrl: '/src/assets/images/fighter_shanti_bapu_1794237661452.jpg',
    proportions: {
      totalHeightCm: 168,
      headToBodyRatio: 4.3,
      shoulderToHipRatio: 1.05,
      bellyRadiusFactor: 1.48,
      limbThicknessFactor: 1.28,
      headWidthFactor: 1.24,
      jawShape: 'round_jovial',
    },
    palette: {
      skinBase: '#CF9268',
      skinSubsurface: '#DE876B',
      skinShadow: '#8F5938',
      hairPrimary: '#F8FAFC',
      hairHighlight: '#FFFFFF',
      topGarmentPrimary: '#1E6F3D', // Emerald Green Handloom Sadri Waistcoat
      topGarmentSecondary: '#F8FAFC', // Crisp White Cotton Kurta
      bottomGarment: '#F1F5F9', // Traditional Pleated Cotton Dhoti
      footwearColor: '#783F1D', // Curled-Toe Brown Leather Mojari Jutti
      accessoryAccent: '#D97706', // Vintage Brass Pocket Watch & Chain + Gemstone Rings
    },
    anatomyAndGarments: {
      hairstyle: 'Smooth bald crown flanked by iconic upturned silver-white side hair wings and thick arched white eyebrows.',
      facialFeatures: 'Wide jovial cheeks, prominent double chin, bulbous expressive nose, and infectious booming grin.',
      frontDetails: 'Emerald green handloom sadri vest over loose white cotton kurta, vintage brass pocket watch with chain on right pocket, pleated dhoti.',
      sideDetails: 'Pronounced round comedic belly silhouette, upturned ear-wing hair tufts, traditional curled-toe mojari jutti profile.',
      backDetails: 'Broad emerald green waistcoat back, pleated center dhoti tuck (kachha), wide silver side-hair fringe wrapping behind ears.',
      handsAndFeet: 'Plump expressive hands wearing colorful astrological gemstone rings on fingers; traditional curled-toe brown leather juttis.',
      accessories: ['Brass Pocket Watch & Chain', 'Astrological Gemstone Rings', 'Emerald Handloom Sadri Vest', 'Curled-Toe Mojari Juttis'],
    },
    sculptSpecs: {
      triCountBudget: 29800,
      materialShader: 'Stylized PBR Subsurface Skin + Handloom Linen & Brass Metallic Shader',
      subsurfaceScattering: 0.44,
      clothRoughness: 0.85,
      skinRoughness: 0.46,
    },
  },
];

export function validateModelSheetConsistency(
  characters: CharacterModelSheetSpec[] = CHARACTER_MODEL_SHEETS,
  views: OrthographicViewSpec[] = MANDATORY_TEN_VIEWS
): {
  valid: boolean;
  characterCount: number;
  viewsPerCharacter: number;
  totalPanels: number;
  errors: string[];
} {
  const errors: string[] = [];

  if (characters.length !== 3) {
    errors.push(`Expected exactly 3 characters, found ${characters.length}`);
  }

  if (views.length !== 10) {
    errors.push(`Expected exactly 10 views per character, found ${views.length}`);
  }

  // Ensure all 3 characters have distinct silhouettes, jaw shapes, and outfits
  const jawShapes = new Set(characters.map((c) => c.proportions.jawShape));
  if (jawShapes.size !== 3) {
    errors.push('All 3 characters must have distinct face/jaw shapes.');
  }

  const garmentColors = new Set(characters.map((c) => c.palette.topGarmentPrimary));
  if (garmentColors.size !== 3) {
    errors.push('All 3 characters must have distinct primary outfit colors.');
  }

  // Ensure every view is orthographic and has >= 0.12 uncropped safe margin
  for (const v of views) {
    if (!v.cameraType.startsWith('orthographic_')) {
      errors.push(`View ${v.id} must use an orthographic camera without perspective distortion.`);
    }
    if (v.cropMarginRatio < 0.12) {
      errors.push(`View ${v.id} must maintain >= 12% uncropped safe margin.`);
    }
  }

  return {
    valid: errors.length === 0,
    characterCount: characters.length,
    viewsPerCharacter: views.length,
    totalPanels: characters.length * views.length,
    errors,
  };
}
