import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  Download,
  X,
  Search,
  RefreshCw,
  Camera,
  Send,
  MessageSquareShare,
  Check,
  FileImage,
  ExternalLink,
  Mail,
  Copy,
  User
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  writeBatch,
  setLogLevel
} from 'firebase/firestore';

// --- Configuration & Global Variables ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'teureobwa-excel-admin';
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyBXLZdseQ7IR7K4gBuv13Esv1vdcRZFwmM",
      authDomain: "imweb-admin.firebaseapp.com",
      projectId: "imweb-admin",
      storageBucket: "imweb-admin.firebasestorage.app",
      messagingSenderId: "488642428115",
      appId: "1:488642428115:web:e3544a81c39110d551e826"
    };

setLogLevel('debug');

const CUSTOM_STATUSES = ['셋팅 필요', '송출중', '결과보고 필요', '캠페인 완료'];

// ✅ FIX 1) 링크는 무조건 Vercel 고정
const DEPLOY_URL = 'https://artist-schedule.vercel.app';

// --- Assets ---
const ASSETS = {
  SHOP_MOCKUP: "https://r.jina.ai/i/065116790b8480309995c72166946059",
  APP_SEARCH: "https://r.jina.ai/i/063f25c8366487e69f88c3a70908865d",
  APP_DETAIL: "https://r.jina.ai/i/21df02e2133481288f69747970728956",

  // ✅ FIX 2) 업로드 이미지로 변경 (GitHub public 폴더에 파일 있어야 함)
  // public/p4.png (업로드 1번)
  // public/p5.png (업로드 2번)
  P4_DISPLAY: "/p4.png",
  P5_APP: "/p5.png",
};

// --- Design Layout Components ---

const TeaserLayout = ({ order, color, isExport = false }) => {
  const dim = isExport ? { width: '1080px', height: '1920px' } : { width: '100%', height: '100%' };
  const bgColor = color || order?.dominantColor || '#1e1e1e';

  return (
    <div
      className="flex flex-col relative text-center items-center font-sans"
      style={{
        ...dim,
        backgroundColor: bgColor,
        color: 'white',
        padding: isExport ? '120px 48px 80px' : '3rem',
        boxSizing: 'border-box',
        justifyContent: 'center'
      }}
    >
      <h2
        className={`font-black uppercase italic leading-none tracking-tighter ${!isExport ? 'text-5xl mb-8' : ''}`}
        style={isExport ? { fontSize: '130px', marginBottom: '80px' } : {}}
      >
        Coming Soon
      </h2>

      <div
        className={`relative aspect-square shadow-2xl rotate-1 flex-shrink-0 overflow-hidden border-white/10 ${!isExport ? 'w-60 mb-8 border-4' : ''}`}
        style={isExport ? { width: '700px', marginBottom: '80px', borderWidth: '20px' } : {}}
      >
        <img src={order?.image} className="w-full h-full object-cover" crossOrigin="anonymous" alt="" />
      </div>

      <div className="space-y-4" style={isExport ? { display: 'flex', flexDirection: 'column', gap: '20px' } : {}}>
        <h3
          className={`font-black uppercase tracking-tighter leading-none ${!isExport ? 'text-3xl' : ''}`}
          style={isExport ? { fontSize: '100px' } : {}}
        >
          {order?.artist || '아티스트명'}
        </h3>
        <p
          className={`font-light italic opacity-80 ${!isExport ? 'text-lg mt-6' : ''}`}
          style={isExport ? { fontSize: '60px', marginTop: '16px' } : {}}
        >
          "{order?.title || '곡 제목'}"
        </p>
      </div>

      <div
        className={`border-white/20 ${!isExport ? 'mt-8 py-3 px-8 border-y' : ''}`}
        style={isExport ? { marginTop: '80px', padding: '40px 80px', borderTopWidth: '8px', borderBottomWidth: '8px' } : {}}
      >
        <p className={`font-black italic ${!isExport ? 'text-xl' : ''}`} style={isExport ? { fontSize: '76px' } : {}}>
          {order?.broadcastPeriod || '송출일 미정'}
        </p>
      </div>

      <div
        className={`font-black italic opacity-40 tracking-tighter ${!isExport ? 'mt-8 text-2xl' : ''}`}
        style={isExport ? { marginTop: '80px', fontSize: '88px' } : {}}
      >
        틀어봐
      </div>
    </div>
  );
};

