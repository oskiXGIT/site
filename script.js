const navButtons = document.querySelectorAll('.nav-btn[data-panel]');
const panels = document.querySelectorAll('.panel-view');
const popup = document.getElementById('popup');
const popupBody = document.getElementById('popupBody');
const popupTitle = document.getElementById('popupTitle');
const languageSelect = document.getElementById('languageSelect');
const translationQuality = document.getElementById('translationQuality');
const deptAccuracy = document.getElementById('deptAccuracy');
const deptMeterBar = document.getElementById('deptMeterBar');
let currentLang = localStorage.getItem('oskiLang') || 'lt';

function showPanel(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.panel === id));
  if (id === 'terminal') setTimeout(() => document.getElementById('terminalInput').focus(), 50);
}
navButtons.forEach(btn => btn.addEventListener('click', () => showPanel(btn.dataset.panel)));

function openPopup(text, title = 'PRANESIMAS') {
  popupTitle.textContent = title;
  popupBody.textContent = text;
  popup.hidden = false;
}
function closePopup() { popup.hidden = true; }
document.getElementById('popupClose').addEventListener('click', closePopup);
document.getElementById('popupOk').addEventListener('click', closePopup);
popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });

const translations = {
  lt: {
    'nav.home':'PAGRINDINIS','nav.archive':'ARCHYVAS','nav.files':'BYLOS','nav.terminal':'TERMINALAS','nav.dont':'NESPAUSK CE',
    'status.active':'SISTEMA: AKTYVI','ticker':'⚠ SVARBUS PRANESIMAS: NIEKAS NEZINO KAS CE VYKSTA   •   VARTAI UZDARYTI   •   JEI GIRDIT TRIUKSMA NEZIUREKIT PRO LANGA   •   SERVERIS NEKALTAS ⚠',
    'hero.eyebrow':'NEOFICIALUS OFICIALUS PUSLAPYS','hero.title':'girdyt welniai ce krw atleksym ir nx pasodinsim i veta visus','hero.sub':'puslapys veikia. kodel veikia neaisku.','counter':'LANKYTOJAS NR.','feed.update':'THREAD UPDATE','feed.music':'va muzikytes biskuti jum paklausit','feed.one':'kazkas pajudino konteineri. daugiau informacijos nebus.','feed.two':'vyriausesis sake viskas kontroliuojama. po 3 min dingo sviesa.','feed.three':'sito posto nieks nedejo.',
    'archive.first':'pirmas incidentas','archive.van':'busiko byla','archive.it':'IT katastrofa','archive.revival':'atgimimas','archive.locked':'PRIEIGA UZDRAUSTA',
    'files.refusal':'⚠ FAILU PAVADINIMU VERSTI NEGALIMA NES DIREKTORIUS UZDRAUDE','files.open':'ATIDARYTI SLAPTA BYLA','terminal.warning':'KERNELIS KALBU PAKETU NEPRIIMA. TERMINALAS LIEKA KAIP YRA.',
    'chief.title':'VYRIAUSESIS','chief.caption':'ce yr kinieciu imigrantu gaujos puslapys, ce musu vyriausesis:','chief.presence':'PRISIJUNGES PRIES 14 METU','stats.danger':'PAVOJUS','stats.gate':'VARTAI','stats.locked':'UZRAKINTI','notice.title':'skelbimas','dept.title':'KALBU SKYRIUS','dept.body':'vertimai atlikti kazkieno pusbrolio. sertifikatu nerasta.','footer.copy':'© 2003-2026 NIEKAS','footer.best':'GERIAUSIA ZIURETI PER INTERNETA','popup.ok':'GERAI NU'
  },
  en: {
    'nav.home':'MAIN THING','nav.archive':'OLD SHIT','nav.files':'FILES N THAT','nav.terminal':'TERMINAL','nav.dont':'DO NOT CLICK BRO',
    'status.active':'SYSTEM: SOMEHOW ALIVE','ticker':'⚠ IMPORTANT BUSINESS: NOBODY KNOWS WHAT IS GOING ON HERE   •   GATE LOCKED FR   •   IF YOU HEAR A BANG MIND YOUR BUSINESS   •   SERVER DID NOTHING WRONG ⚠',
    'hero.eyebrow':'UNOFFICIAL OFFICIAL WEBPAGE','hero.title':'listen demons we pullin up and putting everybody back where they was supposed to be fr','hero.sub':'website is functioning. reason currently under investigation.','counter':'PERSON WHO CAME HERE NR.','feed.update':'THREAD DROPPED','feed.music':'heres some lil music for yall ears n whatever','feed.one':'someone moved the container. statement ends here.','feed.two':'chief said everything under control. lights died 3 minutes later.','feed.three':'nobody posted this post apparently.',
    'archive.first':'first goofy incident','archive.van':'van situation','archive.it':'IT got cooked','archive.revival':'unexpected comeback','archive.locked':'NAH YOU CANT GO IN',
    'files.refusal':'⚠ FILE NAMES CANNOT BE TRANSLATED. MANAGEMENT SAID NO FOR SOME REASON','files.open':'OPEN SECRET STUFF','terminal.warning':'KERNEL REFUSED THE LANGUAGE PACK. TERMINAL IS STAYING LIKE THIS.',
    'chief.title':'THE BIG DUDE','chief.caption':'this the chinese immigrant gang webpage and this our highest ranking individual right here:','chief.presence':'ONLINE SINCE LIKE 14 YEARS AGO','stats.danger':'DANGERISH','stats.gate':'GATE','stats.locked':'LOCKED BRO','notice.title':'announcement or sum','dept.title':'LANGUAGE DEPARTMENT','dept.body':'translations provided by somebody’s cousin. credentials vanished.','footer.copy':'© 2003-2026 LITERALLY NOBODY','footer.best':'BEST VIEWED USING THE INTERNET','popup.ok':'ALRIGHT DAMN'
  },
  fr: {
    'nav.home':'LE PRINCIPAL','nav.archive':'LES VIEUX TRUCS','nav.files':'LES DOSSIERS','nav.terminal':'TERMINAL CHELOU','nav.dont':'CLIQUE PAS FRÉROT',
    'status.active':'SYSTÈME: VIVANT ENCORE','ticker':'⚠ MESSAGE TRÈS SÉRIEUX: PERSONNE SAIT CE QUI SE PASSE ICI   •   PORTAIL FERMÉ WESH   •   SI T’ENTENDS UN BOUM REGARDE AILLEURS   •   LE SERVEUR A RIEN FAIT ⚠',
    'hero.eyebrow':'SITE PAS OFFICIEL MAIS UN PEU OFFICIEL','hero.title':'écoutez les démons on arrive et on remet tout le monde à sa place voilà c tout','hero.sub':'le site marche. pourquoi? excellente question frère.','counter':'GARS QUI EST PASSÉ NR.','feed.update':'NOUVELLE DU BORDEL','feed.music':'tiens un peu de musique pour vos oreilles là','feed.one':'quelqu’un a bougé le conteneur. fin du communiqué.','feed.two':'le boss a dit tout est sous contrôle. 3 min après plus de lumière.','feed.three':'apparemment personne a posté ce post.',
    'archive.first':'premier bail bizarre','archive.van':'affaire du fourgon','archive.it':'informatique explosée','archive.revival':'retour sorti de nulle part','archive.locked':'NON FRÉROT T’ENTRES PAS',
    'files.refusal':'⚠ TRADUIRE LES NOMS DE FICHIERS EST INTERDIT PAR LE PATRON POUR AUCUNE RAISON','files.open':'OUVRIR LE TRUC SECRET','terminal.warning':'LE NOYAU VEUT PAS DU PACK DE LANGUE. LE TERMINAL RESTE COMME ÇA.',
    'chief.title':'LE TRÈS GRAND CHEF','chief.caption':'ici c le site du gang des immigrés chinois et voilà notre chef suprême frère:','chief.presence':'CONNECTÉ DEPUIS 14 ANS TRANQUILLE','stats.danger':'DANGER UN PEU','stats.gate':'PORTAIL','stats.locked':'FERMÉ FRR','notice.title':'annonce vite fait','dept.title':'DÉPARTEMENT DES LANGUES','dept.body':'traductions faites par le cousin d’un gars. aucun diplôme retrouvé.','footer.copy':'© 2003-2026 PERSONNE WALLAH','footer.best':'MIEUX VU AVEC INTERNET','popup.ok':'OK ÇA VA'
  },
  eo: {
    'nav.home':'ĈEFA AFERO','nav.archive':'MALNOVAĴOJ','nav.files':'DOSIEROJ BRO','nav.terminal':'TERMINALO','nav.dont':'NE KLAKU FRATO',
    'status.active':'SISTEMO: ANKORAŬ SPIRAS','ticker':'⚠ GRAVEGA AFERO: NENIU SCIAS KIO OKAZAS ĈI TIE   •   PORDO FERMITE FRATE   •   SE VI AŬDAS BRUON NE ESTU SCIVOLA   •   SERVILO SENKULPA PROBABLY ⚠',
    'hero.eyebrow':'NEOFICIALA OFICIALA RETPAĜO','hero.title':'aŭdu demonoj ni venas kaj metas ĉiujn reen en la ĝustan lokon nu jes','hero.sub':'la retejo funkcias. kial ĝi funkcias estas filozofia problemo.','counter':'HOMO KIU VENIS NR.','feed.update':'FADENA AFERO','feed.music':'jen iom da muziketo por viaj oreloj geuloj','feed.one':'iu movis la konteneron. pli da sciigoj nul.','feed.two':'la estro diris ke ĉio regata. post tri minutoj mallumo.','feed.three':'neniu afiŝis ĉi tiun afiŝon laŭ dokumentoj.',
    'archive.first':'unua stranga afero','archive.van':'kamioneta afero','archive.it':'IT mortis iom','archive.revival':'reveno sen invito','archive.locked':'NE ENIRU BRO',
    'files.refusal':'⚠ DOSIERNOMOJ NE TRADUKEBLAS ĈAR ESTRO DIRIS NE KAJ FINO','files.open':'MALFERMU SEKRETAN AFERON','terminal.warning':'KERNO RIFUZIS LA LINGVAN PAKON. TERMINALO RESTAS KIEL ĜI ESTAS.',
    'chief.title':'LA PLEJ ESTRO','chief.caption':'ĉi tio estas la paĝo de ĉina enmigrinta bando kaj jen nia granda estro bro:','chief.presence':'ENRETA DE ANTAŬ 14 JAROJ','stats.danger':'DANĜERO IOMETE','stats.gate':'PORDO','stats.locked':'FERMITA BRO','notice.title':'anonco aŭ io','dept.title':'LINGVA DEPARTEMENTO','dept.body':'tradukoj faritaj de ies kuzo. atestiloj forestas.','footer.copy':'© 2003-2026 NENIU','footer.best':'PLEJ BONE RIGARDU PER INTERRETO','popup.ok':'BONE NU'
  },
  la: {
    'nav.home':'RES PRINCIPALIS','nav.archive':'VETERA CRAPULA','nav.files':'TABULAE','nav.terminal':'TERMINALE','nav.dont':'NOLI PREMERE FRATER',
    'status.active':'SYSTEMA: NESCIO QUOMODO VIVIT','ticker':'⚠ NUNTIUS MAXIME GRAVIS: NEMO SCIT QUID HIC AGATUR   •   PORTA CLAUSA EST FRATER   •   SI FRAGOREM AUDIS NIHIL VIDISTI   •   SERVITOR INNOCENS EST FERE ⚠',
    'hero.eyebrow':'PAGINA NON OFFICIALIS SED QUASI OFFICIALIS','hero.title':'audite daemones venimus et omnes in locum suum reponimus sic est fratres','hero.sub':'pagina operatur. causa adhuc sub mensa latet.','counter':'HOMO QUI HUC VENIT NR.','feed.update':'NUNTIUS FILI','feed.music':'ecce musica parva auribus vestris bro','feed.one':'aliquis container movit. plura verba non erunt.','feed.two':'dux dixit omnia gubernata. post III minuta lux mortua.','feed.three':'hoc postum nemo posuit secundum senatum.',
    'archive.first':'primum negotium suspectum','archive.van':'causa vehiculi albi','archive.it':'IT combustum est','archive.revival':'reditus sine consilio','archive.locked':'NON INTRAS FRATER',
    'files.refusal':'⚠ NOMINA TABULARUM VERTERE VETITUM EST QUIA DOMINUS DIXIT NAH','files.open':'APERIRE REM SECRETAM','terminal.warning':'KERNEL LINGUAM LATINAM NON CURAT. TERMINALE MANET BARBARICE.',
    'chief.title':'DUX MAXIMUS FR','chief.caption':'haec est pagina manus immigrantium sinensium et hic est maximus dux noster:','chief.presence':'CONIUNCTUS ABHINC XIV ANNOS','stats.danger':'PERICULUM QUASI','stats.gate':'PORTA','stats.locked':'CLAUSA BRO','notice.title':'edictum vel quid','dept.title':'OFFICIUM LINGUARUM','dept.body':'translationes a consobrino cuiusdam factae. diplomata nulla.','footer.copy':'© MMIII-MMXXVI NEMO','footer.best':'OPTIMUM VISUM PER INTERNETUM','popup.ok':'BENE IAM'
  },
  fo: {
    'nav.home':'HØVUÐSDÓTIÐ','nav.archive':'GAMALT DRASL','nav.files':'FÍLUR','nav.terminal':'TERMINALUR','nav.dont':'IKKI TRÝSTA HAR BRO',
    'status.active':'SKIPAN: LIVIR ENN','ticker':'⚠ ÓGVULIGA VIKTIGT: ONGIN VEIT HVAT HENDIR HER   •   PORTRIÐ ER LÆST   •   HOYRIR TÚ EITT BANG SO LAT SUM EINKI   •   SERVARIN ER ÓSEKUR NØK ⚠',
    'hero.eyebrow':'IKKI-ALMENNA ALMENNA HEIMASÍÐAN','hero.title':'hoyr nú demonar vit koma og seta øll aftur har tey skulu vera bro','hero.sub':'heimasíðan riggar. orsøkin er ikki funnin enn.','counter':'PERSÓNUR SUM KOM NR.','feed.update':'TRÁÐUR UPDATE','feed.music':'her er eitt sindur av tónleiki til oyruni hjá tykkum','feed.one':'onkur flutti bingjuna. meira verður ikki sagt.','feed.two':'høvdingin segði alt var undir kontroll. 3 min seinni myrkt.','feed.three':'eingin hevur lagt hetta upp, siga tey.',
    'archive.first':'fyrsta løgna hending','archive.van':'vøruvogns málið','archive.it':'IT fór heilt','archive.revival':'afturkomin uttan orsøk','archive.locked':'NEI TÚ KEMUR IKKI INN',
    'files.refusal':'⚠ FÍLUNØVN VERÐA IKKI UMSETT TÍ LEIÐARIN SEGÐI NEI BRO','files.open':'LAT LOYNILIGT DÓT UPP','terminal.warning':'KJARNIN NOKTAÐI MÁLPAKKAN. TERMINALURIN VERÐUR SUM HANN ER.',
    'chief.title':'HÆGSTI HØVDINGUR','chief.caption':'hetta er síðan hjá kinesiska immigrant ganginum og her er okkara hægsti maður:','chief.presence':'HEVUR VERIÐ ONLINE Í 14 ÁR','stats.danger':'VANDI ELLA OKKURT','stats.gate':'PORTUR','stats.locked':'LÆST BRO','notice.title':'boð ella okkurt','dept.title':'MÁLDEILDIN','dept.body':'umsetingar gjørdar av einum systkinabarni hjá onkrum. eingi prógv funnin.','footer.copy':'© 2003-2026 ONGIN','footer.best':'BEST AT HYGGJA VIÐ INTERNETI','popup.ok':'JAJA NÚ'
  },
  cy: {
    'nav.home':'Y PRIF BETH','nav.archive':'HEN STWFF','nav.files':'FFEILIAU BRO','nav.terminal':'TERFYNELL','nav.dont':'PA WASGU HWN FRR',
    'status.active':'SYSTEM: DAL YN FYW SOMEHOW','ticker':'⚠ NEGES PWYSIG IAWN: DOES NEB YN GWYBOD BETH SY’N DIGWYDD YMA   •   Y GIÂT WEDI CLOI   •   OS WYT TI’N CLYWED BANG CER I FFWRDD   •   DYDY’R GWEINYDD DDIM YN EUOG PROBABLY ⚠',
    'hero.eyebrow':'GWEFAN AN-SWYDDOG SWYDDOG','hero.title':'gwrandewch gythreuliaid rydyn ni’n dod a rhoi pawb yn ôl lle dylsen nhw fod bro','hero.sub':'mae’r wefan yn gweithio. pam? paid gofyn pethau anodd.','counter':'PERSON A DDAETH YMA NR.','feed.update':'DIWEDDARIAD EDEN','feed.music':'dyma dipyn bach o gerddoriaeth i’ch clustiau chi','feed.one':'symudodd rhywun y cynhwysydd. dim mwy o fanylion.','feed.two':'dywedodd y bos fod popeth dan reolaeth. 3 munud wedyn dim golau.','feed.three':'does neb yn honni postio hwn.',
    'archive.first':'y digwyddiad cyntaf lol','archive.van':'achos y fan','archive.it':'IT wedi marw','archive.revival':'comeback o nunlle','archive.locked':'NA CHI DDIM YN MYND MEWN',
    'files.refusal':'⚠ DYDY ENWAU FFEILIAU DDIM YN CAEL EU CYFIEITHU ACHOS DYWEDODD Y BOSS NAH','files.open':'AGOR Y PETH CYFRINACHOL','terminal.warning':'GWRTHODODD Y CNEWYLlYN Y PECYN IAITH. MAE’R TERFYNELL YN AROS FEL HYN.',
    'chief.title':'Y BOS MWYAF','chief.caption':'dyma safle’r gang mewnfudwyr Tsieineaidd a dyma’r prif foi yma:','chief.presence':'AR-LEIN ERS 14 MLYNEDD BRO','stats.danger':'PERYGL TIPO','stats.gate':'GIÂT','stats.locked':'WEDI CLOI','notice.title':'rhybudd neu rhywbeth','dept.title':'ADRAN IEITHOEDD','dept.body':'cyfieithiadau gan gefnder rhywun. dim tystysgrifau.','footer.copy':'© 2003-2026 NEB','footer.best':'GORAU I’W WELD AR Y RHYNGRWYD','popup.ok':'IAWN TE'
  },
  eu: {
    'nav.home':'GAUZA NAGUSIA','nav.archive':'GAUZA ZAHARRAK','nav.files':'FITXATEGIAK BRO','nav.terminal':'TERMINALA','nav.dont':'EZ KLIKATU HOR FRR',
    'status.active':'SISTEMA: BIZIRIK NOLABAIT','ticker':'⚠ OSO MEZU IMPORTANTE: INORK EZ DAKI HEMEN ZER GERTATZEN DEN   •   ATEA ITXITA DAGO   •   ZARATA ENTZUTEN BADUZU ZURE KONTUA   •   ZERBITZARIA ERRUGABEA DA AGIAN ⚠',
    'hero.eyebrow':'EZ-OFIZIALA BAINA OFIZIAL XAMARRA','hero.title':'entzun demonioak bagoaz eta denak bere tokira bueltan jarriko ditugu bro','hero.sub':'webguneak funtzionatzen du. zergatik? administrazioak ez daki.','counter':'HEMEN SARTU DEN PERTSONA NR.','feed.update':'HARIAREN ZERBAIT','feed.music':'hemen musikatxo bat zuen belarrientzat edo','feed.one':'norbaitek edukiontzia mugitu du. informazioa amaitu da.','feed.two':'buruzagiak dena kontrolpean zegoela esan zuen. 3 min gero argirik ez.','feed.three':'post hau inork ez omen du jarri.',
    'archive.first':'lehenengo kontu susmagarria','archive.van':'furgonetaren kontua','archive.it':'IT erreta','archive.revival':'inork eskatu ez zuen itzulera','archive.locked':'EZ BRO EZ ZARA SARTZEN',
    'files.refusal':'⚠ FITXATEGI IZENAK EZIN DIRA ITZULI NAGUSIAK EZETZ ESAN DUELAKO','files.open':'IREKI SEKRETUKO GAUZA','terminal.warning':'KERNELAK HIZKUNTZA PAKETEA BOTA DU. TERMINALA BERE HORRETAN.',
    'chief.title':'BURUZAGI HANDIENA','chief.caption':'hau txinatar etorkinen gang webgunea da eta hau gure buruzagi gorena:','chief.presence':'DUELA 14 URTETIK ONLINE','stats.danger':'ARRISKUA PIXKA BAT','stats.gate':'ATEA','stats.locked':'ITXITA BRO','notice.title':'iragarkia edo','dept.title':'HIZKUNTZA SAILA','dept.body':'itzulpenak norbaiten lehengusuak egin ditu. titulurik ez.','footer.copy':'© 2003-2026 INOR EZ','footer.best':'HOBETO INTERNETAREKIN','popup.ok':'BALE BA'
  },
  br: {
    'nav.home':'AR PENN TRA','nav.archive':'TRAOÙ KOZH','nav.files':'RESTROÙ BRO','nav.terminal':'TERMINAL','nav.dont':'NA GLIK KET WAR-SE FRR',
    'status.active':'REIZHIAD: BEV C’HOAZ SOMEHOW','ticker':'⚠ KEMENN POUEZUS: DEN EBET NE OAR PETRA ZO O C’HOARVEZOUT AMAÑ   •   SERR EO AR PORZH   •   MA KLEVEZ UN TARZH NA SELL KET   •   N’EO KET KABUS AR SERVIJER PROBABLY ⚠',
    'hero.eyebrow':'LEC’HIENN NEO-KOFFISIEL MET KOFFISIEL BEMDEZ','hero.title':'selaou demonioù emaomp o tont hag o lakaat pep hini en e lec’h c’hoazh bro','hero.sub':'mont a ra al lec’hienn. perak? ne ouzer ket tamm ebet.','counter':'DEN DEUT AMAÑ NR.','feed.update':'NEVEZINTI AR FIL','feed.music':'setu un tamm sonerezh evit ho tivskouarn','feed.one':'unan en deus fiñvet ar c’hontener. fin ar c’hemenn.','feed.two':'lavaret en deus ar chef eo pep tra dindan kontroll. 3 munud war-lerc’h teñvalijenn.','feed.three':'den ebet n’en deus kaset ar post-mañ hervez ar paperoù.',
    'archive.first':'kentañ afer iskis','archive.van':'afer ar c’harrigell','archive.it':'IT aet da get','archive.revival':'distro hep bezañ pedet','archive.locked':'NANN BRO NE ZEZ KET E-BARZH',
    'files.refusal':'⚠ ANVIOÙ RESTROÙ NA C’HELLONT KET BEZAÑ TROET RAK LAVARET EN DEUS AR CHEF NAH','files.open':'DIGERIÑ AN DRA KUZH','terminal.warning':'NAC’HET EN DEUS AR C’HERNEL AR PAKAD YEZH. CHOM A RA AR TERMINAL E-GIZ-SE.',
    'chief.title':'AR CHEF BRASAÑ','chief.caption':'amañ eo lec’hienn gang an divroidi sinaat ha setu hor chef uhelañ:','chief.presence':'ENLINENN ABAOE 14 VLOAZ BRO','stats.danger':'DANJER PE DRA','stats.gate':'PORZH','stats.locked':'SERRET BRO','notice.title':'kemenn pe dra','dept.title':'DEPARTAMANT AR YEZHOU','dept.body':'troet gant kenderv unan bennak. diplom ebet bet kavet.','footer.copy':'© 2003-2026 DEN EBET','footer.best':'GWELLET GWELLOCH GANT INTERNET','popup.ok':'YA MAT'
  }
};

