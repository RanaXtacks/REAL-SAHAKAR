import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wrench, Zap, Hammer, Sparkles, Wind, PaintBucket, MapPin, Star,
  ShieldCheck, ShieldAlert, ShieldQuestion, Clock, User, Users,
  MessageSquare, ClipboardList, LogOut, ArrowLeft, Search, Camera,
  Ban, Globe, Loader2, Home, CheckCircle2, RefreshCcw, Phone as PhoneIcon
} from "lucide-react";

/* ---------------------------------------------------------------------
   KAARIGAR — hyperlocal gig-services marketplace prototype
   All identity verification, background checks, translation and mapping
   are SIMULATED. Every seam where a real API/vendor would plug in is
   marked with a "REAL:" comment.
--------------------------------------------------------------------- */

const STORAGE_KEY = "kaarigar_db_v1";
const CENTER = { lat: 19.0948, lng: 74.748 }; // Ahilyanagar, Maharashtra
const hasStorage = typeof window !== "undefined" && !!window.storage;

const CATEGORIES = [
  { id: "plumbing", label: "Plumbing", Icon: Wrench },
  { id: "electrical", label: "Electrician", Icon: Zap },
  { id: "carpentry", label: "Carpentry", Icon: Hammer },
  { id: "cleaning", label: "Home cleaning", Icon: Sparkles },
  { id: "ac_repair", label: "AC repair", Icon: Wind },
  { id: "painting", label: "Painting", Icon: PaintBucket },
];

const SEED_WORKERS = [
  { aadhaar: "111122223333", name: "Ramesh Pawar", phone: "9011122233", skills: ["plumbing"], visitCost: 200, rating: 4.6, ratingCount: 34, verification: "verified", lat: 19.108, lng: 74.762, online: true, banned: false, missedCompletions: 0, completedJobs: 34, bio: "12 years in residential plumbing — leak repair, fittings, tank work.", address: "Savedi, Ahilyanagar", certificate: "plumbing_license.pdf" },
  { aadhaar: "222233334444", name: "Sunita Jadhav", phone: "9022233344", skills: ["cleaning", "painting"], visitCost: 150, rating: 4.8, ratingCount: 51, verification: "verified", lat: 19.081, lng: 74.731, online: true, banned: false, missedCompletions: 0, completedJobs: 51, bio: "Deep home cleaning and interior painting, own equipment.", address: "Nagar Road, Ahilyanagar", certificate: null },
  { aadhaar: "333344445555", name: "Iqbal Shaikh", phone: "9033344455", skills: ["electrical"], visitCost: 250, rating: 4.3, ratingCount: 22, verification: "verified", lat: 19.121, lng: 74.801, online: true, banned: false, missedCompletions: 0, completedJobs: 22, bio: "Licensed electrician — wiring, switchboards, appliance repair.", address: "Kedgaon, Ahilyanagar", certificate: "electrical_license.pdf" },
  { aadhaar: "444455556666", name: "Vikram Deshmukh", phone: "9044455566", skills: ["carpentry"], visitCost: 300, rating: 4.1, ratingCount: 15, verification: "pending", lat: 19.052, lng: 74.712, online: true, banned: false, missedCompletions: 0, completedJobs: 15, bio: "Custom furniture, door and window repair.", address: "MIDC, Ahilyanagar", certificate: null },
  { aadhaar: "555566667777", name: "Anil Kadam", phone: "9055566677", skills: ["ac_repair", "electrical"], visitCost: 350, rating: 4.7, ratingCount: 40, verification: "verified", lat: 19.134, lng: 74.705, online: true, banned: false, missedCompletions: 0, completedJobs: 40, bio: "AC installation, servicing and gas refill.", address: "Station Road, Ahilyanagar", certificate: "ac_cert.pdf" },
  { aadhaar: "666677778888", name: "Prakash More", phone: "9066677788", skills: ["plumbing", "carpentry"], visitCost: 220, rating: 2.1, ratingCount: 9, verification: "flagged", lat: 19.024, lng: 74.783, online: true, banned: false, missedCompletions: 1, completedJobs: 9, bio: "General home repairs.", address: "Vambori Road, Ahilyanagar", certificate: null },
  { aadhaar: "777788889999", name: "Meena Salunkhe", phone: "9077788899", skills: ["cleaning"], visitCost: 180, rating: 4.9, ratingCount: 60, verification: "verified", lat: 19.093, lng: 74.686, online: true, banned: false, missedCompletions: 0, completedJobs: 60, bio: "Reliable, thorough home and office cleaning.", address: "Sarafa Bazar, Ahilyanagar", certificate: null },
  { aadhaar: "888899990000", name: "Ganesh Wagh", phone: "9088899900", skills: ["painting"], visitCost: 270, rating: 4.4, ratingCount: 18, verification: "verified", lat: 19.071, lng: 74.822, online: true, banned: false, missedCompletions: 0, completedJobs: 18, bio: "Interior and exterior painting, texture work.", address: "Burudgaon Road, Ahilyanagar", certificate: "painting_cert.pdf" },
];

const SEED_COMMUNITY = [
  { id: "p1", author: "Meena Salunkhe", text: "Heavy traffic near Nagar Road bridge today, add 10 extra minutes when quoting ETA.", ts: Date.now() - 1000 * 60 * 60 * 5 },
  { id: "p2", author: "Anil Kadam", text: "New hardware store opened near MIDC with better AC gas prices — good for margins.", ts: Date.now() - 1000 * 60 * 60 * 20 },
];

