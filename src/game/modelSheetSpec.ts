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
  preferredClips: string[];
  clipTimeNormalized: number;
  cropMarginRatio: number; // >= 0.12 to ensure zero cropping
  description: string;
}

export interface CharacterModelSheetSpec {
  slotNumber: 'CHARACTER 01' | 'CHARACTER 02' | 'CHARACTER 03';
  fighterId: string;
  name: string;
  parodyTitle: string;
  teamName: string;
  superMove: string;
  personality: string;
  silhouetteArchetype: string;
  glbUrl: string;
  portraitUrl: string;
  proportions: {
    totalHeightCm: number;
    headToBodyRatio: number;
    shoulderToHipRatio: number;
    bellyRadiusFactor: number;
    limbThicknessFactor: number;
    headWidthFactor: number;
    jawShape: 'squared_bearded' | 'angular_athletic' | 'round_jovial' | 'monk_compact' | 'stern_heavy';
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
    glbMeshGroups: string[];
    glbAnimations: string[];
  };
}

export interface FightKaroRosterEntry {
  order: number;
  id: string;
  name: string;
  team: string;
  superMove: string;
  unlockMethod: string;
  status: 'Playable' | 'Boss' | 'Special';
  portraitUrl: string;
  glbUrl?: string;
  themeAndNotes: string;
  accentColor: string;
}

export const FIGHTKARO_ROSTER_ENTRIES: FightKaroRosterEntry[] = [
  {
    order: 1,
    id: 'vikas',
    name: 'MitraMan',
    team: 'Team Vaada',
    superMove: 'MITRA CHAKRA',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/modi.webp',
    glbUrl: '/models/modi.glb',
    themeAndNotes: 'Rhetoric and wave-themed offense; saffron and gold visual accents.',
    accentColor: '#FF9933',
  },
  {
    order: 2,
    id: 'yatra',
    name: 'Yatra Boy',
    team: 'Team Yatra',
    superMove: 'ALOO SE SONA',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/rahul.webp',
    glbUrl: '/models/rahul.glb',
    themeAndNotes: 'Movement and march motifs; blue and green palette.',
    accentColor: '#2E9BFF',
  },
  {
    order: 3,
    id: 'didi',
    name: 'Deedee',
    team: 'Team Dharna',
    superMove: 'JADU HOBE',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/didi.webp',
    glbUrl: '/models/didi.glb',
    themeAndNotes: 'Street-energy and storm-style specials; green and cyan highlights.',
    accentColor: '#22B35E',
  },
  {
    order: 4,
    id: 'trump',
    name: 'Tariff Taau',
    team: 'Team Tariff',
    superMove: 'TARIFF TSUNAMI',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/trump.webp',
    glbUrl: '/models/trump.glb',
    themeAndNotes: 'Trade-war and deal-maker jokes; red and gold.',
    accentColor: '#E0262F',
  },
  {
    order: 5,
    id: 'yogi',
    name: 'Dozer Dada',
    team: 'Team Dozer',
    superMove: 'DOZER KA DHAMAKA',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/yogi.webp',
    glbUrl: '/models/yogi.glb',
    themeAndNotes: 'Heavy machinery and ground-pound flavor; orange and amber.',
    accentColor: '#F05A00',
  },
  {
    order: 6,
    id: 'nitin',
    name: 'Toll Man',
    team: 'Team Highway',
    superMove: 'GADDHA BLAST',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/nitin.webp',
    glbUrl: '/models/nitin.glb',
    themeAndNotes: 'Highways, barriers, and toll booth gags; orange and gold.',
    accentColor: '#FF9A1F',
  },
  {
    order: 7,
    id: 'ravi',
    name: 'Sutti Babu',
    team: 'Team Press',
    superMove: 'RED TAPE GAZETTE BIND',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/ravi.webp',
    glbUrl: '/models/ravi.glb',
    themeAndNotes: 'Press conference cadence, bureaucratic file pokes, and counter traps.',
    accentColor: '#8B5CF6',
  },
  {
    order: 8,
    id: 'lalu',
    name: 'Rail Raja',
    team: 'Team Chaara',
    superMove: 'GARIB RATH EXPRESS RAM',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/lalu.webp',
    glbUrl: '/models/lalu.glb',
    themeAndNotes: 'Rustic folk humor, lantern feints, and heavy belly-bump knockback.',
    accentColor: '#16A34A',
  },
  {
    order: 9,
    id: 'amit',
    name: 'Ghar Mantri',
    team: 'Team Chanakya',
    superMove: 'CHRONOLOGY CHECKMATE',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/amit.webp',
    glbUrl: '/models/amit.glb',
    themeAndNotes: 'Defensive traps, strategic spacing, and chronology command throws.',
    accentColor: '#94A3B8',
  },
  {
    order: 10,
    id: 'dhruv',
    name: 'Fact Bhai',
    team: 'Team Squad',
    superMove: 'DOSTO REALITY CHECK BEAM',
    unlockMethod: 'Character select',
    status: 'Playable',
    portraitUrl: '/faces/dhruv.webp',
    glbUrl: '/models/dhruv.glb',
    themeAndNotes: 'High-speed hand gestures, pointer pokes, and agile dash spacing.',
    accentColor: '#22D3EE',
  },
  {
    order: 11,
    id: 'mbapu',
    name: 'Mbapu',
    team: 'Shanti Akhada · Final Boss',
    superMove: 'MANCH CHHODO',
    unlockMethod: 'Win 3 consecutive 1P CPU matches (triggers on win #3)',
    status: 'Boss',
    portraitUrl: '/faces/mbapu.webp',
    glbUrl: '/models/mbapu.glb',
    themeAndNotes: 'Final Boss (200 HP, regenerates after 3s without taking a hit). Defeat via KO or Shanti Ki Jeet peace route.',
    accentColor: '#FFD700',
  },
  {
    order: 12,
    id: 'random',
    name: 'Random',
    team: 'Random Pick',
    superMove: 'Random',
    unlockMethod: 'Character select',
    status: 'Special',
    portraitUrl: '/faces/modi.webp',
    themeAndNotes: 'Picks a random selectable fighter for you at match start.',
    accentColor: '#A855F7',
  },
];

