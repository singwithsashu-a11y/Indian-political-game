export interface FighterConfig {
  id: string;
  name: string;
  party: string;
  archetype: string;
  accent: string;
  secondaryColor: string;
  skinTone: string;
  headgear: 'glasses_beard' | 'headband' | 'bun_saree' | 'pompadour' | 'saffron_robe' | 'highway_cap' | 'files_glasses' | 'rail_cap' | 'chanakya_bald' | 'youtuber_mic' | 'gandhi_sage';
  superName: string;
  specialMoveName: string;
  desc: string;
  isBoss?: boolean;
  portraitUrl?: string;
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
    party: 'Vikas Morcha · Prime All-Rounder',
    archetype: 'All-Rounder',
    accent: '#FF9933',
    secondaryColor: '#FFF7ED',
    skinTone: '#E0AC69',
    headgear: 'glasses_beard',
    superName: 'MASTERSTROKE LASER WAVE',
    specialMoveName: 'Teleprompter Thunder Clap',
    desc: 'Heavy poise, booming megaphone shockwaves, and 8PM surprise supers.',
    portraitUrl: '/src/assets/images/fighter_vikas_mantri_1794237658789.jpg',
    stats: { power: 9, speed: 7, defense: 8 },
    quotes: {
      intro: 'Bhaiyo aur behno, kursi ki peti baandh lo!',
      win: 'Yeh Aatmanirbhar knockout hai!',
      excuse: 'Yeh sab pichhle 70 saal ki galti hai. Teleprompter hang ho gaya tha!',
      hitCry: ['MITRON!', 'MASTERSTROKE!', 'VIKAS PUNCH!', '8 BAJE!'],
    },
  },
  {
    id: 'yatra',
    name: 'YATRA BOY',
    party: 'MohabbatKiDukaan · Marathon Rushdown',
    archetype: 'Speedster',
    accent: '#2E9BFF',
    secondaryColor: '#FFFFFF',
    skinTone: '#E5B887',
    headgear: 'headband',
    superName: '4000KM MARATHON BLITZ',
    specialMoveName: 'White T-Shirt Pushup Uppercut',
    desc: 'Relentless dash speed, rapid triple-jab chains, and zero winter fatigue.',
    portraitUrl: '/src/assets/images/fighter_yatra_veer_1794237661002.jpg',
    stats: { power: 7, speed: 10, defense: 7 },
    quotes: {
      intro: 'Nafrat ke bazaar mein boxing ring kholne aaya hoon!',
      win: 'Yatra abhi ruki nahi, agli round tak chalegi!',
      excuse: 'Scoreboard hack ho gaya tha! Introspection committee banayi jayegi.',
      hitCry: ['KHATAKHAT!', 'MARATHON!', 'JUDO KARATE!', 'Daro Mat!'],
    },
  },
  {
    id: 'didi',
    name: 'DEEDEE EXPRESS',
    party: 'Ma-Mati-Manush · Counter Brawler',
    archetype: 'Counter Specialist',
    accent: '#22B35E',
    secondaryColor: '#F0FDF4',
    skinTone: '#D9A066',
    headgear: 'bun_saree',
    superName: 'KHELA HOBE HURRICANE',
    specialMoveName: 'Hawai Chappal Low Sweep',
    desc: 'Devastating low sweeps, fierce forward lunges, and unstoppable rally energy.',
    stats: { power: 8, speed: 9, defense: 7 },
    quotes: {
      intro: 'Aaj Sansad mein asli Khela Hobe!',
      win: 'Humba Humba, Ramba Ramba, Kamba Kamba — Knockout!',
      excuse: 'Sab referee ki chaal hai! Kal se dharna shuru, ladai abhi baaki hai!',
      hitCry: ['KHELA HOBE!', 'HUMBA HUMBA!', 'CHAPPAL SWEEP!', 'JOY BANGLA!'],
    },
  },
  {
    id: 'trump',
    name: 'TARIFF TAAU',
    party: 'Mega Deal Party · Heavy Grappler',
    archetype: 'Grappler',
    accent: '#E0262F',
    secondaryColor: '#1E3A8A',
    skinTone: '#F4A261',
    headgear: 'pompadour',
    superName: '200% TARIFF WALL SLAM',
    specialMoveName: 'Covfefe Power Throw',
    desc: 'Crushing command grabs and huge overhead wall drops.',
    stats: { power: 10, speed: 5, defense: 9 },
    quotes: {
      intro: 'Nobody fights better than me. Believe me, it will be YUGE!',
      win: 'Total victory! The biggest knockout in history, folks!',
      excuse: 'The fight was rigged! Very unfair referee! Fake news, we actually won hugely.',
      hitCry: ['YUGE HIT!', 'TARIFF SLAM!', 'TREMENDOUS!', 'YOUR FIRED!'],
    },
  },
  {
    id: 'yogi',
    name: 'DOZER DADA',
    party: 'Gorakhpur Express · Armored Juggernaut',
    archetype: 'Power Juggernaut',
    accent: '#F05A00',
    secondaryColor: '#FFEDD5',
    skinTone: '#D49A6A',
    headgear: 'saffron_robe',
    superName: 'EXPRESS BULLDOZER CHARGE',
    specialMoveName: 'Naam Badlo Hammer Fist',
    desc: 'High stun power and armored forward charges that crush turtling opponents.',
    stats: { power: 10, speed: 6, defense: 8 },
    quotes: {
      intro: 'Aaj tumhara naam aur health bar dono badal denge!',
      win: 'Maamla poori tarah samapt!',
      excuse: 'Bulldozer ka diesel khatam ho gaya tha. Kal subah 5 baje se double shift!',
      hitCry: ['DOZER RUSH!', 'NAAM BADLO!', 'DHWAST!', 'SYSTEM CRUSH!'],
    },
  },
  {
    id: 'nitin',
    name: 'TOLL MAN',
    party: 'Bharatmala Corp · Long-Range Zoner',
    archetype: 'Zoner',
    accent: '#FF9A1F',
    secondaryColor: '#FEF3C7',
    skinTone: '#DFAC78',
    headgear: 'highway_cap',
    superName: '8-LANE FLYOVER DROP',
    specialMoveName: 'FASTag Barrier Thrust',
    desc: 'Controls mid-screen spacing with concrete flyover pillars and toll gates.',
    stats: { power: 8, speed: 7, defense: 9 },
    quotes: {
      intro: 'Do minute mein tumhare upar 8-lane flyover bana dunga!',
      win: 'World-class concrete knockout in record time!',
      excuse: 'Toll naka pe traffic tha. Agli baar 6-lane greenfield expressway pe ladenge!',
      hitCry: ['TOLL DEDUCTED!', 'FLYOVER SLAM!', 'GREEN HYDROGEN!', 'RECORD TIME!'],
    },
  },
  {
    id: 'ravi',
    name: 'SUTTI BABU',
    party: 'Secretariat Cadre · Frame-Trap Tactician',
    archetype: 'Technical',
    accent: '#8B5CF6',
    secondaryColor: '#EDE9FE',
    skinTone: '#C68B59',
    headgear: 'files_glasses',
    superName: 'RED TAPE GAZETTE BIND',
    specialMoveName: 'Sub-Committee File Slap',
    desc: 'Lightning-fast counter pokes and bureaucratic stamina drain.',
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
    party: 'Lantern Brigade · Heavy Trickster',
    archetype: 'Trickster',
    accent: '#16A34A',
    secondaryColor: '#DCFCE7',
    skinTone: '#C88A55',
    headgear: 'rail_cap',
    superName: 'GARIB RATH EXPRESS RAM',
    specialMoveName: 'Kulhad Chai Belly Bump',
    desc: 'Unpredictable feints, comedic knockback, and high vitality.',
    stats: { power: 9, speed: 6, defense: 9 },
    quotes: {
      intro: 'Arre bujho babua, abhi rail chalayenge सीधा kursi par!',
      win: 'Dhat budbak! Humse takkar loge?',
      excuse: 'Signal laal tha, agli baar superfast Rajdhani se aayenge!',
      hitCry: ['DHAT BUDBAK!', 'CHUK-CHUK!', 'LANTERN FLASH!', 'GARIB RATH!'],
    },
  },
  {
    id: 'amit',
    name: 'GHAR MANTRI',
    party: 'Chanakya Cell · Defensive Mastermind',
    archetype: 'Mastermind',
    accent: '#CBD5E1',
    secondaryColor: '#334155',
    skinTone: '#DDB080',
    headgear: 'chanakya_bald',
    superName: 'CHRONOLOGY CHECKMATE',
    specialMoveName: 'midnight Resort Transfer Grab',
    desc: 'Superior block recovery and lethal punish throws.',
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
    party: 'Algorithm Squad · Footsie Specialist',
    archetype: 'Footsie',
    accent: '#22D3EE',
    secondaryColor: '#CFFAFE',
    skinTone: '#E8B88A',
    headgear: 'youtuber_mic',
    superName: 'DOSTO REALITY CHECK BEAM',
    specialMoveName: 'Green Screen Pointer Poke',
    desc: 'Long-range hand gesture pokes and high-agility backdashes.',
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
    name: 'SHANTI BAPU',
    party: 'Satyagraha Ashram · Secret Peace Boss',
    archetype: 'Ahinsa Boss',
    accent: '#FFD700',
    secondaryColor: '#FEF9C3',
    skinTone: '#C68642',
    headgear: 'gandhi_sage',
    superName: 'SATYAGRAHA SOUL FORCE',
    specialMoveName: 'Dandi Staff Moral Aura',
    desc: 'BOSS: Violent attacks bounce off his moral aura! Win by practicing Ahinsa (non-violence) or timing the Budget Audit.',
    isBoss: true,
    portraitUrl: '/src/assets/images/fighter_shanti_bapu_1794237661452.jpg',
    stats: { power: 10, speed: 8, defense: 10 },
    quotes: {
      intro: 'Hinsa se mujhe nahi jeet paoge. Shanti aur sanyam dikhao!',
      win: 'Main sirf aapka sabar dekh raha tha. Aaj ka sabak poora hua.',
      excuse: 'Ahinsa ke aage meri lathi bhi jhuk gayi. Satyamev Jayate!',
      hitCry: ['AHINSA!', 'SHANTI!', 'SATYAGRAHA!', 'SABAR RAKHO!'],
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
    title: 'Apostle of Ahinsa (GTu026DgX-U)',
    desc: 'Defeat Boss Shanti Bapu using non-violence (Ahinsa Harmony) or Budget Counter.',
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
    desc: 'Achieve a 3-match winning streak.',
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
  'AHINSA TIP: Striking Shanti Bapu only strengthens his moral aura — hold peace or press B for Budget Audit',
];
