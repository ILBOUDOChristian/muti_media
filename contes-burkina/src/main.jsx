import React, { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, CirclePlay,
  Compass, Crown, ExternalLink, Filter, Languages, Layers, MapPin, Menu, Pause, Search, Sparkles,
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
    logApp('error', 'Resource media failed to load', { url: resourceUrl });
    return;
  }
  logApp('error', 'Unhandled application error', { message: event.message });
});

// ── CORPUS VÉRIFIÉ DU PATRIMOINE ORAL : CONTES ET LÉGENDES DU BURKINA FASO ──
const stories = [
  // ── LÉGENDES FONDATRICES DU BURKINA FASO ──
  {
    id: 'legende-yennenga',
    title: 'L’Épopée de la Princesse Yennenga & l’Étalon Ouédraogo',
    catalogue: 'Mythe fondateur national',
    language: 'Mooré',
    type: 'Légende',
    color: 'ochre',
    localityRegion: 'Centre',
    localityLabel: 'Ouagadougou & Moogo · Mythe fondateur de la nation mossi',
    image: '/images/yennenga.svg',
    credit: 'Tradition orale du Moogo · Récit académique vérifié',
    excerpt: 'Princesse guerrière du royaume de Dagomba et cavalière d’exception, Yennenga conquiert sa liberté. De son union avec le chasseur Rialé naît Ouédraogo, père fondateur des royaumes mossis.',
    chapters: [
      [
        'L’amazone de Gambaga',
        'Yennenga (dont le prénom de naissance est Poko) naît à Gambaga dans le royaume de Dagomba, fille chérie du roi Naaba Nedega.\nÉlevée dès le plus jeune âge au maniement des armes et à l’équitation, elle se révèle une cavalière incomparable et une archère redoutable.\nElle commande avec bravoure la cavalerie de son père et repousse victorieusement les assauts ennemis, devenant le plus solide rempart du royaume.'
      ],
      [
        'Le champ de gombo et le refus d’asservissement',
        'Admiratif de ses exploits mais refusant de se priver de son bras armé, le roi Nedega repousse tous les prétendants et refuse obstinément de la marier.\nPour exprimer sa révolte et la tristesse de voir sa jeunesse se consumer sans descendance, Yennenga fait semer un champ de gombo par ses servantes et laisse pourrir les fruits mûrs sur pied.\nDevant son père stupéfait, elle déclare : « Vois ce champ : les fruits mûrs abandonnés pourrissent sans nourrir personne. Ainsi dépérit ma jeunesse si tu m’empêches de donner la vie ».'
      ],
      [
        'La chevauchée vers la liberté',
        'Constatant l’inflexibilité de son père, Yennenga prend son destin en main.\nUne nuit, vêtue d’un habit d’homme et de guerrier, elle enfourche son fougueux étalon blanc.\nElle galope à bride abattue vers le nord, franchissant rivières en crue et forêts denses pour échapper aux gardes lancés à sa poursuite.\nAprès des jours d’épuisement et de solitude au cœur de la brousse, son fidèle destrier la conduit à l’orée d’une forêt mystérieuse.'
      ],
      [
        'La rencontre avec Rialé',
        'C’est dans ces bois que vit Rialé, un prince et noble chasseur d’éléphants d’origine mandingue ayant fui les conflits de sa terre.\nDécouvrant cette mystérieuse cavalière évanouie près de son étalon, Rialé la recueille avec bienveillance et panse ses blessures.\nLorsqu’elle reprend ses esprits et révèle sa véritable identité, naît entre ces deux âmes libres une admiration mutuelle qui se transforme en amour profond.'
      ],
      [
        'La naissance de Ouédraogo et la fondation du Moogo',
        'De leur union naît un fils vigoureux qu’ils prénomment Ouédraogo — qui signifie « étalon » ou « cheval mâle » en langue mooré, en hommage éternel au destrier blanc qui permit la fuite de la princesse.\nDevenu adulte, Ouédraogo part vers le nord et fonde le royaume de Tenkodogo, première capitale de la grande dynastie des Mossis (le Moogo).\nDepuis, la princesse Yennenga et son étalon incarnent la bravoure, la liberté et l’identité nationale du Burkina Faso, dont le trophée majeur du FESPACO porte le nom : l’Étalon d’or de Yennenga.'
      ],
    ],
  },
  {
    id: 'legende-dafra',
    title: 'Le Sanctuaire des Silures Sacrés de Dafra',
    catalogue: 'Mémoire tutélaire de Sya',
    language: 'Dioula',
    type: 'Légende',
    color: 'red',
    localityRegion: 'Haut-Bassins',
    localityLabel: 'Bobo-Dioulasso (Sya) · Source sacrée du marigot Houet',
    image: '/images/dafra.svg',
    credit: 'Tradition des Bobo Mandarè · Patrimoine immatériel de Bobo-Dioulasso',
    excerpt: 'Dans la gorge rocheuse de Dafra où sourd le marigot Houet, des silures géants incarnent les ancêtres fondateurs de Sya. Nul ne peut les pêcher sans braver la colère des forces tutélaires.',
    chapters: [
      [
        'La gorge sacrée de Sya',
        'Au sud de Bobo-Dioulasso, encaissée entre de monumentales parois de grès noirci par le temps, se cache la source naturelle du marigot Houet.\nCe lieu mystique et grandiose est nommé Dafra, mot qui signifie « ancêtre » ou « grand-père » en langue bobo.\nC’est un sanctuaire séculaire où la nature et le monde spirituel des anciens ne font qu’un.'
      ],
      [
        'L’incarnation des ancêtres protecteurs',
        'Selon la tradition transmise par les anciens du peuple Bobo Mandarè, lors des grandes guerres et des invasions d’autrefois, les fondateurs de Sya vinrent chercher refuge dans cette gorge inaccessible.\nPour protéger leur descendance pour l’éternité, les esprits des patriarches s’incarnèrent dans les grands silures (poissons-chats) noirs peuplant le bassin.\nCertains récits rapportent que les plus anciens de ces poissons portent sur leur corps les traces sacrées de cauris protecteurs.'
      ],
      [
        'Les interdits et les funérailles des poissons',
        'Le caractère sacré de Dafra impose des règles absolues que chaque visiteur doit respecter :\nIl est formellement interdit de pêcher, de blesser ou de consommer les silures de la source.\nSur le site, le port de vêtements rouges et de parures en or est strictement proscrit.\nChose unique au monde : lorsqu’un vieux silure sacré vient à mourir, il est retiré des eaux avec une vénération infinie, enveloppé dans un linceul blanc et inhumé selon les mêmes rites funéraires qu’un doyen vénéré de la communauté.'
      ],
      [
        'Le vœu et le devoir de mémoire',
        'Depuis des générations, pèlerins et visiteurs descendent le sentier escarpé pour s’agenouiller au bord de l’eau.\nOn y formule des vœux de santé, de prospérité et particulièrement de fécondité pour les mères en attente d’enfant.\nToute prière exaucée par les ancêtres de Dafra engage moralement le pèlerin à revenir accomplir des offrandes de gratitude, perpétuant ainsi l’alliance millénaire entre les hommes et les eaux de Bobo-Dioulasso.'
      ],
    ],
  },
  {
    id: 'legende-crocodiles-bazoule',
    title: 'Le Pacte des Crocodiles Sacrés de Bazoulé & Sabou',
    catalogue: 'Pacte séculaire Homme-Nature',
    language: 'Mooré',
    type: 'Légende',
    color: 'ochre',
    localityRegion: 'Centre-Ouest',
    localityLabel: 'Bazoulé & Sabou · Mare sacrée de la fraternité humaine et animale',
    image: '/images/bazoule.svg',
    credit: 'Tradition orale mossi · Fête rituelle du Koom Lakré',
    excerpt: 'Au XVe siècle, lors d’une terrible sécheresse, les crocodiles guidèrent les villageois assoiffés vers une nappe d’eau secrète. Depuis ce jour, un pacte de paix inviolable unit la communauté et les reptiles.',
    chapters: [
      [
        'L’épreuve de la grande soif',
        'Il y a plus de cinq siècles, sous le règne du Moogho Naaba Kouda vers les années 1400, une sécheresse impitoyable s’abattit sur la région de Bazoulé.\nPendant de longues saisons sans une goutte de pluie, les puits se tarirent, les animaux périrent et les habitants devaient marcher des journées entières sans parvenir à désaltérer leurs enfants.\nLe village était au bord de la famine et de l’exil.'
      ],
      [
        'Les crocodiles guides providentiels',
        'C’est alors qu’apparurent d’imposants crocodiles du Nil venus des profondeurs de la savane.\nObservant avec curiosité les reptiles, des femmes du village remarquèrent qu’ils s’enfonçaient dans des terriers d’argile d’où ils ressortaient le corps ruisselant d’une eau fraîche et limpide.\nEn suivant prudemment leurs traces, les villageois découvrirent une nappe phréatique abondante et inépuisable qui sauva la vie de toute la communauté.'
      ],
      [
        'L’alliance sacrée et le respect mutuel',
        'Pénétrés d’une reconnaissance éternelle envers ces animaux qui les avaient délivrés de la mort, les chefs de terre et les doyens scellèrent un pacte solennel :\nLe crocodile fut élevé au rang de totem protecteur du village.\nIl fut rigoureusement interdit de les chasser, de les frapper ou de leur causer le moindre tort.\nEn retour, les crocodiles apprirent à vivre en harmonie totale avec les humains, sans jamais attaquer les villageois ni leur bétail.'
      ],
      [
        'La fête du Koom Lakré',
        'Aujourd’hui encore, à Bazoulé comme à Sabou, enfants et femmes se baignent et puisent l’eau aux côtés de plus de deux cents crocodiles en totale liberté.\nChaque année, la fête coutumière du Koom Lakré (« vaincre la faim » et célébrer l’eau) rassemble la population pour remercier les crocodiles et réaffirmer ce pacte de coexistence pacifique, exemple universel d’harmonie entre l’être humain et la faune sauvage.'
      ],
    ],
  },
  {
    id: 'legende-fabedougou-cascades',
    title: 'Les Dômes de Fabédougou et Chutes de Karfiguéla',
    catalogue: 'Sanctuaire des Esprits des Eaux',
    language: 'Dioula',
    type: 'Légende',
    color: 'green',
    localityRegion: 'Cascades',
    localityLabel: 'Banfora & Karfiguéla · Forteresses de grès et génies des eaux de la Comoé',
    image: '/images/cascades.svg',
    credit: 'Tradition tiéfo et sénoufo · Région des Cascades',
    excerpt: 'Dans la région de Banfora, les dômes géologiques de Fabédougou et les cascades de Karfiguéla forment un paysage millénaire habité par les génies tutélaires de l’eau. Nul voyageur n’y passe la nuit.',
    chapters: [
      [
        'Les forteresses bâties par la Terre',
        'À quelques lieues de Banfora, les dômes de Fabédougou s’élèvent vers le ciel comme de gigantesques châteaux sculptés dans le grès.\nÉmergées des eaux d’un ancien océan préhistorique il y a des millions d’années, ces couches de roche empilées en strates parfaites semblent avoir été dressées par des mains surnaturelles.\nDans la mémoire des peuples du Sud-Ouest, ces édifices sont les demeures secrètes des génies fondateurs de la terre.'
      ],
      [
        'L’eau vivifiante de la Comoé',
        'Au pied de ces reliefs majestueux, les chutes de Karfiguéla précipitent les eaux du fleuve Comoé le long de falaises étagées, à travers une allée séculaire de manguiers géants.\nCette eau vive irrigue les vallées fertiles et assure la prospérité des récoltes de canne et de céréales de toute la contrée.'
      ],
      [
        'L’interdit absolu du crépuscule',
        'Dans les traditions animistes des Tiéfos et des Sénoufos, la beauté des cascades s’accompagne d’un profond respect des puissances invisibles.\nUn tabou séculaire, scrupuleusement observé par les guides et les habitants, interdit formellement de passer la nuit sur le site des chutes.\nDès que le soleil disparaît derrière la falaise, le royaume de l’eau revient aux génies tutélaires, et troubler leur quiétude nocturne exposerait l’imprudent à de funestes égarements.'
      ],
      [
        'Un héritage à contempler et protéger',
        'Les Dômes de Fabédougou et les Cascades de Karfiguéla rappellent que chaque élément naturel du Burkina Faso porte en lui une histoire, un équilibre écologique fragile et une présence spirituelle qu’il convient de transmettre avec respect aux générations futures.'
      ],
    ],
  },
  {
    id: 'legende-guimbi-ouattara',
    title: 'Guimbi Ouattara, l’Âme Souveraine de Sya',
    catalogue: 'Héroïne et diplomate de Sya',
    language: 'Dioula',
    type: 'Légende',
    color: 'red',
    localityRegion: 'Haut-Bassins',
    localityLabel: 'Bobo-Dioulasso · Grande cheffe et pacificatrice du Gwiriko',
    image: '/images/guimbi.svg',
    credit: 'Histoire orale du Gwiriko · Archives mémorielles de Bobo-Dioulasso',
    excerpt: 'Princesse du royaume du Gwiriko à Bobo-Dioulasso, Guimbi Ouattara marqua l’histoire par sa fine intelligence politique face à Samori Touré et son dévouement inébranlable pour son peuple.',
    chapters: [
      [
        'L’héritière indomptable du Gwiriko',
        'Née vers 1836 à Bobo-Dioulasso, fille aînée de Diori Ouattara, roi du Guiriko, Guimbi Ouattara s’affirme dès sa prime jeunesse comme une femme au caractère exceptionnel.\nRefusant toute soumission servile et affirmant son indépendance politique, elle acquiert une stature de dirigeante éclairée et respectée par tous les notables de la cité de Sya.'
      ],
      [
        'La diplomatie pour sauver Bobo-Dioulasso',
        'En 1897, la redoutable armée de conquête de l’Almamy Samori Touré fond sur la région, semant l’effroi et détruisant les cités rivales.\nConsciente du carnage qui guette son peuple, la princesse Guimbi Ouattara prend une initiative audacieuse : elle se rend elle-même à la rencontre du conquérant.\nGrâce à son éloquence, ses présents somptueux et son sens aigu de la négociation, elle parvient à sceller une alliance de paix qui épargne Bobo-Dioulasso du massacre et du pillage.'
      ],
      [
        'La bienfaitrice et le puits de Konbougou',
        'Véritable mère de la nation et modèle d’hospitalité, Guimbi Ouattara fit creuser de ses propres deniers un puits communautaire dans le quartier Konbougou afin que les femmes et les voyageurs de passage ne souffrent jamais de la pénurie d’eau.\nSon mausolée à Bobo-Dioulasso demeure aujourd’hui un lieu vénéré et un symbole éternel du leadership et de l’émancipation féminine au Burkina Faso.'
      ],
    ],
  },

  // ── CONTES TRADITIONNELS DU FASO ──
  {
    id: 'nin-keem',
    title: 'Nin-kẽem a yembr kibare',
    catalogue: 'Conte moral traditionnel',
    language: 'Mooré',
    type: 'Conte',
    color: 'green',
    localityRegion: 'Centre',
    localityLabel: 'Centre · repère culturel mooré indicatif',
    audioUrl: '/Conte_01_Nikeema.mp3',
    image: '/images/mossi.png',
    moralChapter: true,
    excerpt: 'Un enfant déjoue la ruse du lion et sauve son père grâce à son écoute attentive et à sa présence d’esprit face au danger.',
    chapters: [
      ['Le chemin', 'Nin-kẽem a yembr n wa n yik a zak pʋgẽ, n na n tɩ gõ weoogẽ.\nLa, a bi-bilf a yembr yikame, t’a na n tũ-a lame.\nLa, a ba wã tõdgame, t’a kõn tũ ye.\nTɩ bõe?'],
      ['Le lion chante', 'A paoodame, weoogã pʋg yaa gõose, koom kae me, n yũud ye.\nLa, a biigã tõdgame, n tũ-a n looge.\nB sẽn wa n ta we-raoogã pʋga, saag n kʋɩ, tɩ sebgã sɩng yikri.\nB zoe n tɩ kẽe tãng bokẽ, n na n sool saagã.\nMik bokã yaa m ba Weoognaab roogo.\nM ba Weoognaab sẽn wa n yi gõob n wa, a mikame t’a roogã pida ne rɩɩbo, t’a na n kɩdem ne sũ-noogo, n pʋd yɩɩll n yetẽ :\n«Roog vũuda, roog vũuda, roog vũud tɩ m meng be yɩng n daeeda».'],
      ['La réponse de l’enfant', 'Tɩ biigã leok-a :\n«M pa sablem naaba, m pa zẽenem naaba, sã n pa beoogo, tõnd pa kuus ye.»\nM ba Weoognaab sẽn wʋm dẽ, a kɩdmame, n zoe n maan wa kɩlomɛtr a yiibu.\nWakat-kãnga, la biigã yeel a ba wã :\n«Yik tao-tao n dɩk yir sore».\nLa nin-kẽemã yiime, t’a sũurã tar kiu, kiu, la a yetẽ :\n«Weoognaab ye n da seg maam sorã zug ye».'],
      ['Le retour', 'La, m ba Weoognaab lebg n waame, n le sɩng yɩɩl n yetẽ :\n«Roog vũuda, roog vũuda, roog vũud tɩ m meng be yɩng n gõodẽ.»\nTɩ biigã leok-a yasa :\n«M pa sablem naaba, m pa zẽenem naaba, sã n pa beoogo, tõnd pa kuus ye».\nSũ-noogã yĩnga, a Weoognaab sɩnga kɩdengo, la zoees yasa, n na n gilme.\nTɩ biigã tũnug m ba Weoognaab loogrã, n yi n dɩk sor n zoe n kuili.\nM ba Weoognaab sẽn wa n lebg n wa, a ra tẽedame t’a rɩɩbã ketame, t’a le sɩng yɩɩla, la ned ba a ye pa leokd-a ye.\nT’a kolg n na n lɩk n gese, la ned ba a ye ka be ye.\nT’a kẽng ka, n leb ka, a pa yãnd ned ye .\nLa, a rɩka sorã, n na n bao rao wã ne a biigã.\nLa, wakat-kãng tɩ b taa yiri.'],
      ['La leçon', 'Yaa woto, la biigã maan n fãag a ba wã, la a menga.\nBɩ d ra kɩɩs d kambã noor wakat ning ye, d mi n kelgd-ba.'],
    ],
  },
  {
    id: 'suruku-ni-sonsannin',
    title: 'Suruku ni sonsannin',
    catalogue: '15 Nziirin nziirin',
    language: 'Dioula',
    type: 'Conte',
    color: 'red',
    localityRegion: 'Haut-Bassins',
    localityLabel: 'Bobo-Dioulasso · conte traditionnel mandé',
    audioUrl: '/15%20cont%20dioull%20vol2.mp3',
    image: '/images/dioula.png',
    textCredit: '© Texte dioula par Alou Keïta, Ouagadougou, Burkina Faso, 2021',
    audioCredit: '© Audio lu par Afsatou Bokoum, Bobo-Dioulasso, Burkina Faso',
    excerpt: 'Suruku la hyène et Sonsannin le lièvre rusé partent pêcher ; le partage des prises met à rude épreuve leur confiance et leur fidélité.',
    chapters: [
      ['Le partage des poissons', 'Lon dɔ suruku ni sonsannin bɛnna ka taga jigɛ minɛ.\nO lon fɔlɔ o ye jigɛ kelen le sɔrɔ.\nSonsannin ko n teri jigɛ kelen ni mɔgɔ fila tilan ka gɛlɛn, jigɛ kelen di n ma sini ni an nana jigɛ fila sɔrɔ, e bina to ni jigɛ fila nin ye.\nSuruku ko basi te yen.\nO loon na, o ye jigɛ fila sɔrɔ.\nSonsannin ko n teri nin jigɛ fila nin te se ka supu ɲanaman kɛ, a di n ma, ni an nana sini ka naani sɔrɔ e bina to ni a bɛɛ ye.\nSuruku ko basi te yen.'],
      ['Une excuse pour s’éloigner', 'O dugusagɛ, o tagara jigɛminayɔrɔ ra, o ye naani sɔrɔ.\nSonsannin ko a bi kuma, suruku ko a ma : kana kunko ɲini a te yɔrɔ min na.\nSonsannin ko a ka yafa a ma, nga ale ka lumɔgɔw bi sara, a bina boli ka taga a ɲaɲini.\nO ye ɲɔgɔn fo.\nSonsannin bolila ka taga la suruku ka sira kan.'],
      ['Suruku se rend compte', 'Suruku nana a ye ko sonsannin tun ye min fɔ o ye tiɲɛ le ye ka tɛmɛ ni a yɛrɛ ye.\nSonsannin wulila ka taga la suruku ɲa fɛ tugunin.\nSuruku lɔra ka miiri ni a tun ye sonsannin fila nunu cɛ, a tun bi kɛ supu ɲanaman ye.'],
      ['La morale', 'A ye jigɛ bila, ko a be taga sonsannin kelen dɔ nin ta a nana a sɔrɔ ko Sonsannin wulila ka boli ni a ka jigɛ ye.\nA ma Sonsannin sɔrɔ, a ma a ka jigɛ fana sɔrɔ.\nO le ra, o ko bi ka dɔrɔmɛ kelen ka fisa ni sini duuru ye.'],
    ],
  },
  {
    id: 'soni-alla-waray',
    title: 'Soni so Alla waray, kaananke warataa!',
    catalogue: 'Conte traditionnel peul',
    language: 'Fulfulde',
    type: 'Conte',
    color: 'ochre',
    localityRegion: 'Sahel',
    localityLabel: 'Sahel · aire linguistique fulfulde pastorale',
    audioUrl: '/03_Soni_Alla_waraay.mp3',
    image: '/images/fulfulde.png',
    credit: 'Tijjaani Ba',
    excerpt: 'Conte en Fulfulde transmis par Tijjaani Ba : tant que Dieu ne décide pas de la perte d’un être, nulle puissance humaine ne peut l’abattre.',
    chapters: [
      ['L’avertissement', 'Soni so Alla waray, kaananke warataa!\nGoɗɗo wonnoo de, wawtu fu o wi\'ataanaa soni Alla waray, ni kaananke warataa. Jakka na ɗum metti kaanankee hunnde. Heddii kaananke itti fiyaare muuɗum, kam du finaatawaare muuɗum abada, maamam maayi yoppi ɓiɗɗo addi, noon ni faa tukki o. O addi fiyaare ndeen, o reeni o. Reenunoo o fu, kaananke acci faa o dilli de wi\'i goɗɗo soosoo addowa fiyaare nde, faɗɗa e maayo. Heɓa wara ƴamta o. So tawii tawaaka na o resi nde ni wara o. Nde o faɗɗunoo nde fu liinga moɗi nde.'],
      ['Le jeune homme et le filet', 'Suka gorko du wallaa nyaamdu so wanaa liƴƴi. Goɗɗo goma yaata na awoo dey, so awoken faa kiikiiɗe ni fanta sottira o. Fiyaare faɗɗaama liinga moɗii ɗum. Awottooɗo awooken heɓii linga ngaan fantii sottirii o. O huttunoo nga ni o tawi fiyaare nder reedu liinnga. O wi\'i ndaa fiyaaree nde, way ba nde ndeenanoo-mi nde. O ummii jon kaa o ndaaroy to o resunoo to, o tawi fiyaare kaananke wallaa toon. Heddii o tummbiti fiyaare o resii faa waɗi daggu balɗe jeɗɗi.'],
      ['Le crocodile demande le filet', 'Nyannde gom ni kaananke nilani suka gorko. O yottinoo ni o wi\'aa o wadda fiyaare. O wi\'i ayyo faa o hoota dey, o wadda fiyaare. Kaananke wi\'i ndelle o ɗuutee ko na anndi koo o doggal. O yottinoo ni o tummbiti fiyaare o waddi. Kaanankee ƴammi: "Noy ngaɗɗaa dey kewtuɗaa fiyaare nde ? O jaabii: "Noy waɗɗunoo hey ?" Kaananke wi\'i mi waɗɗaanonaa fiyaare nde tummbitaa de yahaa faɗɗowaa maayo too, heɓa mi ware. O ƴami ko saabii. Ko mbi\'aataa ko so Alla waray ni kaananke warataa ɗum wellaa kam; ɗuum saabii.'],
      ['La ruse dévoilée', 'Suka gorko wi\'i gasii. Ndelle, nde ni nde faɗɗowanoo, liinga moɗi nde. Awotooɗo o, nde awowinoo fu heɓi liinga ngaa wari sottiri kam. Min du coodum liinga ngaan. Kuttum liinga ngaan dey tawum fiyaare ndeen ley reedu magga. Min kaa faa hannde, hannde e jaango fu, kaan keddii-mi nam jeerfoo. Soni so Alla waray fu, kaananke warataa!\n\nTijjaani Ba'],
    ],
  },
  {
    id: 'conte-bissa',
    title: 'Conte en Bissa',
    catalogue: 'Tradition orale bissa',
    language: 'Bissa',
    type: 'Conte',
    color: 'ochre',
    localityRegion: 'Centre-Est',
    localityLabel: 'Centre-Est · repère linguistique bissa indicatif',
    audioUrl: '/Bissa.mp3',
    image: '/images/bissa.png',
    excerpt: 'Enregistrement authentique transmis en langue bissa par les conteurs du Centre-Est burkinabè.',
    chapters: [
      ['Écouter le récit', 'Le fichier audio en langue Bissa est disponible dans son authenticité d’enregistrement.\nCe conte met en lumière la richesse mélodique et poétique de la tradition orale transmise de génération en génération au Centre-Est du Faso.'],
    ],
  },
];