const qualities = {
  lt:['VERTIMAS: ORIGINALUS',97], en:['TRANSLATION: SUSPICIOUSLY OK',78], fr:['TRADUCTION: WESH CERTIFIÉE',71], eo:['TRADUKO: INTERNACIA IOM',64], la:['TRANSLATIO: SENATUS APPROBAT FERE',52], fo:['UMSETING: OYGGJA-GÓÐ',47], cy:['CYFIEITHIAD: DIGON SUS',49], eu:['ITZULPENA: NORK DAKI',44], br:['TRODUR: MOARVAT MAT',42]
};

const noticeSets = {
  lt:['ieskomas zmogus kuris moka atsukt 10mm varzta','siandien susirinkimo nebus nes nieks nezino kur raktas','jei kas rado juoda maisa palikit kur radot','internetas veikia tik jei nelieti laido'],
  en:['looking for a man who understands the 10mm bolt situation','meeting cancelled nobody got the key bro','if you found the black bag respectfully unfind it','internet works if nobody touches the cable'],
  fr:['cherche gars qui maîtrise le boulon 10mm sah','réunion annulée personne a la clé frère','si t’as trouvé le sac noir remets-le où t’as rien vu','internet marche si personne touche au câble wallah'],
  eo:['serĉata ulo kiu konas la misteron de 10mm riglilo','kunveno nuligita ĉar neniu havas ŝlosilon bro','se vi trovis nigran sakon mal-trovu ĝin','interreto funkcias nur se neniu tuŝas la kablon'],
  la:['quaeritur vir qui rem cochleae X mm intellegit','consilium deletum quia clavis nusquam frater','si saccum nigrum invenisti iterum non invenisti','internetum vivit dum nemo funem tangit'],
  fo:['leita eftir einum sum kennir 10mm bolta-lívið','fundurin avlýstur eingin hevur lykilin bro','fann tú svarta posan so fann tú hann ikki','internetið riggar um eingin nertir leidningin'],
  cy:['angen rhywun sy’n deall y bollt 10mm situation','cyfarfod wedi canslo neb efo’r allwedd bro','os wnest ti ffeindio’r bag du na wnest ti','mae internet yn gweithio os neb yn cyffwrdd y cebl'],
  eu:['10mm torlojuaren misterio ulertzen duen norbait behar da','bilera bertan behera inork ez dauka giltza bro','poltsa beltza aurkitu baduzu ez zenuen aurkitu','internetak funtzionatzen du kablea bakean uzten bada'],
  br:['klasket unan a anavez afer ar boulon 10mm','bod nullet den ebet gant an alc’hwez bro','ma kavout ar sac’h du graet dit, n’out ket bet amañ','mont a ra internet ma ne stok den ouzh ar fun']
};

