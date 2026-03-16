/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Play, Check, Globe, Lock, ShieldCheck, Users, Zap, ArrowLeft, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// --- Types ---
interface WalletTutorial {
  title: string;
  videoUrl: string;
}

interface WalletData {
  id: string;
  name: string;
  icon: string;
  color: string;
  tutorials: WalletTutorial[];
}

const WALLETS: WalletData[] = [
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    color: '#F3BA2F',
    tutorials: [
      { title: '1. ¿Cómo depositar mis pesos en Binance?', videoUrl: 'https://www.youtube.com/embed/XaCqwUj5JNg' },
      { title: '2. ¿Cómo realizar la conversión de pesos a USDT?', videoUrl: 'https://www.youtube.com/embed/bmx1VsgEkO8' },
      { title: '3. ¿Cómo depositar mis USDT en Vantage?', videoUrl: 'https://www.youtube.com/embed/rp_BijKN8Oc' },
    ]
  },
  {
    id: 'belo',
    name: 'Belo',
    icon: '🔵',
    color: '#0052FF',
    tutorials: [
      { title: '1. Depositar pesos en Belo y convertir a USDT', videoUrl: 'https://www.youtube.com/embed/moPdIHiTxAM' },
      { title: '2. ¿Cómo depositar mis USDT en Vantage?', videoUrl: 'https://www.youtube.com/embed/kuaaFrgeBmE' },
    ]
  },
  {
    id: 'fiwind',
    name: 'Fiwind',
    icon: '🟢',
    color: '#00D38B',
    tutorials: [
      { title: '1. ¿Cómo depositar mi pesos en Fiwind?', videoUrl: 'https://www.youtube.com/embed/yzo0Nwsw-YI' },
      { title: '2. ¿Cómo realizar la conversión de pesos a USDT?', videoUrl: 'https://www.youtube.com/embed/oQ1Qg1jREUc' },
      { title: '3. ¿Cómo depositar mis USDT en Vantage?', videoUrl: 'https://www.youtube.com/embed/879xOHHFWqg' },
    ]
  },
  {
    id: 'lemon',
    name: 'Lemon Cash',
    icon: '🍋',
    color: '#C5FF00',
    tutorials: [
      { title: '1. ¿Cómo depositar mis pesos en Lemon Cash?', videoUrl: 'https://www.youtube.com/embed/r9TaqhbYegg' },
      { title: '2. ¿Cómo convertir mis pesos a USDT?', videoUrl: 'https://www.youtube.com/embed/yMZ9m61X8SQ' },
      { title: '3. ¿Cómo depositar mis USDT en Vantage?', videoUrl: 'https://www.youtube.com/embed/SV2Z8k9On7E' },
    ]
  }
];

interface StepData {
  id: number;
  icon: string;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  videoUrl?: string;
  videos?: { title: string; url: string }[];
  buttons: { label: string; href: string; primary?: boolean; whatsapp?: boolean; subLabel?: string }[];
  doneLabel: string;
}

