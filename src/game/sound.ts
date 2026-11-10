// Authentic FightKaro & Indian Political Comedy Audio Engine + Scene Catalog
// Uses real downloaded .mp3 assets in /audio/*.mp3 and /audio/memes/*.mp3 with WebAudio fallback

export interface PoliticalAudioSceneItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'character_super' | 'viral_meme' | 'stage_scene' | 'announcer';
  fighterId: string;
  audioUrl: string;
  companionSfxUrls?: string[];
  glbUrl: string;
  glbClip: string;
  expressionKey: 'confident' | 'angry' | 'laughing' | 'shocked';
  sceneQuotes: string[];
  scenePopups: string[];
  accentColor: string;
}

export const POLITICAL_SCENE_AUDIO_CATALOG: PoliticalAudioSceneItem[] = [
  // === 15 VIRAL INDIAN POLITICAL & MEME AUDIO CLIPS (Uploaded by User) ===
  {
    id: 'waah_kya_scene_hai',
    title: 'WAAH! KYA SCENE HAI!',
    subtitle: 'MitraMan · Iconic Rally Reaction & Crowd Roar',
    category: 'viral_meme',
    fighterId: 'vikas',
    audioUrl: '/audio/memes/waah_kya_scene_hai.mp3',
    companionSfxUrls: ['/audio/camera_clicks.mp3'],
    glbUrl: '/models/modi.glb',
    glbClip: 'palm',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Waah... kya scene hai!',
      'Waah kya scene hai!!',
      'Bhaiyo aur behno, maza aa gaya!',
    ],
    scenePopups: ['WAAH!', 'KYA SCENE HAI!', 'MASTERSTROKE!'],
    accentColor: '#FF9933',
  },
  {
    id: 'khatam_tata_bye_bye',
    title: 'KHATAM! BYE-BYE! TATA! GOODBYE! GAYA!',
    subtitle: 'Yatra Boy · Ultimate Knockout Send-Off Speech',
    category: 'viral_meme',
    fighterId: 'yatra',
    audioUrl: '/audio/memes/khatam_tata_bye_bye.mp3',
    companionSfxUrls: ['/audio/ko.mp3'],
    glbUrl: '/models/rahul.glb',
    glbClip: 'uppercut',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Khatam!',
      'Bye-bye! Tata!',
      'Goodbye! Gaya!',
    ],
    scenePopups: ['KHATAM!', 'TATA!', 'GOODBYE!', 'GAYA!'],
    accentColor: '#2E9BFF',
  },
  {
    id: 'rom_rom_bhaiyo',
    title: 'ROM ROM BHAIYO! SYSTEM PAAD DENGE!',
    subtitle: 'Dozer Dada · High-Voltage Arena Entrance',
    category: 'viral_meme',
    fighterId: 'yogi',
    audioUrl: '/audio/memes/rom_rom_bhaiyo.mp3',
    companionSfxUrls: ['/audio/horn_long.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/yogi.glb',
    glbClip: 'slammer',
    expressionKey: 'angry',
    sceneQuotes: [
      'Rom Rom Bhaiyo!',
      'Aaj poora system hila denge!',
    ],
    scenePopups: ['ROM ROM BHAIYO!', 'SYSTEM CRUSH!', 'DHAMAKA!'],
    accentColor: '#F05A00',
  },
  {
    id: 'abhi_maja_aayega',
    title: 'ABHI MAJA AAYEGA NA BHIDU! (NAGIN DJ)',
    subtitle: 'Rail Raja · celebratory Nagin Dance & Dhol',
    category: 'viral_meme',
    fighterId: 'lalu',
    audioUrl: '/audio/memes/abhi_maja_aayega.mp3',
    companionSfxUrls: ['/audio/chai_ting.mp3'],
    glbUrl: '/models/lalu.glb',
    glbClip: 'guardbounce',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Ae! Abhi maja aayega na bhidu!',
      'Pilin chi nagin nighali, Munna majha dolaya lagla!',
    ],
    scenePopups: ['ABHI MAJA AAYEGA!', 'NAGIN DANCE!', 'FULL MASTI!'],
    accentColor: '#16A34A',
  },
  {
    id: 'ruko_jara_sabar_karo',
    title: 'RUKO JARA, SABAR KARO!',
    subtitle: 'Ghar Mantri · Counter-Trap & Chronology Warning',
    category: 'viral_meme',
    fighterId: 'amit',
    audioUrl: '/audio/memes/ruko_jara_sabar_karo.mp3',
    companionSfxUrls: ['/audio/slap.mp3'],
    glbUrl: '/models/amit.glb',
    glbClip: 'block',
    expressionKey: 'confident',
    sceneQuotes: [
      'Ruko jara... sabar karo!',
      'Bola dhakka-bukki nahi karne ka, aaram se lene ka! Haan!',
    ],
    scenePopups: ['RUKO JARA!', 'SABAR KARO!', 'NO DHAKKA-BUKKI!'],
    accentColor: '#94A3B8',
  },
  {
    id: 'aayein_baigan',
    title: 'AAYEIN?! (SHOCKED REACTION)',
    subtitle: 'Fact Bhai · Stunned Frame-Trap Confusion',
    category: 'viral_meme',
    fighterId: 'dhruv',
    audioUrl: '/audio/memes/aayein.mp3',
    companionSfxUrls: ['/audio/eye_zing.mp3'],
    glbUrl: '/models/dhruv.glb',
    glbClip: 'hit',
    expressionKey: 'shocked',
    sceneQuotes: [
      'Aayein?!',
      'Yeh kab hua dosto?!',
    ],
    scenePopups: ['AAYEIN?!', 'CONFUSED!', 'BAIGAN!'],
    accentColor: '#22D3EE',
  },
  {
    id: 'technologia_meme',
    title: 'TECHNOLOGIA! TECHNOLOGIA!',
    subtitle: 'Toll Man · Next-Gen E20 Highway Engineering',
    category: 'viral_meme',
    fighterId: 'nitin',
    audioUrl: '/audio/memes/technologia.mp3',
    companionSfxUrls: ['/audio/eye_zing.mp3', '/audio/kaching.mp3'],
    glbUrl: '/models/nitin.glb',
    glbClip: 'cross',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Technologia! Technologia!',
      'Gaddha-mukt world-class Technologia!',
    ],
    scenePopups: ['TECHNOLOGIA!', 'E20 POWER!', '200 IQ INFRA!'],
    accentColor: '#FF9A1F',
  },
  {
    id: 'is_sajjan_ko_kya_takleef',
    title: 'IS SAJJAN KO KYA TAKLEEF HAI BHAI!',
    subtitle: 'MitraMan · Parliament Roast Counter',
    category: 'viral_meme',
    fighterId: 'vikas',
    audioUrl: '/audio/memes/is_sajjan_ko.mp3',
    companionSfxUrls: ['/audio/slap.mp3'],
    glbUrl: '/models/modi.glb',
    glbClip: 'cross',
    expressionKey: 'confident',
    sceneQuotes: [
      'Is sajjan ko kya takleef hai bhai?',
      'Kya takleef hai inko?!',
    ],
    scenePopups: ['KYA TAKLEEF HAI?!', 'ROASTED!', 'SANSAD BURN!'],
    accentColor: '#FF9933',
  },
  {
    id: 'oh_no_wheeze_laugh',
    title: 'OH NO NO NO + HYSTERICAL LAUGH',
    subtitle: 'Rail Raja & Deedee · Opponent Whiff Laugh Track',
    category: 'viral_meme',
    fighterId: 'lalu',
    audioUrl: '/audio/memes/oh_no_laugh.mp3',
    companionSfxUrls: ['/audio/plop.mp3'],
    glbUrl: '/models/lalu.glb',
    glbClip: 'guardbounce',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Oh no no no no... HAHAHAHA!',
      'Dhat budbak! Miss kar gaya!',
    ],
    scenePopups: ['OH NO NO NO!', 'WHEEZE LAUGH!', 'LOL!'],
    accentColor: '#16A34A',
  },
  {
    id: 'uncontrollable_cackle_laugh',
    title: 'UNCONTROLLABLE CACKLE LAUGH',
    subtitle: 'Sutti Babu · Victory Taunt Laugh',
    category: 'viral_meme',
    fighterId: 'ravi',
    audioUrl: '/audio/memes/wheeze_laugh.mp3',
    companionSfxUrls: ['/audio/coins.mp3'],
    glbUrl: '/models/ravi.glb',
    glbClip: 'guardbounce',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Hehehehe! Paisa hi paisa!',
      'File closed, brother!',
    ],
    scenePopups: ['HAHAHA!', 'TAUNT!', 'FILE CLOSED!'],
    accentColor: '#8B5CF6',
  },
  {
    id: 'chalo_meme',
    title: 'CHALO! (SPEED RUSH)',
    subtitle: 'Dozer Dada · Forward Bulldozer Charge Call',
    category: 'viral_meme',
    fighterId: 'yogi',
    audioUrl: '/audio/memes/chalo_chalo.mp3',
    companionSfxUrls: ['/audio/whoosh.mp3'],
    glbUrl: '/models/yogi.glb',
    glbClip: 'walk_fwd',
    expressionKey: 'confident',
    sceneQuotes: [
      'Chalo!!',
      'Site clear karo, aage badho!',
    ],
    scenePopups: ['CHALO!', 'FULL SPEED!', 'RUSH!'],
    accentColor: '#F05A00',
  },
  {
    id: 'depression_meme',
    title: 'DEPRESSION (KO DEFEAT REACTION)',
    subtitle: 'Fact Bhai · Post-Knockout Election Loss Mood',
    category: 'viral_meme',
    fighterId: 'dhruv',
    audioUrl: '/audio/memes/depression.mp3',
    companionSfxUrls: ['/audio/thud.mp3'],
    glbUrl: '/models/dhruv.glb',
    glbClip: 'knockdown',
    expressionKey: 'shocked',
    sceneQuotes: [
      'Depression...',
      'Exit poll galat nikal gaya dosto!',
    ],
    scenePopups: ['DEPRESSION!', 'MOOD: OFF', 'EMOTIONAL DAMAGE!'],
    accentColor: '#22D3EE',
  },
  {
    id: 'bulati_hai_magar',
    title: 'BULATI HAI MAGAR JAANE KA NAHI!',
    subtitle: 'Ghar Mantri · Anti-Bait & Spacing Warning',
    category: 'viral_meme',
    fighterId: 'amit',
    audioUrl: '/audio/memes/bulati_hai_magar.mp3',
    companionSfxUrls: ['/audio/shimmer.mp3'],
    glbUrl: '/models/amit.glb',
    glbClip: 'guardbounce',
    expressionKey: 'confident',
    sceneQuotes: [
      'Wo bulati hai magar... jaane ka nahi!',
      'Yeh trap hai, chronology samjhiye!',
    ],
    scenePopups: ['BULATI HAI MAGAR...', 'JAANE KA NAHI!', 'BAIT AVOIDED!'],
    accentColor: '#CBD5E1',
  },
  {
    id: 'gaddari_karbe',
    title: 'GADDARI KARBE! (ANGRY RAGE)',
    subtitle: 'Ghar Mantri · Dal-Badal Betrayal Punish',
    category: 'viral_meme',
    fighterId: 'amit',
    audioUrl: '/audio/memes/gaddari_karbe.mp3',
    companionSfxUrls: ['/audio/slap.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/amit.glb',
    glbClip: 'cross',
    expressionKey: 'angry',
    sceneQuotes: [
      'Gaddari karbe?!',
      'Party badalta hai?! Abhi batata hoon!',
    ],
    scenePopups: ['GADDARI KARBE?!', 'DAL-BADAL!', 'PUNISHED!'],
    accentColor: '#EF4444',
  },
  {
    id: 'maza_aaya_rahul',
    title: 'MAZA AAYA! AUR YEH JO MAZA HAI...',
    subtitle: 'Yatra Boy · Combo Finisher Celebration',
    category: 'viral_meme',
    fighterId: 'yatra',
    audioUrl: '/audio/memes/maza_aaya.mp3',
    companionSfxUrls: ['/audio/jingle_win.mp3'],
    glbUrl: '/models/rahul.glb',
    glbClip: 'flipkick',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Maza aaya!',
      'Aur yeh jo maza hai, main poore Hindustan ko dena chahta hoon!',
    ],
    scenePopups: ['MAZA AAYA!', 'FULL ENTERTAINMENT!', 'COMBO WIN!'],
    accentColor: '#2E9BFF',
  },

  // === 13 OFFICIAL FIGHTKARO SUPER & STAGE SCENE AUDIO TRACKS ===
  {
    id: 'scene_modi_super',
    title: 'MITRAMAN SUPER: MITRA CHAKRA',
    subtitle: 'Official FightKaro Scene · modi.mp3 + Chakra Release',
    category: 'character_super',
    fighterId: 'vikas',
    audioUrl: '/audio/modi.mp3',
    companionSfxUrls: ['/audio/charge_chakra.mp3', '/audio/release_chakra.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/modi.glb',
    glbClip: 'palm',
    expressionKey: 'angry',
    sceneQuotes: [
      'Bhaiyo aur behno!',
      'MITRA CHAKRA!',
      'Gale milo, mitron!',
    ],
    scenePopups: ['MITRA CHAKRA!', '8 PM SHOCKWAVE!', '-30% HP!'],
    accentColor: '#FF9933',
  },
  {
    id: 'scene_rahul_super',
    title: 'YATRA BOY SUPER: ALOO SE SONA MACHINE',
    subtitle: 'Official FightKaro Scene · rahul.mp3 + Gold Coins',
    category: 'character_super',
    fighterId: 'yatra',
    audioUrl: '/audio/rahul.mp3',
    companionSfxUrls: ['/audio/engine_loop.mp3', '/audio/kaching.mp3', '/audio/coins.mp3'],
    glbUrl: '/models/rahul.glb',
    glbClip: 'uppercut',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Ek aisi machine lagaunga...',
      'Is side se aloo ghusega...',
      '...us side se SONA niklega!',
    ],
    scenePopups: ['ALOO!', 'GULP!', 'PROCESSING...', 'SONA!'],
    accentColor: '#2E9BFF',
  },
  {
    id: 'scene_didi_super',
    title: 'DEEDEE SUPER: JADU HOBE (FROG TRANSFORM)',
    subtitle: 'Official FightKaro Scene · didi.mp3 + Thunder & Frog Croak',
    category: 'character_super',
    fighterId: 'didi',
    audioUrl: '/audio/didi.mp3',
    companionSfxUrls: ['/audio/release_jadu.mp3', '/audio/thunder.mp3', '/audio/poof.mp3', '/audio/frog.mp3'],
    glbUrl: '/models/didi.glb',
    glbClip: 'cross',
    expressionKey: 'angry',
    sceneQuotes: [
      'Jadu hobe!',
      'Humba Humba, Ramba Ramba, Kamba Kamba!',
      'Jadu hoye gelo!',
    ],
    scenePopups: ['HUMBAAA!', 'POOF!', 'RIBBIT! 🐸'],
    accentColor: '#22B35E',
  },
  {
    id: 'scene_trump_super',
    title: 'TARIFF TAAU SUPER: TARIFF TSUNAMI',
    subtitle: 'Official FightKaro Scene · trump.mp3 + Stamp Slam & Coins',
    category: 'character_super',
    fighterId: 'trump',
    audioUrl: '/audio/trump.mp3',
    companionSfxUrls: ['/audio/pen_scribble.mp3', '/audio/stamp_slam.mp3', '/audio/crate_crash.mp3', '/audio/kaching.mp3'],
    glbUrl: '/models/trump.glb',
    glbClip: 'cross',
    expressionKey: 'confident',
    sceneQuotes: [
      'Tariff time!',
      "Beautiful, isn't it?",
      'Fifty percent. Tremendous!',
    ],
    scenePopups: ['TARIFFED!', '-30%', 'SIGNED!'],
    accentColor: '#E0262F',
  },
  {
    id: 'scene_yogi_super',
    title: 'DOZER DADA SUPER: DOZER KA DHAMAKA',
    subtitle: 'Official FightKaro Scene · yogi.mp3 + Bulldozer Horn & Crush',
    category: 'character_super',
    fighterId: 'yogi',
    audioUrl: '/audio/yogi.mp3',
    companionSfxUrls: ['/audio/horn_long.mp3', '/audio/reverse_beeps.mp3', '/audio/release_bulldozer.mp3', '/audio/metal_crunch.mp3'],
    glbUrl: '/models/yogi.glb',
    glbClip: 'elbowupper',
    expressionKey: 'angry',
    sceneQuotes: [
      'Shaanti…',
      'Site clear karo!',
      'Kaam chalu hai!',
    ],
    scenePopups: ['BULLDOZER AA GAYA!', 'RUK JAO!', '-30%'],
    accentColor: '#F05A00',
  },
  {
    id: 'scene_nitin_super',
    title: 'TOLL MAN SUPER: GADDHA BLAST (GANNA → E20)',
    subtitle: 'Official FightKaro Scene · nitin.mp3 + Pothole & E20 Blast',
    category: 'character_super',
    fighterId: 'nitin',
    audioUrl: '/audio/nitin.mp3',
    companionSfxUrls: ['/audio/thunder.mp3', '/audio/plop.mp3', '/audio/metal_crunch.mp3', '/audio/release_bulldozer.mp3'],
    glbUrl: '/models/nitin.glb',
    glbClip: 'cross',
    expressionKey: 'confident',
    sceneQuotes: [
      'Arre arre... yeh gaddha kahan se aaya?!',
      'Gaddha-mukt Bharat... ek minute.',
      'Quality ka koi compromise nahi!',
    ],
    scenePopups: ['GADDHA!', 'GANNA → E20!', 'DHADAAM!'],
    accentColor: '#FF9A1F',
  },
  {
    id: 'scene_ravi_super',
    title: 'SUTTI BABU SUPER: TIME IS MONEY',
    subtitle: 'Official FightKaro Scene · ravi.mp3 + Clock Freeze & Coins',
    category: 'character_super',
    fighterId: 'ravi',
    audioUrl: '/audio/ravi.mp3',
    companionSfxUrls: ['/audio/eye_zing.mp3', '/audio/reverse_beeps.mp3', '/audio/kaching.mp3', '/audio/coins.mp3'],
    glbUrl: '/models/ravi.glb',
    glbClip: 'cross',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Money follows, brother!',
      'Main nahi bhaagta, yeh mere peeche aata hai!',
    ],
    scenePopups: ['TIME FREEZE!', 'TIME IS MONEY!'],
    accentColor: '#8B5CF6',
  },
  {
    id: 'scene_lalu_super',
    title: 'RAIL RAJA SUPER: RAIL RAJA EXPRESS',
    subtitle: 'Official FightKaro Scene · lalu.mp3 + Train Horn & Chai Cups',
    category: 'character_super',
    fighterId: 'lalu',
    audioUrl: '/audio/lalu.mp3',
    companionSfxUrls: ['/audio/news_sting.mp3', '/audio/horn_long.mp3', '/audio/boom.mp3', '/audio/cup_break.mp3'],
    glbUrl: '/models/lalu.glb',
    glbClip: 'cross',
    expressionKey: 'laughing',
    sceneQuotes: [
      'Yatrigan kripya dhyan dein!',
      'Chai garam, gaadi time pe!',
      'Arre! Gaadi aa rahi hai?!',
    ],
    scenePopups: ['GREEN SIGNAL!', 'RAIL RAJA EXPRESS!', 'NO WAITING LIST!'],
    accentColor: '#16A34A',
  },
  {
    id: 'scene_amit_super',
    title: 'GHAR MANTRI SUPER: CHRONOLOGY DAL-BADAL',
    subtitle: 'Official FightKaro Scene · amit.mp3 + Chess Knight & Slap',
    category: 'character_super',
    fighterId: 'amit',
    audioUrl: '/audio/amit.mp3',
    companionSfxUrls: ['/audio/heartbeat.mp3', '/audio/shimmer.mp3', '/audio/slap.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/amit.glb',
    glbClip: 'cross',
    expressionKey: 'confident',
    sceneQuotes: [
      'Dekho, mere supporters aa gaye!',
      'Arre! Tum log toh mere the!',
      'Shah-maat.',
    ],
    scenePopups: ['CHAAL!', 'DAL-BADAL!', 'JAAN DE DENGE!'],
    accentColor: '#CBD5E1',
  },
  {
    id: 'scene_dhruv_super',
    title: 'FACT BHAI SUPER: REELS TIME & MOOD OFF',
    subtitle: 'Official FightKaro Scene · dhruv.mp3 + Phone Scroll & Bark',
    category: 'character_super',
    fighterId: 'dhruv',
    audioUrl: '/audio/dhruv.mp3',
    companionSfxUrls: ['/audio/plop.mp3', '/audio/shimmer.mp3', '/audio/bark.mp3', '/audio/slap.mp3'],
    glbUrl: '/models/dhruv.glb',
    glbClip: 'cross',
    expressionKey: 'confident',
    sceneQuotes: [
      'Namaskar dosto! Reality check time!',
      'Mood: Off! Kal dekhte hain!',
    ],
    scenePopups: ['MOOD: OFF', 'KAL DEKHTE HAIN!', 'REELS TIME!', 'SCROLL!'],
    accentColor: '#22D3EE',
  },
  {
    id: 'scene_mbapu_boss',
    title: 'MBAPU FINAL BOSS: SHANTI AKHADA & MANCH CHHODO',
    subtitle: 'Official FightKaro Scene · mbapuintro.mp3 + mbapu.mp3 + Charkha',
    category: 'character_super',
    fighterId: 'mbapu',
    audioUrl: '/audio/mbapu.mp3',
    companionSfxUrls: ['/audio/charkha.mp3', '/audio/bell.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/mbapu.glb',
    glbClip: 'guardbounce',
    expressionKey: 'confident',
    sceneQuotes: [
      'AB ASLI PARIKSHA — MBAPU · ANTIM YODDHA',
      'Manch khaali karo!',
      '20s nearby + 5 blocks -> SHANTI KI JEET!',
    ],
    scenePopups: ['MANCH CHHODO!', 'SHANTI CHAKKA!', 'SHANTI TOOFAN!'],
    accentColor: '#FFD700',
  },
  {
    id: 'scene_nirmala_budget',
    title: 'NIRMALA BUDGET PESH HAI: GST 28% TAX SLAM',
    subtitle: 'Official FightKaro Scene · nirmala.mp3 + Stamp Slam & Coins',
    category: 'stage_scene',
    fighterId: 'vikas',
    audioUrl: '/audio/nirmala.mp3',
    companionSfxUrls: ['/audio/news_sting.mp3', '/audio/stamp_slam.mp3', '/audio/coins.mp3', '/audio/boom.mp3'],
    glbUrl: '/models/modi.glb',
    glbClip: 'palm',
    expressionKey: 'shocked',
    sceneQuotes: [
      '📕 BUDGET PESH HAI! Ab lagega tax!',
      'Sabka hissa banta hai, Bapu!',
    ],
    scenePopups: ['GST 28%!', 'TAX COLLECTED!', 'BUDGET PASSED!'],
    accentColor: '#DC2626',
  },
  {
    id: 'scene_sabzi_wala_cow',
    title: 'STAGE HAZARDS: SABZI WALA (ALOO LE LO) & COW CROSSING',
    subtitle: 'Official FightKaro Scene · aloolelo.mp3 + moo.mp3 + Sutli Bomb',
    category: 'stage_scene',
    fighterId: 'lalu',
    audioUrl: '/audio/aloolelo.mp3',
    companionSfxUrls: ['/audio/news_sting.mp3', '/audio/moo.mp3', '/audio/cow_bell.mp3', '/audio/pataka.mp3'],
    glbUrl: '/models/lalu.glb',
    glbClip: 'jump',
    expressionKey: 'shocked',
    sceneQuotes: [
      '⚠ SABZI WALA: Aloo le lo, pyaaz le lo!',
      '⚠ COW CROSSING: Sab ruk jao! MOOOOO!',
      '⚠ SUTLI BOMB: Ring se bahar bhaago! 🧨',
    ],
    scenePopups: ['ALOO LE LO!', 'MOOOOO!', 'SUTLI BOMB! 🧨'],
    accentColor: '#F59E0B',
  },
];

// Map fighter IDs to their official FightKaro super voice MP3
const FIGHTER_VOICE_MP3: Record<string, string> = {
  vikas: '/audio/modi.mp3',
  yatra: '/audio/rahul.mp3',
  didi: '/audio/didi.mp3',
  trump: '/audio/trump.mp3',
  yogi: '/audio/yogi.mp3',
  nitin: '/audio/nitin.mp3',
  ravi: '/audio/ravi.mp3',
  lalu: '/audio/lalu.mp3',
  amit: '/audio/amit.mp3',
  dhruv: '/audio/dhruv.mp3',
  mbapu: '/audio/mbapu.mp3',
};

// Map fighter IDs to their viral Indian meme reaction MP3s
const FIGHTER_MEME_MP3: Record<string, string[]> = {
  vikas: ['/audio/memes/waah_kya_scene_hai.mp3', '/audio/memes/is_sajjan_ko.mp3', '/audio/memes/bhaiyo_behno.mp3'],
  yatra: ['/audio/memes/khatam_tata_bye_bye.mp3', '/audio/memes/maza_aaya.mp3'],
  didi: ['/audio/memes/khela_hobe.mp3', '/audio/didi.mp3'],
  trump: ['/audio/trump.mp3'],
  yogi: ['/audio/memes/rom_rom_bhaiyo.mp3', '/audio/memes/chalo_chalo.mp3'],
  nitin: ['/audio/memes/technologia.mp3', '/audio/nitin.mp3'],
  ravi: ['/audio/raviwin.mp3', '/audio/memes/wheeze_laugh.mp3'],
  lalu: ['/audio/memes/abhi_maja_aayega.mp3', '/audio/memes/oh_no_laugh.mp3'],
  amit: ['/audio/memes/ruko_jara_sabar_karo.mp3', '/audio/memes/bulati_hai_magar.mp3', '/audio/memes/gaddari_karbe.mp3', '/audio/amitwin.mp3'],
  dhruv: ['/audio/memes/aayein.mp3', '/audio/memes/depression.mp3'],
  mbapu: ['/audio/mbapuintro.mp3', '/audio/gulaam.mp3'],
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public musicOn: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  private activeVoiceAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playMp3(url: string, volume = 0.85, interruptVoice = false): HTMLAudioElement | null {
    if (this.muted || typeof window === 'undefined') return null;
    try {
      if (interruptVoice && this.activeVoiceAudio) {
        this.activeVoiceAudio.pause();
        this.activeVoiceAudio.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.volume = Math.max(0, Math.min(1, volume));
      if (interruptVoice) {
        this.activeVoiceAudio = audio;
        if (this.bgmAudio && !this.bgmAudio.paused) {
          this.bgmAudio.volume = 0.08;
          audio.addEventListener('ended', () => {
            if (this.bgmAudio) this.bgmAudio.volume = 0.26;
          });
        }
      }
      audio.play().catch(() => {});
      return audio;
    } catch {
      return null;
    }
  }

  public stopActiveVoice() {
    if (this.activeVoiceAudio) {
      this.activeVoiceAudio.pause();
      this.activeVoiceAudio.currentTime = 0;
      this.activeVoiceAudio = null;
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = 0.26;
    }
  }

  public playSceneAudio(scene: PoliticalAudioSceneItem) {
    if (this.muted) return;
    this.playMp3(scene.audioUrl, 0.95, true);
    if (scene.companionSfxUrls && scene.companionSfxUrls.length > 0) {
      scene.companionSfxUrls.forEach((sfxUrl, i) => {
        setTimeout(() => {
          this.playMp3(sfxUrl, 0.55, false);
        }, (i + 1) * 450);
      });
    }
  }

  public playCharacterSuperVoice(fighterId: string) {
    if (this.muted) return;
    const voiceUrl = FIGHTER_VOICE_MP3[fighterId] || '/audio/modi.mp3';
    this.playMp3(voiceUrl, 0.95, true);

    // Trigger matching super SFX layer from fightkaro.com
    if (fighterId === 'vikas') {
      this.playMp3('/audio/charge_chakra.mp3', 0.65);
      setTimeout(() => this.playMp3('/audio/release_chakra.mp3', 0.75), 700);
    } else if (fighterId === 'yatra') {
      this.playMp3('/audio/engine_loop.mp3', 0.55);
      setTimeout(() => {
        this.playMp3('/audio/kaching.mp3', 0.8);
        this.playMp3('/audio/coins.mp3', 0.75);
      }, 800);
    } else if (fighterId === 'didi') {
      this.playMp3('/audio/release_jadu.mp3', 0.75);
      setTimeout(() => {
        this.playMp3('/audio/thunder.mp3', 0.7);
        this.playMp3('/audio/frog.mp3', 0.85);
      }, 750);
    } else if (fighterId === 'trump') {
      this.playMp3('/audio/stamp_slam.mp3', 0.8);
      setTimeout(() => {
        this.playMp3('/audio/crate_crash.mp3', 0.75);
        this.playMp3('/audio/kaching.mp3', 0.8);
      }, 650);
    } else if (fighterId === 'yogi') {
      this.playMp3('/audio/horn_long.mp3', 0.8);
      setTimeout(() => {
        this.playMp3('/audio/release_bulldozer.mp3', 0.8);
        this.playMp3('/audio/metal_crunch.mp3', 0.75);
      }, 650);
    } else if (fighterId === 'nitin') {
      this.playMp3('/audio/thunder.mp3', 0.75);
      setTimeout(() => this.playMp3('/audio/metal_crunch.mp3', 0.8), 650);
    } else if (fighterId === 'ravi') {
      this.playMp3('/audio/eye_zing.mp3', 0.75);
      setTimeout(() => {
        this.playMp3('/audio/kaching.mp3', 0.8);
        this.playMp3('/audio/coins.mp3', 0.8);
      }, 650);
    } else if (fighterId === 'lalu') {
      this.playMp3('/audio/horn_long.mp3', 0.85);
      setTimeout(() => {
        this.playMp3('/audio/boom.mp3', 0.8);
        this.playMp3('/audio/cup_break.mp3', 0.75);
      }, 700);
    } else if (fighterId === 'amit') {
      this.playMp3('/audio/heartbeat.mp3', 0.8);
      setTimeout(() => {
        this.playMp3('/audio/slap.mp3', 0.85);
        this.playMp3('/audio/boom.mp3', 0.8);
      }, 650);
    } else if (fighterId === 'dhruv') {
      this.playMp3('/audio/eye_zing.mp3', 0.75);
      setTimeout(() => {
        this.playMp3('/audio/shimmer.mp3', 0.75);
        this.playMp3('/audio/bark.mp3', 0.75);
      }, 650);
    } else if (fighterId === 'mbapu') {
      this.playMp3('/audio/charkha.mp3', 0.8);
      setTimeout(() => {
        this.playMp3('/audio/bell.mp3', 0.8);
        this.playMp3('/audio/boom.mp3', 0.8);
      }, 650);
    }
  }

  public playFighterMemeClip(fighterId: string) {
    if (this.muted) return;
    const pool = FIGHTER_MEME_MP3[fighterId] || ['/audio/memes/waah_kya_scene_hai.mp3'];
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.playMp3(chosen, 0.9, true);
  }

  public playBudgetAudit() {
    if (this.muted) return;
    this.playMp3('/audio/news_sting.mp3', 0.7);
    this.playMp3('/audio/nirmala.mp3', 0.95, true);
    setTimeout(() => {
      this.playMp3('/audio/stamp_slam.mp3', 0.85);
      this.playMp3('/audio/coins.mp3', 0.8);
    }, 550);
  }

  public playStageHazard(kind: 'sabzi' | 'cow' | 'sutli') {
    if (this.muted) return;
    this.playMp3('/audio/news_sting.mp3', 0.75);
    if (kind === 'sabzi') {
      this.playMp3('/audio/aloolelo.mp3', 0.9, true);
    } else if (kind === 'cow') {
      this.playMp3('/audio/moo.mp3', 0.9, true);
      this.playMp3('/audio/cow_bell.mp3', 0.75);
    } else {
      this.playMp3('/audio/pataka.mp3', 0.9);
      this.playMp3('/audio/bomb.mp3', 0.85);
    }
  }

  public playRoundStart(roundNumber: number, isBoss = false) {
    if (this.muted) return;
    if (isBoss && roundNumber === 1) {
      this.playMp3('/audio/mbapuintro.mp3', 0.95, true);
      return;
    }
    const roundFile =
      roundNumber === 1
        ? '/audio/round_1.mp3'
        : roundNumber === 2
        ? '/audio/round_2.mp3'
        : '/audio/final_round.mp3';
    this.playMp3(roundFile, 0.85);
    setTimeout(() => {
      this.playMp3('/audio/fight.mp3', 0.9);
    }, 900);
  }

  public playSelect() {
    if (this.muted) return;
    const played = this.playMp3('/audio/ui_select.mp3', 0.65);
    if (played) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  public playConfirm() {
    if (this.muted) return;
    this.playMp3('/audio/ui_confirm.mp3', 0.75);
  }

  public playHit(heavy = false) {
    if (this.muted) return;
    const hitFile = heavy
      ? '/audio/hit_3.mp3'
      : Math.random() < 0.5
      ? '/audio/hit_1.mp3'
      : '/audio/hit_2.mp3';
    this.playMp3(hitFile, heavy ? 0.85 : 0.7);
    if (heavy) {
      this.playMp3('/audio/thud.mp3', 0.65);
    }
  }

  public playBlock() {
    if (this.muted) return;
    this.playMp3('/audio/block.mp3', 0.75);
  }

  public playJump() {
    if (this.muted) return;
    this.playMp3('/audio/whoosh.mp3', 0.55);
  }

  public playSuper(fighterId?: string) {
    if (this.muted) return;
    if (fighterId) {
      this.playCharacterSuperVoice(fighterId);
      return;
    }
    this.playMp3('/audio/boom.mp3', 0.85);
  }

  public playKO(winnerId?: string, userWon = true) {
    if (this.muted) return;
    this.playMp3('/audio/ko.mp3', 0.95);
    this.playMp3('/audio/boom.mp3', 0.8);

    setTimeout(() => {
      if (userWon) {
        this.playMp3('/audio/jingle_win.mp3', 0.8);
        if (winnerId === 'ravi') {
          this.playMp3('/audio/raviwin.mp3', 0.95, true);
        } else if (winnerId === 'amit') {
          this.playMp3('/audio/amitwin.mp3', 0.95, true);
        } else if (winnerId === 'yatra') {
          this.playMp3('/audio/memes/khatam_tata_bye_bye.mp3', 0.95, true);
        } else if (winnerId === 'vikas') {
          this.playMp3('/audio/memes/waah_kya_scene_hai.mp3', 0.95, true);
        } else if (winnerId) {
          this.playFighterMemeClip(winnerId);
        }
      } else {
        this.playMp3('/audio/jingle_lose.mp3', 0.8);
        if (winnerId === 'mbapu') {
          this.playMp3('/audio/gulaam.mp3', 0.95, true);
        } else {
          this.playMp3('/audio/memes/oh_no_laugh.mp3', 0.85, true);
        }
      }
    }, 950);
  }

  public startArenaBgm() {
    this.stopArenaBgm();
    if (this.muted || !this.musicOn || typeof window === 'undefined') return;
    try {
      const audio = new Audio('/audio/battle.mp3');
      audio.loop = true;
      audio.volume = 0.26;
      audio.play().catch(() => {});
      this.bgmAudio = audio;
    } catch {
      // ignore autoplay block prior to gesture
    }
  }

  public stopArenaBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
  }
}

export const sound = new SoundEngine();