const SchedulerLayout = ({ order, desc, isExport = false }) => {
  const dim = isExport
    ? { width: '2400px', minHeight: '3200px', height: 'auto', padding: '160px', boxSizing: 'border-box' }
    : { width: '100%', height: '100%', padding: '40px', boxSizing: 'border-box' };

  return (
    <div className="flex flex-col bg-white text-black overflow-visible text-left font-sans" style={{ ...dim }}>
      <div
        className={`flex items-center justify-between border-black ${!isExport ? 'mb-8 border-b-8 pb-4' : ''}`}
        style={isExport ? { marginBottom: '192px', borderBottomWidth: '40px', paddingBottom: '96px' } : {}}
      >
        <h2 className={`font-black uppercase italic leading-none ${!isExport ? 'text-4xl' : ''}`} style={isExport ? { fontSize: '280px' } : {}}>
          Scheduler
        </h2>
        <span className={`font-black uppercase ${!isExport ? 'text-lg' : ''}`} style={isExport ? { fontSize: '100px' } : {}}>
          틀어봐
        </span>
      </div>

      <div className={`flex items-center ${!isExport ? 'gap-6 mb-8' : ''}`} style={isExport ? { gap: '96px', marginBottom: '128px' } : {}}>
        <img
          src={order?.image}
          className={`object-cover shadow-xl border-slate-50 ${!isExport ? 'w-32 h-32 rounded-2xl border-4' : ''}`}
          style={isExport ? { width: '700px', height: '700px', borderRadius: '6rem', borderWidth: '20px' } : {}}
          crossOrigin="anonymous"
          alt=""
        />
        <div className="space-y-2" style={isExport ? { display: 'flex', flexDirection: 'column', gap: '32px' } : {}}>
          <h3 className={`font-black uppercase leading-tight tracking-tight ${!isExport ? 'text-2xl' : ''}`} style={isExport ? { fontSize: '140px' } : {}}>
            {order?.artist}
          </h3>
          <p className={`font-bold text-slate-500 italic ${!isExport ? 'text-lg' : ''}`} style={isExport ? { fontSize: '90px' } : {}}>
            "{order?.title}"
          </p>
        </div>
      </div>

      <div className="flex-1" style={isExport ? { display: 'flex', flexDirection: 'column', gap: '48px', flex: 1 } : {}}>
        <div>
          <p
            className={`font-black text-slate-400 uppercase tracking-widest ${!isExport ? 'text-[10px] mb-1' : ''}`}
            style={isExport ? { fontSize: '48px', marginBottom: '24px' } : {}}
          >
            Product
          </p>
          <p className="font-bold" style={isExport ? { fontSize: '80px' } : {}}>
            {order?.productName}
          </p>
        </div>

        <div className={!isExport ? 'mt-8' : ''} style={isExport ? { marginTop: '64px' } : {}}>
          <p
            className={`font-black text-slate-400 uppercase tracking-widest ${!isExport ? 'text-[10px] mb-1' : ''}`}
            style={isExport ? { fontSize: '48px', marginBottom: '24px' } : {}}
          >
            Period
          </p>
          <p className={`font-black italic text-indigo-600 ${!isExport ? 'text-xl' : ''}`} style={isExport ? { fontSize: '120px' } : {}}>
            {order?.broadcastPeriod || 'TBA'}
          </p>
        </div>

        <div
          className={`bg-slate-50 border-dashed border-slate-200 shadow-inner ${!isExport ? 'mt-10 p-6 rounded-2xl border-2' : ''}`}
          style={isExport ? { marginTop: '80px', padding: '96px', borderRadius: '5rem', borderWidth: '12px' } : {}}
        >
          <p className={`font-black text-slate-400 uppercase ${!isExport ? 'text-[10px] mb-2' : ''}`} style={isExport ? { fontSize: '48px', marginBottom: '40px' } : {}}>
            Description
          </p>
          <p
            className={`font-medium text-slate-600 italic break-words whitespace-pre-wrap ${!isExport ? 'text-sm' : ''}`}
            style={isExport ? { fontSize: '72px', lineHeight: '1.5' } : {}}
          >
            {desc || order?.description}
          </p>
        </div>
      </div>

      <div className={`mt-auto flex items-center justify-between opacity-20 border-slate-200 ${!isExport ? 'pt-4 border-t' : ''}`} style={isExport ? { marginTop: 'auto', paddingTop: '96px', borderTopWidth: '10px' } : {}}>
        <h4 className={`font-black tracking-[-0.2em] italic ${!isExport ? 'text-4xl' : ''}`} style={isExport ? { fontSize: '160px' } : {}}>
          틀어봐
        </h4>
      </div>
    </div>
  );
};

