export interface FighterConfig {
  id: string;
  name: string;
  party: string;
  teamLabel?: string;
  archetype: string;
  accent: string;
  secondaryColor: string;
  skinTone: string;
  headgear:
    | 'glasses_beard'
    | 'headband'
    | 'bun_saree'
    | 'pompadour'
    | 'saffron_robe'
    | 'highway_cap'
    | 'files_glasses'
    | 'rail_cap'
    | 'chanakya_bald'
    | 'youtuber_mic'
    | 'gandhi_sage';
  superName: string;
  specialMoveName: string;
  desc: string;
  isBoss?: boolean;
  portraitUrl?: string;
  modelUrl?: string;
  unlockHow?: string;
  statusLabel?: 'Playable' | 'Boss' | 'Special';
  stats: {
    power: number; // 1-10
    speed: number; // 1-10
    defense: number; // 1-10
  };
  quotes: {
    intro: string;
    win: string;
    excuse: string;
    hitCry: string[];
  };
}

export interface StageConfig {
  id: string;
  name: string;
  subtitle: string;
  skyTop: string;
  skyBottom: string;
  floorColor: string;
  trimColor: string;
  bgImage?: string;
}

export const STAGES: StageConfig[] = [
  {
    id: 'sansad',
    name: 'SANSAD CENTRAL HALL',
    subtitle: 'Well of the House · Zero Hour Showdown',
    skyTop: '#24110B',
    skyBottom: '#431D12',
    floorColor: '#5A1818',
    trimColor: '#D97706',
    bgImage: '/src/assets/images/arena_sansad_hall_1794237658110.jpg',
  },
  {
    id: 'jantar',
    name: 'JANTAR MANTAR DHARNA',
    subtitle: 'Loudspeakers, Placards & Chai Stalls',
    skyTop: '#0F172A',
    skyBottom: '#1E293B',
    floorColor: '#334155',
    trimColor: '#F59E0B',
  },
  {
    id: 'road',
    name: 'DESI SADAK EXPRESSWAY',
    subtitle: '6-Lane Toll Naka & Barricade Chaos',
    skyTop: '#18181B',
    skyBottom: '#27272A',
    floorColor: '#1E1B18',
    trimColor: '#22D3EE',
  },
];

