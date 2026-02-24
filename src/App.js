import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Upload, 
  Download, 
  X, 
  Search,
  RefreshCw,
  Calendar,
  Camera,
  Send,
  ChevronLeft,
  ChevronRight,
  Layers,
  MessageSquareShare,
  Check,
  Package,
  FileImage,
  Info,
  ExternalLink,
  Mail
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  writeBatch
} from 'firebase/firestore';

// --- 글로벌 설정 및 상수 ---
const appId = 'teureobwa-excel-admin';
const firebaseConfig = {
  apiKey: "AIzaSyBXLZdseQ7IR7K4gBuv13Esv1vdcRZFwmM",
  authDomain: "imweb-admin.firebaseapp.com",
  projectId: "imweb-admin",
  storageBucket: "imweb-admin.firebasestorage.app",
  messagingSenderId: "488642428115",
  appId: "1:488642428115:web:e3544a81c39110d551e826"
};

const CUSTOM_STATUSES = ['셋팅 필요', '송출중', '결과보고 필요', '캠페인 완료'];
const DEPLOY_URL = 'https://artist-schedule.vercel.app';

// --- 디자인 레이아웃 컴포넌트 ---

const TeaserLayout = ({ order, color, isExport = false }) => {
  const dim = isExport ? { width: '1080px', height: '1920px' } : { width: '100%', height: '100%' };
  return (
    <div className="flex flex-col h-full w-full relative p-12 text-center items-center justify-center font-sans" style={{ ...dim, backgroundColor: color, color: 'white' }}>
      <h2 className={`${isExport ? 'text-[120px] mb-20' : 'text-6xl mb-8'} font-black uppercase italic leading-none`}>Coming Soon</h2>
      
      <div className={`relative aspect-square ${isExport ? 'w-[700px] mb-24 border-[20px]' : 'w-64 mb-8 border-4'} border-white/10 shadow-2xl rotate-1 flex-shrink-0`}>
        <img src={order?.image} className="w-full h-full object-cover" crossOrigin="Anonymous" alt="" />
      </div>

      <div className="space-y-4">
        <h3 className={`${isExport ? 'text-9xl' : 'text-4xl'} font-black uppercase tracking-tighter`}>{order?.artist}</h3>
        <p className={`${isExport ? 'text-6xl' : 'text-xl'} font-light italic opacity-80`}>"{order?.title}"</p>
      </div>
      
      <div className={`${isExport ? 'mt-20 py-10 px-20 border-y-8' : 'mt-8 py-3 px-8 border-y'} border-white/20`}>
         <p className={`${isExport ? 'text-7xl' : 'text-2xl'} font-black italic`}>{order?.broadcastPeriod || 'TBA'}</p>
      </div>

      <div className={`${isExport ? 'mt-24 text-8xl' : 'mt-8 text-3xl'} font-black italic opacity-40`}>틀어봐</div>
    </div>
  );
};

