// English / Tamil / Hindi for the Outpost screens. Machine-assisted: have a native speaker review before publishing.
export type Lang = "en" | "ta" | "hi";
export const cfg = { lang: "en" as Lang }; // App copies the saved setting here
export const LANGS: [Lang, string][] = [["en", "English"], ["ta", "தமிழ்"], ["hi", "हिन्दी"]];
const D: Record<string, [string, string, string]> = {
  title: ["Run a space outpost", "விண்வெளி நிலையத்தை நடத்துங்கள்", "अंतरिक्ष चौकी चलाइए"],
  daily: ["Play today’s challenge", "இன்றைய சவாலை விளையாடு", "आज की चुनौती खेलें"],
  day: ["Day", "நாள்", "दिन"],
  junior: ["Junior", "ஜூனியர்", "जूनियर"], commander: ["Commander (numbers)", "கமாண்டர் (எண்கள்)", "कमांडर (संख्याएँ)"],
  "m.health": ["Crew health", "குழு ஆரோக்கியம்", "दल का स्वास्थ्य"], "m.power": ["Battery power", "மின்கல ஆற்றல்", "बैटरी पावर"],
  "m.air": ["Air", "காற்று", "हवा"], "m.water": ["Water", "தண்ணீர்", "पानी"], "m.food": ["Food", "உணவு", "भोजन"],
  "m.shield": ["Radiation shield", "கதிர்வீச்சு கவசம்", "विकिरण कवच"], "m.solar": ["Solar panels", "சூரிய தகடுகள்", "सौर पैनल"],
  "m.airwater": ["Air & water", "காற்றும் தண்ணீரும்", "हवा और पानी"], "m.machines": ["Machines", "இயந்திரங்கள்", "मशीनें"],
  launch: ["Launch!", "ஏவு!", "प्रक्षेपण!"], "design.title": ["Design your outpost", "உங்கள் நிலையத்தை வடிவமைக்கவும்", "अपनी चौकी डिज़ाइन करें"],
  "m.ls": ["Life support", "உயிர் ஆதரவு அமைப்பு", "जीवन रक्षा प्रणाली"],
  ok: ["OK", "நல்லது", "ठीक"], low: ["LOW", "குறைவு", "कम"], danger: ["DANGER", "ஆபத்து", "खतरा"],
  "work.title": ["Crew work today", "இன்றைய குழு பணி", "आज का दल कार्य"],
  "work.solar": ["Clean solar panels", "சூரிய தகடுகளைச் சுத்தம் செய்", "सौर पैनल साफ़ करें"],
  "work.shield": ["Pile soil on the roof", "கூரையில் மண் குவி", "छत पर मिट्टी डालें"],
  "work.farm": ["Tend greenhouse", "பசுமைக்குடிலைக் கவனி", "ग्रीनहाउस की देखभाल करें"],
  "work.repair": ["Repair life support", "உயிர் ஆதரவைச் சரிசெய்", "जीवन रक्षा प्रणाली ठीक करें"],
  "work.rest": ["Rest and exercise", "ஓய்வு மற்றும் உடற்பயிற்சி", "आराम और व्यायाम"],
  "work.science": ["Run science", "அறிவியல் ஆய்வு", "विज्ञान प्रयोग"],
  lights: ["Grow lights (food, uses power)", "வளர்ச்சி விளக்குகள் (உணவு, மின்சாரம் பயன்படும்)", "ग्रो लाइट (भोजन, बिजली लगती है)"],
  lab: ["Science lab (uses power)", "அறிவியல் ஆய்வகம் (மின்சாரம் பயன்படும்)", "विज्ञान प्रयोगशाला (बिजली लगती है)"],
  endday: ["End day ▶", "நாளை முடி ▶", "दिन समाप्त करें ▶"], quit: ["Quit mission", "பணியை நிறுத்து", "मिशन छोड़ें"],
  cosmo: ["Cosmo says", "காஸ்மோ சொல்கிறது", "कॉस्मो कहता है"],
  win: ["Mission success!", "பணி வெற்றி!", "मिशन सफल!"], lose: ["Mission failed", "பணி தோல்வி", "मिशन विफल"],
  science: ["THE REAL NASA SCIENCE", "உண்மையான நாசா அறிவியல்", "असली नासा विज्ञान"],
  coach: ["Mission coach", "பணி பயிற்சியாளர்", "मिशन कोच"],
};
export const keys = () => Object.keys(D);
export const t = (k: string) => (D[k] ?? [k, k, k])[(["en", "ta", "hi"] as Lang[]).indexOf(cfg.lang)];
