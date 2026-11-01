import React, { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, CirclePlay,
  Compass, ExternalLink, Languages, Layers, MapPin, Menu, Pause, Search, Sparkles,
  Volume2, X,
} from 'lucide-react';
import Interactive3DMap from './Interactive3DMap';
import './styles.css';

const APP_LOG_PREFIX = '[Les Voix du Faso]';

function logApp(level, message, details = {}) {
  console[level](`${APP_LOG_PREFIX} ${message}`, details);
}

window.addEventListener('error', (event) => {
  const resourceUrl = event.target instanceof HTMLImageElement || event.target instanceof HTMLAudioElement
    ? event.target.currentSrc || event.target.src
    : undefined;
  if (resourceUrl) {
    logApp('error', 'Resource media or image failed to load', {
      url: resourceUrl,
      element: event.target.tagName.toLower?.(),
    }, true);
    return;
  }
  logApp('error', 'Unhandled application error', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logApp('error', 'Unhandled promise rejection', {
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
  });
});

logApp('info', 'Application started', {
  host: window.location.host,
  pathname: window.location.pathname,
  protocol: window.location.protocol,
});

const stories = [
  {
    id: 'conte-bissa', title: 'Conte en Bissa', language: 'Bissa', type: 'Conte', color: 'ochre',
    localityRegion: 'Centre-Est', localityLabel: 'Centre-Est · repère linguistique bissa indicatif',
    audioUrl: '/Bissa.mp3', image: '/images/bissa.png', excerpt: 'Enregistrement transmis en langue bissa.',
    chapters: [['Écouter le récit', 'Le fichier audio en Bissa est disponible. Le texte du récit n’a pas été fourni.']],
  },
  {
    id: 'suruku-ni-sonsannin', title: 'Suruku ni sonsannin', catalogue: '15 Nziirin nziirin',
    language: 'Dioula', type: 'Conte', color: 'red',
    localityRegion: 'Haut-Bassins', localityLabel: 'Bobo-Dioulasso · lieu de lecture audio',
    audioUrl: '/15%20cont%20dioull%20vol2.mp3', image: '/images/dioula.png',
    textCredit: '© Texte dioula par Alou Keïta, Ouagadougou, Burkina Faso, 2021',
    audioCredit: '© Audio lu par Afsatou Bokoum, Bobo-Dioulasso, Burkina Faso',
    excerpt: 'Suruku et Sonsannin partent pêcher; le partage des prises met à l’épreuve leur confiance.',
    chapters: [
      ['Le partage des poissons', 'Lon dɔ suruku ni sonsannin bɛnna ka taga jigɛ minɛ.\nO lon fɔlɔ o ye jigɛ kelen le sɔrɔ.\nSonsannin ko n teri jigɛ kelen ni mɔgɔ fila tilan ka gɛlɛn, jigɛ kelen di n ma sini ni an nana jigɛ fila sɔrɔ, e bina to ni jigɛ fila nin ye.\nSuruku ko basi te yen.\nO loon na, o ye jigɛ fila sɔrɔ.\nSonsannin ko n teri nin jigɛ fila nin te se ka supu ɲanaman kɛ, a di n ma, ni an nana sini ka naani sɔrɔ e bina to ni a bɛɛ ye.\nSuruku ko basi te yen.'],
      ['Une excuse pour s’éloigner', 'O dugusagɛ, o tagara jigɛminayɔrɔ ra, o ye naani sɔrɔ.\nSonsannin ko a bi kuma, suruku ko a ma : kana kunko ɲini a te yɔrɔ min na.\nSonsannin ko a ka yafa a ma, nga ale ka lumɔgɔw bi sara, a bina boli ka taga a ɲaɲini.\nO ye ɲɔgɔn fo.\nSonsannin bolila ka taga la suruku ka sira kan.'],
      ['Suruku se rend compte', 'Suruku nana a ye ko sonsannin tun ye min fɔ o ye tiɲɛ le ye ka tɛmɛ ni a yɛrɛ ye.\nSonsannin wulila ka taga la suruku ɲa fɛ tugunin.\nSuruku lɔra ka miiri ni a tun ye sonsannin fila nunu cɛ, a tun bi kɛ supu ɲanaman ye.'],
      ['La morale', 'A ye jigɛ bila, ko a be taga sonsannin kelen dɔ nin ta a nana a sɔrɔ ko Sonsannin wulila ka boli ni a ka jigɛ ye.\nA ma Sonsannin sɔrɔ, a ma a ka jigɛ fana sɔrɔ.\nO le ra, o ko bi ka dɔrɔmɛ kelen ka fisa ni sini duuru ye.'],
    ],
  },
  {
    id: 'soni-alla-waray', title: 'Soni so Alla waray, kaananke warataa!',
    language: 'Fulfulde', type: 'Conte', color: 'ochre', audioUrl: '/03_Soni_Alla_waraay.mp3', image: '/images/fulfulde.png', credit: 'Tijjaani Ba',
    localityRegion: 'Sahel', localityLabel: 'Sahel · aire linguistique fulfulde indicative',
    excerpt: 'Conte en Fulfulde transmis par Tijjaani Ba.',
    chapters: [
      ['L’avertissement', 'Soni so Alla waray, kaananke warataa!\nGoɗɗo wonnoo de, wawtu fu o wi\'ataanaa soni Alla waray, ni kaananke warataa. Jakka na ɗum metti kaanankee hunnde. Heddii kaananke itti fiyaare muuɗum, kam du finaatawaare muuɗum abada, maamam maayi yoppi ɓiɗɗo addi, noon ni faa tukki o. O addi fiyaare ndeen, o reeni o. Reenunoo o fu, kaananke acci faa o dilli de wi\'i goɗɗo soosoo addowa fiyaare nde, faɗɗa e maayo. Heɓa wara ƴamta o. So tawii tawaaka na o resi nde ni wara o. Nde o faɗɗunoo nde fu liinga moɗi nde.'],
      ['Le jeune homme et le filet', 'Suka gorko du wallaa nyaamdu so wanaa liƴƴi. Goɗɗo goma yaata na awoo dey, so awoken faa kiikiiɗe ni fanta sottira o. Fiyaare faɗɗaama liinga moɗii ɗum. Awottooɗo awooken heɓii linga ngaan fantii sottirii o. O huttunoo nga ni o tawi fiyaare nder reedu liinnga. O wi\'i ndaa fiyaaree nde, way ba nde ndeenanoo-mi nde. O ummii jon kaa o ndaaroy to o resunoo to, o tawi fiyaare kaananke wallaa toon. Heddii o tummbiti fiyaare o resii faa waɗi daggu balɗe jeɗɗi.'],
      ['Le crocodile demande le filet', 'Nyannde gom ni kaananke nilani suka gorko. O yottinoo ni o wi\'aa o wadda fiyaare. O wi\'i ayyo faa o hoota dey, o wadda fiyaare. Kaananke wi\'i ndelle o ɗuutee ko na anndi koo o doggal. O yottinoo ni o tummbiti fiyaare o waddi. Kaanankee ƴammi: "Noy ngaɗɗaa dey kewtuɗaa fiyaare nde ? O jaabii: "Noy waɗɗunoo hey ?" Kaananke wi\'i mi waɗɗaanonaa fiyaare nde tummbitaa de yahaa faɗɗowaa maayo too, heɓa mi ware. O ƴami ko saabii. Ko mbi\'aataa ko so Alla waray ni kaananke warataa ɗum wellaa kam; ɗuum saabii.'],
      ['La ruse dévoilée', 'Suka gorko wi\'i gasii. Ndelle, nde ni nde faɗɗowanoo, liinga moɗi nde. Awotooɗo o, nde awowinoo fu heɓi liinga ngaa wari sottiri kam. Min du coodum liinga ngaan. Kuttum liinga ngaan dey tawum fiyaare ndeen ley reedu magga. Min kaa faa hannde, hannde e jaango fu, kaan keddii-mi nam jeerfoo. Soni so Alla waray fu, kaananke warataa!\n\nTijjaani Ba'],
    ],
  },
  {
    id: 'nin-keem', title: 'Nin-kẽem a yembr kibare',
    language: 'Mooré', type: 'Conte', color: 'green', audioUrl: '/Conte_01_Nikeema.mp3', image: '/images/mossi.png', moralChapter: true,
    localityRegion: 'Centre', localityLabel: 'Centre · repère culturel mooré indicatif',
    excerpt: 'Un enfant déjoue la ruse du lion et sauve son père grâce à son écoute et à sa présence d’esprit.',
    chapters: [
      ['Le chemin', 'Nin-kẽem a yembr n wa n yik a zak pʋgẽ, n na n tɩ gõ weoogẽ.\nLa, a bi-bilf a yembr yikame, t’a na n tũ-a lame.\nLa, a ba wã tõdgame, t’a kõn tũ ye.\nTɩ bõe?'],
      ['Le lion chante', 'A paoodame, weoogã pʋg yaa gõose, koom kae me, n yũud ye.\nLa, a biigã tõdgame, n tũ-a n looge.\nB sẽn wa n ta we-raoogã pʋga, saag n kʋɩ, tɩ sebgã sɩng yikri.\nB zoe n tɩ kẽe tãng bokẽ, n na n sool saagã.\nMik bokã yaa m ba Weoognaab roogo.\nM ba Weoognaab sẽn wa n yi gõob n wa, a mikame t’a roogã pida ne rɩɩbo, t’a na n kɩdem ne sũ-noogo, n pʋd yɩɩll n yetẽ :\n«Roog vũuda, roog vũuda, roog vũud tɩ m meng be yɩng n daeeda».'],
      ['La réponse de l’enfant', 'Tɩ biigã leok-a :\n«M pa sablem naaba, m pa zẽenem naaba, sã n pa beoogo, tõnd pa kuus ye.»\nM ba Weoognaab sẽn wʋm dẽ, a kɩdmame, n zoe n maan wa kɩlomɛtr a yiibu.\nWakat-kãnga, la biigã yeel a ba wã :\n«Yik tao-tao n dɩk yir sore».\nLa nin-kẽemã yiime, t’a sũurã tar kiu, kiu, la a yetẽ :\n«Weoognaab ye n da seg maam sorã zug ye».'],
      ['Le retour', 'La, m ba Weoognaab lebg n waame, n le sɩng yɩɩl n yetẽ :\n«Roog vũuda, roog vũuda, roog vũud tɩ m meng be yɩng n gõodẽ.»\nTɩ biigã leok-a yasa :\n«M pa sablem naaba, m pa zẽenem naaba, sã n pa beoogo, tõnd pa kuus ye».\nSũ-noogã yĩnga, a Weoognaab sɩnga kɩdengo, la zoees yasa, n na n gilme.\nTɩ biigã tũnug m ba Weoognaab loogrã, n yi n dɩk sor n zoe n kuili.\nM ba Weoognaab sẽn wa n lebg n wa, a ra tẽedame t’a rɩɩbã ketame, t’a le sɩng yɩɩla, la ned ba a ye pa leokd-a ye.\nT’a kolg n na n lɩk n gese, la ned ba a ye ka be ye.\nT’a kẽng ka, n leb ka, a pa yãnd ned ye .\nLa, a rɩka sorã, n na n bao rao wã ne a biigã.\nLa, wakat-kãng tɩ b taa yiri.'],
      ['La leçon', 'Yaa woto, la biigã maan n fãag a ba wã, la a menga.\nBɩ d ra kɩɩs d kambã noor wakat ning ye, d mi n kelgd-ba.'],
    ],
  },
];

function persistContribution(record) {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Le stockage local des fichiers n’est pas disponible dans ce navigateur.'));
      return;
    }
    const request = indexedDB.open('les-voix-du-faso', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('proposals', { keyPath: 'id' });
    request.onerror = () => reject(request.error || new Error('Ouverture du stockage impossible.'));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction('proposals', 'readwrite');
      transaction.objectStore('proposals').put(record);
      transaction.oncomplete = () => { database.close(); resolve(); };
      transaction.onerror = () => { database.close(); reject(transaction.error || new Error('Enregistrement impossible.')); };
      transaction.onabort = () => { database.close(); reject(transaction.error || new Error('Enregistrement interrompu.')); };
    };
  });
}