const T = {
  en: {
    appName: "Kaarigar", tagline: "Verified help, near you", chooseRole: "How are you joining today?",
    workerRole: "I offer services", workerRoleDesc: "Plumbing, electrical, cleaning and more",
    customerRole: "I need a service", customerRoleDesc: "Find a verified professional nearby",
    resetDemo: "Reset demo data", aadhaarNumber: "Aadhaar number", phoneNumber: "Mobile number",
    sendOtp: "Send OTP", otpSentDemo: "Demo OTP sent — enter any 6 digits to continue",
    enterOtp: "Enter OTP", verifyContinue: "Verify & continue", back: "Back",
    setupProfile: "Set up your profile", fullName: "Full name", address: "Address / area",
    selectSkills: "Select your skills", visitCostLabel: "Visit cost (₹)", saveContinue: "Save & continue",
    profileTab: "Profile", requestsTab: "Requests", ordersTab: "Orders", communityTab: "Community",
    online: "Online", offline: "Offline", editProfile: "Edit profile", saveChanges: "Save changes",
    certificateLabel: "Certificate", uploadCertificate: "Upload certificate",
    noRequestsYet: "No requests yet. New booking requests will appear here.",
    accept: "Accept", decline: "Decline", orderHistory: "Order history",
    noOrdersYet: "No completed orders yet.", customerLabel: "Customer", dateLabel: "Date",
    paymentLabel: "Payment", locationLabel: "Location", statusLabel: "Status",
    communityFeed: "Local worker community", writePost: "Share a tip with nearby workers…", post: "Post",
    banned: "Account suspended", bannedMessage: "This account was suspended for repeatedly not completing accepted jobs.",
    flaggedBanner: "Your verification check needs review. You're hidden from customer search until resolved.",
    activeOrder: "Active order", markEnRoute: "Start heading to customer", uploadCompletionPhoto: "Add photo & mark done",
    markJobDone: "Mark job done", etaLabel: "ETA", emailAddress: "Email address",
    whatServiceNeed: "What do you need help with?", searchServices: "Search services",
    previousOrders: "Your previous orders", noPreviousOrders: "No orders yet — book your first service above.",
    nearestProfessionals: "Nearest professionals", kmAway: "km away", viewProfile: "View profile", bookNow: "Book now",
    verified: "Verified", pendingVerification: "Verification pending", flaggedStatus: "Under review",
    describeIssue: "Describe the problem", optionalField: "optional", attachPhoto: "Attach a photo",
    confirmBooking: "Confirm booking", waitingTitle: "Waiting for the professional to accept",
    waitingDesc: "You'll be notified the moment they respond.", trackingTitle: "Track your order",
    jobDoneTitle: "Job marked complete", rateExperience: "Rate your experience", submitRating: "Submit & pay",
    payNowBtn: "Pay visit cost", paymentSuccessful: "Payment successful", logout: "Log out",
    contactBook: "Contact & book", messageWorker: "Message before booking", reviews: "reviews",
    experienceJobs: "jobs completed", simulateMiss: "Demo: simulate missed deadline",
    closeAnyway: "Close & review anyway", missedNotice: "This professional missed the completion deadline for this order.",
    goOnline: "Go online", goOffline: "Go offline", cannotGoOnline: "Cannot go online while under review or suspended.",
    yourLocation: "Your location", demoLocationNote: "Using approximate location — GPS unavailable in preview.",
    arrivingIn: "Arriving in", min: "min", declined: "declined by professional", chooseAnother: "Choose another professional",
    skills: "Skills", visitCost: "Visit cost", bio: "About",
  },
  hi: {
    appName: "कारीगर", tagline: "आपके पास सत्यापित मदद", chooseRole: "आज आप कैसे जुड़ रहे हैं?",
    workerRole: "मैं सेवा देता/देती हूँ", workerRoleDesc: "प्लंबिंग, इलेक्ट्रिकल, सफाई और अधिक",
    customerRole: "मुझे सेवा चाहिए", customerRoleDesc: "पास में सत्यापित पेशेवर खोजें",
    resetDemo: "डेमो डेटा रीसेट करें", aadhaarNumber: "आधार नंबर", phoneNumber: "मोबाइल नंबर",
    sendOtp: "OTP भेजें", otpSentDemo: "डेमो OTP भेजा गया — जारी रखने के लिए कोई भी 6 अंक डालें",
    enterOtp: "OTP दर्ज करें", verifyContinue: "सत्यापित करें और आगे बढ़ें", back: "वापस",
    setupProfile: "अपनी प्रोफ़ाइल बनाएं", fullName: "पूरा नाम", address: "पता / क्षेत्र",
    selectSkills: "अपने कौशल चुनें", visitCostLabel: "विज़िट शुल्क (₹)", saveContinue: "सहेजें और आगे बढ़ें",
    profileTab: "प्रोफ़ाइल", requestsTab: "अनुरोध", ordersTab: "ऑर्डर", communityTab: "समुदाय",
    online: "ऑनलाइन", offline: "ऑफ़लाइन", editProfile: "प्रोफ़ाइल संपादित करें", saveChanges: "बदलाव सहेजें",
    certificateLabel: "प्रमाणपत्र", uploadCertificate: "प्रमाणपत्र अपलोड करें",
    noRequestsYet: "अभी कोई अनुरोध नहीं। नई बुकिंग यहाँ दिखेगी।",
    accept: "स्वीकार करें", decline: "अस्वीकार करें", orderHistory: "ऑर्डर इतिहास",
    noOrdersYet: "अभी तक कोई पूर्ण ऑर्डर नहीं।", customerLabel: "ग्राहक", dateLabel: "तारीख",
    paymentLabel: "भुगतान", locationLabel: "स्थान", statusLabel: "स्थिति",
    communityFeed: "स्थानीय कारीगर समुदाय", writePost: "आस-पास के कारीगरों के साथ सुझाव साझा करें…", post: "पोस्ट करें",
    banned: "खाता निलंबित", bannedMessage: "बार-बार स्वीकृत काम पूरा न करने के कारण यह खाता निलंबित किया गया।",
    flaggedBanner: "आपकी सत्यापन जांच की समीक्षा बाकी है। समाधान होने तक आप ग्राहक खोज से छिपे हैं।",
    activeOrder: "सक्रिय ऑर्डर", markEnRoute: "ग्राहक की ओर जाना शुरू करें", uploadCompletionPhoto: "फ़ोटो जोड़ें और पूर्ण करें",
    markJobDone: "काम पूर्ण करें", etaLabel: "अनुमानित समय", emailAddress: "ईमेल पता",
    whatServiceNeed: "आपको किस सेवा की ज़रूरत है?", searchServices: "सेवाएं खोजें",
    previousOrders: "आपके पिछले ऑर्डर", noPreviousOrders: "अभी कोई ऑर्डर नहीं — ऊपर अपनी पहली सेवा बुक करें।",
    nearestProfessionals: "सबसे नज़दीकी पेशेवर", kmAway: "किमी दूर", viewProfile: "प्रोफ़ाइल देखें", bookNow: "अभी बुक करें",
    verified: "सत्यापित", pendingVerification: "सत्यापन लंबित", flaggedStatus: "समीक्षाधीन",
    describeIssue: "समस्या बताएं", optionalField: "वैकल्पिक", attachPhoto: "फ़ोटो जोड़ें",
    confirmBooking: "बुकिंग की पुष्टि करें", waitingTitle: "पेशेवर की स्वीकृति का इंतज़ार",
    waitingDesc: "जवाब मिलते ही आपको सूचित किया जाएगा।", trackingTitle: "अपना ऑर्डर ट्रैक करें",
    jobDoneTitle: "काम पूर्ण के रूप में चिह्नित", rateExperience: "अपना अनुभव रेट करें", submitRating: "सबमिट करें और भुगतान करें",
    payNowBtn: "विज़िट शुल्क चुकाएं", paymentSuccessful: "भुगतान सफल", logout: "लॉग आउट",
    contactBook: "संपर्क करें और बुक करें", messageWorker: "बुकिंग से पहले संदेश भेजें", reviews: "समीक्षाएं",
    experienceJobs: "काम पूरे हुए", simulateMiss: "डेमो: चूक हुई समय-सीमा दिखाएं",
    closeAnyway: "फिर भी बंद करें और समीक्षा करें", missedNotice: "इस पेशेवर ने इस ऑर्डर की समय-सीमा चूक दी।",
    goOnline: "ऑनलाइन जाएं", goOffline: "ऑफ़लाइन जाएं", cannotGoOnline: "समीक्षाधीन या निलंबित होने पर ऑनलाइन नहीं जा सकते।",
    yourLocation: "आपका स्थान", demoLocationNote: "अनुमानित स्थान उपयोग हो रहा है — प्रीव्यू में GPS उपलब्ध नहीं।",
    arrivingIn: "पहुंचने में", min: "मिनट", declined: "पेशेवर द्वारा अस्वीकृत", chooseAnother: "दूसरा पेशेवर चुनें",
    skills: "कौशल", visitCost: "विज़िट शुल्क", bio: "परिचय",
  },
  mr: {
    appName: "कारीगर", tagline: "तुमच्या जवळ, पडताळणी केलेली मदत", chooseRole: "आज तुम्ही कसे सामील होत आहात?",
    workerRole: "मी सेवा देतो/देते", workerRoleDesc: "प्लंबिंग, इलेक्ट्रिकल, साफसफाई आणि बरेच काही",
    customerRole: "मला सेवा हवी आहे", customerRoleDesc: "जवळचा पडताळणी केलेला व्यावसायिक शोधा",
    resetDemo: "डेमो डेटा रीसेट करा", aadhaarNumber: "आधार क्रमांक", phoneNumber: "मोबाईल क्रमांक",
    sendOtp: "OTP पाठवा", otpSentDemo: "डेमो OTP पाठवला — पुढे जाण्यासाठी कोणतेही 6 अंक टाका",
    enterOtp: "OTP टाका", verifyContinue: "पडताळणी करा आणि पुढे जा", back: "मागे",
    setupProfile: "तुमची प्रोफाइल तयार करा", fullName: "पूर्ण नाव", address: "पत्ता / भाग",
    selectSkills: "तुमची कौशल्ये निवडा", visitCostLabel: "भेट शुल्क (₹)", saveContinue: "जतन करा आणि पुढे जा",
    profileTab: "प्रोफाइल", requestsTab: "विनंत्या", ordersTab: "ऑर्डर", communityTab: "समुदाय",
    online: "ऑनलाइन", offline: "ऑफलाइन", editProfile: "प्रोफाइल संपादित करा", saveChanges: "बदल जतन करा",
    certificateLabel: "प्रमाणपत्र", uploadCertificate: "प्रमाणपत्र अपलोड करा",
    noRequestsYet: "अजून विनंती नाही. नवीन बुकिंग विनंत्या इथे दिसतील.",
    accept: "स्वीकारा", decline: "नाकारा", orderHistory: "ऑर्डर इतिहास",
    noOrdersYet: "अजून पूर्ण झालेली ऑर्डर नाही.", customerLabel: "ग्राहक", dateLabel: "तारीख",
    paymentLabel: "पेमेंट", locationLabel: "स्थान", statusLabel: "स्थिती",
    communityFeed: "स्थानिक कारागीर समुदाय", writePost: "जवळच्या कारागिरांसोबत टिप शेअर करा…", post: "पोस्ट करा",
    banned: "खाते निलंबित", bannedMessage: "वारंवार स्वीकारलेले काम पूर्ण न केल्यामुळे हे खाते निलंबित करण्यात आले.",
    flaggedBanner: "तुमच्या पडताळणीचा आढावा बाकी आहे. निकाल येईपर्यंत तुम्ही ग्राहक शोधातून लपवलेले आहात.",
    activeOrder: "सक्रिय ऑर्डर", markEnRoute: "ग्राहकाकडे जाणे सुरू करा", uploadCompletionPhoto: "फोटो जोडा आणि पूर्ण करा",
    markJobDone: "काम पूर्ण करा", etaLabel: "अंदाजे वेळ", emailAddress: "ईमेल पत्ता",
    whatServiceNeed: "तुम्हाला कोणत्या सेवेची गरज आहे?", searchServices: "सेवा शोधा",
    previousOrders: "तुमच्या मागील ऑर्डर", noPreviousOrders: "अजून ऑर्डर नाही — वर तुमची पहिली सेवा बुक करा.",
    nearestProfessionals: "सर्वात जवळचे व्यावसायिक", kmAway: "किमी दूर", viewProfile: "प्रोफाइल पहा", bookNow: "आता बुक करा",
    verified: "पडताळणी केलेले", pendingVerification: "पडताळणी प्रलंबित", flaggedStatus: "आढावाधीन",
    describeIssue: "समस्या सांगा", optionalField: "ऐच्छिक", attachPhoto: "फोटो जोडा",
    confirmBooking: "बुकिंग निश्चित करा", waitingTitle: "व्यावसायिकाच्या स्वीकृतीची वाट पाहत आहे",
    waitingDesc: "प्रतिसाद मिळताच तुम्हाला कळवले जाईल.", trackingTitle: "तुमची ऑर्डर ट्रॅक करा",
    jobDoneTitle: "काम पूर्ण म्हणून चिन्हांकित", rateExperience: "तुमचा अनुभव रेट करा", submitRating: "सबमिट करा आणि पैसे द्या",
    payNowBtn: "भेट शुल्क भरा", paymentSuccessful: "पेमेंट यशस्वी", logout: "लॉग आउट",
    contactBook: "संपर्क करा आणि बुक करा", messageWorker: "बुकिंगपूर्वी मेसेज पाठवा", reviews: "पुनरावलोकने",
    experienceJobs: "कामे पूर्ण", simulateMiss: "डेमो: चुकलेली मुदत दाखवा",
    closeAnyway: "तरीही बंद करा आणि पुनरावलोकन करा", missedNotice: "या व्यावसायिकाने या ऑर्डरची मुदत चुकवली.",
    goOnline: "ऑनलाइन व्हा", goOffline: "ऑफलाइन व्हा", cannotGoOnline: "आढावाधीन किंवा निलंबित असताना ऑनलाइन जाता येत नाही.",
    yourLocation: "तुमचे स्थान", demoLocationNote: "अंदाजे स्थान वापरत आहे — प्रीव्ह्यूमध्ये GPS उपलब्ध नाही.",
    arrivingIn: "इतक्या वेळात पोहोचेल", min: "मिनिटे", declined: "व्यावसायिकाने नाकारले", chooseAnother: "दुसरा व्यावसायिक निवडा",
    skills: "कौशल्ये", visitCost: "भेट शुल्क", bio: "परिचय",
  },
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
const uid = (p) => p + "_" + Math.random().toString(36).slice(2, 9);
const fmtDate = (ts) => new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function seedDb() {
  const workers = {};
  SEED_WORKERS.forEach((w) => (workers[w.aadhaar] = { ...w }));
  return { workers, customers: {}, orders: [], community: [...SEED_COMMUNITY] };
}

/* ---------------------------- small shared bits ---------------------------- */

function Stars({ value, size = 14 }) {
  const full = Math.round(value);
  return (
    <span style={{ display: "inline-flex", gap: 1, verticalAlign: "middle" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= full ? "#E7A33E" : "none"} stroke={i <= full ? "#E7A33E" : "#C7CBC4"} />
      ))}
    </span>
  );
}