const archiveText = {
  2007:{lt:"2007: rastas tuscias folderis pavadinimu 'NEATIDARYT'. jis buvo atidarytas.",en:"2007: empty folder called 'DO_NOT_OPEN' was found. naturally it got opened.",fr:"2007: dossier vide nommé 'OUVRE_PAS' trouvé. évidemment ils l'ont ouvert."},
  2011:{lt:'2011: buvo uzfiksuotas baltas busikas. nieks nezino kieno. vis dar stovi.',en:'2011: white van documented. owner unknown. van still vibing there.',fr:'2011: fourgon blanc repéré. propriétaire inconnu. il est toujours là tranquille.'},
  2016:{lt:"2016: kazkas pakeite visus slaptazodzius i '1234'. kaltu nera.",en:"2016: somebody changed every password to '1234'. investigation found nobody somehow.",fr:"2016: quelqu'un a mis tous les mots de passe sur '1234'. aucun suspect frère."},
  2022:{lt:'2022: dokumentas sunaikintas del priezasciu kurios pacios sunaikintos.',en:'2022: document destroyed for reasons that were also destroyed.',fr:'2022: document détruit pour des raisons qui ont elles-mêmes été détruites.'},
  2026:{lt:'2026: puslapys vel paleistas. visu nuostabai.',en:'2026: website came back online. nobody authorized this apparently.',fr:"2026: le site est revenu en ligne. apparemment personne n'a demandé ça."}
};