const STEPS: StepData[] = [
  {
    id: 1,
    icon: '⚖️',
    tag: 'Paso 1 · Nivelación',
    title: '¿Tenés experiencia previa en trading?',
    description: 'Queremos brindarte la mejor experiencia según tu nivel de conocimiento. Seleccioná una opción para continuar.',
    bullets: [
      'Si sos principiante, te daremos una base sólida antes de empezar.',
      'Si ya tenés experiencia, iremos directo al grano con el sistema.'
    ],
    buttons: [],
    doneLabel: 'Continuar'
  },
  {
    id: 2,
    icon: '📚',
    tag: 'Paso 2 · Introducción',
    title: '¿Qué es el trading y cómo funciona?',
    description: 'Antes de ver nuestro sistema, es fundamental que entiendas las bases del mercado. En este video te explicamos qué es el trading de forma sencilla.',
    bullets: [
      'Qué es un activo financiero',
      'Cómo se gana dinero con las subas y bajas',
      'El rol de los brokers y el mercado interbancario',
      'Conceptos básicos de oferta y demanda'
    ],
    videoUrl: 'https://www.youtube.com/embed/LSQNJaPa74k',
    buttons: [
      { label: 'Ver Curso Básico Gratuito →', href: '/curso-basico', primary: true, subLabel: 'Comenzar formación desde cero' }
    ],
    doneLabel: 'Entendido, siguiente paso'
  },
  {
    id: 3,
    icon: '🎯',
    tag: 'Paso 3 · Presentación',
    title: 'Presentación del Sistema Educativo',
    description: 'Conocé a fondo cómo funciona nuestro ecosistema educativo. En este video te presentamos la metodología y herramientas que recibirás. A continuación, descarga nuestra App Educativa de Trading Sin Fronteras para acceder a todo el contenido desde tu celular.',
    bullets: [
      'Metodología de estudio paso a paso',
      'Herramientas exclusivas de la academia',
      'Descarga la App Educativa de Trading Sin Fronteras',
      'Acceso a la comunidad de alumnos'
    ],
    videoUrl: 'https://www.youtube.com/embed/XLUVhQUyqeY',
    buttons: [
      { label: '🤖 Descargar para Android', href: 'https://play.google.com/store/apps/details?id=ar.digitalpower.tsf', subLabel: 'Disponible en Play Store' },
      { label: '🍎 Descargar para iOS', href: 'https://apps.apple.com/ar/app/trading-sin-fronteras/id6757570567', subLabel: 'Disponible en App Store' }
    ],
    doneLabel: 'Ya lo vi, siguiente paso'
  },
  {
    id: 4,
    icon: '📋',
    tag: 'Paso 4 · Registro',
    title: 'Creá tu cuenta en Vantage',
    description: 'Para acceder a la academia y a la comunidad de señales, necesitás abrir tu cuenta en Vantage a través de nuestro enlace de referido. Es un broker regulado internacionalmente y con alta calificación de seguridad.',
    bullets: [
      'Broker con múltiples regulaciones (ASIC, FCA, CIMA)',
      'Seguridad de fondos y ejecución institucional',
      'Completá el formulario con tus datos (nombre, email, país)',
      'Verificá tu identidad con DNI o pasaporte'
    ],
    videos: [
      { title: '📺 Cómo crear tu cuenta paso a paso', url: 'https://www.youtube.com/embed/q92wdR2tuMg' },
      { title: '🎁 Tutorial: Activa tu bono del 150%', url: 'https://www.youtube.com/embed/pywhUXgm-Xs' }
    ],
    buttons: [
      { label: 'Abrir cuenta en Vantage →', href: 'https://www.vantagemarkets.com/open-live-account/?affid=NzI2MDI5Mw==&invitecode=IVANTSF', primary: true, subLabel: 'Enlace oficial de registro' },
      { label: '🛡️ Ver Regulaciones', href: 'https://apphtml.0067.cc/mobile/trader?code=0361345333&languageCode=es&countryCode=380', subLabel: 'Seguridad del broker' }
    ],
    doneLabel: 'Cuenta creada, siguiente paso'
  },
  {
    id: 5,
    icon: '💳',
    tag: 'Paso 5 · Depósito',
    title: 'Realizá tu primer depósito',
    description: 'Una vez verificada tu cuenta, hacé tu primer depósito. Podés empezar desde el mínimo recomendado. Elegí el método que más te convenga:',
    bullets: [
      'Tarjeta: Visa / Mastercard instantáneo',
      'Cripto: USDT, BTC, ETH y más',
      'Transferencia: Banco local o SWIFT',
      'Billeteras digitales: Skrill / Neteller',
      '🎁 ¡Activa tu bonificación del 150%!'
    ],
    videoUrl: 'https://www.youtube.com/embed/pywhUXgm-Xs',
    buttons: [
      { label: 'DEPÓSITO EXITOSO', href: '#', primary: true, subLabel: 'Subir comprobante de pago' },
      { label: '¿Dudas? Escribinos', href: `https://wa.me/541135719765?text=${encodeURIComponent('Hola! Necesito ayuda con el depósito.')}`, whatsapp: true, subLabel: 'Chat directo con soporte' }
    ],
    doneLabel: 'Confirmar y continuar'
  },
  {
    id: 6,
    icon: '🖥️',
    tag: 'Paso 6 · Plataforma',
    title: 'Instalá y configurá MetaTrader',
    description: 'Todo el trading se hace desde MetaTrader 4 o 5. Te enseñamos a configurarlo exactamente como lo usamos en la academia, con los indicadores y templates del método.',
    bullets: [
      'Descargá MT4 o MT5 desde la web de Vantage',
      'Iniciá sesión con los datos de tu cuenta real o demo',
      'Instalá el template del método (archivo adjunto en la comunidad)',
      'Configurá los indicadores: EMA 20/50 + Estocástico 14,3,3'
    ],
    videos: [
      { title: '🖥️ Tutorial PC', url: 'https://www.youtube.com/embed/_2WRLXjpFAo' },
      { title: '📱 Tutorial Celular', url: 'https://www.youtube.com/embed/RNoNVni_nxE' }
    ],
    buttons: [
      { label: '🍎 MT5 para iOS', href: 'https://apps.apple.com/ar/app/metatrader-5/id413251709', subLabel: 'App Store' },
      { label: '🤖 MT5 para Android', href: 'https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5', subLabel: 'Play Store' }
    ],
    doneLabel: 'MT5 listo, siguiente paso'
  },
  {
    id: 7,
    icon: '📊',
    tag: 'Paso 7 · Análisis',
    title: 'Análisis Profesional con TradingView',
    description: 'TradingView es la herramienta líder mundial para el análisis técnico. Aquí es donde trazamos nuestras estrategias antes de ejecutarlas en MetaTrader.',
    bullets: [
      'Gráficos en tiempo real de todos los mercados',
      'Herramientas de dibujo y análisis técnico avanzado',
      'Sincronización total entre web y dispositivos móviles',
      'Comunidad global de traders e ideas de inversión'
    ],
    videoUrl: 'https://www.youtube.com/embed/DCZc1BfIAZk',
    buttons: [
      { label: 'WEB →', href: 'https://es.tradingview.com/pricing/?share_your_love=ivangasolero', primary: true, subLabel: 'Para usar en PC o Laptop' },
      { label: 'ANDROID →', href: 'https://es.tradingview.com/pricing/?share_your_love=ivangasolero&mobileapp=true', subLabel: 'App para celulares Android' },
      { label: 'iOS App Store →', href: 'https://es.tradingview.com/pricing/?share_your_love=ivangasolero&mobileapp=true', subLabel: 'App para iPhone o iPad' }
    ],
    doneLabel: 'TradingView configurado, siguiente paso'
  }
];