const SchedulerLayout = ({ order, desc, isExport = false }) => {
  const dim = isExport ? { width: '2400px', height: '3000px', padding: '160px' } : { width: '100%', height: '100%', padding: '40px' };
  return (
    <div className="flex flex-col bg-white text-black overflow-hidden text-left font-sans" style={{ ...dim }}>
      <div className={`flex items-center justify-between border-black ${isExport ? 'mb-48 border-b-[40px] pb-24' : 'mb-8 border-b-8 pb-4'}`}>
         <h2 className={`${isExport ? 'text-[280px]' : 'text-4xl'} font-black uppercase italic leading-none`}>Scheduler</h2>
         <span className={`${isExport ? 'text-8xl' : 'text-lg'} font-black uppercase`}>틀어봐</span>
      </div>
      <div className={`flex items-center ${isExport ? 'gap-24 mb-32' : 'gap-6 mb-8'}`}>
        <img src={order?.image} className={`${isExport ? 'w-[700px] h-[700px] rounded-[6rem] border-[20px]' : 'w-32 h-32 rounded-2xl border-4'} object-cover shadow-xl border-slate-50`} crossOrigin="Anonymous" alt="" />
        <div className="space-y-2">
          <h3 className={`${isExport ? 'text-9xl' : 'text-2xl'} font-black uppercase leading-tight`}>{order?.artist}</h3>
          <p className={`${isExport ? 'text-7xl' : 'text-lg'} font-bold text-slate-500 italic`}>"{order?.title}"</p>
        </div>
      </div>
      <div className="space-y-6 flex-1">
        <div><p className={`${isExport ? 'text-3xl mb-4' : 'text-[10px] mb-1'} font-black text-slate-400 uppercase`}>Product</p><p className={`${isExport ? 'text-6xl font-bold' : 'font-bold'}`}>{order?.productName}</p></div>
        <div className="mt-4"><p className={`${isExport ? 'text-3xl mb-4' : 'text-[10px] mb-1'} font-black text-slate-400 uppercase`}>Period</p><p className={`${isExport ? 'text-8xl' : 'text-xl'} font-black italic text-indigo-600`}>{order?.broadcastPeriod || 'TBA'}</p></div>
        <div className={`mt-6 bg-slate-50 ${isExport ? 'p-20 rounded-[4rem] border-8' : 'p-6 rounded-2xl border-2'} border-dashed border-slate-200 shadow-inner`}>
          <p className={`${isExport ? 'text-3xl mb-8' : 'text-[10px] mb-2'} font-black text-slate-400 uppercase`}>Description</p>
          <p className={`${isExport ? 'text-6xl leading-relaxed' : 'text-sm'} font-medium text-slate-600 italic break-words whitespace-pre-wrap`}>{desc || order?.description}</p>
        </div>
      </div>
      <div className={`mt-auto flex items-center justify-between opacity-20 border-slate-200 ${isExport ? 'pt-24 border-t-[6px]' : 'pt-4 border-t'}`}>
         <h4 className={`${isExport ? 'text-[120px]' : 'text-4xl'} font-black tracking-[-0.2em] italic`}>틀어봐</h4>
      </div>
    </div>
  );
};

const PosterLayout = ({ order, color, desc, isExport = false }) => {
  const dim = isExport ? { width: '1059px', height: '2571px' } : { width: '100%', height: '100%', minHeight: '857px' };
  return (
    <div className="flex flex-col relative bg-black overflow-hidden font-sans" style={{ ...dim, backgroundColor: color, color: 'white' }}>
      <div className={`${isExport ? 'pt-64' : 'pt-32'} px-10 text-center`}>
        <div className={`relative aspect-square shadow-2xl mx-auto ${isExport ? 'w-[750px] border-[16px]' : 'w-64 border-2'} border-white/20`}>
          <img src={order?.image} className="w-full h-full object-cover" crossOrigin="Anonymous" alt="" />
        </div>
      </div>
      <div className={`${isExport ? 'px-20 mt-32' : 'px-10 mt-16'} flex-1 flex flex-col`}>
        <div className="mb-12 text-center">
          <h2 className={`${isExport ? 'text-9xl mb-8' : 'text-4xl'} font-black tracking-tighter uppercase break-keep leading-tight`}>{order?.artist}</h2>
          <h4 className={`${isExport ? 'text-6xl' : 'text-xl'} font-light opacity-80 italic mt-4`}>"{order?.title}"</h4>
        </div>
        <div className="h-px w-full bg-white/20 mb-10"></div>
        <p className={`${isExport ? 'text-6xl leading-[1.8]' : 'text-sm leading-relaxed'} text-center opacity-90 font-bold italic whitespace-pre-wrap`}>{desc || order?.description}</p>
      </div>
    </div>
  );
};