function t(key) { return (translations[currentLang] && translations[currentLang][key]) || translations.lt[key] || key; }
function applyLanguage(lang) {
  currentLang = translations[lang] ? lang : 'lt';
  localStorage.setItem('oskiLang', currentLang);
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const value = t(el.dataset.i18n);
    if (el.classList.contains('ticker-track')) el.textContent = value;
    else el.textContent = value;
  });
  const [quality, accuracy] = qualities[currentLang];
  translationQuality.textContent = quality;
  deptAccuracy.textContent = `accuracy.exe: ${accuracy}%`;
  deptMeterBar.style.width = `${accuracy}%`;
  languageSelect.value = currentLang;
  refreshNotice();
}
languageSelect.addEventListener('change', e => applyLanguage(e.target.value));

const fakeBase = 4800;
let visits = Number(localStorage.getItem('oskiVisits') || 0) + 1;
localStorage.setItem('oskiVisits', visits);
document.getElementById('visitorCounter').textContent = String(fakeBase + visits).padStart(6, '0');

function updateClock() { document.getElementById('clock').textContent = new Date().toLocaleTimeString('lt-LT'); }
updateClock();
setInterval(updateClock, 1000);

function refreshNotice() {
  const arr = noticeSets[currentLang] || noticeSets.lt;
  document.getElementById('randomNotice').textContent = arr[Math.floor(Math.random() * arr.length)];
}
setInterval(() => {
  refreshNotice();
  document.getElementById('cpuStat').textContent = `${Math.floor(7 + Math.random() * 79)}%`;
  document.getElementById('ramStat').textContent = `${Math.floor(48 + Math.random() * 50)}%`;
}, 5500);