const PosterLayout = ({ order, color, desc, isExport = false }) => {
  const dim = isExport ? { width: '1059px', height: '2571px' } : { width: '100%', height: '100%', minHeight: '857px' };
  const bgColor = color || order?.dominantColor || '#000';

  return (
    <div className="flex flex-col relative overflow-hidden font-sans" style={{ ...dim, backgroundColor: bgColor, color: 'white' }}>
      <div className={`text-center ${!isExport ? 'pt-24 px-10' : ''}`} style={isExport ? { paddingTop: '320px', paddingLeft: '80px', paddingRight: '80px' } : {}}>
        <div
          className={`relative aspect-square shadow-2xl mx-auto border-white/20 ${!isExport ? 'w-64 border-2' : ''}`}
          style={isExport ? { width: '800px', borderWidth: '20px', margin: '0 auto' } : {}}
        >
          <img src={order?.image} className="w-full h-full object-cover" crossOrigin="anonymous" alt="" />
        </div>
      </div>

      <div className={`flex flex-col ${!isExport ? 'px-10 mt-16 flex-1' : ''}`} style={isExport ? { paddingLeft: '96px', paddingRight: '96px', marginTop: '160px', flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
        <div className="text-center" style={{ marginBottom: '64px' }}>
          <h2
            className={`font-black tracking-tighter uppercase break-keep leading-none ${!isExport ? 'text-4xl' : ''}`}
            style={isExport ? { fontSize: '120px', marginBottom: '40px' } : {}}
          >
            {order?.artist || '아티스트명'}
          </h2>
          <h4 className={`font-light opacity-80 italic ${!isExport ? 'text-xl mt-6' : ''}`} style={isExport ? { fontSize: '72px', marginTop: '24px' } : {}}>
            "{order?.title || '곡 제목'}"
          </h4>
        </div>

        <div className={`w-full bg-white/20 ${!isExport ? 'mb-10 h-px' : ''}`} style={isExport ? { height: '1px', marginBottom: '64px' } : {}} />

        <p
          className={`text-center opacity-90 font-bold italic whitespace-pre-wrap break-words ${!isExport ? 'text-sm leading-relaxed' : ''}`}
          style={isExport ? { fontSize: '64px', lineHeight: '1.7' } : {}}
        >
          {desc || order?.description || '음악 설명을 작성해 주세요.'}
        </p>
      </div>

      <div className={`text-center font-black italic opacity-20 tracking-tighter ${!isExport ? 'pb-10 text-4xl mt-auto' : ''}`} style={isExport ? { paddingBottom: '128px', fontSize: '100px', marginTop: 'auto' } : {}}>
        틀어봐
      </div>
    </div>
  );
};

// ✅ P4: 업로드 1번 이미지
const DisplayMockupLayout = ({ isExport = false }) => {
  const dim = isExport ? { width: '1080px', height: '1080px' } : { width: '100%', aspectRatio: '1/1' };
  return (
    <div className="relative overflow-hidden bg-black flex items-center justify-center" style={{ ...dim }}>
      <img src={ASSETS.P4_DISPLAY} alt="P4 디스플레이" className="w-full h-full object-cover" crossOrigin="anonymous" />
    </div>
  );
};

// ✅ P5: 업로드 2번 이미지
const ClientMockupLayout = ({ isExport = false }) => {
  const dim = isExport ? { width: '1080px', height: '1080px' } : { width: '100%', aspectRatio: '1/1' };
  return (
    <div className="relative overflow-hidden bg-black flex items-center justify-center" style={{ ...dim }}>
      <img src={ASSETS.P5_APP} alt="P5 앱노출" className="w-full h-full object-cover" crossOrigin="anonymous" />
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIdForMessage, setSelectedOrderIdForMessage] = useState(null);
  const [messagePage, setMessagePage] = useState(1);
  const [selectedOrderIdForDetail, setSelectedOrderIdForDetail] = useState(null);
  const [publicViewId, setPublicViewId] = useState(null);
  const posterRef = useRef(null);
  const [dominantColor, setDominantColor] = useState('rgb(30, 30, 30)');
  const [localDesc, setLocalDesc] = useState('');
  const [toast, setToast] = useState(null);

  const selectedOrderForMessage = useMemo(() => orders.find(o => o.id === selectedOrderIdForMessage), [orders, selectedOrderIdForMessage]);
  const selectedOrderForDetail = useMemo(() => orders.find(o => o.id === selectedOrderIdForDetail), [orders, selectedOrderIdForDetail]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = filterStatus === '전체' || o.status === filterStatus;
      const term = searchTerm.toLowerCase();
      return matchesStatus && (
        (o.title || "").toLowerCase().includes(term) ||
        (o.artist || "").toLowerCase().includes(term) ||
        (o.orderNo || "").includes(term)
      );
    });
  }, [orders, filterStatus, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get('v');
    if (vId) setPublicViewId(vId);

    const scripts = [
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
    ];
    scripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script'); s.src = src; s.async = true;
        document.body.appendChild(s);
      }
    });

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const firebaseAuth = getAuth(app);
    setDb(firestore);
    setAuth(firebaseAuth);

    const performAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }
      } catch (err) {
        console.error("Firebase Auth Fail:", err);
      }
    };

    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });

    performAuth();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !db || !user) return;
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    return onSnapshot(ordersRef, (snapshot) => {
      const list = [];
      snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(list);
      setLoading(false);
    });
  }, [isAuthReady, db, user]);

  useEffect(() => {
    if (selectedOrderForDetail) {
      setLocalDesc(selectedOrderForDetail.description || '');
      setDominantColor(selectedOrderForDetail.dominantColor || 'rgb(30, 30, 30)');
    }
  }, [selectedOrderIdForDetail, selectedOrderForDetail]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateOrderField = async (orderId, field, value) => {
    if (!db || !user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
    await setDoc(docRef, { [field]: value, updatedAt: new Date().toISOString() }, { merge: true });
  };

  const extractColor = async (imgSrc, orderId) => {
    try {
      if (!imgSrc || !orderId || !db) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const w = 64, h = 64;
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
      }
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      setDominantColor(rgb);
      await updateOrderField(orderId, 'dominantColor', rgb);
    } catch (e) {
      console.warn('extractColor failed:', e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !db || !user || !window.XLSX) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = window.XLSX.read(data, { type: 'array' });
      const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      const headers = rows[0].map(h => String(h || "").trim());
      const batch = writeBatch(db);
      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        if (!values || !values.length) continue;
        const row = {};
        headers.forEach((h, idx) => row[h] = values[idx]);
        const orderNo = String(row['주문번호'] || "").trim();
        if (!orderNo) continue;
        const optionStr = String(row['옵션명'] || "");
        const extract = (key) => {
          const m = optionStr.match(new RegExp(`${key}\\s*:\\s*([^/]+)`));
          return m ? m[1].trim() : "";
        };
        batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderNo), {
          orderNo,
          title: extract("곡 제목") || extract("노출 곡 제목") || "",
          artist: extract("아티스트명") || "",
          productName: row['상품명'] || "",
          description: optionStr,
          netPrice: row['품목실결제가'] || "0",
          orderDate: row['주문일'] || new Date().toISOString(),
          image: "https://placehold.co/400x400/000/fff?text=No+Image",
          status: '셋팅 필요',
          broadcastPeriod: '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        count++;
      }
      await batch.commit();
      showToast(`${count}건 데이터 업로드 완료.`);
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleImageUpload = async (orderId, file) => {
    if (!file || !db || !user) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      await updateOrderField(orderId, 'image', base64);
      extractColor(base64, orderId);
    };
    reader.readAsDataURL(file);
  };

  const openStudio = (order) => {
    setDominantColor(order.dominantColor || 'rgb(30, 30, 30)');
    setSelectedOrderIdForMessage(order.id);
    if (order.image) extractColor(order.image, order.id);
  };

  const copySmsText = (order) => {
    if (!order) return;
    const shareUrl = `${DEPLOY_URL}/?v=${order.id}`;
    const sms =
      `안녕하세요, 아티스트 ${order.artist}님.\n'틀어봐' 서비스를 통해 소중한 음악을 홍보해 주셔서 진심으로 감사드립니다.\n홍보 진행을 위해 아래 내용을 확인 부탁드립니다.\n\n` +
      `48시간 이내 회신이 없으실 경우, 안내드린 스케줄표 기준으로 자동 송출이 진행됩니다.\n\n` +
      `스케줄 확인하기 : ${shareUrl}\n\n` +
      `송출 매장 확인하기 링크 : https://summitplay.notion.site/2dc77dadb820803aa606cf900e84c5fd\n\n` +
      `그외 문의 사항 있는 경우 아래로 문의부탁드립니다.\n문의 메일 : summitplay@summit-play.com`;

    const textArea = document.createElement("textarea");
    textArea.value = sms;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('문자 메세지 복사 완료');
  };

  const downloadForArtist = async (order) => {
    showToast('고화질 이미지 생성 중...');
    const ids = ['teaser', 'schedule', 'poster', 'display', 'client'];
    const names = ['티저', '스케줄', '포스터', '디스플레이_예시', '앱노출_예시'];
    for (let i = 0; i < ids.length; i++) {
      const el = document.getElementById(`public-${ids[i]}`);
      if (el) {
        const canvas = await window.html2canvas(el, { useCORS: true, scale: 2 });
        const link = document.createElement('a');
        link.download = `틀어봐_${order.artist}_${names[i]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    showToast('저장 완료.');
  };

  // --- Render Views ---

  if (publicViewId) {
    const publicOrder = orders.find(o => o.id === publicViewId);
    if (!publicOrder && !loading) return <div className="h-screen flex items-center justify-center font-black bg-[#0a0a0a] text-white">데이터를 찾을 수 없습니다.</div>;
    if (loading) return <div className="h-screen flex flex-col items-center justify-center font-black bg-[#0a0a0a] text-white space-y-4"><RefreshCw className="animate-spin" /></div>;

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-4 md:p-10 space-y-16 overflow-y-auto font-sans text-center text-white">
        <header className="flex flex-col items-center max-w-2xl text-center">
          <div className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-4 border border-white/10 italic tracking-widest">Curation Service</div>
          <h1 className="text-4xl font-black italic tracking-tight uppercase">틀어봐 SCHEDULER</h1>
          <p className="text-sm opacity-60 mt-6 leading-relaxed italic">
            안녕하세요, <strong>{publicOrder.artist}</strong>님! 제작된 홍보 이미지를 확인해 주세요.<br />
            하단 버튼을 눌러 고화질 원본 파일을 다운로드하실 수 있습니다.
          </p>
          <button
            onClick={() => downloadForArtist(publicOrder)}
            className="mt-10 px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-sm flex items-center gap-3 shadow-2xl shadow-indigo-500/30 hover:scale-105 transition-transform"
          >
            <Download size={20} /> 고화질 이미지 전체 다운로드
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 w-full max-w-7xl items-start pb-24">
          <div className="flex flex-col items-center gap-8">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P1. Story Teaser</span>
            <div className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '345.6px', height: '614.4px' }}>
              <div id="public-teaser" style={{ width: '1080px', height: '1920px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                <TeaserLayout order={publicOrder} color={publicOrder.dominantColor} isExport={true} />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P2. Schedule Board</span>
            <div className="shadow-2xl rounded-3xl overflow-visible bg-white border border-white/5" style={{ width: '348px', minHeight: '464px' }}>
              <div id="public-schedule" style={{ width: '2400px', transform: 'scale(0.145)', transformOrigin: 'top left' }}>
                <SchedulerLayout order={publicOrder} desc={publicOrder.description} isExport={true} />
              </div>
            </div>
          </div>

          {/* ✅ FIX 3) P2 아래에 P4/P5 추가 노출 */}
          <div className="flex flex-col items-center gap-8 lg:col-span-3">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">
              Schedule + Preview (P4 / P5)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
              <div className="flex flex-col items-center gap-4">
                <div className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P4. Display</div>
                <div className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '345.6px', height: '345.6px' }}>
                  <div style={{ width: '1080px', height: '1080px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                    <DisplayMockupLayout isExport={true} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P5. App</div>
                <div className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '345.6px', height: '345.6px' }}>
                  <div style={{ width: '1080px', height: '1080px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                    <ClientMockupLayout isExport={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P3. Music Poster</span>
            <div className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '338.8px', height: '822.7px' }}>
              <div id="public-poster" style={{ width: '1059px', height: '2571px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                <PosterLayout order={publicOrder} color={publicOrder.dominantColor} desc={publicOrder.description} isExport={true} />
              </div>
            </div>
          </div>

          {/* 기존 P4 */}
          <div className="flex flex-col items-center gap-8">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P4. Shop Display</span>
            <div id="public-display" className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '345.6px', height: '345.6px' }}>
              <div style={{ width: '1080px', height: '1080px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                <DisplayMockupLayout isExport={true} />
              </div>
            </div>
          </div>

          {/* 기존 P5 */}
          <div className="flex flex-col items-center gap-8">
            <span className="text-white/30 text-[10px] font-black uppercase italic tracking-widest">P5. Mobile App</span>
            <div id="public-client" className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/5" style={{ width: '345.6px', height: '345.6px' }}>
              <div style={{ width: '1080px', height: '1080px', transform: 'scale(0.32)', transformOrigin: 'top left' }}>
                <ClientMockupLayout isExport={true} />
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full max-w-4xl border-t border-white/10 pt-16 pb-20 flex flex-col items-center space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
            <a href="https://summitplay.notion.site/2dc77dadb820803aa606cf900e84c5fd" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-3xl flex items-center justify-between group transition-all">
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase mb-1">Store List</p>
                <p className="text-white font-bold">송출 매장 확인하기</p>
              </div>
              <ExternalLink size={20} className="text-white/20 group-hover:text-white" />
            </a>
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
              <div>
                <p className="text-white/40 text-[10px] font-black uppercase mb-1">Inquiry</p>
                <p className="text-white font-bold text-sm">summitplay@summit-play.com</p>
              </div>
              <Mail size={20} className="text-white/20" />
            </div>
          </div>
          <div className="text-white/20 text-[10px] font-black italic uppercase tracking-widest">© PLAYSOMETUNES / 틀어봐</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">틀어봐</h1>
          <p className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-widest">Admin Control</p>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-black font-black shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> <span className="text-sm font-bold">대시보드</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'orders' ? 'bg-white text-black font-black shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
            <ListOrdered size={20} /> <span className="text-sm font-bold">주문 목록</span>
          </button>
        </nav>
        <div className="p-8 space-y-4">
          <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <User size={16} className="text-slate-400" />
            <div className="overflow-hidden">
              <p className="text-[9px] font-black text-slate-500 uppercase">User ID</p>
              <p className="text-[10px] font-bold truncate text-slate-300">{user?.uid || 'Not Authenticated'}</p>
            </div>
          </div>
          <label className="block w-full py-4 bg-white text-black text-center rounded-3xl text-sm font-black cursor-pointer shadow-xl hover:scale-105 transition-transform">
            {uploading ? "업로드 중..." : "Excel 업로드"}
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b px-10 py-6 flex items-center justify-between">
          <div className="relative w-full max-w-xl text-left">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              type="text"
              placeholder="아티스트, 트랙, 주문번호 검색..."
              className="w-full bg-slate-100 rounded-2xl py-3.5 pl-14 pr-8 text-sm font-bold outline-none focus:ring-2 focus:ring-black"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="p-10 space-y-10">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-6">Total Campaigns</p>
                <h3 className="text-6xl font-black">{orders.length}</h3>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <p className="text-[11px] font-black text-emerald-500 uppercase mb-6">Live</p>
                <h3 className="text-6xl font-black text-emerald-600">{orders.filter(o => o.status === '송출중').length}</h3>
              </div>
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <p className="text-[11px] font-black text-amber-500 uppercase mb-6">Waiting</p>
                <h3 className="text-6xl font-black text-amber-600">{orders.filter(o => o.status === '셋팅 필요').length}</h3>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {['전체', ...CUSTOM_STATUSES].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`px-8 py-3 rounded-full text-xs font-black border whitespace-nowrap transition-all ${filterStatus === s ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-500 hover:border-slate-400'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-[3.5rem] border shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-6 text-center">No</th>
                      <th className="px-8 py-6">Artist / Track</th>
                      <th className="px-8 py-6 text-right">Price</th>
                      <th className="px-8 py-6 text-center">Period</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedOrderIdForDetail(o.id)}>
                        <td className="px-8 py-7 text-center">
                          <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full">{o.orderNo}</span>
                        </td>
                        <td className="px-8 py-7 flex items-center gap-4">
                          <img src={o.image} className="w-14 h-14 rounded-xl object-cover shadow-sm" crossOrigin="anonymous" alt="" />
                          <div>
                            <h4 className="font-black leading-tight text-slate-900">{o.title}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase">{o.artist}</p>
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right font-black text-slate-700">{Number(o.netPrice).toLocaleString()}원</td>
                        <td className="px-8 py-7 text-center" onClick={e => e.stopPropagation()}>
                          <input type="text" className="bg-slate-100/50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold w-32 text-center outline-none focus:ring-1 focus:ring-black" value={o.broadcastPeriod || ''} onChange={e => updateOrderField(o.id, 'broadcastPeriod', e.target.value)} placeholder="MM.DD-MM.DD" />
                        </td>
                        <td className="px-8 py-7" onClick={e => e.stopPropagation()}>
                          <select value={o.status} onChange={e => updateOrderField(o.id, 'status', e.target.value)} className={`text-[11px] font-black rounded-xl border-none px-4 py-2 appearance-none cursor-pointer ${o.status === '송출중' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white shadow-sm'}`}>
                            {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-8 py-7 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openStudio(o)} className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-black hover:text-white transition-all"><Send size={16} /></button>

                            {/* ✅ 링크 복사도 무조건 Vercel 링크 */}
                            <button onClick={() => {
                              const shareUrl = `${DEPLOY_URL}/?v=${o.id}`;
                              const textArea = document.createElement("textarea");
                              textArea.value = shareUrl;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              showToast('링크 복사 완료');
                            }} className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-black hover:text-white transition-all"><Copy size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedOrderIdForDetail && selectedOrderForDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden text-left shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <header className="p-10 border-b flex items-center justify-between">
              <h2 className="text-2xl font-black italic uppercase text-slate-900 tracking-tighter">Details</h2>
              <button onClick={() => setSelectedOrderIdForDetail(null)} className="p-4 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-6">
                <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border border-slate-100">
                  <img src={selectedOrderForDetail.image} className="w-full aspect-square object-cover" crossOrigin="anonymous" alt="" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={32} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(selectedOrderForDetail.id, e.target.files?.[0])} />
                  </label>
                </div>
                <div className="p-6 bg-slate-50 border rounded-[2.5rem] shadow-inner text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest italic">Schedule Period</p>
                  <input type="text" className="w-full bg-white border rounded-2xl py-3 px-4 text-center font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={selectedOrderForDetail.broadcastPeriod || ''} onChange={e => updateOrderField(selectedOrderForDetail.id, 'broadcastPeriod', e.target.value)} placeholder="MM.DD-MM.DD" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-10">
                <div className="flex gap-10 border-b pb-10">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Artist</p>
                    <p className="font-black text-3xl text-slate-900 tracking-tight">{selectedOrderForDetail.artist}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Track</p>
                    <p className="font-black text-3xl text-slate-900 opacity-70 italic tracking-tight">"{selectedOrderForDetail.title}"</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Album Description</p>
                  <textarea className="w-full h-64 p-10 bg-slate-50 border rounded-[3rem] text-sm font-bold leading-relaxed outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner text-slate-800 italic" value={localDesc} onChange={(e) => { setLocalDesc(e.target.value); updateOrderField(selectedOrderForDetail.id, 'description', e.target.value); }} />
                </div>
              </div>
            </div>
            <footer className="p-10 border-t flex gap-6 bg-slate-50">
              <button onClick={() => { openStudio(selectedOrderForDetail); setSelectedOrderIdForDetail(null); }} className="px-12 py-5 bg-white border-2 rounded-[2rem] font-black text-sm hover:bg-black hover:text-white transition-all shadow-lg flex items-center gap-2"><FileImage size={18} /> 스튜디오 열기</button>
              <button onClick={() => copySmsText(selectedOrderForDetail)} className="flex-1 py-5 bg-black text-white rounded-[2rem] font-black text-sm hover:scale-[1.02] transition-all shadow-2xl shadow-black/30 flex items-center justify-center gap-2"><MessageSquareShare size={20} /> 문자 메세지 복사</button>
            </footer>
          </div>
        </div>
      )}

      {/* Studio Modal */}
      {selectedOrderIdForMessage && selectedOrderForMessage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-7xl h-full flex overflow-hidden">
            <div className="w-[420px] border-r p-12 flex flex-col bg-slate-50 shrink-0">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black italic uppercase text-slate-900 tracking-tighter">Studio</h2>
                <button onClick={() => { setSelectedOrderIdForMessage(null); setMessagePage(1); }} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={24} /></button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {[1, 2, 3, 4, 5].map(p => (
                    <button key={p} onClick={() => setMessagePage(p)} className={`py-4 rounded-2xl text-[11px] font-black transition-all ${messagePage === p ? 'bg-black text-white shadow-lg scale-105' : 'bg-white border text-slate-400 hover:border-slate-300'}`}>
                      {p === 1 ? 'P1. 티저' : p === 2 ? 'P2. 스케줄' : p === 3 ? 'P3. 포스터' : p === 4 ? 'P4. 디스플레이' : 'P5. 앱노출'}
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase px-2 italic tracking-widest">Selected Detail</div>
                  <div className="w-full h-40 p-6 bg-white border rounded-[2.5rem] text-xs font-bold leading-relaxed overflow-y-auto italic text-slate-800 shadow-inner whitespace-pre-wrap">
                    {selectedOrderForMessage.description}
                  </div>
                </div>
              </div>
              <div className="pt-10 flex gap-4">
                <button
                  onClick={() => {
                    if (!window.html2canvas) return;
                    window.html2canvas(posterRef.current, { useCORS: true, scale: 2 }).then(canvas => {
                      const a = document.createElement('a');
                      const names = ['티저', '스케줄', '포스터', '디스플레이_예시', '앱노출_예시'];
                      a.download = `틀어봐_${selectedOrderForMessage.artist}_${names[messagePage - 1]}.png`;
                      a.href = canvas.toDataURL('image/png');
                      a.click();
                    });
                  }}
                  className="flex-1 py-5 bg-black text-white rounded-[2rem] font-black text-sm hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2"
                >
                  <Download size={18} /> 현재 화면 저장
                </button>
              </div>
            </div>
            <div className="flex-1 bg-[#0a0a0a] p-12 overflow-y-auto flex justify-center items-center">
              <div
                ref={posterRef}
                className="relative shadow-2xl overflow-visible flex flex-col transition-all duration-300"
                style={{
                  width: (messagePage === 1 || messagePage === 4 || messagePage === 5) ? '400px' : (messagePage === 2 ? '450px' : '353px'),
                  minHeight: (messagePage === 4 || messagePage === 5) ? '400px' : (messagePage === 3 ? '857px' : (messagePage === 2 ? '500px' : '711px')),
                  backgroundColor: messagePage === 2 ? 'white' : (selectedOrderForMessage.dominantColor || dominantColor),
                  color: messagePage === 2 ? 'black' : 'white',
                  borderRadius: (messagePage === 3 || messagePage === 4 || messagePage === 5) ? '0px' : '10px'
                }}
              >
                {messagePage === 1 && <TeaserLayout order={selectedOrderForMessage} color={selectedOrderForMessage.dominantColor || dominantColor} />}
                {messagePage === 2 && <SchedulerLayout order={selectedOrderForMessage} desc={selectedOrderForMessage.description} />}
                {messagePage === 3 && <PosterLayout order={selectedOrderForMessage} color={selectedOrderForMessage.dominantColor || dominantColor} desc={selectedOrderForMessage.description} />}
                {messagePage === 4 && <DisplayMockupLayout isExport={false} />}
                {messagePage === 5 && <ClientMockupLayout isExport={false} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast UI */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 border border-white/10 animate-in slide-in-from-bottom-5">
          <Check size={18} className="text-emerald-400" />{toast}
        </div>
      )}
    </div>
  );
};

export default App;