function App() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const regionLayers = useRef(new Map());
  const localityMarker = useRef(null);
  const [mapRegionsReady, setMapRegionsReady] = useState(false);
  const [mapMode, setMapMode] = useState('3D'); // '3D' | '2D'
  const [activeStory, setActiveStory] = useState(() => stories.find((story) => story.id === 'nin-keem') || stories[0]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState('Toutes les langues');
  const [query, setQuery] = useState('');
  const [contributionOpen, setContributionOpen] = useState(false);
  const [contributionSent, setContributionSent] = useState(false);
  const [contributionSaving, setContributionSaving] = useState(false);
  const [contributionError, setContributionError] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const updateScrollProgress = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0);
      });
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  const stopNarration = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlaying(false);
  };
  const selectStory = (story) => {
    stopNarration();
    setActiveStory(story);
    setChapterIndex(0);
  };
  const changeChapter = (index) => {
    stopNarration();
    setChapterIndex(Math.max(0, Math.min(index, activeStory.chapters.length - 1)));
  };
  const toggleNarration = () => {
    if (!('speechSynthesis' in window)) return;
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(activeStory.chapters[chapterIndex][1]);
    utterance.lang = 'fr-FR';
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const handleContributionSubmit = async (event) => {
    event.preventDefault();
    setContributionError('');
    const formData = new FormData(event.currentTarget);
    const transcriptFile = formData.get('transcriptionFile');
    const audioFile = formData.get('audioFile');
    const transcript = String(formData.get('story') || '').trim();
    const hasTranscriptFile = transcriptFile instanceof File && transcriptFile.size > 0;
    const hasAudioFile = audioFile instanceof File && audioFile.size > 0;
    const extension = (file) => file.name.split('.').pop().toLowerCase();
    const transcriptTypes = new Set(['txt', 'pdf', 'doc', 'docx']);
    const audioTypes = new Set(['mp3', 'mpeg', 'wav', 'm4a', 'aac', 'ogg', 'opus', 'webm', 'mp4']);

    if (transcript.length < 12 && !hasTranscriptFile) {
      setContributionError('Écris la transcription ou joins un fichier de transcription.');
      return;
    }
    if (hasTranscriptFile && (!transcriptTypes.has(extension(transcriptFile)) || transcriptFile.size > 10 * 1024 * 1024)) {
      setContributionError('La transcription doit être un fichier TXT, PDF, DOC ou DOCX de 10 Mo maximum.');
      return;
    }
    if (hasAudioFile && (!audioTypes.has(extension(audioFile)) || audioFile.size > 25 * 1024 * 1024)) {
      setContributionError('L’audio doit être un fichier MP3, WAV, M4A, AAC, OGG ou WebM de 25 Mo maximum.');
      return;
    }

    setContributionSaving(true);
    try {
      await persistContribution({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        contributor: String(formData.get('contributor') || '').trim(),
        title: String(formData.get('title') || '').trim(),
        story: transcript,
        region: String(formData.get('region') || '').trim(),
        language: String(formData.get('language') || ''),
        submittedAt: new Date().toISOString(),
        transcriptFile: hasTranscriptFile ? transcriptFile : null,
        audioFile: hasAudioFile ? audioFile : null,
      });
      setContributionSent(true);
    } catch (error) {
      setContributionError(error.message || 'Impossible d’enregistrer cette proposition.');
    } finally {
      setContributionSaving(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return undefined;
    let disposed = false;
    const map = L.map(mapRef.current, { center: [12.26, -1.55], zoom: 6, zoomControl: false, attributionControl: false });
    leafletMap.current = map;
    L.control.attribution({ prefix: false }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>', maxZoom: 18,
    }).addTo(map);
    fetch('/geojson/regions.geojson')
      .then((response) => {
        logApp(response.ok ? 'info' : 'warn', 'Regional GeoJSON request completed', {
          url: '/geojson/regions.geojson',
          status: response.status,
        });
        if (!response.ok) throw new Error(`Chargement des régions impossible (${response.status})`);
        return response.json();
      })
      .then((regions) => {
        if (disposed || !mapRef.current?.isConnected) return;
        const regionIndex = new Map();
        const regionOverlay = L.geoJSON(regions, {
          style: { color: '#b75535', weight: 1.2, fillColor: '#dda047', fillOpacity: 0.08 },
          onEachFeature: (feature, layer) => {
            const regionName = feature.properties?.NAME_1 || 'Région du Burkina Faso';
            regionIndex.set(regionName, layer);
            layer.bindTooltip(regionName, { sticky: true });
            layer.on({
              mouseover: (event) => event.target.setStyle({ weight: 2, fillOpacity: 0.24 }),
              mouseout: (event) => event.target.setStyle({ weight: 1.2, fillOpacity: 0.08 }),
              click: (event) => map.fitBounds(event.target.getBounds(), { padding: [35, 35], maxZoom: 8 }),
            });
          },
        }).addTo(map);
        regionLayers.current = regionIndex;
        map.fitBounds(regionOverlay.getBounds(), { padding: [18, 18], maxZoom: 6 });
        setMapRegionsReady(true);
      })
      .catch((error) => {
        if (!disposed) logApp('error', 'Regional map could not be initialized', { reason: error.message });
      });
    return () => { disposed = true; stopNarration(); map.remove(); leafletMap.current = null; regionLayers.current = new Map(); localityMarker.current = null; };
  }, []);

  useEffect(() => {
    const map = leafletMap.current;
    const regionLayer = regionLayers.current.get(activeStory.localityRegion);
    if (!mapRegionsReady || !map || !regionLayer) return undefined;

    // Invalidate map size so Leaflet container calculates valid dimensions even if toggled
    map.invalidateSize();

    regionLayers.current.forEach((layer) => {
      layer.setStyle({ color: '#b75535', weight: 1.2, fillColor: '#dda047', fillOpacity: 0.08 });
      layer.getElement()?.classList.remove('cultural-region-selected');
    });
    regionLayer.setStyle({ color: '#a9442b', weight: 2.8, fillColor: '#e5a44e', fillOpacity: 0.3 });
    regionLayer.bringToFront();
    regionLayer.getElement()?.classList.add('cultural-region-selected');

    try {
      const bounds = regionLayer.getBounds?.();
      if (bounds && bounds.isValid?.()) {
        const center = bounds.getCenter();
        if (Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
          if (mapMode === '2D') {
            map.flyToBounds(bounds, { padding: [58, 58], maxZoom: 7, duration: 1.6 });
          }

          localityMarker.current?.remove();
          const icon = L.divIcon({
            className: 'story-locality-marker',
            html: '<span class="locality-marker"><span class="locality-marker__halo"></span><span class="locality-marker__shadow"></span><span class="locality-marker__body" aria-hidden="true">✦</span></span>',
            iconSize: [66, 76],
            iconAnchor: [33, 64],
          });
          localityMarker.current = L.marker(center, { icon, title: activeStory.localityLabel, riseOnHover: true })
            .addTo(map)
            .bindTooltip(activeStory.localityLabel, { permanent: true, direction: 'top', offset: [0, -44], className: 'locality-tooltip' });
        }
      }
    } catch (err) {
      logApp('warn', 'Could not animate region bounds', { message: err?.message });
    }

    return () => localityMarker.current?.remove();
  }, [activeStory, mapRegionsReady, mapMode]);

  const filteredStories = stories.filter((story) => {
    const matchesLanguage = language === 'Toutes les langues' || story.language === language;
    const matchesQuery = `${story.title} ${story.region} ${story.type}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'));
    return matchesLanguage && matchesQuery;
  });

  return (
    <div className="app-shell">
      <div className="scroll-progress" role="progressbar" aria-label="Progression de la lecture" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(scrollProgress)}>
        <span className="scroll-progress__track"><i style={{ height: `${scrollProgress}%` }} /></span>
        <strong>{String(Math.round(scrollProgress)).padStart(2, '0')}<small>%</small></strong>
      </div>
      <header className="topbar">
        <a className="brand" href="#accueil" aria-label="Les Voix du Faso, accueil">
          <span className="brand-mark"><Sparkles size={17} aria-hidden="true" /></span><span>Les Voix du <strong>Faso</strong></span>
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navigation principale">
          <a className="active" href="#explorer" onClick={() => setMenuOpen(false)}>Explorer</a>
          <a href="#histoires" onClick={() => setMenuOpen(false)}>Les histoires</a>
          <a href="#a-propos" onClick={() => setMenuOpen(false)}>À propos</a>
        </nav>
        <div className="topbar-actions">
          <span className="language-indicator" aria-label="Langue de l’interface : français">FR <ChevronDown size={15} aria-hidden="true" /></span>
          <button className="contribute-button" type="button" onClick={() => { setContributionOpen(true); setContributionSent(false); setContributionError(''); }}>Partager un récit <ArrowUpRight size={16} aria-hidden="true" /></button>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="accueil">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> Patrimoine oral du Burkina Faso</p>
            <h1>Chaque terre<br /><em>a une voix.</em></h1>
            <p className="hero-text">Parcourez le Burkina Faso à travers ses contes, ses légendes et les voix de celles et ceux qui les font vivre.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#explorer">Explorer la carte <Compass size={18} aria-hidden="true" /></a>
              <a className="text-button" href="#histoires">Découvrir les récits <ArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="hero-meta">
              <div><strong>60+</strong><span>langues au Faso</span></div>
              <div><strong>100%</strong><span>patrimoine oral</span></div>
              <div><strong>{new Set(stories.map((story) => story.language)).size}</strong><span>langues intégrées</span></div>
            </div>
          </div>
          <div className="hero-art" role="img" aria-label="Baobab animé en relief au coucher du soleil">
            <div className="scene-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="sun" /><div className="moon-ring" />
            <div className="scene-ground ground-back" /><div className="scene-ground ground-front" />
            <div className="baobab">
              <div className="trunk" /><div className="branch branch-one" /><div className="branch branch-two" /><div className="branch branch-three" />
              <div className="leaf-cluster cluster-one" /><div className="leaf-cluster cluster-two" /><div className="leaf-cluster cluster-three" /><div className="leaf-cluster cluster-four" />
            </div>
            <span className="art-label">La mémoire<br />habite la terre</span>
            <span className="scene-caption">Une terre · mille récits</span>
          </div>
        </section>

        <section className="explorer-section" id="explorer">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 — La carte vivante</p>
              <h2>Explorez par <em>territoire.</em></h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="map-view-switcher" role="group" aria-label="Mode d'affichage de la carte">
                <button
                  type="button"
                  className={mapMode === '3D' ? 'switcher-btn active' : 'switcher-btn'}
                  onClick={() => setMapMode('3D')}
                  aria-pressed={mapMode === '3D'}
                >
                  <Sparkles size={14} aria-hidden="true" /> Vue 3D relief
                </button>
                <button
                  type="button"
                  className={mapMode === '2D' ? 'switcher-btn active' : 'switcher-btn'}
                  onClick={() => setMapMode('2D')}
                  aria-pressed={mapMode === '2D'}
                >
                  <Layers size={14} aria-hidden="true" /> Carte 2D OpenStreetMap
                </button>
              </div>
            </div>
          </div>
          <div className="map-layout">
            <div className="map-card">
              <div className="map-toolbar">
                <span><MapPin size={16} aria-hidden="true" /> Burkina Faso · {mapMode === '3D' ? 'Relief 3D du territoire' : 'Carte cartographique'}</span>
                <span className="map-hint">{activeStory.localityLabel}</span>
              </div>
              <div style={{ position: 'relative', height: '430px' }}>
                <div
                  className="map-canvas"
                  ref={mapRef}
                  role="application"
                  aria-label={`Carte 2D du Burkina Faso, repère régional pour le récit en ${activeStory.language}`}
                  style={{ display: mapMode === '2D' ? 'block' : 'none', height: '100%' }}
                />
                {mapMode === '3D' && (
                  <Interactive3DMap
                    activeRegionName={activeStory.localityRegion}
                    onSelectStoryRegion={(region) => {
                      const matchingStory = stories.find((s) => s.localityRegion === region.localityRegion);
                      if (matchingStory) {
                        selectStory(matchingStory);
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <aside className="featured-story" aria-live="polite">
              <p className="eyebrow">Récit à découvrir</p>
              <div className="story-info">
                <div className="story-tags"><span>{activeStory.type}</span>{activeStory.region && <span>{activeStory.region}</span>}</div>{activeStory.catalogue && <p className="catalogue-label">{activeStory.catalogue}</p>}<h3>{activeStory.title}</h3><p>{activeStory.excerpt}</p>
                <div className="chapter-reader">
                  <div className="chapter-topline"><span>Étape {chapterIndex + 1} / {activeStory.chapters.length}</span><span>{activeStory.chapters[chapterIndex][0]}</span></div>
                  <p className={activeStory.moralChapter && chapterIndex === activeStory.chapters.length - 1 ? 'story-moral' : undefined}>{activeStory.chapters[chapterIndex][1]}</p>
                  <div className="chapter-controls"><button type="button" disabled={chapterIndex === 0} onClick={() => changeChapter(chapterIndex - 1)}><ArrowLeft size={13} aria-hidden="true" /> Précédent</button><div className="chapter-dots">{activeStory.chapters.map((chapter, index) => <button key={chapter[0]} className={index === chapterIndex ? 'selected' : ''} type="button" onClick={() => changeChapter(index)} aria-label={`Étape ${index + 1} : ${chapter[0]}`} aria-current={index === chapterIndex ? 'step' : undefined} />)}</div><button type="button" disabled={chapterIndex === activeStory.chapters.length - 1} onClick={() => changeChapter(chapterIndex + 1)}>Suivant <ArrowRight size={13} aria-hidden="true" /></button></div>
                </div>
                <div className="story-footer">
                  {activeStory.audioUrl ? <><span><strong>Écouter le conte en {activeStory.language}</strong><small>{activeStory.credit ? `Récit transmis par ${activeStory.credit}` : 'Enregistrement fourni avec le récit'}</small></span><audio className="story-audio" controls preload="none" aria-label={`Audio en ${activeStory.language} : ${activeStory.title}`} src={activeStory.audioUrl}>Votre navigateur ne prend pas en charge la lecture audio.</audio></> : <><button className="play-button" type="button" onClick={toggleNarration} aria-label={playing ? 'Mettre la lecture en pause' : 'Lire le texte à voix haute'} title="Lecture vocale du texte en français">{playing ? <Pause size={17} fill="currentColor" /> : <CirclePlay size={18} fill="currentColor" />}</button><span><strong>{playing ? 'Lecture du texte en français' : 'Lire le texte en français'}</strong><small>Voix de synthèse de votre navigateur</small></span><Volume2 className="volume-icon" size={18} aria-hidden="true" /></>}
                </div>
                {activeStory.textCredit && <p className="story-credits"><span>{activeStory.textCredit}</span><span>{activeStory.audioCredit}</span></p>}
                {activeStory.sourceUrl && <a className="source-link" href={activeStory.sourceUrl} target="_blank" rel="noreferrer">Consulter une ressource audio externe <ExternalLink size={13} aria-hidden="true" /></a>}
              </div>
            </aside>
          </div>
        </section>

        <section className="narrative-section" aria-labelledby="narrative-title">
          <div className="narrative-copy"><p className="eyebrow">02 — L’expérience narrative</p><h2 id="narrative-title">Écouter, puis <em>transmettre.</em></h2><p>Chaque récit avance par étapes courtes, à lire ou à écouter. Choisissez le rythme qui vous convient.</p><a className="primary-button" href="#histoires">Choisir une histoire <BookOpen size={17} aria-hidden="true" /></a></div>
          <div className="narrative-steps">{['Une terre', 'Une voix', 'Une mémoire'].map((step, index) => <button type="button" className={chapterIndex === index ? 'narrative-step active' : 'narrative-step'} key={step} onClick={() => changeChapter(index)} aria-pressed={chapterIndex === index}><span>0{index + 1}</span><strong>{step}</strong><small>{['Choisissez un point sur la carte.', 'Lisez ou écoutez le texte en français.', 'Partagez une histoire à transmettre.'][index]}</small><ArrowUpRight size={17} aria-hidden="true" /></button>)}</div>
        </section>

        <section className="stories-section" id="histoires">
          <div className="section-heading"><div><p className="eyebrow">03 — La collection</p><h2>Des histoires à <em>habiter.</em></h2></div><span className="collection-count">{filteredStories.length} récit{filteredStories.length > 1 ? 's' : ''} présenté{filteredStories.length > 1 ? 's' : ''}</span></div>
          <div className="filter-row">
            <div className="search-field">
              <label htmlFor="search-recit-input" className="sr-only">Rechercher un récit</label>
              <Search size={17} aria-hidden="true" />
              <input id="search-recit-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un récit…" />
            </div>
            <div className="select-field">
              <label htmlFor="filter-langue-select" className="sr-only">Filtrer par langue</label>
              <Languages size={17} aria-hidden="true" />
              <select id="filter-langue-select" value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option>Toutes les langues</option><option>Bissa</option><option>Dioula</option><option>Mooré</option><option>Fulfulde</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
          <div className="story-grid">
            {filteredStories.map((story) => (
              <button
                className={`story-card story-card--${story.id}`}
                type="button"
                key={story.id}
                onClick={() => { selectStory(story); document.querySelector('#explorer')?.scrollIntoView({ behavior: 'smooth' }); }}
                aria-label={`Découvrir ${story.title}`}
                onPointerMove={(event) => {
                  if (event.pointerType === 'touch') return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  const x = (event.clientX - rect.left) / rect.width;
                  const y = (event.clientY - rect.top) / rect.height;
                  event.currentTarget.style.setProperty('--story-rx', `${(0.5 - y) * 7}deg`);
                  event.currentTarget.style.setProperty('--story-ry', `${(x - 0.5) * 9}deg`);
                  event.currentTarget.style.setProperty('--story-light-x', `${x * 100}%`);
                  event.currentTarget.style.setProperty('--story-light-y', `${y * 100}%`);
                }}
                onPointerLeave={(event) => {
                  event.currentTarget.style.setProperty('--story-rx', '0deg');
                  event.currentTarget.style.setProperty('--story-ry', '0deg');
                  event.currentTarget.style.setProperty('--story-light-x', '50%');
                  event.currentTarget.style.setProperty('--story-light-y', '50%');
                }}
              >
                <span className="story-animation">
                  <img className="card-image" src={story.image} alt={`Illustration animée du récit en ${story.language}`} loading="lazy" onError={(event) => { event.currentTarget.remove(); }} />
                  <span className="story-animation__veil" aria-hidden="true" />
                  <span className="story-animation__grain" aria-hidden="true" />
                  <span className="story-animation__horizon" aria-hidden="true" />
                  <span className="story-animation__cursor-light" aria-hidden="true" />
                </span>
                <div className="card-content">
                  {story.catalogue && <small className="catalogue-label">{story.catalogue}</small>}
                  <div className="story-tags"><span>{story.type}</span><span>{story.language}</span></div>
                  <h3>{story.title}</h3>
                  {(story.region || story.duration) && <p>{story.region}{story.duration && <> <span>·</span> {story.duration}</>}</p>}
                </div>
                <ArrowUpRight className="card-arrow" size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
          {filteredStories.length === 0 && <p className="empty-state">Aucun récit ne correspond à votre recherche.</p>}
        </section>
      </main>

      <footer id="a-propos"><div className="footer-brand"><span className="brand-mark"><Sparkles size={17} aria-hidden="true" /></span><span>Les Voix du <strong>Faso</strong></span></div><p>Un projet pour écouter, préserver et transmettre.</p><span className="footer-note">© 2026 · Fait avec respect pour nos mémoires</span></footer>

      {contributionOpen && <ContributionDialog onClose={() => setContributionOpen(false)} onSubmit={handleContributionSubmit} saving={contributionSaving} error={contributionError} sent={contributionSent} />}
    </div>
  );
}

function ContributionDialog({ onClose, onSubmit, saving, error, sent }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="contribution-dialog" role="dialog" aria-modal="true" aria-labelledby="contribution-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        {sent ? (
          <div className="dialog-success">
            <Sparkles size={28} aria-hidden="true" />
            <h2 id="contribution-title">Merci pour ce partage.</h2>
            <p>Le récit et ses fichiers joints sont enregistrés dans ce navigateur. Ils ne sont pas envoyés à un serveur.</p>
            <button className="primary-button" type="button" onClick={onClose}>Terminer</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Faire vivre la mémoire</p>
            <h2 id="contribution-title">Partager un récit</h2>
            <p className="dialog-intro">Saisis la transcription ou joins un fichier, puis ajoute l’enregistrement audio du conte.</p>
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="contributor-input">Nom de la personne qui transmet</label>
                <input id="contributor-input" name="contributor" required maxLength="80" placeholder="Nom du conteur ou de la conteuse" />
              </div>
              <div className="form-group">
                <label htmlFor="title-input">Titre du conte</label>
                <input id="title-input" name="title" required maxLength="120" placeholder="Ex. Nin-kẽem a yembr kibare" />
              </div>
              <div className="form-group">
                <label htmlFor="story-input">Transcription du conte</label>
                <textarea id="story-input" name="story" maxLength="30000" rows="5" placeholder="Tu peux saisir ou coller la transcription ici…" />
              </div>
              <div className="form-group file-upload-group">
                <label htmlFor="transcriptionFile-input" className="file-upload-label">Joindre la transcription (facultatif)</label>
                <input id="transcriptionFile-input" className="file-upload-input" name="transcriptionFile" type="file" accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                <span className="file-hint">TXT, PDF, DOC ou DOCX · 10 Mo maximum</span>
              </div>
              <div className="form-group file-upload-group">
                <label htmlFor="audioFile-input" className="file-upload-label">Joindre l’audio (facultatif)</label>
                <input id="audioFile-input" className="file-upload-input" name="audioFile" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.opus,.webm" />
                <span className="file-hint">MP3, WAV, M4A, AAC, OGG ou WebM · 25 Mo maximum</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="region-input">Région</label>
                  <input id="region-input" name="region" required maxLength="80" placeholder="Ex. Centre" />
                </div>
                <div className="form-group">
                  <label htmlFor="language-input">Langue</label>
                  <select id="language-input" name="language" required defaultValue="">
                    <option value="" disabled>Choisir</option>
                    <option>Bissa</option><option>Dioula</option><option>Mooré</option><option>Fulfulde</option><option>Autre</option>
                  </select>
                </div>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Enregistrer la proposition'} <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