export const MBAPU_BOSS_STATS_TABLE = [
  { rule: 'Boss unlock', value: '3 consecutive 1P CPU wins (triggers on win #3)' },
  { rule: 'Boss health', value: '200 HP' },
  { rule: 'Recovery', value: '2.5 HP/s after 3s without taking a hit' },
  { rule: 'Mbapu super', value: '40% of max health damage' },
  { rule: 'Other supers (for comparison)', value: '30% of max health damage' },
  {
    rule: 'Peace thresholds',
    value: '20s nearby & 5 blocked hits without attacking -> "SHANTI KI JEET"',
  },
];

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
    preferredClips: [],
    clipTimeNormalized: 0,
    cropMarginRatio: 0.14,
    description: 'True 0° orthographic front plane of the FightKaro 3D GLB mesh showing symmetrical face, outfit, hands, and footwear.',
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
    preferredClips: [],
    clipTimeNormalized: 0,
    cropMarginRatio: 0.14,
    description: 'True 90° orthographic right profile of the FightKaro 3D GLB mesh showing nose/beard projection, torso depth, and footwear.',
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
    preferredClips: [],
    clipTimeNormalized: 0,
    cropMarginRatio: 0.14,
    description: 'True 180° orthographic rear plane of the FightKaro 3D GLB mesh showing back hair sculpt, garment drape, and heels.',
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
    preferredClips: [],
    clipTimeNormalized: 0,
    cropMarginRatio: 0.14,
    description: '35° orthographic three-quarter turnaround of the FightKaro 3D GLB mesh showing volumetric depth of face and outfit.',
  },
  {
    id: 'neutral_pose',
    index: 5,
    title: '05. Neutral Standing Pose',
    shortLabel: 'Neutral Standing Pose',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 0,
    poseKey: 'apose',
    expressionKey: 'confident',
    preferredClips: ['walk_fwd'],
    clipTimeNormalized: 0.0,
    cropMarginRatio: 0.14,
    description: 'Balanced standing rig reference pose with clearly visible hands, arms, collar, and planted footwear.',
  },
  {
    id: 'fighting_stance',
    index: 6,
    title: '06. Fighting Stance',
    shortLabel: 'Fighting Stance (guardbounce)',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 25,
    poseKey: 'combat',
    expressionKey: 'confident',
    preferredClips: ['guardbounce', 'cross', 'jabcross'],
    clipTimeNormalized: 0.35,
    cropMarginRatio: 0.14,
    description: 'Actual in-game FightKaro guardbounce fighting stance skeletal animation clip at 25° orthographic angle.',
  },
  {
    id: 'victory_pose',
    index: 7,
    title: '07. Victory Pose',
    shortLabel: 'Victory Pose',
    category: 'pose',
    cameraType: 'orthographic_full_body',
    yawDegrees: 15,
    poseKey: 'victory',
    expressionKey: 'laughing',
    preferredClips: ['uppercut', 'palm', 'elbowupper', 'slammer'],
    clipTimeNormalized: 0.48,
    cropMarginRatio: 0.14,
    description: 'Triumphant match-winning celebration pose from the FightKaro 3D skeletal rig.',
  },
  {
    id: 'expr_angry',
    index: 8,
    title: '08. Angry Facial Expression',
    shortLabel: 'Angry Head Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: 0,
    poseKey: 'neutral',
    expressionKey: 'angry',
    preferredClips: ['hit', 'cross'],
    clipTimeNormalized: 0.3,
    cropMarginRatio: 0.16,
    description: 'Orthographic close-up of the FightKaro 3D head mesh with fierce combat expression and forward brow tilt.',
  },
  {
    id: 'expr_laughing',
    index: 9,
    title: '09. Funny Laughing Expression',
    shortLabel: 'Laughing Head Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: 8,
    poseKey: 'neutral',
    expressionKey: 'laughing',
    preferredClips: ['guardbounce'],
    clipTimeNormalized: 0.5,
    cropMarginRatio: 0.16,
    description: 'Orthographic close-up of the FightKaro 3D head mesh with open-jaw laughing expression and jovial head tilt.',
  },
  {
    id: 'expr_shocked',
    index: 10,
    title: '10. Shocked Expression',
    shortLabel: 'Shocked Head Sculpt',
    category: 'expression',
    cameraType: 'orthographic_head_closeup',
    yawDegrees: -6,
    poseKey: 'neutral',
    expressionKey: 'shocked',
    preferredClips: ['hit', 'knockdown'],
    clipTimeNormalized: 0.22,
    cropMarginRatio: 0.16,
    description: 'Orthographic close-up of the FightKaro 3D head mesh with stunned recoil and wide-eyed shocked expression.',
  },
];