const dangerLevels = ['MAZAS', 'VIDUTINIS', 'NU BLE', 'NEKLAUSK'];
setInterval(() => { document.getElementById('dangerStat').textContent = dangerLevels[Math.floor(Math.random() * dangerLevels.length)]; }, 9000);

document.querySelectorAll('.archive-item[data-archive]').forEach(item => {
  item.addEventListener('click', () => {
    const entry = archiveText[item.dataset.archive];
    const text = entry[currentLang] || entry.en || entry.lt;
    openPopup(text, currentLang === 'fr' ? 'ARCHIVE TRÈS OFFICIELLE' : currentLang === 'en' ? 'VERY OFFICIAL ARCHIVE' : 'ARCHYVO IRASAS');
  });
});

document.getElementById('classifiedBtn').addEventListener('click', () => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const msgs = {
    lt:`PRIEIGA ATMESTA.\n\nKLAIDOS KODAS: ${code}\nPRIEZASTIS: per daug smalsus.`,
    en:`ACCESS GOT DECLINED BRO.\n\nERROR THING: ${code}\nREASON: way too curious.`,
    fr:`ACCÈS REFUSÉ FRÉROT.\n\nCODE DU PROBLÈME: ${code}\nRAISON: beaucoup trop curieux.`
  };
  openPopup(msgs[currentLang] || `ACCESS DENIED (${code}). translation department went home.`, 'C:\\BYLOS\\SLAPTA');
});