function VerificationBadge({ status, t }) {
  const map = {
    verified: { Icon: ShieldCheck, color: "#2F8F5B", label: t.verified },
    pending: { Icon: ShieldQuestion, color: "#C98A1F", label: t.pendingVerification },
    flagged: { Icon: ShieldAlert, color: "#C1443A", label: t.flaggedStatus },
  };
  const m = map[status] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: m.color, fontSize: 12, fontWeight: 600 }}>
      <m.Icon size={14} /> {m.label}
    </span>
  );
}

function MapView({ order, now, t }) {
  if (!order) return null;
  const total = order.etaTotalSeconds || 90;
  const elapsed = order.acceptedAt ? (now - order.acceptedAt) / 1000 : 0;
  const progress = Math.max(0, Math.min(1, elapsed / total));
  const remaining = Math.max(0, Math.ceil(total - elapsed));
  const start = { lat: order.workerStartLat, lng: order.workerStartLng };
  const dest = { lat: order.customerLat, lng: order.customerLng };
  const pad = 0.01;
  const minLat = Math.min(start.lat, dest.lat) - pad;
  const maxLat = Math.max(start.lat, dest.lat) + pad;
  const minLng = Math.min(start.lng, dest.lng) - pad;
  const maxLng = Math.max(start.lng, dest.lng) + pad;
  const W = 300, H = 200, PAD = 34;
  const project = (lat, lng) => ({
    x: PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * PAD),
    y: PAD + (1 - (lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * PAD),
  });
  const p0 = project(start.lat, start.lng);
  const p1 = project(dest.lat, dest.lng);
  const curLat = start.lat + (dest.lat - start.lat) * progress;
  const curLng = start.lng + (dest.lng - start.lng) * progress;
  const pc = project(curLat, curLng);
  const distKm = haversine(start.lat, start.lng, dest.lat, dest.lng).toFixed(1);
  const arrived = progress >= 1;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", borderRadius: 16, background: "#EAF0EC" }}>
        <line x1={20} y1={40} x2={280} y2={30} stroke="#D7DED8" strokeWidth={6} />
        <line x1={10} y1={140} x2={290} y2={155} stroke="#D7DED8" strokeWidth={6} />
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#B9C4BC" strokeWidth={2} strokeDasharray="4 4" />
        <line x1={p0.x} y1={p0.y} x2={pc.x} y2={pc.y} stroke="#0E6B5C" strokeWidth={3} />
        <circle cx={p1.x} cy={p1.y} r={5} fill="#142433" />
        <text x={p1.x} y={p1.y - 10} fontSize="18" textAnchor="middle">🏠</text>
        <circle cx={pc.x} cy={pc.y} r={5} fill="#E7A33E" />
        <text x={pc.x} y={pc.y - 10} fontSize="18" textAnchor="middle">🛵</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 13, color: "#6B7280" }}>
        <span>{distKm} {t.kmAway}</span>
        <span style={{ fontWeight: 700, color: "#142433" }}>
          {arrived ? "•" : `${t.arrivingIn} ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`}
        </span>
      </div>
    </div>
  );
}