export const ALL_FIGHTKARO_CHARACTER_SPECS: Record<string, Omit<CharacterModelSheetSpec, 'slotNumber'>> = {
  vikas: {
    fighterId: 'vikas',
    name: 'MITRAMAN',
    parodyTitle: 'MitraMan · Team Vaada (Official FightKaro 3D Model: modi.glb)',
    teamName: 'Team Vaada',
    superMove: 'MITRA CHAKRA',
    personality: 'Commanding orator with saffron bandhgala vest, rimless glasses, manicured white beard, and wave-themed offense.',
    silhouetteArchetype: 'Broad-Shouldered Saffron Vest & White Kurta All-Rounder',
    glbUrl: '/models/modi.glb',
    portraitUrl: '/faces/modi.webp',
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
      topGarmentPrimary: '#EA7B26',
      topGarmentSecondary: '#F8F1E1',
      bottomGarment: '#EFE6D5',
      footwearColor: '#5C341E',
      accessoryAccent: '#D97706',
    },
    anatomyAndGarments: {
      hairstyle: 'Swept-back silver-white hair with full sculpted white beard and moustache (`Head` mesh).',
      facialFeatures: 'Detailed 3D facial geometry with `Glasses`, `EyeL`/`EyeR`, `EyeCorneaL`/`R`, `Eyelashes`, and `TeethUpper`/`TeethLower` meshes.',
      frontDetails: 'Saffron sleeveless Modi jacket (`OutfitTop`) over white half-sleeve kurta, pocket square, and fitted churidar (`OutfitBottom`).',
      sideDetails: 'Barrel-chested posture, rounded white beard profile, side vents on vest, and dark brown footwear (`Shoes`).',
      backDetails: 'Clean saffron jacket rear panel, white kurta sleeves, and cropped silver nape hairline.',
      handsAndFeet: 'Fully rigged 5-fingered `Body` hands and `Shoes` mesh.',
      accessories: ['Glasses Mesh', 'Saffron Modi Jacket (OutfitTop)', 'White Kurta & Churidar (OutfitBottom)', 'Dress Shoes (Shoes)'],
    },
    sculptSpecs: {
      triCountBudget: 28400,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (modi.glb)',
      subsurfaceScattering: 0.42,
      clothRoughness: 0.78,
      skinRoughness: 0.45,
      glbMeshGroups: ['Body', 'EyeCorneaL', 'EyeCorneaR', 'EyeL', 'Eyelashes', 'EyeR', 'Glasses', 'Head', 'OutfitBottom', 'OutfitTop', 'Shoes', 'TeethLower', 'TeethUpper'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'palm', 'jabelbow', 'frontkick', 'uppercut', 'crescent', 'butterfly', 'lowjab', 'sweep360', 'flyingkick', 'cross', 'kick'],
    },
  },
  yatra: {
    fighterId: 'yatra',
    name: 'YATRA BOY',
    parodyTitle: 'Yatra Boy · Team Yatra (Official FightKaro 3D Model: rahul.glb)',
    teamName: 'Team Yatra',
    superMove: 'ALOO SE SONA',
    personality: 'Energetic marathon sprinter in iconic white polo T-shirt, dark cargo trousers, and tousled wavy hair with beard.',
    silhouetteArchetype: 'Lean Athletic Sprinter in White Polo & Trousers',
    glbUrl: '/models/rahul.glb',
    portraitUrl: '/faces/rahul.webp',
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
      topGarmentPrimary: '#F8FAFC',
      topGarmentSecondary: '#E2E8F0',
      bottomGarment: '#334155',
      footwearColor: '#1E293B',
      accessoryAccent: '#2E9BFF',
    },
    anatomyAndGarments: {
      hairstyle: 'Wavy dark brown hair with salt-and-pepper scruff beard (`Head` mesh).',
      facialFeatures: 'Expressive brows, dimpled cheeks, `EyeL`/`EyeR`, `Eyelashes`, and `TeethUpper`/`TeethLower` meshes.',
      frontDetails: 'Signature fitted white Yatra polo T-shirt (`OutfitTop`) over dark tailored trousers (`OutfitBottom`).',
      sideDetails: 'Athletic runner posture, short polo sleeves revealing toned forearms (`Body`), running shoes (`Shoes`).',
      backDetails: 'Clean white polo back and tapered trousers.',
      handsAndFeet: 'Articulated 5-fingered brawler hands (`Body`) and marathon sneakers (`Shoes`).',
      accessories: ['White Yatra Polo Shirt (OutfitTop)', 'Dark Marathon Trousers (OutfitBottom)', 'Running Sneakers (Shoes)'],
    },
    sculptSpecs: {
      triCountBudget: 26900,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (rahul.glb)',
      subsurfaceScattering: 0.45,
      clothRoughness: 0.82,
      skinRoughness: 0.42,
      glbMeshGroups: ['Body', 'EyeCorneaL', 'EyeCorneaR', 'EyeL', 'Eyelashes', 'EyeR', 'Head', 'OutfitBottom', 'OutfitTop', 'Shoes', 'TeethLower', 'TeethUpper'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'jabcross', 'uppercut', 'flipkick', 'highkick', 'lowjab', 'sweep360', 'flyingkick', 'cross', 'kick'],
    },
  },
  yogi: {
    fighterId: 'yogi',
    name: 'DOZER DADA',
    parodyTitle: 'Dozer Dada · Team Dozer (Official FightKaro 3D Model: yogi.glb)',
    teamName: 'Team Dozer',
    superMove: 'DOZER KA DHAMAKA',
    personality: 'No-nonsense saffron-clad powerhouse with shaved head, fierce brow, draped shawl, and ground-pound punches.',
    silhouetteArchetype: 'Compact Power Juggernaut in Saffron Kurta, Dhoti & Shawl',
    glbUrl: '/models/yogi.glb',
    portraitUrl: '/faces/yogi.webp',
    proportions: {
      totalHeightCm: 170,
      headToBodyRatio: 4.4,
      shoulderToHipRatio: 1.35,
      bellyRadiusFactor: 1.04,
      limbThicknessFactor: 1.18,
      headWidthFactor: 1.12,
      jawShape: 'monk_compact',
    },
    palette: {
      skinBase: '#D49A6A',
      skinSubsurface: '#E29578',
      skinShadow: '#99653F',
      hairPrimary: '#1E293B',
      hairHighlight: '#475569',
      topGarmentPrimary: '#F05A00',
      topGarmentSecondary: '#EA580C',
      bottomGarment: '#FB923C',
      footwearColor: '#78350F',
      accessoryAccent: '#F59E0B',
    },
    anatomyAndGarments: {
      hairstyle: 'Clean-shaven monk dome with pronounced brow ridge and intense eyes (`Head` mesh).',
      facialFeatures: 'Rounded cheeks, stern jawline, ear adornment, and fierce facial sculpt.',
      frontDetails: 'Saffron `Kurta` and draped `Shawl` over traditional `Dhoti` with `NeckFill` and bare `Forearms`.',
      sideDetails: 'Forward-leaning powerhouse stance, draped saffron shawl folds, and sturdy `Shoes`.',
      backDetails: 'Full saffron shawl drape across upper back and pleated dhoti rear.',
      handsAndFeet: 'Muscular `Forearms` and hands (`Body`) with traditional footwear (`Shoes`).',
      accessories: ['Saffron Kurta (Kurta)', 'Draped Saffron Shawl (Shawl)', 'Traditional Dhoti (Dhoti)', 'Sandals (Shoes)'],
    },
    sculptSpecs: {
      triCountBudget: 27600,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (yogi.glb)',
      subsurfaceScattering: 0.44,
      clothRoughness: 0.84,
      skinRoughness: 0.46,
      glbMeshGroups: ['Body', 'Dhoti', 'Forearms', 'Head', 'Kurta', 'NeckFill', 'Shawl', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'elbowupper', 'slammer', 'lowjab', 'sweep360', 'flyingkick', 'kick'],
    },
  },
  lalu: {
    fighterId: 'lalu',
    name: 'RAIL RAJA',
    parodyTitle: 'Rail Raja · Team Chaara (Official FightKaro 3D Model: lalu.glb)',
    teamName: 'Team Chaara',
    superMove: 'GARIB RATH EXPRESS RAM',
    personality: 'Boisterous folk heavyweight with signature side-wing white hair, comedic grin, and belly-bump feints.',
    silhouetteArchetype: 'Wide Jovial Heavyweight Trickster',
    glbUrl: '/models/lalu.glb',
    portraitUrl: '/faces/lalu.webp',
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
      topGarmentPrimary: '#1E6F3D',
      topGarmentSecondary: '#F8FAFC',
      bottomGarment: '#F1F5F9',
      footwearColor: '#783F1D',
      accessoryAccent: '#16A34A',
    },
    anatomyAndGarments: {
      hairstyle: 'Iconic silver-white side wing hair tufts with broad forehead (`Head` mesh).',
      facialFeatures: 'Wide jovial cheeks, expressive eyes, and unmistakable comedic grin.',
      frontDetails: 'Traditional kurta and vest over dhoti.',
      sideDetails: 'Heavyweight silhouette and sturdy stance.',
      backDetails: 'Clean kurta back and dhoti drape.',
      handsAndFeet: 'Full 3D hands and traditional footwear.',
      accessories: ['Kurta & Vest', 'Traditional Dhoti', 'Slip-on Footwear'],
    },
    sculptSpecs: {
      triCountBudget: 25400,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (lalu.glb)',
      subsurfaceScattering: 0.44,
      clothRoughness: 0.85,
      skinRoughness: 0.46,
      glbMeshGroups: ['Body', 'Head', 'OutfitTop', 'OutfitBottom', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'kick'],
    },
  },
  didi: {
    fighterId: 'didi',
    name: 'DEEDEE',
    parodyTitle: 'Deedee · Team Dharna (Official FightKaro 3D Model: didi.glb)',
    teamName: 'Team Dharna',
    superMove: 'JADU HOBE',
    personality: 'Fierce street-rally counter brawler in blue-bordered white cotton saree and hawai chappals.',
    silhouetteArchetype: 'Agile Counter Specialist in Blue-Bordered White Saree',
    glbUrl: '/models/didi.glb',
    portraitUrl: '/faces/didi.webp',
    proportions: {
      totalHeightCm: 162,
      headToBodyRatio: 4.4,
      shoulderToHipRatio: 1.15,
      bellyRadiusFactor: 1.0,
      limbThicknessFactor: 1.0,
      headWidthFactor: 1.05,
      jawShape: 'round_jovial',
    },
    palette: {
      skinBase: '#D9A066',
      skinSubsurface: '#E29578',
      skinShadow: '#99653F',
      hairPrimary: '#1E293B',
      hairHighlight: '#334155',
      topGarmentPrimary: '#F8FAFC',
      topGarmentSecondary: '#0284C7',
      bottomGarment: '#F8FAFC',
      footwearColor: '#38BDF8',
      accessoryAccent: '#22B35E',
    },
    anatomyAndGarments: {
      hairstyle: 'Pulled-back dark hair bun with glasses and forehead bindi.',
      facialFeatures: 'Fierce determined expression with glasses.',
      frontDetails: 'Iconic white cotton saree with blue border.',
      sideDetails: 'Draped saree pallu and agile fighter posture.',
      backDetails: 'Neat hair bun and saree drape.',
      handsAndFeet: 'Expressive hands and signature chappals.',
      accessories: ['Glasses', 'Blue-Border White Saree', 'Hawai Chappals'],
    },
    sculptSpecs: {
      triCountBudget: 26200,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (didi.glb)',
      subsurfaceScattering: 0.43,
      clothRoughness: 0.82,
      skinRoughness: 0.44,
      glbMeshGroups: ['Body', 'Head', 'Glasses', 'OutfitTop', 'OutfitBottom', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'kick'],
    },
  },
  trump: {
    fighterId: 'trump',
    name: 'TARIFF TAAU',
    parodyTitle: 'Tariff Taau · Team Tariff (Official FightKaro 3D Model: trump.glb)',
    teamName: 'Team Tariff',
    superMove: 'TARIFF TSUNAMI',
    personality: 'Deal-making heavyweight grappler with golden swept pompadour, navy suit, and long red tie.',
    silhouetteArchetype: 'Heavyweight Suit-and-Tie Grappler',
    glbUrl: '/models/trump.glb',
    portraitUrl: '/faces/trump.webp',
    proportions: {
      totalHeightCm: 186,
      headToBodyRatio: 4.5,
      shoulderToHipRatio: 1.38,
      bellyRadiusFactor: 1.25,
      limbThicknessFactor: 1.22,
      headWidthFactor: 1.15,
      jawShape: 'stern_heavy',
    },
    palette: {
      skinBase: '#F4A261',
      skinSubsurface: '#E76F51',
      skinShadow: '#B56547',
      hairPrimary: '#FACC15',
      hairHighlight: '#FEF08A',
      topGarmentPrimary: '#1E3A8A',
      topGarmentSecondary: '#E0262F',
      bottomGarment: '#1E3A8A',
      footwearColor: '#0F172A',
      accessoryAccent: '#E0262F',
    },
    anatomyAndGarments: {
      hairstyle: 'Signature golden-blonde swept pompadour.',
      facialFeatures: 'Exaggerated pursed expression and heavy jawline.',
      frontDetails: 'Navy blue suit jacket, white dress shirt, and long red tie.',
      sideDetails: 'Broad-shouldered heavyweight suit profile.',
      backDetails: 'Tailored navy suit back.',
      handsAndFeet: 'Expressive gesturing hands and black dress shoes.',
      accessories: ['Signature Red Tie', 'Navy Blue Suit', 'Dress Shoes'],
    },
    sculptSpecs: {
      triCountBudget: 31000,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (trump.glb)',
      subsurfaceScattering: 0.4,
      clothRoughness: 0.75,
      skinRoughness: 0.45,
      glbMeshGroups: ['Body', 'Head', 'OutfitTop', 'OutfitBottom', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'kick'],
    },
  },
  nitin: {
    fighterId: 'nitin',
    name: 'TOLL MAN',
    parodyTitle: 'Toll Man · Team Highway (Official FightKaro 3D Model: nitin.glb)',
    teamName: 'Team Highway',
    superMove: 'GADDHA BLAST',
    personality: 'Expressway builder and zoner with glasses, waistcoat, and unstoppable infrastructure energy.',
    silhouetteArchetype: 'Sturdy Zoner in Waistcoat & Kurta',
    glbUrl: '/models/nitin.glb',
    portraitUrl: '/faces/nitin.webp',
    proportions: {
      totalHeightCm: 171,
      headToBodyRatio: 4.4,
      shoulderToHipRatio: 1.2,
      bellyRadiusFactor: 1.3,
      limbThicknessFactor: 1.2,
      headWidthFactor: 1.16,
      jawShape: 'round_jovial',
    },
    palette: {
      skinBase: '#DFAC78',
      skinSubsurface: '#E29578',
      skinShadow: '#99653F',
      hairPrimary: '#334155',
      hairHighlight: '#94A3B8',
      topGarmentPrimary: '#FF9A1F',
      topGarmentSecondary: '#F8FAFC',
      bottomGarment: '#F1F5F9',
      footwearColor: '#451A03',
      accessoryAccent: '#F59E0B',
    },
    anatomyAndGarments: {
      hairstyle: 'Neatly combed dark-grey hair with moustache and glasses.',
      facialFeatures: 'Confident builder expression with spectacles.',
      frontDetails: 'Formal jacket/vest over crisp white kurta.',
      sideDetails: 'Solid grounded zoner stance.',
      backDetails: 'Clean tailored waistcoat back.',
      handsAndFeet: 'Sturdy hands and dress shoes.',
      accessories: ['Spectacles', 'Highway Minister Vest', 'Dress Footwear'],
    },
    sculptSpecs: {
      triCountBudget: 28900,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (nitin.glb)',
      subsurfaceScattering: 0.42,
      clothRoughness: 0.8,
      skinRoughness: 0.45,
      glbMeshGroups: ['Body', 'Head', 'Glasses', 'OutfitTop', 'OutfitBottom', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'kick'],
    },
  },
  mbapu: {
    fighterId: 'mbapu',
    name: 'MBAPU',
    parodyTitle: 'Mbapu · Shanti Akhada Final Boss (Official FightKaro 3D Model: mbapu.glb)',
    teamName: 'Shanti Akhada · Final Boss',
    superMove: 'MANCH CHHODO',
    personality: '200 HP Final Boss with golden aura, round glasses, shawl, and Shanti Ki Jeet peace route mechanics.',
    silhouetteArchetype: 'Ascetic Peace Boss in Traditional Dhoti & Shawl',
    glbUrl: '/models/mbapu.glb',
    portraitUrl: '/faces/mbapu.webp',
    proportions: {
      totalHeightCm: 168,
      headToBodyRatio: 4.4,
      shoulderToHipRatio: 1.18,
      bellyRadiusFactor: 0.92,
      limbThicknessFactor: 0.95,
      headWidthFactor: 1.08,
      jawShape: 'monk_compact',
    },
    palette: {
      skinBase: '#C68642',
      skinSubsurface: '#D97706',
      skinShadow: '#78350F',
      hairPrimary: '#F8FAFC',
      hairHighlight: '#FFFFFF',
      topGarmentPrimary: '#FEF3C7',
      topGarmentSecondary: '#FDE68A',
      bottomGarment: '#F8FAFC',
      footwearColor: '#78350F',
      accessoryAccent: '#FFD700',
    },
    anatomyAndGarments: {
      hairstyle: 'Smooth sage head with iconic round wireframe glasses.',
      facialFeatures: 'Serene yet formidable boss expression.',
      frontDetails: 'Traditional draped khadi shawl and dhoti.',
      sideDetails: 'Balanced martial arts meditation posture.',
      backDetails: 'Draped khadi shawl across shoulders.',
      handsAndFeet: 'Hands and traditional sandals.',
      accessories: ['Round Wireframe Glasses', 'Khadi Shawl & Dhoti', 'Sandals'],
    },
    sculptSpecs: {
      triCountBudget: 34200,
      materialShader: 'FightKaro GLTF PBR + WebP Textures (mbapu.glb)',
      subsurfaceScattering: 0.45,
      clothRoughness: 0.85,
      skinRoughness: 0.44,
      glbMeshGroups: ['Body', 'Head', 'Glasses', 'OutfitTop', 'OutfitBottom', 'Shoes'],
      glbAnimations: ['guardbounce', 'walk_fwd', 'walk_back', 'crouch', 'jump', 'hit', 'block', 'knockdown', 'getup', 'cross', 'kick'],
    },
  },
};

export const CHARACTER_MODEL_SHEETS: CharacterModelSheetSpec[] = [
  {
    slotNumber: 'CHARACTER 01',
    ...ALL_FIGHTKARO_CHARACTER_SPECS.vikas,
  },
  {
    slotNumber: 'CHARACTER 02',
    ...ALL_FIGHTKARO_CHARACTER_SPECS.yatra,
  },
  {
    slotNumber: 'CHARACTER 03',
    ...ALL_FIGHTKARO_CHARACTER_SPECS.yogi,
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

  const jawShapes = new Set(characters.map((c) => c.proportions.jawShape));
  if (jawShapes.size !== 3) {
    errors.push('All 3 characters must have distinct face/jaw shapes.');
  }

  const garmentColors = new Set(characters.map((c) => c.palette.topGarmentPrimary));
  if (garmentColors.size !== 3) {
    errors.push('All 3 characters must have distinct primary outfit colors.');
  }

  for (const c of characters) {
    if (!c.glbUrl.startsWith('/models/') || !c.glbUrl.endsWith('.glb')) {
      errors.push(`Character ${c.name} must reference an authentic FightKaro 3D .glb model in /models/.`);
    }
  }

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