let presses = 0;
document.getElementById('dontPress').addEventListener('click', () => {
  presses++;
  const packs = {
    lt:['nu kam spaudei','sakiau nespaust ce','dabar jau velu','GERAI. PALEIDZIAM.'],
    en:['bro why did you click it','I literally said do not click','too late now gang','AIGHT. DEPLOYING THE BULLSHIT.'],
    fr:["frérot pourquoi t'as cliqué","j'ai littéralement dit clique pas","maintenant c trop tard frère","BON. ON LANCE LE BORDEL."],
    la:['cur pressisti frater','dixi noli premere bro','nunc sero est','BENE. INITIAMUS CRAPULAM.']
  };
  const arr = packs[currentLang] || packs.en;
  openPopup(arr[Math.min(presses - 1, arr.length - 1)], 'KLAIDA / ERROR / ???');
  if (presses >= 4) {
    document.body.classList.add('alert-mode');
    setTimeout(() => document.body.classList.remove('alert-mode'), 5000);
    presses = 0;
  }
});

const terminalForm = document.getElementById('terminalForm');
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
function terminalLine(html = '') { const line = document.createElement('div'); line.innerHTML = html; terminalOutput.appendChild(line); terminalOutput.scrollTop = terminalOutput.scrollHeight; }
const commands = {
  help: () => terminalLine('komandos: help, whoami, ls, status, vyriausesis, vartai, music, clear, exit, secret, language'),
  whoami: () => terminalLine('NEZINOMAS_VARTOTOJAS [leidimai: beveik jokie]'),
  ls: () => terminalLine('archyvas/&nbsp;&nbsp; bylos/&nbsp;&nbsp; nieko_ce_nera/&nbsp;&nbsp; planas.txt'),
  status: () => terminalLine('sistema: veikia<br>vartai: uzrakinti<br>kamera_04: ziuri i kamera_03<br>problemos: taip'),
  vyriausesis: () => terminalLine('VYRIAUSESIS yra prisijunges. atsakymo laikas: 3-14 metu.'),
  vartai: () => terminalLine('VARTAI UZRAKINTI. rakto vieta: [DUOMENYS PASALINTI]'),
  music: () => { showPanel('home'); terminalLine('atidaryta muzikyte'); },
  clear: () => { terminalOutput.innerHTML = ''; },
  exit: () => { showPanel('home'); },
  secret: () => terminalLine('nice try.'),
  sudo: () => terminalLine('tu ne vyriausesis.'),
  dir: () => commands.ls(),
  language: () => terminalLine(`GUI kalba: ${currentLang}. kernelis sako "man px".`)
};
terminalForm.addEventListener('submit', e => {
  e.preventDefault();
  const raw = terminalInput.value.trim();
  if (!raw) return;
  terminalLine(`<span style="color:#b7ffbf">C:\\Users\\nezinomas&gt; ${raw.replace(/[<>]/g, '')}</span>`);
  const cmd = raw.toLowerCase().split(' ')[0];
  if (commands[cmd]) commands[cmd](); else terminalLine(`'${cmd}' nera komanda. gal ir gerai.`);
  terminalInput.value = '';
});

let chiefClicks = 0;
document.querySelector('.chief-photo').addEventListener('click', () => {
  chiefClicks++;
  if (chiefClicks === 5) {
    openPopup(currentLang === 'fr' ? "LE CHEF A REMARQUÉ QUE TU LE CLIQUES.\n\n+1 niveau de surveillance frère." : currentLang === 'en' ? 'THE CHIEF NOTICED YOU KEEP CLICKING HIM.\n\n+1 surveillance level.' : 'VYRIAUSESIS pastebejo kad ji spaudineji.\n\n+1 stebejimo lygis.', 'DEMESIO');
    chiefClicks = 0;
  }
});

console.log('%c KO CE IESKAI ', 'background:#24488f;color:white;font-size:22px;font-weight:bold;padding:8px');
console.log('jei radai konsole tai sveikinu. nieko cia nera.');
applyLanguage(currentLang);