export const FIGHTERS: FighterConfig[] = [
  {
    id: 'vikas',
    name: 'MITRAMAN',
    party: 'Team Vaada · Prime All-Rounder',
    teamLabel: 'Team Vaada',
    archetype: 'All-Rounder',
    accent: '#FF9933',
    secondaryColor: '#FFF7ED',
    skinTone: '#E0AC69',
    headgear: 'glasses_beard',
    superName: 'MITRA CHAKRA',
    specialMoveName: 'Teleprompter Thunder Clap',
    desc: 'Rhetoric and wave-themed offense; saffron and gold visual accents.',
    portraitUrl: '/faces/modi.webp',
    modelUrl: '/models/modi.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 9, speed: 7, defense: 8 },
    quotes: {
      intro: 'Bhaiyo aur behno, kursi ki peti baandh lo!',
      win: 'Yeh Aatmanirbhar knockout hai!',
      excuse: 'Yeh sab pichhle 70 saal ki galti hai. Teleprompter hang ho gaya tha!',
      hitCry: ['MITRON!', 'MITRA CHAKRA!', 'VIKAS PUNCH!', '8 BAJE!'],
    },
  },
  {
    id: 'yatra',
    name: 'YATRA BOY',
    party: 'Team Yatra · Marathon Rushdown',
    teamLabel: 'Team Yatra',
    archetype: 'Speedster',
    accent: '#2E9BFF',
    secondaryColor: '#FFFFFF',
    skinTone: '#E5B887',
    headgear: 'headband',
    superName: 'ALOO SE SONA',
    specialMoveName: 'White T-Shirt Pushup Uppercut',
    desc: 'Movement and march motifs; blue and green palette.',
    portraitUrl: '/faces/rahul.webp',
    modelUrl: '/models/rahul.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 7, speed: 10, defense: 7 },
    quotes: {
      intro: 'Nafrat ke bazaar mein boxing ring kholne aaya hoon!',
      win: 'Yatra abhi ruki nahi, agli round tak chalegi!',
      excuse: 'Scoreboard hack ho gaya tha! Introspection committee banayi jayegi.',
      hitCry: ['KHATAKHAT!', 'ALOO SE SONA!', 'JUDO KARATE!', 'DARO MAT!'],
    },
  },
  {
    id: 'didi',
    name: 'DEEDEE',
    party: 'Team Dharna · Counter Brawler',
    teamLabel: 'Team Dharna',
    archetype: 'Counter Specialist',
    accent: '#22B35E',
    secondaryColor: '#F0FDF4',
    skinTone: '#D9A066',
    headgear: 'bun_saree',
    superName: 'JADU HOBE',
    specialMoveName: 'Hawai Chappal Low Sweep',
    desc: 'Street-energy and storm-style specials; green and cyan highlights.',
    portraitUrl: '/faces/didi.webp',
    modelUrl: '/models/didi.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 8, speed: 9, defense: 7 },
    quotes: {
      intro: 'Aaj Sansad mein asli Khela Hobe!',
      win: 'Humba Humba, Ramba Ramba, Kamba Kamba — Knockout!',
      excuse: 'Sab referee ki chaal hai! Kal se dharna shuru, ladai abhi baaki hai!',
      hitCry: ['JADU HOBE!', 'KHELA HOBE!', 'CHAPPAL SWEEP!', 'HUMBA HUMBA!'],
    },
  },
  {
    id: 'trump',
    name: 'TARIFF TAAU',
    party: 'Team Tariff · Heavy Grappler',
    teamLabel: 'Team Tariff',
    archetype: 'Grappler',
    accent: '#E0262F',
    secondaryColor: '#1E3A8A',
    skinTone: '#F4A261',
    headgear: 'pompadour',
    superName: 'TARIFF TSUNAMI',
    specialMoveName: 'Covfefe Power Throw',
    desc: 'Trade-war and deal-maker jokes; red and gold.',
    portraitUrl: '/faces/trump.webp',
    modelUrl: '/models/trump.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 10, speed: 5, defense: 9 },
    quotes: {
      intro: 'Nobody fights better than me. Believe me, it will be YUGE!',
      win: 'Total victory! The biggest knockout in history, folks!',
      excuse: 'The fight was rigged! Very unfair referee! Fake news, we actually won hugely.',
      hitCry: ['YUGE HIT!', 'TARIFF TSUNAMI!', 'TREMENDOUS!', 'YOU ARE FIRED!'],
    },
  },
  {
    id: 'yogi',
    name: 'DOZER DADA',
    party: 'Team Dozer · Armored Juggernaut',
    teamLabel: 'Team Dozer',
    archetype: 'Power Juggernaut',
    accent: '#F05A00',
    secondaryColor: '#FFEDD5',
    skinTone: '#D49A6A',
    headgear: 'saffron_robe',
    superName: 'DOZER KA DHAMAKA',
    specialMoveName: 'Naam Badlo Hammer Fist',
    desc: 'Heavy machinery and ground-pound flavor; orange and amber.',
    portraitUrl: '/faces/yogi.webp',
    modelUrl: '/models/yogi.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 10, speed: 6, defense: 8 },
    quotes: {
      intro: 'Aaj tumhara naam aur health bar dono badal denge!',
      win: 'Maamla poori tarah samapt!',
      excuse: 'Bulldozer ka diesel khatam ho gaya tha. Kal subah 5 baje se double shift!',
      hitCry: ['DOZER KA DHAMAKA!', 'NAAM BADLO!', 'DHWAST!', 'SYSTEM CRUSH!'],
    },
  },
  {
    id: 'nitin',
    name: 'TOLL MAN',
    party: 'Team Highway · Long-Range Zoner',
    teamLabel: 'Team Highway',
    archetype: 'Zoner',
    accent: '#FF9A1F',
    secondaryColor: '#FEF3C7',
    skinTone: '#DFAC78',
    headgear: 'highway_cap',
    superName: 'GADDHA BLAST',
    specialMoveName: 'FASTag Barrier Thrust',
    desc: 'Highways, barriers, and toll booth gags; orange and gold.',
    portraitUrl: '/faces/nitin.webp',
    modelUrl: '/models/nitin.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 8, speed: 7, defense: 9 },
    quotes: {
      intro: 'Do minute mein tumhare upar 8-lane flyover bana dunga!',
      win: 'World-class concrete knockout in record time!',
      excuse: 'Toll naka pe traffic tha. Agli baar 6-lane greenfield expressway pe ladenge!',
      hitCry: ['GADDHA BLAST!', 'TOLL DEDUCTED!', 'FLYOVER SLAM!', 'RECORD TIME!'],
    },
  },
  {
    id: 'ravi',
    name: 'SUTTI BABU',
    party: 'Team Press · Frame-Trap Tactician',
    teamLabel: 'Team Press',
    archetype: 'Technical',
    accent: '#8B5CF6',
    secondaryColor: '#EDE9FE',
    skinTone: '#C68B59',
    headgear: 'files_glasses',
    superName: 'RED TAPE GAZETTE BIND',
    specialMoveName: 'Sub-Committee File Slap',
    desc: 'Lightning-fast counter pokes and bureaucratic stamina drain.',
    portraitUrl: '/faces/ravi.webp',
    modelUrl: '/models/ravi.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 7, speed: 9, defense: 8 },
    quotes: {
      intro: 'File number 420 ke tahat aapki haar manzoor ki jaati hai!',
      win: 'Circular issued: Kursi officially transferred!',
      excuse: 'Lunch break ke baad aana, abhi server down hai!',
      hitCry: ['STAMPED!', 'FILE CLOSED!', 'NOTIFIED!', 'RULE 144!'],
    },
  },
  {
    id: 'lalu',
    name: 'RAIL RAJA',
    party: 'Team Chaara · Heavy Trickster',
    teamLabel: 'Team Chaara',
    archetype: 'Trickster',
    accent: '#16A34A',
    secondaryColor: '#DCFCE7',
    skinTone: '#C88A55',
    headgear: 'rail_cap',
    superName: 'GARIB RATH EXPRESS RAM',
    specialMoveName: 'Kulhad Chai Belly Bump',
    desc: 'Unpredictable feints, comedic knockback, and high vitality.',
    portraitUrl: '/faces/lalu.webp',
    modelUrl: '/models/lalu.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 9, speed: 6, defense: 9 },
    quotes: {
      intro: 'Arre bujho babua, abhi rail chalayenge seedha kursi par!',
      win: 'Dhat budbak! Humse takkar loge?',
      excuse: 'Signal laal tha, agli baar superfast Rajdhani se aayenge!',
      hitCry: ['DHAT BUDBAK!', 'CHUK-CHUK!', 'LANTERN FLASH!', 'GARIB RATH!'],
    },
  },
  {
    id: 'amit',
    name: 'GHAR MANTRI',
    party: 'Team Chanakya · Defensive Mastermind',
    teamLabel: 'Team Chanakya',
    archetype: 'Mastermind',
    accent: '#CBD5E1',
    secondaryColor: '#334155',
    skinTone: '#DDB080',
    headgear: 'chanakya_bald',
    superName: 'CHRONOLOGY CHECKMATE',
    specialMoveName: 'Midnight Resort Transfer Grab',
    desc: 'Superior block recovery and lethal punish throws.',
    portraitUrl: '/faces/amit.webp',
    modelUrl: '/models/amit.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 9, speed: 7, defense: 9 },
    quotes: {
      intro: 'Aap chronology samjhiye: pehle jab padega, phir knockout hoga!',
      win: 'Booth level se lekar ring tak — clean sweep!',
      excuse: 'Booth-wise review ke baad baat karenge. Yeh toh sirf jumla warm-up tha!',
      hitCry: ['CHRONOLOGY!', 'CHANAKYA MOVE!', 'CHECKMATE!', 'CLEAN SWEEP!'],
    },
  },
  {
    id: 'dhruv',
    name: 'FACT BHAI',
    party: 'Team Squad · Footsie Specialist',
    teamLabel: 'Team Squad',
    archetype: 'Footsie',
    accent: '#22D3EE',
    secondaryColor: '#CFFAFE',
    skinTone: '#E8B88A',
    headgear: 'youtuber_mic',
    superName: 'DOSTO REALITY CHECK BEAM',
    specialMoveName: 'Green Screen Pointer Poke',
    desc: 'Long-range hand gesture pokes and high-agility backdashes.',
    portraitUrl: '/faces/dhruv.webp',
    modelUrl: '/models/dhruv.glb',
    unlockHow: 'Character select',
    statusLabel: 'Playable',
    stats: { power: 7, speed: 9, defense: 7 },
    quotes: {
      intro: 'Namaskar dosto! Aaj hum is fighter ki pitai ka poora sach janenge!',
      win: 'Like, share aur subscribe zaroor karein — opponent debunked!',
      excuse: 'Algorithm ne reach kam kar di! Part 2 video mein poora sach aayega.',
      hitCry: ['NAMASKAR DOSTO!', 'FACT CHECK!', 'DEBUNKED!', 'SOURCE LINK!'],
    },
  },
  {
    id: 'mbapu',
    name: 'MBAPU',
    party: 'Shanti Akhada · Final Boss',
    teamLabel: 'Shanti Akhada · Final Boss',
    archetype: 'Ahinsa Boss',
    accent: '#FFD700',
    secondaryColor: '#FEF9C3',
    skinTone: '#C68642',
    headgear: 'gandhi_sage',
    superName: 'MANCH CHHODO',
    specialMoveName: 'Dandi Staff Moral Aura',
    desc: 'Final Boss (200 HP, regenerates after 3s without taking a hit). Defeat via KO or Shanti Ki Jeet peace route (20s nearby + 5 blocked hits).',
    isBoss: true,
    portraitUrl: '/faces/mbapu.webp',
    modelUrl: '/models/mbapu.glb',
    unlockHow: 'Win 3 consecutive 1P CPU matches (triggers on win #3)',
    statusLabel: 'Boss',
    stats: { power: 10, speed: 8, defense: 10 },
    quotes: {
      intro: 'Hinsa se mujhe nahi jeet paoge. Shanti aur sanyam dikhao!',
      win: 'Main sirf aapka sabar dekh raha tha. Aaj ka sabak poora hua.',
      excuse: 'Ahinsa ke aage meri lathi bhi jhuk gayi. Shanti Ki Jeet!',
      hitCry: ['MANCH CHHODO!', 'AHINSA!', 'SHANTI!', 'SABAR RAKHO!'],
    },
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  xpReward: number;
  coinReward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_login',
    title: 'Oath of Office',
    desc: 'Enter the Sansad Showdown arena for the first time.',
    xpReward: 50,
    coinReward: 50,
  },
  {
    id: 'first_win',
    title: 'Maiden Election Victory',
    desc: 'Win your first 1v1 match in any mode.',
    xpReward: 100,
    coinReward: 75,
  },
  {
    id: 'combo_master',
    title: 'Manifesto Flurry',
    desc: 'Land a 5+ hit Target Combo in a single match.',
    xpReward: 150,
    coinReward: 100,
  },
  {
    id: 'shakti_unleashed',
    title: 'Full Majority Super',
    desc: 'Unleash a 100% Shakti Super Move.',
    xpReward: 120,
    coinReward: 80,
  },
  {
    id: 'ahinsa_victor',
    title: 'Shanti Ki Jeet (Peace Route)',
    desc: 'Defeat Boss Mbapu using non-violence (20s nearby & 5 blocked hits) or Budget Counter.',
    xpReward: 400,
    coinReward: 250,
  },
  {
    id: 'hard_campaigner',
    title: 'Seasoned Parliamentarian',
    desc: 'Defeat the CPU on HARD difficulty.',
    xpReward: 250,
    coinReward: 150,
  },
  {
    id: 'streak_3',
    title: 'Hattrick Mandate',
    desc: 'Achieve a 3-match winning streak to unlock Boss Mbapu.',
    xpReward: 200,
    coinReward: 120,
  },
  {
    id: 'online_contender',
    title: 'All-Party Coalition',
    desc: 'Create or join a live Multiplayer Room.',
    xpReward: 150,
    coinReward: 100,
  },
];

export const BREAKING_TICKER_LINES = [
  'BREAKING: Speakers desk demands compensation for 14 broken microphones during Zero Hour combo exchange',
  'EXIT POLL UPDATE: Both fighters claiming 400+ seats despite health bar dropping below 15%',
  'CANTEEN ALERT: Samosa prices frozen while Shakti Meter crosses danger mark in Central Hall',
  'FACT CHECK DESK: Slow-motion replay confirms Chappal Sweep was frame-positive on block',
  'WEATHER REPORT: Heavy jumla showers expected across Jantar Mantar and Desi Sadak stages',
  'SHANTI KI JEET TIP: Against Mbapu, stay close for 20s and block 5 hits without attacking for a peaceful victory!',
];