const VideoAssistant = ({ stepTitle, stepDescription, stepBullets }: { stepTitle: string, stepDescription: string, stepBullets: string[] }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const result = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          systemInstruction: `Eres un asistente experto de la academia "Trading Sin Fronteras". 
          Tu tarea es responder dudas sobre el video del paso: "${stepTitle}".
          Contexto del paso: ${stepDescription}
          Puntos clave: ${stepBullets.join(', ')}
          Responde de forma profesional, motivadora y concisa en español. 
          Si el usuario pregunta algo fuera de este contexto, recuérdale que estás aquí para ayudar con este paso específico.`
        }
      });

      setResponse(result.text || "No pude generar una respuesta. Por favor intenta de nuevo.");
    } catch (error) {
      console.error("Error AI:", error);
      setResponse("Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo o contacta a soporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <span>🤖</span>
        <h4>Asistente IA del Video</h4>
      </div>
      <p className="text-xs text-gray-400 mb-4">¿Tienes dudas sobre lo que viste en el video? Pregúntame aquí.</p>
      
      <form onSubmit={handleAsk} className="ai-input-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe tu duda..."
          className="ai-input"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="ai-btn"
        >
          {loading ? '...' : 'Preguntar'}
        </button>
      </form>

      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gold/5 rounded-xl border border-gold/20 text-sm text-gray-200 leading-relaxed"
          >
            {response}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FREE_COURSE_CLASSES = [
  { id: 1, title: 'Clase 1: Introducción al Trading', videoId: 'kninYT2Gbo8' },
  { id: 2, title: 'Clase 2: Estructura de Mercado', videoId: '6eSc4iUBhps' },
  { id: 3, title: 'Clase 3: Soportes y Resistencias', videoId: 'dqJvl1o3TyE' },
  { id: 4, title: 'Clase 4: Gestión de Riesgo', videoId: 'Xr-DgZvRF5E' },
  { id: 5, title: 'Clase 5: Psicología del Trader', videoId: 'v_ocIcUnr98' },
  { id: 6, title: 'Clase 6: Análisis Técnico', videoId: 'Yc3INjWxYLs' },
  { id: 7, title: 'Clase 7: Operativa en Vivo', videoId: 'Dg9qsFKEfww' },
  { id: 8, title: 'Clase 8: Plan de Trading', videoId: 'fPcvtU-LIoE' },
  { id: 9, title: 'Clase 9: Conclusión y Siguiente Paso', videoId: 'tdSas36tIpE' },
];

const CursoBasicoPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center">
      <div className="max-w-7xl w-full">
        <div className="flex justify-start mb-8">
          <Link 
            to="/" 
            className="group inline-flex items-center gap-3 py-2 px-4 rounded-full bg-white/5 border border-white/10 text-gold hover:bg-gold hover:text-black transition-all duration-300 font-medium shadow-lg hover:shadow-gold/20"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span>Volver a la academia</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 w-full flex flex-col items-center"
        >
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            Curso básico – <span className="text-gold">Introducción al Trading</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed mb-10 text-center">
            Esta sección es para quienes están dando sus primeros pasos. Aquí aprenderás qué es el trading, cómo funcionan los mercados financieros y las bases necesarias antes de unirte a nuestra academia profesional.
          </p>

          <a 
            href="https://chat.whatsapp.com/GI8Az4IduIm7Xd5qaM23zS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-gold !inline-flex items-center gap-2 !py-4 !px-8"
          >
            <MessageCircle size={20} /> Unirse al grupo informativo
          </a>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 w-full justify-items-center">
          {FREE_COURSE_CLASSES.map((clase) => (
            <motion.div 
              key={clase.id}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-400/50 transition-all group w-full max-w-md backdrop-blur-md"
            >
              <div className="aspect-video bg-black relative">
                <iframe 
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${clase.videoId}`}
                  title={clase.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <div className="text-gold text-xs font-mono mb-2 uppercase tracking-widest">Módulo {clase.id}</div>
                <h3 className="font-bold text-lg group-hover:text-gold transition-colors">{clase.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center p-12 glass border-gold/20 rounded-3xl w-full max-w-4xl flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-4">¿Listo para el siguiente nivel?</h3>
          <p className="text-gray-400 mb-8 text-center">Si ya viste el curso básico, es momento de crear tu cuenta y empezar tu camino profesional.</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 w-full items-center">
            <a 
              href="https://chat.whatsapp.com/GI8Az4IduIm7Xd5qaM23zS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-gold !inline-flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <MessageCircle size={20} /> Unirse al grupo informativo
            </a>
            <Link to="/" state={{ openStep: 4 }} className="btn-outline w-full md:w-auto text-center">
              Continuar proceso de ingreso (Abrir cuenta Vantage)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainLanding = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [openStep, setOpenStep] = useState<number | null>(1);
  const [showVideo, setShowVideo] = useState<{ [key: number]: boolean }>({});
  const [selectedWallet, setSelectedWallet] = useState<string>('binance');
  const [userLevel, setUserLevel] = useState<'beginner' | 'experienced' | null>(null);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositInfo, setDepositInfo] = useState({ name: '', dni: '', file: null as File | null });
  const [isDepositSubmitted, setIsDepositSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openStep) {
      setOpenStep(location.state.openStep);
      // Ensure previous steps are marked as done if we're jumping to step 4
      if (location.state.openStep === 4 && !completedSteps.includes(3)) {
        setCompletedSteps([1, 2, 3]);
      }
      
      // Scroll to roadmap after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById('roadmap-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state]);

  const toggleStep = (id: number) => {
    const isFirstStep = id === 1;
    const isPreviousCompleted = completedSteps.includes(id - 1);
    
    if (isFirstStep || isPreviousCompleted || completedSteps.includes(id)) {
      setOpenStep(openStep === id ? null : id);
    }
  };

  const handleLevelSelection = (level: 'beginner' | 'experienced') => {
    setUserLevel(level);
    if (level === 'experienced') {
      setCompletedSteps([1, 2]);
      setOpenStep(3);
    } else {
      setCompletedSteps([1]);
      setOpenStep(2);
    }
  };

  const markAsDone = (id: number) => {
    if (id === 5 && !isDepositSubmitted) {
      alert("Por favor, completá el formulario de depósito exitoso para continuar.");
      setShowDepositForm(true);
      return;
    }
    if (!completedSteps.includes(id)) {
      setCompletedSteps([...completedSteps, id]);
      if (id < STEPS.length) {
        setOpenStep(id + 1);
      } else {
        setOpenStep(null);
      }
    }
  };

  const scrollToRoadmap = () => {
    const element = document.getElementById('roadmap-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const progress = (completedSteps.length / STEPS.length) * 100;
  const isAllDone = completedSteps.length === STEPS.length;

  return (
    <div className="min-h-screen">
      {/* HEADER / NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/Trading_Sin_Fronteras_Logo.png" 
              alt="TSF Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if logo.png is not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
              }}
            />
            <div className="fallback-logo hidden w-10 h-10 bg-accent-cyan rounded-xl flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20">
              <img src="/Trading_Sin_Fronteras_Logo.png" alt="TSF Logo" style={{width: '35px', height: '35px', objectFit: 'contain'}} />
              TSF
            </div>
            <span className="font-bold tracking-tight text-lg">Trading Sin Fronteras</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        </div>
        <a href="https://chat.whatsapp.com/GI8Az4IduIm7Xd5qaM23zS" target="_blank" rel="noopener noreferrer" className="btn-gold !py-2 !px-5 !text-xs">
          ÚNETE A NUESTRO GRUPO
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <img 
              src="/Trading_Sin_Fronteras_Logo.png" 
              alt="Trading Sin Fronteras Logo"
              className="w-48 md:w-64 h-auto drop-shadow-[0_0_15px_rgba(0,194,255,0.3)]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.hero-fallback-logo');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hero-fallback-logo hidden flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-accent-cyan/20 rounded-full flex items-center justify-center border border-accent-cyan/30 shadow-[0_0_30px_rgba(0,194,255,0.2)]">
                <Globe size={48} className="text-accent-cyan" />
              </div>
            </div>
          </div>

          <div className="logo-badge mb-8">
            <Zap size={14} className="text-accent-cyan" />
            <span>Sistema Institucional 2026</span>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
            <img src="/Trading_Sin_Fronteras_Logo.png" alt="Trading Sin Fronteras" style={{width: '140px', objectFit: 'contain'}} />
          </div>
          
          <h1>
            Convertite en un<br />
            <span>Trader de Élite</span>
          </h1>

          <p className="hero-sub">
            Seguí nuestra hoja de ruta certificada para dominar los mercados financieros con el método institucional. Todo lo que necesitás está aquí.
          </p>

          {/* PRESENTATION VIDEO */}
          <div className="w-full max-w-4xl mt-12 mb-12">
            <div className="video-wrap shadow-2xl shadow-gold/10">
              <div className="video-embed-container">
                {/* 
                  Note: The user provided https://meet.google.com/bzw-upjt-one 
                  which is a Google Meet link. Google Meet links cannot be embedded 
                  directly in an iframe for playback. 
                  Using a placeholder or the link if it's a recording, 
                  but standard Meet links won't work.
                */}
                <iframe 
                  src="https://www.youtube.com/embed/aoAtel7yXc8" 
                  title="Video de Presentación"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-10">
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={scrollToRoadmap}
                  className="btn-gold !py-4 !px-8 text-lg flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  Quiero ingresar a la academia
                </button>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Pasos para ser parte de nuestro equipo
                </span>
              </div>
            </div>
          </div>

          <div className="progress-bar-wrap group">
            <div className="progress-label">
              <span className="text-white font-bold">Tu progreso de inscripción</span>
              <span className="text-accent-cyan font-mono">{Math.round(progress)}% Completado</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 text-[10px] text-gray-500 font-mono text-center uppercase tracking-widest">
              {completedSteps.length} de {STEPS.length} pasos completados
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-40 grayscale">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} />
            <span className="text-sm font-mono uppercase tracking-widest">Broker Regulado</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span className="text-sm font-mono uppercase tracking-widest">+700 Alumnos</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={20} />
            <span className="text-sm font-mono uppercase tracking-widest">Señales VIP</span>
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <div className="roadmap" id="roadmap-section">
        <div className="section-label">Hoja de Ruta de Aprendizaje</div>

        <div className="flex flex-col">
          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isOpen = openStep === step.id;
            const isFirstStep = step.id === 1;
            const isPreviousCompleted = completedSteps.includes(step.id - 1);
            const isLocked = !isFirstStep && !isPreviousCompleted && !isCompleted;
            const isActive = openStep === step.id || (!isCompleted && isPreviousCompleted) || (isFirstStep && !isCompleted);

            return (
              <div 
                key={step.id} 
                className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''} ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
                <div 
                  className="step-header"
                  onClick={() => !isLocked && toggleStep(step.id)}
                >
                  <div className="step-num">
                    {isLocked ? <Lock size={14} /> : (isCompleted ? <Check size={18} /> : step.id)}
                  </div>
                  <div className="step-title-wrap">
                    <div className="step-tag">{step.tag}</div>
                    <div className="step-title">{step.title}</div>
                  </div>
                  <ChevronDown className="step-chevron" size={20} />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="step-inner">
                        <p className="step-desc">{step.description}</p>

                        {step.id === 1 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <button 
                              onClick={() => handleLevelSelection('experienced')}
                              className={`group relative p-8 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col gap-6 overflow-hidden ${
                                userLevel === 'experienced' 
                                ? 'border-accent-cyan bg-accent-cyan/10 shadow-[0_0_30px_rgba(0,194,255,0.2)] scale-[1.02]' 
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${
                                  userLevel === 'experienced' 
                                  ? 'bg-accent-cyan text-white shadow-[0_0_25px_rgba(0,194,255,0.5)] rotate-[10deg]' 
                                  : 'bg-white/10 text-gray-400 group-hover:bg-accent-cyan/20 group-hover:text-accent-cyan'
                                }`}>
                                  🚀
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  userLevel === 'experienced' 
                                  ? 'border-accent-cyan bg-accent-cyan' 
                                  : 'border-white/20'
                                }`}>
                                  {userLevel === 'experienced' && <Check size={14} className="text-white" />}
                                </div>
                              </div>
                              
                              <div className="relative z-10">
                                <div className={`font-bold text-2xl mb-2 transition-colors ${userLevel === 'experienced' ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                  Tengo experiencia
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                  Ya opero en los mercados reales y conozco los conceptos técnicos básicos.
                                </p>
                              </div>

                              <div className={`mt-2 py-3 px-6 rounded-xl font-bold text-center transition-all ${
                                userLevel === 'experienced'
                                ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/20'
                                : 'bg-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-white'
                              }`}>
                                {userLevel === 'experienced' ? 'SELECCIONADO' : 'ELEGIR ESTA OPCIÓN'}
                              </div>

                              {userLevel === 'experienced' && (
                                <motion.div 
                                  layoutId="active-glow-1"
                                  className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/10 via-transparent to-transparent pointer-events-none"
                                />
                              )}
                            </button>

                            <button 
                              onClick={() => handleLevelSelection('beginner')}
                              className={`group relative p-8 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col gap-6 overflow-hidden ${
                                userLevel === 'beginner' 
                                ? 'border-accent-cyan bg-accent-cyan/10 shadow-[0_0_30px_rgba(0,194,255,0.2)] scale-[1.02]' 
                                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${
                                  userLevel === 'beginner' 
                                  ? 'bg-accent-cyan text-white shadow-[0_0_25px_rgba(0,194,255,0.5)] rotate-[10deg]' 
                                  : 'bg-white/10 text-gray-400 group-hover:bg-accent-cyan/20 group-hover:text-accent-cyan'
                                }`}>
                                  🌱
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  userLevel === 'beginner' 
                                  ? 'border-accent-cyan bg-accent-cyan' 
                                  : 'border-white/20'
                                }`}>
                                  {userLevel === 'beginner' && <Check size={14} className="text-white" />}
                                </div>
                              </div>
                              
                              <div className="relative z-10">
                                <div className={`font-bold text-2xl mb-2 transition-colors ${userLevel === 'beginner' ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                                  Soy principiante
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                  Quiero empezar mi formación desde cero absoluto con acompañamiento.
                                </p>
                              </div>

                              <div className={`mt-2 py-3 px-6 rounded-xl font-bold text-center transition-all ${
                                userLevel === 'beginner'
                                ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/20'
                                : 'bg-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-white'
                              }`}>
                                {userLevel === 'beginner' ? 'SELECCIONADO' : 'ELEGIR ESTA OPCIÓN'}
                              </div>

                              {userLevel === 'beginner' && (
                                <motion.div 
                                  layoutId="active-glow-2"
                                  className="absolute inset-0 bg-gradient-to-tr from-accent-cyan/10 via-transparent to-transparent pointer-events-none"
                                />
                              )}
                            </button>
                          </div>
                        ) : step.id === 5 ? (
                          <div className="mt-10 space-y-10">
                            {/* Recommended Method Card */}
                            <div className="relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                              <div className="relative bg-white/[0.03] border border-gold/30 p-8 rounded-[32px] backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-3xl shadow-inner border border-gold/20 shrink-0">
                                  🔐
                                </div>
                                <div className="text-center md:text-left">
                                  <div className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Sugerencia del equipo</div>
                                  <h4 className="text-xl font-bold text-white mb-2">Método Recomendado: Criptomonedas</h4>
                                  <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                                    Es la forma más rápida, económica y segura para fondear tu cuenta desde cualquier país. 
                                    Seleccioná tu billetera debajo para ver los tutoriales paso a paso.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Wallet Selection Buttons */}
                            <div className="space-y-8">
                              <div className="flex flex-col gap-6">
                                <span className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold ml-1">Seleccioná tu plataforma para ver el tutorial</span>
                                <div className="flex flex-wrap gap-4">
                                  {WALLETS.map((wallet) => (
                                    <button
                                      key={wallet.id}
                                      onClick={() => setSelectedWallet(wallet.id)}
                                      className={`px-8 py-4 rounded-2xl text-base font-bold transition-all flex items-center gap-3 border-2 ${
                                        selectedWallet === wallet.id 
                                        ? 'bg-gold border-gold text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] scale-105 z-10' 
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-white hover:-translate-y-1'
                                      }`}
                                    >
                                      <span className="text-2xl">{wallet.icon}</span>
                                      {wallet.name}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Tutorials List */}
                              <div className="grid gap-12">
                                {WALLETS.find(w => w.id === selectedWallet)?.tutorials.map((tutorial, idx) => (
                                  <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-6"
                                  >
                                    <div className="flex items-center gap-5">
                                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black text-sm shadow-lg">
                                        {idx + 1}
                                      </div>
                                      <h4 className="font-bold text-xl text-white tracking-tight">{tutorial.title}</h4>
                                    </div>
                                    
                                    <div className="video-wrap group/video overflow-hidden rounded-[32px] border border-white/10 bg-black/40">
                                      <div className="video-embed-container aspect-video">
                                        <iframe 
                                          src={tutorial.videoUrl} 
                                          title={tutorial.title}
                                          className="w-full h-full"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                          allowFullScreen
                                        />
                                      </div>
                                    </div>

                                    <div className="px-2">
                                      <VideoAssistant 
                                        stepTitle={`${WALLETS.find(w => w.id === selectedWallet)?.name} - ${tutorial.title}`} 
                                        stepDescription={`Tutorial detallado de fondeo utilizando la plataforma ${WALLETS.find(w => w.id === selectedWallet)?.name}.`} 
                                        stepBullets={[tutorial.title]} 
                                      />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {step.videos ? (
                              <div className="space-y-6 mb-8">
                                {step.videos.map((vid, vIdx) => (
                                  <div key={vIdx} className="video-wrap !mb-0">
                                    <div className="text-gold text-[10px] font-mono uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                                      <div className="w-1 h-1 bg-gold rounded-full" />
                                      {vid.title}
                                    </div>
                                    {!showVideo[`${step.id}-${vIdx}`] ? (
                                      <div 
                                        className="video-placeholder"
                                        onClick={() => setShowVideo({ ...showVideo, [`${step.id}-${vIdx}`]: true })}
                                      >
                                        <div className="play-btn">
                                          <Play fill="currentColor" size={28} />
                                        </div>
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-gold/60">Tutorial Exclusivo</div>
                                        <div className="text-sm font-semibold">Reproducir {vid.title}</div>
                                      </div>
                                    ) : (
                                      <div className="video-embed-container">
                                        <iframe 
                                          src={vid.url} 
                                          title={vid.title}
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                          allowFullScreen
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : step.videoUrl ? (
                              <div className="video-wrap">
                                {!showVideo[step.id] ? (
                                  <div 
                                    className="video-placeholder"
                                    onClick={() => setShowVideo({ ...showVideo, [step.id]: true })}
                                  >
                                    <div className="play-btn">
                                      <Play fill="currentColor" size={28} />
                                    </div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-gold/60">Tutorial Exclusivo</div>
                                    <div className="text-sm font-semibold">Reproducir video del paso</div>
                                  </div>
                                ) : (
                                  <div className="video-embed-container">
                                    <iframe 
                                      src={step.videoUrl} 
                                      title={step.title}
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                    />
                                  </div>
                                )}
                              </div>
                            ) : null}

                            <ul className="check-list">
                              {step.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>

                            {(step.videoUrl || step.videos) && (
                              <VideoAssistant 
                                stepTitle={step.title} 
                                stepDescription={step.description} 
                                stepBullets={step.bullets} 
                              />
                            )}
                          </>
                        )}

                        {step.id === 3 && (
                          <div className="mt-10 -mb-4">
                            <span className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold ml-1">Descarga la App Educativa de TSF</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-6 mt-8">
                          {step.buttons.map((btn, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                              <button 
                                onClick={(e) => {
                                  if (step.id === 5 && btn.label === 'DEPÓSITO EXITOSO') {
                                    e.preventDefault();
                                    setShowDepositForm(true);
                                  } else if (btn.href.startsWith('/')) {
                                    navigate(btn.href);
                                  } else if (btn.href !== '#') {
                                    window.open(btn.href, '_blank');
                                  }
                                }}
                                className={btn.primary ? 'btn-gold' : 'btn-outline'}
                              >
                                {btn.label}
                              </button>
                              {btn.subLabel && (
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">
                                  {btn.subLabel}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {step.id === 5 && showDepositForm && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 p-10 md:p-16 bg-white/[0.03] border border-white/10 rounded-[40px] shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                          >
                            {/* Decorative background element */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl"></div>
                            
                            <h4 className="text-2xl font-bold mb-12 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-inner">
                                <span className="text-2xl">📄</span>
                              </div>
                              Verificación de Depósito
                            </h4>
                            
                            <div className="space-y-12">
                              <div className="group">
                                <label className="block text-xs text-gold/50 mb-4 uppercase tracking-[0.3em] font-bold ml-1">Nombre Completo</label>
                                <input 
                                  type="text" 
                                  placeholder="Ej: Juan Pérez"
                                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-base focus:border-gold outline-none transition-all focus:ring-1 focus:ring-gold/20 placeholder:text-gray-600"
                                  value={depositInfo.name}
                                  onChange={(e) => setDepositInfo({ ...depositInfo, name: e.target.value })}
                                />
                              </div>
                              
                              <div className="group">
                                <label className="block text-xs text-gold/50 mb-4 uppercase tracking-[0.3em] font-bold ml-1">DNI / Pasaporte</label>
                                <input 
                                  type="text" 
                                  placeholder="Ej: 12.345.678"
                                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-base focus:border-gold outline-none transition-all focus:ring-1 focus:ring-gold/20 placeholder:text-gray-600"
                                  value={depositInfo.dni}
                                  onChange={(e) => setDepositInfo({ ...depositInfo, dni: e.target.value })}
                                />
                              </div>
                              
                              <div className="group">
                                <label className="block text-xs text-gold/50 mb-5 uppercase tracking-[0.3em] font-bold ml-1 leading-relaxed">Captura de pantalla de tu depósito</label>
                                <div className="relative">
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    id="file-upload"
                                    onChange={(e) => setDepositInfo({ ...depositInfo, file: e.target.files?.[0] || null })}
                                  />
                                  <label 
                                    htmlFor="file-upload"
                                    className="w-full bg-black/60 border-2 border-dashed border-white/5 rounded-[32px] px-8 py-16 text-sm flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-gold/30 hover:bg-gold/[0.02] transition-all group/upload"
                                  >
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:bg-gold/10 transition-all duration-500">
                                      <span className="text-4xl">📤</span>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-lg text-white font-medium mb-2">{depositInfo.file ? depositInfo.file.name : 'Seleccionar archivo'}</p>
                                      <p className="text-gray-500 text-sm tracking-wide">Formatos aceptados: JPG, PNG, PDF</p>
                                    </div>
                                  </label>
                                </div>
                              </div>
                              <button 
                                onClick={async () => {
                                  if (depositInfo.name && depositInfo.dni && depositInfo.file) {
                                    setIsUploading(true);
                                    try {
                                      let fileUrl = 'No se pudo generar link (enviar manualmente)';
                                      
                                      try {
                                        const formData = new FormData();
                                        formData.append('file', depositInfo.file);
                                        
                                        // Try tmpfiles.org which is often more CORS-friendly
                                        const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
                                          method: 'POST',
                                          body: formData
                                        });
                                        
                                        if (uploadRes.ok) {
                                          const uploadData = await uploadRes.json();
                                          if (uploadData.status === 'success') {
                                            // Convert to direct download link if possible
                                            fileUrl = uploadData.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
                                          }
                                        }
                                      } catch (uploadErr) {
                                        console.error("Primary upload failed, trying fallback...", uploadErr);
                                        // Fallback to file.io if tmpfiles fails
                                        try {
                                          const formData = new FormData();
                                          formData.append('file', depositInfo.file);
                                          const fallbackRes = await fetch('https://file.io', {
                                            method: 'POST',
                                            body: formData
                                          });
                                          if (fallbackRes.ok) {
                                            const fallbackData = await fallbackRes.json();
                                            fileUrl = fallbackData.link;
                                          }
                                        } catch (fallbackErr) {
                                          console.error("All uploads failed", fallbackErr);
                                        }
                                      }

                                      const message = `Hola! Acabo de realizar mi depósito exitoso.%0A%0A*Datos de verificación:*%0A- Nombre: ${depositInfo.name}%0A- DNI: ${depositInfo.dni}%0A- Comprobante: ${fileUrl}%0A%0APlazo de respuesta hasta 24 hs.%0A%0A*IMPORTANTE:* Ahora vuelvo a la página para continuar con la integración de MetaTrader 5 y TradingView, herramientas que utilizaremos todos los días.`;
                                      const whatsappUrl = `https://wa.me/541135719765?text=${message}`;
                                      
                                      window.open(whatsappUrl, '_blank');
                                      
                                      setIsDepositSubmitted(true);
                                      setShowDepositForm(false);
                                      markAsDone(5);
                                    } catch (error) {
                                      console.error("Process error:", error);
                                      alert("Hubo un problema al procesar la información. Por favor intenta de nuevo.");
                                    } finally {
                                      setIsUploading(false);
                                    }
                                  } else {
                                    alert("Por favor completá todos los campos y adjuntá el comprobante.");
                                  }
                                }}
                                disabled={isUploading}
                                className="w-full btn-gold !py-6 text-lg font-bold shadow-2xl shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                              >
                                {isUploading ? 'Procesando comprobante...' : 'Enviar y Verificar'}
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {step.id !== 1 && (
                          <button 
                            className="btn-done"
                            onClick={() => markAsDone(step.id)}
                          >
                            {isCompleted ? <Check size={16} className="inline mr-2" /> : null}
                            {isCompleted ? 'Paso Completado' : step.doneLabel}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* APP DOWNLOAD SECTION */}
        <section className="mt-24 p-12 glass border-white/5 rounded-[32px] text-center">
          <div className="section-label">📱 Nuestra App Oficial</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Llevá la Academia en tu Bolsillo</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">
            Accedé a todo nuestro sistema educativo, señales en tiempo real y comunidad desde nuestra aplicación oficial. Disponible para todos tus dispositivos.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://play.google.com/store/apps/details?id=ar.digitalpower.tsf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 hover:border-gold/50 transition-all group"
            >
              <div className="text-3xl">🤖</div>
              <div className="text-left">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Disponible en</div>
                <div className="font-bold group-hover:text-gold transition-colors">Google Play</div>
              </div>
            </a>
            <a 
              href="https://apps.apple.com/ar/app/trading-sin-fronteras/id6757570567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 hover:border-gold/50 transition-all group"
            >
              <div className="text-3xl">🍎</div>
              <div className="text-left">
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Disponible en</div>
                <div className="font-bold group-hover:text-gold transition-colors">App Store</div>
              </div>
            </a>
          </div>
        </section>

        {/* COMPLETION BANNER */}
        <AnimatePresence>
          {isAllDone && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 p-12 glass border-gold/30 rounded-[32px] text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full -z-10" />
              <div className="text-6xl mb-6">🏆</div>
              <h3 className="text-3xl font-bold mb-4">¡Felicidades, Trader!</h3>
              <p className="text-gray-400 max-width-xl mx-auto mb-8">
                Completaste con éxito la hoja de ruta institucional. Ahora sos parte de la élite de Trading Sin Fronteras. Tu camino hacia la rentabilidad comienza hoy.
              </p>
              <a href="https://wa.me/541135719765" className="btn-gold !py-5 !px-10 !text-lg">
                🚀 Acceder a la Comunidad VIP
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center text-black font-bold text-xs">TSF</div>
          <span className="font-bold tracking-tight">Trading Sin Fronteras</span>
        </div>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed mb-4">
          &copy; 2026 Trading Sin Fronteras Academy. Todos los derechos reservados. El trading conlleva riesgos. Operá con responsabilidad.
        </p>
        <a 
          href="https://tradingsinfronteras.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gold hover:text-white transition-colors font-medium"
        >
          www.tradingsinfronteras.com
        </a>
      </footer>

      {/* WHATSAPP FLOAT */}
      <div className="wa-float">
        <a 
          href={`https://wa.me/541135719765?text=${encodeURIComponent('Hola! Mi nombre es [ ] y necesito ayuda con el proceso.')}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 group"
        >
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
            className="wa-bubble group-hover:scale-105 transition-transform"
          >
            ¿Dudas con el proceso?<br />
            Hablá con un asesor
          </motion.div>
          <div className="wa-btn group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="trading-bg-container">
        <div className="grid-layer"></div>
        <div className="candles-layer"></div>
        <div className="lines-layer"></div>
      </div>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/curso-basico" element={<CursoBasicoPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