function PhoneFrame({ children, toast }) {
  return (
    <div style={{ minHeight: "100vh", background: "#EFEFEA", display: "flex", justifyContent: "center", alignItems: "center", padding: 16, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ width: "100%", maxWidth: 380, height: 780, background: "#F5F6F4", borderRadius: 32, boxShadow: "0 20px 50px rgba(20,36,51,0.18)", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #E2E4DF", position: "relative" }}>
        {children}
        {toast && (
          <div style={{ position: "absolute", left: 16, right: 16, bottom: 84, background: "#142433", color: "#fff", padding: "10px 14px", borderRadius: 12, fontSize: 12.5, textAlign: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.25)", zIndex: 50 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function TopBar({ title, onBack, lang, setLang, showLang }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#142433", color: "#fff", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
        )}
        <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      </div>
      {showLang && (
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: 3 }}>
          {["en", "hi", "mr"].map((l) => (
            <button key={l} onClick={() => setLang(l)}
              style={{ border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 999, background: lang === l ? "#E7A33E" : "transparent", color: lang === l ? "#142433" : "#fff" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = { width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D8DCD5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: "#fff" };
const btnPrimary = { width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#0E6B5C", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnGhost = { width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #D8DCD5", background: "#fff", color: "#142433", fontWeight: 600, fontSize: 14, cursor: "pointer" };
const chip = (active) => ({ padding: "8px 12px", borderRadius: 999, border: active ? "1px solid #0E6B5C" : "1px solid #D8DCD5", background: active ? "#E7F2EF" : "#fff", color: active ? "#0E6B5C" : "#142433", fontSize: 13, fontWeight: 600, cursor: "pointer" });

/* --------------------------------- App --------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [lang, setLang] = useState("en");
  const t = T[lang];
  const [screen, setScreen] = useState("role");
  const [session, setSession] = useState(null); // {role, id}
  const [now, setNow] = useState(Date.now());

  // transient form state
  const [idInput, setIdInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [pendingRole, setPendingRole] = useState(null);
  const [setupForm, setSetupForm] = useState({});
  const [editForm, setEditForm] = useState(null);
  const [workerTab, setWorkerTab] = useState("profile");
  const [customerTab, setCustomerTab] = useState("services");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [geoNote, setGeoNote] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [bookingDesc, setBookingDesc] = useState("");
  const [bookingPhoto, setBookingPhoto] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [toast, setToast] = useState(null);
  const [postText, setPostText] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  // load / init db
  useEffect(() => {
    (async () => {
      if (!hasStorage) { setDb(seedDb()); setLoading(false); return; }
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        if (res && res.value) setDb(JSON.parse(res.value));
        else { const s = seedDb(); setDb(s); window.storage.set(STORAGE_KEY, JSON.stringify(s), true).catch(() => {}); }
      } catch (e) {
        const s = seedDb(); setDb(s);
        try { await window.storage.set(STORAGE_KEY, JSON.stringify(s), true); } catch (_) {}
      } finally { setLoading(false); }
    })();
  }, []);

  const persist = useCallback((next) => {
    setDb(next);
    if (hasStorage) window.storage.set(STORAGE_KEY, JSON.stringify(next), true).catch(() => {});
  }, []);

  // geolocation for customer
  useEffect(() => {
    if (screen !== "customerDashboard" && screen !== "workersList") return;
    if (customerCoords) return;
    let done = false;
    const fallback = () => {
      if (done) return; done = true;
      setCustomerCoords({ lat: CENTER.lat + (Math.random() - 0.5) * 0.05, lng: CENTER.lng + (Math.random() - 0.5) * 0.05 });
      setGeoNote(true);
    };
    const timer = setTimeout(fallback, 2500);
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => { if (done) return; done = true; clearTimeout(timer); setCustomerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        () => { clearTimeout(timer); fallback(); },
        { timeout: 2000 }
      );
    } catch (e) { clearTimeout(timer); fallback(); }
    return () => clearTimeout(timer);
  }, [screen, customerCoords]);

  // ticking clock + auto status transitions (en_route -> arrived)
  useEffect(() => {
    const iv = setInterval(() => {
      setNow(Date.now());
      setDb((prev) => {
        if (!prev) return prev;
        let changed = false;
        const orders = prev.orders.map((o) => {
          if (o.status === "en_route" && o.acceptedAt) {
            const elapsed = (Date.now() - o.acceptedAt) / 1000;
            if (elapsed >= (o.etaTotalSeconds || 90)) { changed = true; return { ...o, status: "arrived" }; }
          }
          return o;
        });
        if (!changed) return prev;
        const next = { ...prev, orders };
        if (hasStorage) window.storage.set(STORAGE_KEY, JSON.stringify(next), true).catch(() => {});
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  if (loading || !db) {
    return (
      <PhoneFrame toast={toast}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <Loader2 className="animate-spin" size={28} color="#0E6B5C" />
          <span style={{ color: "#6B7280", fontSize: 13 }}>Loading Kaarigar…</span>
        </div>
      </PhoneFrame>
    );
  }

  const worker = session?.role === "worker" ? db.workers[session.id] : null;
  const customer = session?.role === "customer" ? db.customers[session.id] : null;

  const resetAll = async () => {
    const s = seedDb();
    if (hasStorage) { try { await window.storage.delete(STORAGE_KEY, true); } catch (_) {} }
    persist(s);
    setSession(null); setScreen("role"); setIdInput(""); setOtpSent(false); setOtpInput("");
  };

  const logout = () => { setSession(null); setScreen("role"); setIdInput(""); setOtpSent(false); setOtpInput(""); setSetupForm({}); };

  const sendOtp = (role) => {
    const valid = role === "worker" ? /^\d{12}$/.test(idInput) : /^\d{10}$/.test(idInput);
    if (!valid) { showToast(role === "worker" ? "Enter a valid 12-digit Aadhaar number" : "Enter a valid 10-digit mobile number"); return; }
    setPendingRole(role); setOtpSent(true);
    // REAL: this is where a licensed eKYC vendor (UIDAI KUA, or DigiLocker via API Setu)
    // or an SMS OTP provider would be called instead of simulating.
  };

  const verifyOtp = () => {
    if (!/^\d{6}$/.test(otpInput)) { showToast("Enter the 6-digit OTP"); return; }
    if (pendingRole === "worker") {
      if (db.workers[idInput]) { setSession({ role: "worker", id: idInput }); setScreen("workerDashboard"); }
      else { setSetupForm({ aadhaar: idInput, phone: "", name: "", address: "", skills: [], visitCost: 200 }); setScreen("workerSetup"); }
    } else {
      if (db.customers[idInput]) { setSession({ role: "customer", id: idInput }); setScreen("customerDashboard"); }
      else { setSetupForm({ phone: idInput, name: "", email: "", address: "" }); setScreen("customerSetup"); }
    }
    setOtpSent(false); setOtpInput("");
  };

  const saveWorkerSetup = () => {
    if (!setupForm.name || !setupForm.phone || setupForm.skills.length === 0) { showToast("Fill name, phone and at least one skill"); return; }
    const jitterLat = CENTER.lat + (Math.random() - 0.5) * 0.1;
    const jitterLng = CENTER.lng + (Math.random() - 0.5) * 0.1;
    const w = { aadhaar: setupForm.aadhaar, name: setupForm.name, phone: setupForm.phone, address: setupForm.address || "Ahilyanagar", skills: setupForm.skills, visitCost: Number(setupForm.visitCost) || 150, rating: 0, ratingCount: 0, verification: "pending", lat: jitterLat, lng: jitterLng, online: false, banned: false, missedCompletions: 0, completedJobs: 0, bio: "", certificate: null };
    const next = { ...db, workers: { ...db.workers, [w.aadhaar]: w } };
    persist(next);
    setSession({ role: "worker", id: w.aadhaar });
    setScreen("workerDashboard");
    showToast("Profile created — verification pending (demo)");
    // REAL: verification flips to 'verified' once a background-check vendor
    // (SpringVerify / IDfy / Karza) returns a clear result, typically 24-72h later.
  };

  const saveCustomerSetup = () => {
    if (!setupForm.name || !/\S+@\S+\.\S+/.test(setupForm.email || "")) { showToast("Enter name and a valid email"); return; }
    const c = { phone: setupForm.phone, name: setupForm.name, email: setupForm.email, address: setupForm.address || "" };
    const next = { ...db, customers: { ...db.customers, [c.phone]: c } };
    persist(next);
    setSession({ role: "customer", id: c.phone });
    setScreen("customerDashboard");
  };

  const toggleOnline = () => {
    if (worker.verification === "flagged" || worker.banned) { showToast(t.cannotGoOnline); return; }
    const w = { ...worker, online: !worker.online };
    persist({ ...db, workers: { ...db.workers, [w.aadhaar]: w } });
  };

  const openEdit = () => setEditForm({ address: worker.address, phone: worker.phone, skills: [...worker.skills], visitCost: worker.visitCost, bio: worker.bio || "", certificate: worker.certificate });
  const saveEdit = () => {
    const w = { ...worker, ...editForm };
    persist({ ...db, workers: { ...db.workers, [w.aadhaar]: w } });
    setEditForm(null); showToast(t.saveChanges + " ✓");
  };

  const respondRequest = (orderId, accept) => {
    const orders = db.orders.map((o) => {
      if (o.id !== orderId) return o;
      if (accept) {
        return { ...o, status: "en_route", acceptedAt: Date.now(), etaTotalSeconds: 60 + Math.floor(Math.random() * 90), workerStartLat: worker.lat, workerStartLng: worker.lng };
      }
      return { ...o, status: "declined" };
    });
    persist({ ...db, orders });
  };

  const simulateMiss = (orderId) => {
    const missed = (worker.missedCompletions || 0) + 1;
    const banned = missed >= 3;
    const w = { ...worker, missedCompletions: missed, banned, online: banned ? false : worker.online };
    const orders = db.orders.map((o) => (o.id === orderId ? { ...o, workerMissedDeadline: true } : o));
    persist({ ...db, workers: { ...db.workers, [w.aadhaar]: w }, orders });
    showToast(banned ? "Account suspended (demo)" : "Marked as missed (demo)");
  };

  const completeJob = (orderId) => {
    const orders = db.orders.map((o) => (o.id === orderId ? { ...o, status: "completed", completedAt: Date.now(), hasCompletionPhoto: true } : o));
    const w = { ...worker, completedJobs: (worker.completedJobs || 0) + 1 };
    persist({ ...db, workers: { ...db.workers, [w.aadhaar]: w }, orders });
    showToast("Job marked done ✓");
  };

  const distanceSortedWorkers = () => {
    if (!selectedCategory || !customerCoords) return [];
    return Object.values(db.workers)
      .filter((w) => w.skills.includes(selectedCategory.id) && w.online && !w.banned && w.verification !== "flagged")
      .map((w) => ({ ...w, distance: haversine(customerCoords.lat, customerCoords.lng, w.lat, w.lng) }))
      .sort((a, b) => a.distance - b.distance);
  };

  const submitBooking = () => {
    const w = db.workers[selectedWorkerId];
    const order = {
      id: uid("order"), service: selectedCategory.label, serviceId: selectedCategory.id,
      description: bookingDesc, hasPhoto: !!bookingPhoto,
      customerPhone: customer.phone, customerName: customer.name, customerAddress: customer.address || "Ahilyanagar",
      customerLat: customerCoords.lat, customerLng: customerCoords.lng,
      workerAadhaar: w.aadhaar, workerName: w.name, visitCost: w.visitCost,
      status: "requested", createdAt: Date.now(), paymentStatus: "unpaid",
    };
    persist({ ...db, orders: [...db.orders, order] });
    setActiveOrderId(order.id); setBookingDesc(""); setBookingPhoto(null); setScreen("orderWaiting");
  };

  const closeAsCustomer = (orderId) => {
    const orders = db.orders.map((o) => (o.id === orderId ? { ...o, status: "completed", completedBy: "customer" } : o));
    persist({ ...db, orders });
  };

  const submitReview = (orderId) => {
    const order = db.orders.find((o) => o.id === orderId);
    const w = db.workers[order.workerAadhaar];
    const newCount = (w.ratingCount || 0) + 1;
    const newRating = Math.round((((w.rating || 0) * (w.ratingCount || 0) + reviewStars) / newCount) * 10) / 10;
    const orders = db.orders.map((o) => (o.id === orderId ? { ...o, status: "closed", rating: reviewStars, review: reviewText, paymentStatus: "paid" } : o));
    persist({ ...db, workers: { ...db.workers, [w.aadhaar]: { ...w, rating: newRating, ratingCount: newCount } }, orders });
    setReviewStars(5); setReviewText(""); showToast(t.paymentSuccessful + " ✓");
    setScreen("customerDashboard"); setCustomerTab("orders");
  };

  const addPost = () => {
    if (!postText.trim()) return;
    const post = { id: uid("post"), author: worker.name, text: postText.trim(), ts: Date.now() };
    persist({ ...db, community: [post, ...db.community] });
    setPostText("");
  };

  /* --------------------------- role select --------------------------- */
  if (screen === "role") {
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.appName} lang={lang} setLang={setLang} showLang />
        <div style={{ flex: 1, padding: 22, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#0E6B5C", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Wrench color="#fff" size={26} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#142433" }}>{t.appName}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{t.tagline}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", marginBottom: 10 }}>{t.chooseRole}</div>
          <button onClick={() => setScreen("workerAuth")} style={{ ...btnGhost, textAlign: "left", padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Hammer color="#0E6B5C" />
            <div><div style={{ fontWeight: 700 }}>{t.workerRole}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{t.workerRoleDesc}</div></div>
          </button>
          <button onClick={() => setScreen("customerAuth")} style={{ ...btnGhost, textAlign: "left", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <Home color="#E7A33E" />
            <div><div style={{ fontWeight: 700 }}>{t.customerRole}</div><div style={{ fontSize: 12, color: "#6B7280" }}>{t.customerRoleDesc}</div></div>
          </button>
        </div>
        <div style={{ padding: 16, textAlign: "center" }}>
          <button onClick={resetAll} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <RefreshCcw size={12} /> {t.resetDemo}
          </button>
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- auth screens --------------------------- */
  if (screen === "workerAuth" || screen === "customerAuth") {
    const role = screen === "workerAuth" ? "worker" : "customer";
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={role === "worker" ? t.workerRole : t.customerRole} onBack={() => { setScreen("role"); setOtpSent(false); setIdInput(""); }} />
        <div style={{ flex: 1, padding: 22 }}>
          <Field label={role === "worker" ? t.aadhaarNumber : t.phoneNumber}>
            <input style={inputStyle} inputMode="numeric" maxLength={role === "worker" ? 12 : 10} value={idInput}
              onChange={(e) => setIdInput(e.target.value.replace(/\D/g, ""))} placeholder={role === "worker" ? "XXXXXXXXXXXX" : "9XXXXXXXXX"} disabled={otpSent} />
          </Field>
          {!otpSent ? (
            <button style={btnPrimary} onClick={() => sendOtp(role)}>{t.sendOtp}</button>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "#0E6B5C", background: "#E7F2EF", padding: 10, borderRadius: 10, marginBottom: 14 }}>{t.otpSentDemo}</div>
              <Field label={t.enterOtp}>
                <input style={inputStyle} inputMode="numeric" maxLength={6} value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
              </Field>
              <button style={btnPrimary} onClick={verifyOtp}>{t.verifyContinue}</button>
            </>
          )}
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- worker setup --------------------------- */
  if (screen === "workerSetup") {
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.setupProfile} onBack={() => setScreen("workerAuth")} />
        <div style={{ flex: 1, padding: 22, overflowY: "auto" }}>
          <Field label={t.fullName}><input style={inputStyle} value={setupForm.name} onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })} /></Field>
          <Field label={t.phoneNumber}><input style={inputStyle} inputMode="numeric" maxLength={10} value={setupForm.phone} onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label={t.address}><input style={inputStyle} value={setupForm.address} onChange={(e) => setSetupForm({ ...setupForm, address: e.target.value })} /></Field>
          <Field label={t.selectSkills}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CATEGORIES.map((c) => {
                const active = setupForm.skills?.includes(c.id);
                return (
                  <button key={c.id} style={chip(active)} onClick={() => setSetupForm({ ...setupForm, skills: active ? setupForm.skills.filter((s) => s !== c.id) : [...(setupForm.skills || []), c.id] })}>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label={t.visitCostLabel}><input style={inputStyle} type="number" value={setupForm.visitCost} onChange={(e) => setSetupForm({ ...setupForm, visitCost: e.target.value })} /></Field>
          <Field label={t.uploadCertificate + " (" + t.optionalField + ")"}>
            <input type="file" onChange={(e) => setSetupForm({ ...setupForm, certificate: e.target.files?.[0]?.name })} />
          </Field>
          <button style={btnPrimary} onClick={saveWorkerSetup}>{t.saveContinue}</button>
        </div>
      </PhoneFrame>
    );
  }

  if (screen === "customerSetup") {
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.setupProfile} onBack={() => setScreen("customerAuth")} />
        <div style={{ flex: 1, padding: 22 }}>
          <Field label={t.fullName}><input style={inputStyle} value={setupForm.name} onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })} /></Field>
          <Field label={t.emailAddress}><input style={inputStyle} value={setupForm.email} onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })} placeholder="you@gmail.com" /></Field>
          <Field label={t.address + " (" + t.optionalField + ")"}><input style={inputStyle} value={setupForm.address} onChange={(e) => setSetupForm({ ...setupForm, address: e.target.value })} /></Field>
          <button style={btnPrimary} onClick={saveCustomerSetup}>{t.saveContinue}</button>
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- worker dashboard --------------------------- */
  if (screen === "workerDashboard" && worker) {
    const myRequests = db.orders.filter((o) => o.workerAadhaar === worker.aadhaar && o.status === "requested");
    const myActive = db.orders.filter((o) => o.workerAadhaar === worker.aadhaar && ["en_route", "arrived"].includes(o.status));
    const myHistory = db.orders.filter((o) => o.workerAadhaar === worker.aadhaar && ["completed", "closed"].includes(o.status)).sort((a, b) => b.createdAt - a.createdAt);

    return (
      <PhoneFrame toast={toast}>
        <TopBar title={worker.name} lang={lang} setLang={setLang} showLang />
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {worker.banned && <div style={{ background: "#FDECEA", color: "#C1443A", padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 14 }}><b>{t.banned}.</b> {t.bannedMessage}</div>}
          {!worker.banned && worker.verification === "flagged" && <div style={{ background: "#FDECEA", color: "#C1443A", padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 14 }}>{t.flaggedBanner}</div>}

          {workerTab === "profile" && !editForm && (
            <div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, border: "1px solid #E2E4DF" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{worker.name}</div>
                  <VerificationBadge status={worker.verification} t={t} />
                </div>
                <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{worker.address}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <Stars value={worker.rating} /> <span style={{ fontSize: 12, color: "#6B7280" }}>{worker.rating || "—"} ({worker.ratingCount} {t.reviews})</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {worker.skills.map((s) => <span key={s} style={chip(true)}>{CATEGORIES.find((c) => c.id === s)?.label}</span>)}
                </div>
                <div style={{ marginTop: 10, fontSize: 13 }}>₹{worker.visitCost} {t.visitCost.toLowerCase()} · {worker.completedJobs} {t.experienceJobs}</div>
                <button style={{ ...btnGhost, marginTop: 12 }} onClick={openEdit}>{t.editProfile}</button>
              </div>
              <button style={{ ...(worker.online ? btnGhost : btnPrimary), opacity: worker.banned || worker.verification === "flagged" ? 0.5 : 1 }} disabled={worker.banned || worker.verification === "flagged"} onClick={toggleOnline}>
                {worker.online ? t.goOffline : t.goOnline}
              </button>
            </div>
          )}

          {workerTab === "profile" && editForm && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1px solid #E2E4DF" }}>
              <Field label={t.phoneNumber}><input style={inputStyle} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></Field>
              <Field label={t.address}><input style={inputStyle} value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></Field>
              <Field label={t.bio}><input style={inputStyle} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} /></Field>
              <Field label={t.selectSkills}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map((c) => {
                    const active = editForm.skills.includes(c.id);
                    return <button key={c.id} style={chip(active)} onClick={() => setEditForm({ ...editForm, skills: active ? editForm.skills.filter((s) => s !== c.id) : [...editForm.skills, c.id] })}>{c.label}</button>;
                  })}
                </div>
              </Field>
              <Field label={t.visitCostLabel}><input style={inputStyle} type="number" value={editForm.visitCost} onChange={(e) => setEditForm({ ...editForm, visitCost: e.target.value })} /></Field>
              <Field label={t.certificateLabel}>
                <input type="file" onChange={(e) => setEditForm({ ...editForm, certificate: e.target.files?.[0]?.name || editForm.certificate })} />
                {editForm.certificate && <div style={{ fontSize: 12, color: "#0E6B5C", marginTop: 4 }}>✓ {editForm.certificate}</div>}
              </Field>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={btnGhost} onClick={() => setEditForm(null)}>{t.back}</button>
                <button style={btnPrimary} onClick={saveEdit}>{t.saveChanges}</button>
              </div>
            </div>
          )}

          {workerTab === "requests" && (
            <div>
              {myActive.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0E6B5C", marginBottom: 6 }}>{t.activeOrder} · {o.service}</div>
                  <div style={{ fontSize: 13, marginBottom: 8 }}>{o.customerName} — {o.customerAddress}</div>
                  {o.description && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>"{o.description}"</div>}
                  <MapView order={o} now={now} t={t} />
                  {o.status === "arrived" && !o.workerMissedDeadline && (
                    <button style={{ ...btnPrimary, marginTop: 12 }} onClick={() => completeJob(o.id)}>{t.uploadCompletionPhoto}</button>
                  )}
                  {!o.workerMissedDeadline && o.status !== "arrived" && (
                    <button style={{ ...btnGhost, marginTop: 12, fontSize: 12, color: "#C1443A", borderColor: "#F3D2CE" }} onClick={() => simulateMiss(o.id)}>{t.simulateMiss}</button>
                  )}
                  {o.workerMissedDeadline && <div style={{ marginTop: 10, fontSize: 12, color: "#C1443A" }}>{t.missedNotice}</div>}
                </div>
              ))}
              {myRequests.length === 0 && myActive.length === 0 && <div style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 40 }}>{t.noRequestsYet}</div>}
              {myRequests.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.service}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{o.customerName} · {o.customerAddress}</div>
                  {o.description && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>"{o.description}"</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button style={{ ...btnGhost, color: "#C1443A" }} onClick={() => respondRequest(o.id, false)}>{t.decline}</button>
                    <button style={btnPrimary} onClick={() => respondRequest(o.id, true)}>{t.accept}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {workerTab === "orders" && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.orderHistory}</div>
              {myHistory.length === 0 && <div style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 30 }}>{t.noOrdersYet}</div>}
              {myHistory.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 14, marginBottom: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>{o.service}</div>
                  <div>{t.customerLabel}: {o.customerName}</div>
                  <div>{t.dateLabel}: {fmtDate(o.createdAt)}</div>
                  <div>{t.paymentLabel}: {o.paymentStatus === "paid" ? "✓ Paid" : "Unpaid"}</div>
                  <div>{t.locationLabel}: {o.customerAddress}</div>
                  {o.rating && <div style={{ marginTop: 4 }}><Stars value={o.rating} size={12} /></div>}
                </div>
              ))}
            </div>
          )}

          {workerTab === "community" && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.communityFeed}</div>
              <textarea style={{ ...inputStyle, minHeight: 60, marginBottom: 8 }} placeholder={t.writePost} value={postText} onChange={(e) => setPostText(e.target.value)} />
              <button style={{ ...btnGhost, marginBottom: 16 }} onClick={addPost}>{t.post}</button>
              {db.community.map((p) => (
                <div key={p.id} style={{ borderBottom: "1px solid #E2E4DF", padding: "10px 0" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.author}</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{p.text}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{fmtDate(p.ts)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav role="worker" active={workerTab} setActive={(v) => { setWorkerTab(v); setEditForm(null); }} t={t} onLogout={logout} />
      </PhoneFrame>
    );
  }

  /* --------------------------- customer dashboard --------------------------- */
  if (screen === "customerDashboard" && customer) {
    const myOrders = db.orders.filter((o) => o.customerPhone === customer.phone).sort((a, b) => b.createdAt - a.createdAt);
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={`👋 ${customer.name}`} lang={lang} setLang={setLang} showLang />
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {customerTab === "services" && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.whatServiceNeed}</div>
              {geoNote && <div style={{ fontSize: 11, color: "#C98A1F", background: "#FBF3E3", padding: 8, borderRadius: 8, marginBottom: 10 }}>{t.demoLocationNote}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => { setSelectedCategory(c); setScreen("workersList"); }}
                    style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 16, textAlign: "left", cursor: "pointer" }}>
                    <c.Icon color="#0E6B5C" size={22} />
                    <div style={{ marginTop: 8, fontWeight: 600, fontSize: 13 }}>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {customerTab === "orders" && (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{t.previousOrders}</div>
              {myOrders.length === 0 && <div style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 30 }}>{t.noPreviousOrders}</div>}
              {myOrders.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{o.service}</div>
                    <span style={{ fontSize: 11, color: "#6B7280", textTransform: "capitalize" }}>{o.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{o.workerName} · {fmtDate(o.createdAt)}</div>
                  {o.workerMissedDeadline && o.status !== "closed" && o.status !== "completed" && (
                    <div style={{ marginTop: 8, background: "#FDECEA", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: "#C1443A", marginBottom: 6 }}>{t.missedNotice}</div>
                      <button style={{ ...btnGhost, fontSize: 12, padding: 8 }} onClick={() => closeAsCustomer(o.id)}>{t.closeAnyway}</button>
                    </div>
                  )}
                  {["en_route", "arrived"].includes(o.status) && (
                    <button style={{ ...btnGhost, marginTop: 8, fontSize: 12, padding: 8 }} onClick={() => { setActiveOrderId(o.id); setScreen("customerTracking"); }}>{t.trackingTitle}</button>
                  )}
                  {o.status === "completed" && (
                    <button style={{ ...btnPrimary, marginTop: 8, fontSize: 12, padding: 8 }} onClick={() => { setActiveOrderId(o.id); setScreen("reviewScreen"); }}>{t.submitRating}</button>
                  )}
                  {o.status === "requested" && <div style={{ fontSize: 12, color: "#C98A1F", marginTop: 6 }}>{t.waitingTitle}</div>}
                  {o.status === "declined" && <div style={{ fontSize: 12, color: "#C1443A", marginTop: 6 }}>{t.declined}</div>}
                  {o.rating && <div style={{ marginTop: 6 }}><Stars value={o.rating} size={12} /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <BottomNav role="customer" active={customerTab} setActive={setCustomerTab} t={t} onLogout={logout} />
      </PhoneFrame>
    );
  }

  /* --------------------------- nearest workers list --------------------------- */
  if (screen === "workersList") {
    const list = distanceSortedWorkers();
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={selectedCategory?.label} onBack={() => setScreen("customerDashboard")} />
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>{t.nearestProfessionals}</div>
          {!customerCoords && <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6B7280", fontSize: 13 }}><Loader2 className="animate-spin" size={16} /> {t.yourLocation}…</div>}
          {list.map((w) => (
            <div key={w.aadhaar} style={{ background: "#fff", border: "1px solid #E2E4DF", borderRadius: 16, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{w.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0E6B5C" }}>{w.distance.toFixed(1)} {t.kmAway}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Stars value={w.rating} size={12} /> <span style={{ fontSize: 12, color: "#6B7280" }}>({w.ratingCount})</span>
                <VerificationBadge status={w.verification} t={t} />
              </div>
              <div style={{ fontSize: 13, marginTop: 6 }}>₹{w.visitCost} {t.visitCost.toLowerCase()}</div>
              <button style={{ ...btnGhost, marginTop: 10 }} onClick={() => { setSelectedWorkerId(w.aadhaar); setScreen("workerProfileView"); }}>{t.viewProfile}</button>
            </div>
          ))}
          {customerCoords && list.length === 0 && <div style={{ color: "#6B7280", fontSize: 13, textAlign: "center", marginTop: 30 }}>No professionals online nearby right now.</div>}
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- worker profile view (by customer) --------------------------- */
  if (screen === "workerProfileView") {
    const w = db.workers[selectedWorkerId];
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={w.name} onBack={() => setScreen("workersList")} />
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <VerificationBadge status={w.verification} t={t} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <Stars value={w.rating} /> <span style={{ fontSize: 13, color: "#6B7280" }}>{w.rating} ({w.ratingCount} {t.reviews}) · {w.completedJobs} {t.experienceJobs}</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 13, color: "#374151" }}>{w.bio}</div>
          <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: "#6B7280" }}>{t.skills}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>{w.skills.map((s) => <span key={s} style={chip(true)}>{CATEGORIES.find((c) => c.id === s)?.label}</span>)}</div>
          <div style={{ marginTop: 14, fontSize: 15, fontWeight: 700 }}>₹{w.visitCost} <span style={{ fontWeight: 400, fontSize: 12, color: "#6B7280" }}>{t.visitCost.toLowerCase()}</span></div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>{w.address}</div>
          <button style={{ ...btnGhost, marginTop: 20 }} onClick={() => showToast("Demo: message sent — production uses live chat")}>{t.messageWorker}</button>
          <button style={{ ...btnPrimary, marginTop: 10 }} onClick={() => setScreen("bookingForm")}>{t.bookNow}</button>
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- booking form --------------------------- */
  if (screen === "bookingForm") {
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.confirmBooking} onBack={() => setScreen("workerProfileView")} />
        <div style={{ flex: 1, padding: 20 }}>
          <Field label={`${t.describeIssue} (${t.optionalField})`}>
            <textarea style={{ ...inputStyle, minHeight: 80 }} value={bookingDesc} onChange={(e) => setBookingDesc(e.target.value)} />
          </Field>
          <Field label={`${t.attachPhoto} (${t.optionalField})`}>
            <input type="file" accept="image/*" onChange={(e) => setBookingPhoto(e.target.files?.[0] || null)} />
            {bookingPhoto && <div style={{ fontSize: 12, color: "#0E6B5C", marginTop: 4 }}>✓ {bookingPhoto.name}</div>}
          </Field>
          <button style={btnPrimary} onClick={submitBooking}>{t.confirmBooking}</button>
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- waiting screen --------------------------- */
  if (screen === "orderWaiting") {
    const order = db.orders.find((o) => o.id === activeOrderId);
    if (order?.status === "en_route" || order?.status === "arrived") {
      return (
        <PhoneFrame toast={toast}>
          <TopBar title={t.trackingTitle} onBack={() => setScreen("customerDashboard")} />
          <div style={{ flex: 1, padding: 20 }}>
            <MapView order={order} now={now} t={t} />
            <button style={{ ...btnPrimary, marginTop: 16 }} onClick={() => setScreen("customerDashboard")}>OK</button>
          </div>
        </PhoneFrame>
      );
    }
    if (order?.status === "declined") {
      return (
        <PhoneFrame toast={toast}>
          <TopBar title={t.waitingTitle} onBack={() => setScreen("customerDashboard")} />
          <div style={{ flex: 1, padding: 20, textAlign: "center" }}>
            <div style={{ color: "#C1443A", marginBottom: 14 }}>{t.declined}</div>
            <button style={btnPrimary} onClick={() => setScreen("workersList")}>{t.chooseAnother}</button>
          </div>
        </PhoneFrame>
      );
    }
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.waitingTitle} onBack={() => setScreen("customerDashboard")} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
          <Loader2 className="animate-spin" size={28} color="#0E6B5C" style={{ marginBottom: 14 }} />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{t.waitingTitle}</div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>{t.waitingDesc}</div>
        </div>
      </PhoneFrame>
    );
  }

  if (screen === "customerTracking") {
    const order = db.orders.find((o) => o.id === activeOrderId);
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.trackingTitle} onBack={() => setScreen("customerDashboard")} />
        <div style={{ flex: 1, padding: 20 }}>
          <MapView order={order} now={now} t={t} />
        </div>
      </PhoneFrame>
    );
  }

  /* --------------------------- review screen --------------------------- */
  if (screen === "reviewScreen") {
    return (
      <PhoneFrame toast={toast}>
        <TopBar title={t.rateExperience} onBack={() => setScreen("customerDashboard")} />
        <div style={{ flex: 1, padding: 20 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <CheckCircle2 color="#2F8F5B" size={32} />
            <div style={{ fontWeight: 700, marginTop: 8 }}>{t.jobDoneTitle}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setReviewStars(n)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Star size={28} fill={n <= reviewStars ? "#E7A33E" : "none"} stroke={n <= reviewStars ? "#E7A33E" : "#C7CBC4"} />
              </button>
            ))}
          </div>
          <textarea style={{ ...inputStyle, minHeight: 70, marginBottom: 14 }} placeholder="Add a comment (optional)" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
          <button style={btnPrimary} onClick={() => submitReview(activeOrderId)}>{t.submitRating}</button>
        </div>
      </PhoneFrame>
    );
  }

  return null;
}

function BottomNav({ role, active, setActive, t, onLogout }) {
  const items = role === "worker"
    ? [{ id: "profile", label: t.profileTab, Icon: User }, { id: "requests", label: t.requestsTab, Icon: ClipboardList }, { id: "orders", label: t.ordersTab, Icon: Clock }, { id: "community", label: t.communityTab, Icon: Users }]
    : [{ id: "services", label: "Services", Icon: Search }, { id: "orders", label: t.ordersTab, Icon: Clock }];
  return (
    <div style={{ display: "flex", borderTop: "1px solid #E2E4DF", background: "#fff", flexShrink: 0 }}>
      {items.map((it) => (
        <button key={it.id} onClick={() => setActive(it.id)} style={{ flex: 1, padding: "10px 4px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active === it.id ? "#0E6B5C" : "#9CA3AF" }}>
          <it.Icon size={18} />
          <span style={{ fontSize: 10, fontWeight: 600 }}>{it.label}</span>
        </button>
      ))}
      <button onClick={onLogout} style={{ flex: 1, padding: "10px 4px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: "#9CA3AF" }}>
        <LogOut size={18} />
        <span style={{ fontSize: 10, fontWeight: 600 }}>{t.logout}</span>
      </button>
    </div>
  );
}