// --- App 메인 컴포넌트 ---

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
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
  const [dominantColor, setDominantColor] = useState('rgb(20, 20, 20)');
  const [localDesc, setLocalDesc] = useState('');
  const [toast, setToast] = useState(null);

  const selectedOrderForMessage = useMemo(() => orders.find(o => o.id === selectedOrderIdForMessage), [orders, selectedOrderIdForMessage]);
  const selectedOrderForDetail = useMemo(() => orders.find(o => o.id === selectedOrderIdForDetail), [orders, selectedOrderIdForDetail]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = filterStatus === '전체' || o.status === filterStatus;
      const term = searchTerm.toLowerCase();
      return matchesStatus && ((o.title || "").toLowerCase().includes(term) || (o.artist || "").toLowerCase().includes(term) || (o.orderNo || "").includes(term));
    });
  }, [orders, filterStatus, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get('v');
    if (vId) setPublicViewId(vId);

    const h2cScript = document.createElement('script');
    h2cScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    h2cScript.async = true;
    document.body.appendChild(h2cScript);

    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    xlsxScript.async = true;
    document.body.appendChild(xlsxScript);

    const initFirebase = async () => {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestore);
      setAuth(firebaseAuth);
      await signInAnonymously(firebaseAuth);
      onAuthStateChanged(firebaseAuth, (user) => { if (user) setUserId(user.uid); setIsAuthReady(true); });
    };
    initFirebase();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !db) return;
    const ordersRef = collection(db, `artifacts/${appId}/public/data/orders`);
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const orderList = [];
      snapshot.forEach(doc => { orderList.push({ id: doc.id, ...doc.data() }); });
      orderList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthReady, db]);

  useEffect(() => {
    if (selectedOrderForDetail) setLocalDesc(selectedOrderForDetail.description || '');
  }, [selectedOrderIdForDetail]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const updateOrderField = async (orderId, field, value) => {
    if (!db) return;
    await setDoc(doc(db, `artifacts/${appId}/public/data/orders`, orderId), { [field]: value }, { merge: true });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !db) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = window.XLSX.read(data, { type: 'array' });
      const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      const headers = rows[0].map(h => String(h || "").trim());
      const batch = writeBatch(db);
      let newCount = 0;
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        if (!values || values.length === 0) continue;
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx]; });
        const orderNo = String(row['주문번호'] || "").trim();
        if (!orderNo) continue;
        const docRef = doc(db, `artifacts/${appId}/public/data/orders`, orderNo);
        const existingSnap = await getDoc(docRef);
        if (existingSnap.exists()) continue;

        const optionStr = String(row['옵션명'] || "");
        const extract = (key) => {
          const match = optionStr.match(new RegExp(`${key}\\s*:\\s*([^/]+)`));
          return match ? match[1].trim() : "";
        };
        batch.set(docRef, {
          orderNo: orderNo,
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
        });
        newCount++;
      }
      await batch.commit();
      showToast(`${newCount}건 추가 완료.`);
      setUploading(false);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleImageUpload = async (orderId, file) => {
    if (!file || !db) return;
    const reader = new FileReader();
    reader.onload = async (e) => { await updateOrderField(orderId, 'image', e.target.result); };
    reader.readAsDataURL(file);
  };

  const extractColor = (imgUrl) => {
    if (!imgUrl) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10; canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i+1]; b += data[i+2]; }
      const count = data.length / 4;
      setDominantColor(`rgb(${Math.floor(r/count)}, ${Math.floor(g/count)}, ${Math.floor(b/count)})`);
    };
  };

  const downloadSingle = async (name) => {
    if (!posterRef.current || !window.html2canvas) return;
    const canvas = await window.html2canvas(posterRef.current, { useCORS: true, scale: 2 });
    const link = document.createElement('a');
    link.download = `틀어봐_${name}_P${messagePage}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copySmsText = (order) => {
    if (!order) return;
    const shareUrl = `${DEPLOY_URL}/?v=${order.id}`;
    
    const smsContent = `안녕하세요, 아티스트 ${order.artist}님.
‘틀어봐’ 서비스를 통해 소중한 음악을 홍보해 주셔서 진심으로 감사드립니다.
홍보 진행을 위해 아래 내용을 확인 부탁드립니다.

⭐️48시간 이내 회신이 없으실 경우, 안내드린 스케줄표 기준으로 자동 송출이 진행됩니다.

스케줄 확인하기 : ${shareUrl}

송출 매장 확인하기 링크 : https://summitplay.notion.site/2dc77dadb820803aa606cf900e84c5fd

그외 문의 사항 있는 경우 아래로 문의부탁드립니다.
문의 메일 : summitplay@summit-play.com`;

    const textArea = document.createElement("textarea");
    textArea.value = smsContent;
    document.body.appendChild(textArea);
    textArea.select();
    textArea.focus();
    try {
      const successful = document.execCommand('copy');
      if (successful) showToast('문자 메세지가 클립보드에 복사되었습니다.');
    } catch (err) { showToast('복사 중 오류가 발생했습니다.'); }
    document.body.removeChild(textArea);
  };

  const downloadForArtist = async (order) => {
    if (!window.html2canvas) return;
    showToast('고화질 이미지를 생성 중입니다...');
    const layouts = [
      { id: 'teaser', name: '티저' },
      { id: 'schedule', name: '스케줄' },
      { id: 'poster', name: '포스터' }
    ];
    for (const layout of layouts) {
      const el = document.getElementById(`public-${layout.id}`);
      if (el) {
        const canvas = await window.html2canvas(el, { useCORS: true, scale: 1, logging: false });
        const link = document.createElement('a');
        link.download = `틀어봐_${order.artist}_${layout.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    showToast('모든 이미지가 저장되었습니다.');
  };

  if (publicViewId) {
    const publicOrder = orders.find(o => o.id === publicViewId);
    if (!publicOrder && !loading) return <div className="h-screen flex items-center justify-center font-black bg-[#0a0a0a] text-white">데이터를 찾을 수 없습니다.</div>;
    if (loading) return <div className="h-screen flex flex-col items-center justify-center font-black bg-[#0a0a0a] text-white space-y-4"><RefreshCw className="animate-spin" /><p>정보를 불러오는 중입니다...</p></div>;
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-4 md:p-10 space-y-10 overflow-y-auto font-sans text-center">
        <header className="text-white text-center flex flex-col items-center max-w-2xl">
          <div className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10 italic">Curation Service</div>
          <h1 className="text-4xl font-black italic tracking-tight">틀어봐 SCHEDULER</h1>
          <p className="text-sm opacity-60 mt-6 leading-relaxed break-keep text-center">
            안녕하세요, <strong>{publicOrder.artist}</strong>님! 아래 제작된 홍보 이미지를 확인해 주세요. <br/>
            하단 버튼을 눌러 고화질 원본 파일을 직접 다운로드하실 수 있습니다.
          </p>
          <button 
            onClick={() => downloadForArtist(publicOrder)}
            className="mt-10 px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/30"
          >
            <Download size={20} /> 고화질 이미지 전체 다운로드
          </button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 w-full max-w-7xl items-start pb-20">
          <div className="flex flex-col items-center gap-6 group text-left">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest italic">P1. Instagram Story</span>
            <div id="public-teaser" style={{ width: '1080px', height: '1920px', transform: 'scale(0.33)', transformOrigin: 'top center' }} className="shadow-2xl rounded-3xl overflow-hidden bg-slate-900 border border-white/10">
               <TeaserLayout order={publicOrder} color={publicOrder.dominantColor || '#1e1e1e'} isExport={true} />
            </div>
            <div style={{ height: 'calc(1920px * 0.33 - 640px)' }}></div>
          </div>
          <div className="flex flex-col items-center gap-6 group text-left">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest italic">P2. Schedule Board</span>
            <div id="public-schedule" style={{ width: '2400px', height: '3000px', transform: 'scale(0.15)', transformOrigin: 'top center' }} className="shadow-2xl rounded-3xl overflow-hidden bg-white border border-white/10">
               <SchedulerLayout order={publicOrder} desc={publicOrder.description} isExport={true} />
            </div>
            <div style={{ height: 'calc(3000px * 0.15 - 450px)' }}></div>
          </div>
          <div className="flex flex-col items-center gap-6 group text-left">
            <span className="text-white/30 text-[10px] font-black uppercase tracking-widest italic">P3. Promotion Poster</span>
            <div id="public-poster" style={{ width: '1059px', height: '2571px', transform: 'scale(0.33)', transformOrigin: 'top center' }} className="shadow-2xl rounded-3xl overflow-hidden bg-black border border-white/10">
               <PosterLayout order={publicOrder} color={publicOrder.dominantColor || '#000'} desc={publicOrder.description} isExport={true} />
            </div>
          </div>
        </div>

        <footer className="w-full max-w-4xl border-t border-white/10 pt-16 pb-20 flex flex-col items-center space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
              <a href="https://summitplay.notion.site/2dc77dadb820803aa606cf900e84c5fd" target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 rounded-3xl flex items-center justify-between group transition-all">
                <div><p className="text-white/40 text-[10px] font-black uppercase mb-1">Store List</p><p className="text-white font-bold">송출 매장 확인하기</p></div>
                <ExternalLink size={20} className="text-white/20 group-hover:text-white transition-colors" />
              </a>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between">
                <div><p className="text-white/40 text-[10px] font-black uppercase mb-1">Inquiry</p><p className="text-white font-bold text-sm">summitplay@summit-play.com</p></div>
                <Mail size={20} className="text-white/20" />
              </div>
           </div>
           <div className="text-white/20 text-[10px] font-black italic uppercase tracking-widest">© PLAYSOMETUNES / 틀어봐</div>
        </footer>
        {toast && <div className="fixed bottom-10 z-[200] bg-white text-black px-8 py-4 rounded-2xl shadow-2xl font-black text-sm animate-in slide-in-from-bottom-5">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-10"><h1 className="text-3xl font-black italic">틀어봐</h1><p className="text-[10px] text-slate-500 mt-2 uppercase font-black tracking-widest italic">Campaign Admin</p></div>
        <nav className="flex-1 px-6 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-black font-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><LayoutDashboard size={20} /> <span className="text-sm font-bold">대시보드</span></button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all ${activeTab === 'orders' ? 'bg-white text-black font-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><ListOrdered size={20} /> <span className="text-sm font-bold">주문 목록</span></button>
        </nav>
        <div className="p-8"><label className="block w-full py-4 bg-white text-black text-center rounded-3xl text-sm font-black cursor-pointer shadow-xl hover:scale-105 transition-transform">{uploading ? "업로드 중..." : "Excel 업로드"}<input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" disabled={uploading} /></label></div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200 px-10 py-6 flex items-center justify-between">
          <div className="relative w-full max-w-xl"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input type="text" placeholder="검색..." className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-14 pr-8 text-sm font-bold focus:ring-2 focus:ring-black outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black uppercase shadow-lg shadow-slate-200">{userId?.[0]}</div>
        </header>

        <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
          {activeTab === 'dashboard' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm"><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Total Campaigns</p><h3 className="text-6xl font-black">{orders.length}</h3></div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm"><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 text-emerald-500">Live Broadcaster</p><h3 className="text-6xl font-black text-emerald-600">{orders.filter(o => o.status === '송출중').length}</h3></div>
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm"><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 text-amber-500">Waiting Setup</p><h3 className="text-6xl font-black text-amber-600">{orders.filter(o => o.status === '셋팅 필요').length}</h3></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {['전체', ...CUSTOM_STATUSES].map(status => <button key={status} onClick={() => setFilterStatus(status)} className={`px-8 py-3 rounded-full text-xs font-black transition-all border whitespace-nowrap ${filterStatus === status ? 'bg-slate-900 text-white shadow-xl border-slate-900' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'}`}>{status}</button>)}
              </div>
              <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                    <tr><th className="px-8 py-6 text-center">Campaign</th><th className="px-8 py-6">Artist / Track</th><th className="px-8 py-6 text-right">Price</th><th className="px-8 py-6 text-center w-40">Period</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-center">Studio</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedOrderIdForDetail(o.id)}>
                        <td className="px-8 py-7 text-center"><span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full group-hover:bg-black group-hover:text-white transition-colors">{o.orderNo}</span></td>
                        <td className="px-8 py-7 flex items-center gap-4"><img src={o.image} className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" /><div className="flex flex-col"><h4 className="font-black leading-tight text-slate-900">{o.title}</h4><p className="text-xs text-slate-400 font-bold uppercase">{o.artist}</p></div></td>
                        <td className="px-8 py-7 text-right font-black text-slate-700">{Number(o.netPrice).toLocaleString()}원</td>
                        <td className="px-8 py-7 text-center" onClick={e => e.stopPropagation()}><input type="text" className="bg-slate-100/50 border-none rounded-lg py-1.5 px-3 text-[11px] font-bold w-32 focus:ring-1 focus:ring-black text-center outline-none" value={o.broadcastPeriod || ''} onChange={e => updateOrderField(o.id, 'broadcastPeriod', e.target.value)} placeholder="00.00-00.00" /></td>
                        <td className="px-8 py-7" onClick={e => e.stopPropagation()}><select value={o.status} onChange={e => updateOrderField(o.id, 'status', e.target.value)} className={`text-[11px] font-black rounded-xl border-none px-4 py-2 appearance-none cursor-pointer ${o.status === '송출중' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white shadow-sm'}`}>{CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                        <td className="px-8 py-7 text-center" onClick={e => e.stopPropagation()}><button onClick={() => { setSelectedOrderIdForMessage(o.id); extractColor(o.image); }} className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"><Send size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 상세보기 모달 */}
      {selectedOrderIdForDetail && selectedOrderForDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden text-left">
            <header className="p-10 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-black italic uppercase text-slate-900">Campaign Details</h2>
                 <span className="text-[10px] bg-slate-900 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest italic">{selectedOrderForDetail.orderNo}</span>
              </div>
              <button onClick={() => setSelectedOrderIdForDetail(null)} className="p-4 hover:bg-slate-100 rounded-full transition-colors relative z-[110] cursor-pointer"><X size={24} className="text-slate-400" /></button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div className="space-y-6 text-center">
                <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl border border-slate-100">
                  <img src={selectedOrderForDetail.image} className="w-full aspect-square object-cover" alt="" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <div className="text-white text-center"><Camera size={32} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase">Change Cover</p></div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(selectedOrderForDetail.id, e.target.files[0])} />
                  </label>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-4 shadow-inner text-center">
                   <div className="text-center space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schedule</p>
                     <input type="text" className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-center font-black text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" value={selectedOrderForDetail.broadcastPeriod || ''} onChange={e => updateOrderField(selectedOrderForDetail.id, 'broadcastPeriod', e.target.value)} placeholder="00.00-00.00" />
                   </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-10">
                <div className="grid grid-cols-1 gap-8 text-slate-900 border-b border-slate-100 pb-10 text-left">
                  <div className="flex gap-10 text-left">
                    <div className="flex-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Artist Name</p><p className="font-black text-3xl tracking-tight">{selectedOrderForDetail.artist || "미정"}</p></div>
                    <div className="flex-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Song Title</p><p className="font-black text-3xl tracking-tight opacity-70 italic">"{selectedOrderForDetail.title || "미정"}"</p></div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-indigo-500">Order Product</p>
                    <div className="flex items-center gap-3 bg-slate-100/50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                      <Package size={18} className="text-slate-400" />
                      <p className="font-bold text-slate-700">{selectedOrderForDetail.productName || "상품 정보 없음"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">Album Description <Info size={12}/></p>
                    <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-widest shadow-sm bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100"><Check size={10}/> Auto Saved</span>
                  </div>
                  <textarea 
                    className="w-full h-64 p-10 bg-slate-50 border border-slate-200 rounded-[3rem] text-sm font-bold leading-relaxed focus:ring-8 focus:ring-indigo-500/5 outline-none shadow-inner transition-all text-slate-700"
                    value={localDesc}
                    onChange={(e) => {
                      setLocalDesc(e.target.value);
                      updateOrderField(selectedOrderForDetail.id, 'description', e.target.value);
                    }}
                    placeholder="아티스트에게 전달될 음악 설명글을 작성해 주세요. 모든 이미지에 실시간으로 반영됩니다."
                  />
                </div>
              </div>
            </div>

            <footer className="p-10 border-t border-slate-100 flex gap-6 bg-slate-50/50">
              <button 
                onClick={() => { setSelectedOrderIdForMessage(selectedOrderForDetail.id); extractColor(selectedOrderForDetail.image); setSelectedOrderIdForDetail(null); }} 
                className="px-12 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black text-sm hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center gap-3"
              >
                <FileImage size={18} /> 시작 메세지 이미지 제작
              </button>
              <button 
                onClick={() => copySmsText(selectedOrderForDetail)}
                className="flex-1 py-5 bg-black text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageSquareShare size={20} /> 문자 메세지 복사하기
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* 메세지 스튜디오 모달 */}
      {selectedOrderIdForMessage && selectedOrderForMessage && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-8 bg-black/98 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-7xl h-full flex overflow-hidden text-left">
            <div className="w-[420px] border-r border-slate-100 p-12 flex flex-col bg-slate-50">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-black italic uppercase text-slate-900">Studio</h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedOrderIdForMessage(null); setMessagePage(1); }} 
                  className="p-3 hover:bg-slate-200 rounded-full transition-colors relative z-[130] cursor-pointer text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 space-y-10 overflow-y-auto scrollbar-hide text-left">
                <div className="flex gap-2">{[1, 2, 3].map(p => <button key={p} onClick={() => setMessagePage(p)} className={`flex-1 py-3 rounded-2xl text-[11px] font-black transition-all ${messagePage === p ? 'bg-black text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>{p === 1 ? '티저' : p === 2 ? '스케줄' : '포스터'}</button>)}</div>
                
                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm font-medium text-xs leading-relaxed text-slate-500 italic text-center">
                  상세페이지에서 수정한 설명글이 모든 이미지에 실시간 반영되어 있습니다.
                </div>
                
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic text-left">Applied Description</div>
                  <div className="w-full h-64 p-8 bg-white border border-slate-100 rounded-[2.5rem] text-xs font-bold leading-relaxed shadow-inner overflow-y-auto italic text-slate-800 whitespace-pre-wrap text-left">
                    {selectedOrderForMessage.description}
                  </div>
                </div>
              </div>
              <div className="pt-10 space-y-4">
                <div className="flex gap-4"><button onClick={() => setMessagePage(Math.max(1, messagePage - 1))} className="p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"><ChevronLeft size={20} className="text-slate-900"/></button><button onClick={() => downloadSingle(selectedOrderForMessage.artist)} className="flex-1 py-5 bg-black text-white rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"><Download size={18}/> 현재 이미지 저장</button><button onClick={() => setMessagePage(Math.min(3, messagePage + 1))} className="p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"><ChevronRight size={20} className="text-slate-900"/></button></div>
              </div>
            </div>
            <div className="flex-1 bg-[#0a0a0a] p-12 overflow-y-auto flex justify-center items-center scrollbar-hide">
              <div ref={posterRef} className="relative shadow-2xl overflow-hidden flex flex-col transition-all duration-300" 
                style={{ 
                  width: messagePage === 3 ? '353px' : (messagePage === 2 ? '450px' : '400px'), 
                  minHeight: messagePage === 3 ? '857px' : (messagePage === 2 ? '500px' : '711px'), 
                  backgroundColor: messagePage === 2 ? 'white' : dominantColor, 
                  color: messagePage === 2 ? 'black' : 'white',
                  borderRadius: '10px' 
                }}>
                {messagePage === 1 && <TeaserLayout order={selectedOrderForMessage} color={dominantColor} />}
                {messagePage === 2 && <SchedulerLayout order={selectedOrderForMessage} desc={selectedOrderForMessage.description} />}
                {messagePage === 3 && <PosterLayout order={selectedOrderForMessage} color={dominantColor} desc={selectedOrderForMessage.description} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 토스트 UI */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm animate-in slide-in-from-bottom-5 border border-white/10 flex items-center gap-3">
          <Check size={18} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
};

export default App;