function persistContribution(record) {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Le stockage local n’est pas disponible.'));
      return;
    }
    const request = indexedDB.open('les-voix-du-faso', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('proposals', { keyPath: 'id' });
    request.onerror = () => reject(request.error || new Error('Erreur d’ouverture.'));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('proposals', 'readwrite');
      tx.objectStore('proposals').put(record);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}

function App() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const regionLayers = useRef(new Map());
  const localityMarker = useRef(null);
  const [mapRegionsReady, setMapRegionsReady] = useState(false);
  const [mapMode, setMapMode] = useState('3D');
  const [activeStory, setActiveStory] = useState(() => stories.find(s => s.id === 'nin-keem') || stories[0]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('Tous les types');
  const [language, setLanguage] = useState('Toutes les langues');
  const [query, setQuery] = useState('');

  // Synchronisation filtre 3D ↔ filtre collection
  const handle3DFilterChange = (filter) => {
    if (filter === 'legendes') {
      setTypeFilter('Légendes');
    } else if (filter === 'contes') {
      setTypeFilter('Contes');
    } else {
      setTypeFilter('Tous les types');
    }
    // Scroller vers la collection pour voir l'effet du filtre
    document.querySelector('#histoires')?.scrollIntoView({ behavior: 'smooth' });
  };
  const [contributionOpen, setContributionOpen] = useState(false);
  const [contributionSent, setContributionSent] = useState(false);
  const [contributionSaving, setContributionSaving] = useState(false);
  const [contributionError, setContributionError] = useState('');

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
    const currentText = activeStory.chapters[chapterIndex]?.[1] || '';
    const utterance = new SpeechSynthesisUtterance(currentText);
    
    // Sélection d'une voix africaine (Burkina, Côte d'Ivoire, Sénégal, etc.) ou timbre chaleureux de conteur
    const voices = window.speechSynthesis.getVoices() || [];
    const africanVoice = voices.find(v => 
      v.lang.startsWith('fr-BF') || 
      v.lang.startsWith('fr-CI') || 
      v.lang.startsWith('fr-SN') || 
      v.lang.startsWith('fr-CM') || 
      v.name.toLowerCase().includes('african') || 
      v.name.toLowerCase().includes('dakar') || 
      v.name.toLowerCase().includes('abidjan') || 
      v.name.toLowerCase().includes('burkina')
    ) || voices.find(v => v.lang.startsWith('fr') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('thomas') || v.name.toLowerCase().includes('paul') || v.name.toLowerCase().includes('henri')))
      || voices.find(v => v.lang.startsWith('fr'));

    if (africanVoice) {
      utterance.voice = africanVoice;
      utterance.lang = africanVoice.lang;
    } else {
      utterance.lang = 'fr-FR';
    }
    // Timbre et cadence d'un conteur traditionnel burkinabè (posé, narratif, enveloppant)
    utterance.rate = 0.88;
    utterance.pitch = 0.95;
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
    const transcript = String(formData.get('story') || '').trim();
    if (transcript.length < 10) {
      setContributionError('Veuillez saisir au moins une courte transcription.');
      return;
    }

    setContributionSaving(true);
    try {
      await persistContribution({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`,
        contributor: String(formData.get('contributor') || '').trim(),
        title: String(formData.get('title') || '').trim(),
        story: transcript,
        region: String(formData.get('region') || '').trim(),
        language: String(formData.get('language') || ''),
        submittedAt: new Date().toISOString(),
      });
      setContributionSent(true);
    } catch (error) {
      setContributionError(error.message || 'Impossible d’enregistrer.');
    } finally {
      setContributionSaving(false);
    }
  };

  // Carte 2D Leaflet
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return undefined;
    let disposed = false;
    const map = L.map(mapRef.current, { center: [12.26, -1.55], zoom: 6, zoomControl: false, attributionControl: false });
    leafletMap.current = map;
    L.control.attribution({ prefix: false }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 18,
    }).addTo(map);

    fetch('/geojson/regions.geojson')
      .then((r) => r.json())
      .then((regions) => {
        if (disposed || !mapRef.current?.isConnected) return;
        const regionIndex = new Map();
        const regionOverlay = L.geoJSON(regions, {
          style: { color: '#b75535', weight: 1.2, fillColor: '#dda047', fillOpacity: 0.08 },
          onEachFeature: (feature, layer) => {
            const regionName = feature.properties?.NAME_1 || 'Région';
            regionIndex.set(regionName, layer);
            layer.bindTooltip(regionName, { sticky: true });
            layer.on({
              mouseover: (e) => e.target.setStyle({ weight: 2, fillOpacity: 0.24 }),
              mouseout: (e) => e.target.setStyle({ weight: 1.2, fillOpacity: 0.08 }),
              click: () => {
                const found = stories.find((s) => s.localityRegion === regionName || (s.localityRegion === 'Haut-Bassins' && regionName.includes('Bassins')));
                if (found) selectStory(found);
              },
            });
          },
        }).addTo(map);
        regionLayers.current = regionIndex;
        map.fitBounds(regionOverlay.getBounds(), { padding: [16, 16], maxZoom: 6 });
        setMapRegionsReady(true);
      })
      .catch((err) => console.error(err));

    return () => { disposed = true; stopNarration(); map.remove(); leafletMap.current = null; };
  }, []);

  // Synchronisation région active Leaflet
  useEffect(() => {
    const map = leafletMap.current;
    const rName = activeStory.localityRegion;
    const layer = regionLayers.current.get(rName) || (rName === 'Hauts-Bassins' ? regionLayers.current.get('Haut-Bassins') : undefined);
    if (!mapRegionsReady || !map || !layer) return;

    map.invalidateSize();
    regionLayers.current.forEach((l) => l.setStyle({ color: '#b75535', weight: 1.2, fillOpacity: 0.08 }));
    layer.setStyle({ color: '#a9442b', weight: 2.8, fillOpacity: 0.3 });
    layer.bringToFront();

    try {
      const bounds = layer.getBounds?.();
      if (bounds?.isValid?.()) {
        const center = bounds.getCenter();
        if (mapMode === '2D') map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 7, duration: 1.4 });
        localityMarker.current?.remove();
        const iconSvg = activeStory.type === 'Légende'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/></svg>';
        const icon = L.divIcon({
          className: 'story-locality-marker',
          html: `<span class="locality-marker ${activeStory.type === 'Légende' ? 'is-legend' : ''}"><span class="locality-marker__body">${iconSvg}</span></span>`,
          iconSize: [40, 40],
          iconAnchor: [20, 36],
        });
        localityMarker.current = L.marker(center, { icon, title: activeStory.localityLabel }).addTo(map);
      }
    } catch (e) { console.warn(e); }

    return () => localityMarker.current?.remove();
  }, [activeStory, mapRegionsReady, mapMode]);

  // Filtrage combiné
  const filteredStories = stories.filter((story) => {
    const matchesLanguage = language === 'Toutes les langues' || story.language === language;
    const matchesType = typeFilter === 'Tous les types'
      || (typeFilter === 'Contes' && story.type === 'Conte')
      || (typeFilter === 'Légendes' && story.type === 'Légende');
    const matchesQuery = `${story.title} ${story.localityRegion} ${story.type}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'));
    return matchesLanguage && matchesType && matchesQuery;
  });

  const countContes = stories.filter((s) => s.type === 'Conte').length;
  const countLegendes = stories.filter((s) => s.type === 'Légende').length;

  return (
    <div className="app-shell">
      {/* ── HEADER ── */}
      <header className="topbar">
        <a className="brand" href="#accueil" aria-label="Les Voix du Faso, accueil">
          <span className="brand-mark"><Sparkles size={16} aria-hidden="true" /></span>
          <span>Les Voix du <strong>Faso</strong></span>
        </a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navigation principale">
          <a className="active" href="#explorer" onClick={() => setMenuOpen(false)}>Explorer la carte</a>
          <a href="#narratif" onClick={() => setMenuOpen(false)}>L'expérience</a>
          <a href="#histoires" onClick={() => setMenuOpen(false)}>Contes &amp; Légendes</a>
        </nav>
        <div className="topbar-actions">
          <span className="language-indicator">FR <ChevronDown size={14} aria-hidden="true" /></span>
          <button className="contribute-button" type="button" onClick={() => { setContributionOpen(true); setContributionSent(false); setContributionError(''); }}>
            Partager un récit <ArrowUpRight size={15} aria-hidden="true" />
          </button>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main>
        {/* ── 1. PAGE D'ACCUEIL : TEXTE + BAOBAB + CHIFFRES EN 1 SEUL ÉCRAN ── */}
        <section className="hero-section" id="accueil">
          <div className="hero-main-row">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-line" /> Patrimoine oral et mythologie du Burkina Faso</p>
              <h1>Chaque terre<br /><em>a une voix &amp; une légende.</em></h1>
              <p className="hero-text">
                Parcourez le Burkina Faso à travers ses contes traditionnels, ses légendes fondatrices (de l’Épopée de Yennenga aux Silures de Dafra) et la mémoire vivante de ses terroirs.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#explorer">Explorer la carte 3D <Compass size={17} aria-hidden="true" /></a>
                <a className="text-button" href="#histoires">Découvrir les récits <ArrowUpRight size={15} aria-hidden="true" /></a>
              </div>
            </div>

            <div className="hero-art" role="img" aria-label="Baobab et relief au coucher du soleil">
              <div className="scene-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className="sun" /><div className="moon-ring" />
              <div className="scene-ground ground-back" /><div className="scene-ground ground-front" />
              <div className="baobab">
                <div className="trunk" />
                <div className="branch branch-one" /><div className="branch branch-two" /><div className="branch branch-three" />
                <div className="leaf-cluster cluster-one" /><div className="leaf-cluster cluster-two" />
                <div className="leaf-cluster cluster-three" /><div className="leaf-cluster cluster-four" />
              </div>
              <span className="art-label">La mémoire<br />habite la terre</span>
              <span className="scene-caption">Contes &amp; Légendes</span>
            </div>
          </div>

          <div className="hero-meta">
            <div><strong>{countLegendes}</strong><span>Légendes fondatrices</span></div>
            <div><strong>{countContes}</strong><span>Contes traditionnels</span></div>
            <div><strong>60+</strong><span>Langues du Faso</span></div>
            <div><strong>100%</strong><span>Patrimoine vérifié</span></div>
          </div>
        </section>

        {/* ── 2. SECTION 01 — CARTE ET LECTEUR (1 ÉCRAN TOTAL, PAS DE COUPURE) ── */}
        <section className="explorer-section" id="explorer">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 — La carte vivante</p>
              <h2>Explorez par <em>territoire &amp; sanctuaire.</em></h2>
            </div>
            <div className="map-view-switcher" role="group" aria-label="Mode carte">
              <button
                type="button"
                className={mapMode === '3D' ? 'switcher-btn active' : 'switcher-btn'}
                onClick={() => setMapMode('3D')}
              >
                <Sparkles size={13} aria-hidden="true" /> Vue 3D relief &amp; sanctuaires
              </button>
              <button
                type="button"
                className={mapMode === '2D' ? 'switcher-btn active' : 'switcher-btn'}
                onClick={() => setMapMode('2D')}
              >
                <Layers size={13} aria-hidden="true" /> Carte 2D OpenStreetMap
              </button>
            </div>
          </div>

          <div className="map-layout">
            <div className="map-card">
              <div className="map-toolbar">
                <span>
                  <MapPin size={15} aria-hidden="true" /> Burkina Faso · {mapMode === '3D' ? 'Relief 3D & Sanctuaires Légendaires' : 'Atlas cartographique'}
                </span>
                <span className="map-hint">{activeStory.localityLabel}</span>
              </div>
              <div className="map-canvas-container">
                <div
                  className="map-canvas"
                  ref={mapRef}
                  style={{ display: mapMode === '2D' ? 'block' : 'none' }}
                />
                {mapMode === '3D' && (
                  <Interactive3DMap
                    activeRegionName={activeStory.localityRegion}
                    activeStoryId={activeStory.id}
                    activeStoryType={activeStory.type}
                    onSelectStoryRegion={(region) => {
                      const found = stories.find(
                        (s) => s.localityRegion === region.localityRegion
                          || (s.localityRegion === 'Haut-Bassins' && region.localityRegion?.includes('Bassins'))
                      );
                      if (found) selectStory(found);
                    }}
                    onSelectStoryId={(storyId) => {
                      const found = stories.find((s) => s.id === storyId);
                      if (found) selectStory(found);
                    }}
                    onFilterChange={handle3DFilterChange}
                  />
                )}
              </div>
            </div>

            <aside className="featured-story" aria-live="polite">
              <div className="story-info">
                <p className="eyebrow">Récit sélectionné</p>
                <div className="story-tags">
                  <span className={activeStory.type === 'Légende' ? 'tag-legend' : 'tag-conte'}>
                    {activeStory.type === 'Légende' && <Crown size={11} style={{ display: 'inline', marginRight: 4 }} />}
                    {activeStory.type}
                  </span>
                  <span>{activeStory.language}</span>
                  {activeStory.localityRegion && <span>{activeStory.localityRegion}</span>}
                </div>

                {activeStory.catalogue && <small className="catalogue-label">{activeStory.catalogue}</small>}
                <h3>{activeStory.title}</h3>
                <p>{activeStory.excerpt}</p>

                <div className="chapter-reader">
                  <div className="chapter-topline">
                    <span>Étape {chapterIndex + 1} / {activeStory.chapters.length}</span>
                    <span>{activeStory.chapters[chapterIndex][0]}</span>
                  </div>
                  <p>{activeStory.chapters[chapterIndex][1]}</p>
                  <div className="chapter-controls">
                    <button type="button" disabled={chapterIndex === 0} onClick={() => changeChapter(chapterIndex - 1)}>
                      <ArrowLeft size={12} aria-hidden="true" /> Précédent
                    </button>
                    <div className="chapter-dots">
                      {activeStory.chapters.map((chapter, index) => (
                        <button
                          key={chapter[0]}
                          className={index === chapterIndex ? 'selected' : ''}
                          type="button"
                          onClick={() => changeChapter(index)}
                          aria-label={`Étape ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button type="button" disabled={chapterIndex === activeStory.chapters.length - 1} onClick={() => changeChapter(chapterIndex + 1)}>
                      Suivant <ArrowRight size={12} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="story-footer">
                {activeStory.audioUrl ? (
                  <div className="story-footer-audio-box">
                    <div className="story-footer-text">
                      <span className="listen-cta">Cliquez ici pour écouter</span>
                      <strong>Écouter l’enregistrement en {activeStory.language}</strong>
                      <small>{activeStory.credit ? `Par ${activeStory.credit}` : "Voix d’archive authentique"}</small>
                    </div>
                    <audio
                      className="story-audio"
                      controls
                      preload="metadata"
                      src={activeStory.audioUrl}
                    />
                  </div>
                ) : (
                  <div className="story-footer-ia-box">
                    <button
                      className={`play-button ${playing ? "is-playing" : ""}`}
                      type="button"
                      onClick={toggleNarration}
                      aria-label={playing ? "Mettre en pause" : "Cliquez ici pour écouter avec la voix de conteur"}
                    >
                      {playing ? <Pause size={18} fill="currentColor" /> : <CirclePlay size={20} fill="currentColor" />}
                    </button>
                    <div className="story-footer-text" onClick={toggleNarration} style={{ cursor: "pointer" }}>
                      <span className="listen-cta">{playing ? "Lecture en cours…" : "Cliquez ici pour écouter"}</span>
                      <strong>{playing ? "Conte en cours de narration" : "Voix IA de conteur burkinabè"}</strong>
                      <small>Narration orale du chapitre sélectionné</small>
                    </div>
                    <Volume2 className="volume-icon" size={18} aria-hidden="true" />
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* ── 3. SECTION 02 — EXPÉRIENCE NARRATIVE PREMIUM ── */}
        <section className="narrative-section" id="narratif" aria-labelledby="narrative-title">
          <div className="narrative-grain" aria-hidden="true" />
          <div className="narrative-container">

            {/* Colonne gauche : texte + CTA animé */}
            <div className="narrative-copy">
              <p className="eyebrow"><span className="eyebrow-line" />02 — L’expérience narrative</p>
              <h2 id="narrative-title">Écouter,<br />comprendre,<br /><em>transmettre.</em></h2>
              <p>
                Chaque conte et légende avance par étapes claires et documentées, à lire ou à écouter à voix haute. Des mythes fondateurs aux leçons de sagesse des villages, plongez au cœur de la parole burkinabè.
              </p>

              {/* CTA pulsant */}
              <div className="narrative-cta-wrap">
                <a className="narrative-cta" href="#histoires" aria-label="Parcourir la collection complète">
                  <span className="narrative-cta__ring" aria-hidden="true" />
                  <span className="narrative-cta__inner">
                    <BookOpen size={18} aria-hidden="true" />
                    Parcourir la collection
                  </span>
                  <ArrowUpRight size={14} className="narrative-cta__arrow" aria-hidden="true" />
                </a>
                <span className="narrative-cta-hint">9 récits · 5 légendes · 4 contes</span>
              </div>
            </div>

            {/* Colonne droite : étapes verticales épurées */}
            <div className="narrative-steps">
              {[
                { num: '01', title: 'Choisir un territoire', desc: 'Sélectionnez une région ou un sanctuaire légendaire sur la carte 3D interactive.' },
                { num: '02', title: 'Lire & écouter', desc: 'Parcourez les étapes documentées ou activez la voix IA pour une narration immersive.' },
                { num: '03', title: 'Transmettre', desc: "Partagez votre propre conte ou l’archive collective." },
              ].map((step) => (
                <div className="narrative-step" key={step.num}>
                  <span className="narrative-step__num">{step.num}</span>
                  <div className="narrative-step__body">
                    <strong>{step.title}</strong>
                    <small>{step.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ── 4. SECTION 03 — COLLECTION COMPLÈTE & FOOTER (SCROLLABLE NATUREL) ── */}
        <section className="stories-section" id="histoires">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 — La collection complète</p>
              <h2>Contes &amp; Légendes à <em>habiter.</em></h2>
            </div>
            <span className="collection-count">
              {filteredStories.length} récit{filteredStories.length > 1 ? 's' : ''} ({countLegendes} légendes, {countContes} contes)
            </span>
          </div>

          <div className="filter-row">
            <div className="search-field">
              <label htmlFor="search-recit-input" className="sr-only">Rechercher</label>
              <Search size={16} aria-hidden="true" />
              <input
                id="search-recit-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par titre, région, héros (ex. Yennenga, Dafra)…"
              />
            </div>

            <div className="select-field">
              <label htmlFor="filter-type-select" className="sr-only">Type</label>
              <Filter size={15} aria-hidden="true" />
              <select
                id="filter-type-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option>Tous les types</option>
                <option>Légendes</option>
                <option>Contes</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </div>

            <div className="select-field">
              <label htmlFor="filter-langue-select" className="sr-only">Langue</label>
              <Languages size={15} aria-hidden="true" />
              <select
                id="filter-langue-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>Toutes les langues</option>
                <option>Mooré</option>
                <option>Dioula</option>
                <option>Fulfulde</option>
                <option>Bissa</option>
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </div>
          </div>

          <div className="story-grid">
            {filteredStories.map((story) => (
              <button
                className={`story-card ${story.type === 'Légende' ? 'story-card--legend' : ''}`}
                type="button"
                key={story.id}
                onClick={() => {
                  selectStory(story);
                  document.querySelector('#explorer')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="story-animation">
                  <img
                    className="card-image"
                    src={story.image}
                    alt={story.title}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </span>
                <div className="card-content">
                  {story.catalogue && <small className="catalogue-label">{story.catalogue}</small>}
                  <div className="story-tags">
                    <span className={story.type === 'Légende' ? 'tag-legend' : 'tag-conte'}>
                      {story.type === 'Légende' && <Crown size={10} style={{ display: 'inline', marginRight: 3 }} />}
                      {story.type}
                    </span>
                    <span>{story.language}</span>
                  </div>
                  <h3>{story.title}</h3>
                  <p>{story.localityRegion} <span>·</span> {story.chapters.length} étapes</p>
                </div>
                <ArrowUpRight className="card-arrow" size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER DÉCOUVERT EN FIN DE DÉFILEMENT DE LA SECTION 03 ── */}
      <footer id="a-propos">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark"><Sparkles size={16} aria-hidden="true" /></span>
            <div className="footer-brand-text">
              <strong>Les Voix du Faso</strong>
              <span>Un projet pour écouter, préserver et transmettre.</span>
            </div>
          </div>
          <p className="footer-note">© 2026 · Fait avec respect pour nos mémoires</p>
        </div>
      </footer>
      {contributionOpen && (
        <ContributionDialog
          onClose={() => setContributionOpen(false)}
          onSubmit={handleContributionSubmit}
          saving={contributionSaving}
          error={contributionError}
          sent={contributionSent}
        />
      )}
    </div>
  );
}

function ContributionDialog({ onClose, onSubmit, saving, error, sent }) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="contribution-dialog" role="dialog" aria-modal="true" aria-labelledby="contribution-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        {sent ? (
          <div>
            <Sparkles size={24} aria-hidden="true" />
            <h2 id="contribution-title">Merci pour ce partage.</h2>
            <p>Le récit a été enregistré avec succès dans votre navigateur (IndexedDB).</p>
            <button className="primary-button" type="button" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <p className="eyebrow">Transmission de la mémoire</p>
            <h2 id="contribution-title">Partager un récit</h2>
            <div className="form-group">
              <label htmlFor="contributor-input">Votre nom</label>
              <input id="contributor-input" name="contributor" required maxLength="80" placeholder="Ex. Yennenga K." />
            </div>
            <div className="form-group">
              <label htmlFor="title-input">Titre de l’histoire</label>
              <input id="title-input" name="title" required maxLength="120" placeholder="Ex. Le lièvre et l'éléphant" />
            </div>
            <div className="form-group">
              <label htmlFor="story-input">Texte ou transcription</label>
              <textarea id="story-input" name="story" required rows="4" placeholder="Racontez le conte ou la légende ici…" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="region-input">Région</label>
                <input id="region-input" name="region" required placeholder="Ex. Centre" />
              </div>
              <div className="form-group">
                <label htmlFor="language-input">Langue</label>
                <select id="language-input" name="language" required defaultValue="">
                  <option value="" disabled>Choisir</option>
                  <option>Mooré</option>
                  <option>Dioula</option>
                  <option>Fulfulde</option>
                  <option>Bissa</option>
                </select>
              </div>
            </div>
            {error && <p style={{ color: '#983e22', fontSize: 12 }}>{error}</p>}
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'} <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

