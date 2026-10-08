import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  BookOpen,
  Send,
  Upload,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Palette
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import cyberpunkHemantImage from './WhatsApp Image 2026-10-07 at 4.13.51 PM.jpeg';
import normalHemantImage from './WhatsApp Image 2026-10-07 at 4.19.26 PM.jpeg';

// The two uploaded portrait images for Hemant Kumar Mukhiya
const CYBERPUNK_HEMANT_IMAGE = cyberpunkHemantImage;
const NORMAL_HEMANT_IMAGE = normalHemantImage;

interface ArcConfig {
  r: number;
  startDeg: number;
  endDeg: number;
  dotDeg: number;
  statNumber: string;
  statSuffix: string;
  statLabel: string;
}

// Portfolio statistics on concentric arcs
const PORTFOLIO_ARCS: ArcConfig[] = [
  {
    r: 330,
    startDeg: -92,
    endDeg: 16,
    dotDeg: -46,
    statNumber: '04',
    statSuffix: '+',
    statLabel: 'YEARS CREATIVE WORK',
  },
  {
    r: 395,
    startDeg: -56,
    endDeg: 60,
    dotDeg: 2,
    statNumber: '03',
    statSuffix: '+',
    statLabel: 'DESIGN TOOLS',
  },
  {
    r: 460,
    startDeg: -14,
    endDeg: 72,
    dotDeg: 44,
    statNumber: '2026',
    statSuffix: '',
    statLabel: 'B.TECH GRADUATE',
  },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Matched Image Pair State (persisted in localStorage)
  // IMAGE 1 = Cyberpunk / Armored version of Hemant (Base Layer)
  // IMAGE 2 = Normal professional shirt version of Hemant (Reveal Layer)
  const [baseImage, setBaseImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hemant_portrait_cyber');
      if (saved && saved.startsWith('data:')) return saved;
      return CYBERPUNK_HEMANT_IMAGE;
    } catch {
      return CYBERPUNK_HEMANT_IMAGE;
    }
  });

  const [revealImage, setRevealImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hemant_portrait_normal');
      if (saved && saved.startsWith('data:')) return saved;
      return NORMAL_HEMANT_IMAGE;
    } catch {
      return NORMAL_HEMANT_IMAGE;
    }
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [formSent, setFormSent] = useState(false);

  // Parallax grid pattern offset
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });

  // Refs for animation loop & canvas
  const heroRef = useRef<HTMLDivElement>(null);
  const revealDivRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputCyberRef = useRef<HTMLInputElement>(null);
  const fileInputNormalRef = useRef<HTMLInputElement>(null);

  // Coordinates refs for single rAF loop
  const mousePosRef = useRef({ x: -999, y: -999, targetNormX: 0.5, targetNormY: 0.5 });
  const smoothedMouseRef = useRef({ x: -999, y: -999 });
  const smoothedGridRef = useRef({ x: 0, y: 0 });

  // Single rAF loop for parallax and cursor spotlight mask
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = -999;
      let clientY = -999;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      mousePosRef.current.x = clientX;
      mousePosRef.current.y = clientY;
      mousePosRef.current.targetNormX = Math.max(0, Math.min(1, clientX / window.innerWidth));
      mousePosRef.current.targetNormY = Math.max(0, Math.min(1, clientY / window.innerHeight));
    };

    const onPointerLeave = () => {
      mousePosRef.current.x = -999;
      mousePosRef.current.y = -999;
      mousePosRef.current.targetNormX = 0.5;
      mousePosRef.current.targetNormY = 0.5;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchstart', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);

    const loop = () => {
      const realMouse = mousePosRef.current;
      const smooth = smoothedMouseRef.current;
      const grid = smoothedGridRef.current;

      // Cursor smoothing: lerp factor 0.1 toward real mouse position
      smooth.x += (realMouse.x - smooth.x) * 0.1;
      smooth.y += (realMouse.y - smooth.y) * 0.1;

      // Parallax grid: target = (normalized cursor position − 0.5) × 16px, eased at 0.06 lerp
      const targetGridX = (realMouse.targetNormX - 0.5) * 16;
      const targetGridY = (realMouse.targetNormY - 0.5) * 16;
      grid.x += (targetGridX - grid.x) * 0.06;
      grid.y += (targetGridY - grid.y) * 0.06;

      setGridOffset({ x: grid.x, y: grid.y });

      // Spotlight mask generation via hidden canvas
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Only draw circle if smoothed cursor is inside or near viewport
      if (smooth.x > -300 && smooth.x < width + 300 && smooth.y > -300 && smooth.y < height + 300) {
        const radius = 260;
        const grad = ctx.createRadialGradient(smooth.x, smooth.y, 0, smooth.x, smooth.y, radius);
        // Stops: 0→1, 0.4→1, 0.6→0.75, 0.75→0.4, 0.88→0.12, 1→0
        grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.4, 'rgba(0, 0, 0, 1)');
        grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.75)');
        grad.addColorStop(0.75, 'rgba(0, 0, 0, 0.4)');
        grad.addColorStop(0.88, 'rgba(0, 0, 0, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(smooth.x, smooth.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (revealDivRef.current) {
          const maskUrl = canvas.toDataURL();
          revealDivRef.current.style.maskImage = `url("${maskUrl}")`;
          revealDivRef.current.style.webkitMaskImage = `url("${maskUrl}")`;
          revealDivRef.current.style.maskSize = '100% 100%';
          revealDivRef.current.style.webkitMaskSize = '100% 100%';
        }
      } else if (revealDivRef.current) {
        revealDivRef.current.style.maskImage = 'none';
        revealDivRef.current.style.webkitMaskImage = 'none';
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchstart', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeave);
    };
  }, []);

  // Handle local file uploads for Hemant's matched portrait images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isCyber: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isCyber) {
        setBaseImage(dataUrl);
        try {
          localStorage.setItem('hemant_portrait_cyber', dataUrl);
        } catch {}
      } else {
        setRevealImage(dataUrl);
        try {
          localStorage.setItem('hemant_portrait_normal', dataUrl);
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  };

  // Nav Links
  const navItems = [
    { label: 'HOME', href: '#home' },
    { label: 'ABOUT', href: '#about' },
    { label: 'SKILLS', href: '#skills' },
    { label: 'EXPERIENCE', href: '#experience' },
    { label: 'EDUCATION', href: '#education' },
    { label: 'PORTFOLIO', href: '#portfolio' },
    { label: 'CONTACT', href: '#contact' },
  ];

  // Arc mathematical center: (-110, 300)
  const cx = -110;
  const cy = 300;

  // Selected work categories & cards
  const portfolioProjects = [
    {
      title: 'Visual Identity & Branding Concept',
      category: 'BRANDING',
      desc: 'Complete brand guidelines, custom geometric typography, color palette, and stationary systems.',
      tags: ['Branding', 'Adobe Illustrator', 'Identity'],
    },
    {
      title: 'High-Impact Social Media Creatives',
      category: 'SOCIAL MEDIA DESIGN',
      desc: 'Multi-platform creative assets optimized for Facebook, Instagram & LinkedIn engagement.',
      tags: ['Social Media', 'Photoshop', 'Canva'],
    },
    {
      title: 'Corporate Marketing Collateral Suite',
      category: 'MARKETING COLLATERAL',
      desc: 'Brochures, event roll-up banners, pitch decks and promotional print materials.',
      tags: ['Print & Digital', 'Advertising', 'Illustrator'],
    },
    {
      title: 'Digital Ad Campaigns & Banner Systems',
      category: 'DIGITAL DESIGN',
      desc: 'Performance marketing ad creatives, web headers and visual storytelling layouts.',
      tags: ['Digital Content', 'Photoshop', 'Creative Direction'],
    },
    {
      title: 'Academic & Institutional Event Branding',
      category: 'BRANDING',
      desc: 'End-to-end promotional assets for Government Engineering College symposiums and events.',
      tags: ['Buxar College', 'Visual Assets', 'Photoshop'],
    },
    {
      title: 'Editorial & Typography Layout System',
      category: 'MARKETING COLLATERAL',
      desc: 'Clean, structured magazine & catalog design combining technical precision with modern aesthetics.',
      tags: ['Editorial', 'Layout Design', 'Illustrator'],
    },
  ];

  const filteredProjects =
    activeCategory === 'ALL'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory);

  return (
    <div
      className="min-h-screen bg-[#070709] tracking-[-0.02em] select-none text-gray-100 overflow-x-hidden relative"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Hidden full-window canvas used to generate dynamic radial gradient mask */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* FIXED NAVBAR (fixed, z-50) */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:justify-center p-4 sm:p-5 pointer-events-none">
        {/* Mobile Left: Logo Pill */}
        <a
          href="#home"
          className="md:hidden pointer-events-auto bg-black/75 backdrop-blur-md rounded-full px-3.5 py-2 flex items-center gap-2 nav-drop shadow-lg shadow-black/40 border border-white/10"
        >
          <svg
            className="w-[18px] h-[18px] fill-white"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Hemant Portfolio Mark"
          >
            <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
          </svg>
          <span className="text-xs font-semibold tracking-wider text-white">HKM</span>
        </a>

        {/* Desktop: ONE centered pill */}
        <div className="hidden md:flex pointer-events-auto bg-black/65 backdrop-blur-md rounded-full pl-3.5 pr-2 py-1.5 items-center gap-1 nav-drop shadow-xl shadow-black/40 border border-white/10">
          {/* Logo Mark SVG (22x22, geometric angular mark) */}
          <a href="#home" className="mr-2 flex items-center gap-1.5 group cursor-pointer">
            <svg
              className="w-[20px] h-[20px] fill-white group-hover:fill-amber-400 transition-colors"
              viewBox="0 0 256 256"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Hemant Portfolio Logo"
            >
              <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
            </svg>
            <span className="text-xs font-bold text-white tracking-wider">HEMANT</span>
          </a>

          {/* Nav text links */}
          {navItems.map((item) => {
            const isActive = activeSection === item.label.toLowerCase();
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveSection(item.label.toLowerCase())}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/20'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}

          {/* White CTA "Contact" */}
          <a
            href="#contact"
            className="bg-white text-gray-950 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 ml-1 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
          >
            LET'S TALK
          </a>
        </div>

        {/* Mobile Right: Hamburger toggle pill */}
        <div className="md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-black/75 backdrop-blur-md rounded-full p-2.5 text-white flex items-center justify-center nav-drop border border-white/10 shadow-lg shadow-black/30 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 pt-20 pb-6 px-5 shadow-2xl bg-[#0c0c10] border-b border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => {
                  setActiveSection(item.label.toLowerCase());
                  setMobileMenuOpen(false);
                }}
                className="text-left py-3 border-b border-white/10 text-gray-300 font-medium text-sm hover:text-amber-400 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-[10px] text-gray-500 font-mono">→</span>
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-4 bg-white text-black text-xs font-bold py-3 rounded-full text-center hover:bg-gray-200 transition-colors shadow-md cursor-pointer uppercase tracking-wider"
            >
              Contact Hemant
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO SECTION (100dvh, relative overflow-hidden)
          Preserves the exact cursor reveal interaction & concentric arcs
          ========================================================================= */}
      <section
        id="home"
        ref={heroRef}
        className="h-[100dvh] relative overflow-hidden bg-black select-none"
      >
        {/* LAYER 1: Grid background (z-0) with mouse parallax */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-10 z-0"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="cyber-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
              x={gridOffset.x}
              y={gridOffset.y}
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        </svg>

        {/* LAYER 2: Base Image (z-10) — IMAGE 1: Cyberpunk/Armored Version of Hemant
            CRITICAL REQUIREMENT: Both base and reveal layers occupy EXACT SAME dimensions,
            exact same background-size ('cover'), background-position ('center') with no scale offset. */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover pointer-events-none"
          style={{
            backgroundImage: `url("${baseImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Subtle dark gradient overlay to ensure text contrast while preserving imagery */}
        <div
          className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/95 via-black/40 to-black/35"
          aria-hidden="true"
        />

        {/* LAYER 3: Cursor Spotlight Reveal Layer (z-30) — IMAGE 2: Normal Professional Shirt Version of Hemant
            CRITICAL REQUIREMENT: Exact same positioning, zero transform jump, mask-image tracks smoothed cursor. */}
        <div
          ref={revealDivRef}
          className="absolute inset-0 z-30 bg-center bg-cover pointer-events-none transition-[opacity] duration-150"
          style={{
            backgroundImage: `url("${revealImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />

        {/* LAYER 4: Stats on a fading circular arc (z-50, hidden below sm) */}
        <div className="absolute inset-y-0 right-0 pointer-events-none hidden sm:block z-50">
          <svg
            viewBox="0 0 380 700"
            preserveAspectRatio="xMaxYMid meet"
            className="h-full w-auto"
            aria-hidden="true"
          >
            <defs>
              {PORTFOLIO_ARCS.map((arc, i) => {
                const sRad = (arc.startDeg * Math.PI) / 180;
                const eRad = (arc.endDeg * Math.PI) / 180;
                const sx = cx + arc.r * Math.cos(sRad);
                const sy = cy + arc.r * Math.sin(sRad);
                const ex = cx + arc.r * Math.cos(eRad);
                const ey = cy + arc.r * Math.sin(eRad);

                return (
                  <linearGradient
                    key={`arc-grad-${i}`}
                    id={`arcGradient-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={sx}
                    y1={sy}
                    x2={ex}
                    y2={ey}
                  >
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="22%" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.5" />
                    <stop offset="85%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                );
              })}
            </defs>

            {PORTFOLIO_ARCS.map((arc, i) => {
              const sRad = (arc.startDeg * Math.PI) / 180;
              const eRad = (arc.endDeg * Math.PI) / 180;
              const dotRad = (arc.dotDeg * Math.PI) / 180;

              const sx = cx + arc.r * Math.cos(sRad);
              const sy = cy + arc.r * Math.sin(sRad);
              const ex = cx + arc.r * Math.cos(eRad);
              const ey = cy + arc.r * Math.sin(eRad);

              const dotX = cx + arc.r * Math.cos(dotRad);
              const dotY = cy + arc.r * Math.sin(dotRad);

              const deltaRad = ((arc.endDeg - arc.startDeg) * Math.PI) / 180;
              const arcLen = arc.r * deltaRad;

              const lineDelay = 0.4 + i * 0.22;
              const dotDelay = lineDelay + 0.9;
              const ringDelay = dotDelay + 0.3;
              const numberDelay = dotDelay + 0.15;
              const labelDelay = dotDelay + 0.3;

              const pathD = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${arc.r} ${arc.r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;

              return (
                <g key={`arc-group-${i}`}>
                  {/* Concentric stroke arc */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={`url(#arcGradient-${i})`}
                    strokeWidth="1.1"
                    className="arc-line"
                    style={
                      {
                        '--len': `${arcLen.toFixed(1)}px`,
                        animationDelay: `${lineDelay.toFixed(2)}s`,
                      } as React.CSSProperties
                    }
                  />

                  {/* Pulsing ring around dot */}
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="7"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    className="arc-ring"
                    style={{
                      animationDelay: `${ringDelay.toFixed(2)}s`,
                    }}
                  />

                  {/* Solid dot */}
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="3.4"
                    fill="white"
                    className="arc-dot"
                    style={{
                      animationDelay: `${dotDelay.toFixed(2)}s`,
                    }}
                  />

                  {/* Number Stat text at dot + (16, 4) */}
                  <text
                    x={dotX + 16}
                    y={dotY + 4}
                    fill="white"
                    fontSize="30"
                    fontWeight="700"
                    letterSpacing="-1px"
                    className="arc-text font-helvetica-neue"
                    style={{
                      animationDelay: `${numberDelay.toFixed(2)}s`,
                    }}
                  >
                    {arc.statNumber}
                    {arc.statSuffix && (
                      <tspan fontSize="18" dy="-9">
                        {arc.statSuffix}
                      </tspan>
                    )}
                  </text>

                  {/* Uppercase Label at dot + (18, 22) */}
                  <text
                    x={dotX + 18}
                    y={dotY + 22}
                    fill="white"
                    fillOpacity="0.85"
                    fontSize="8.5"
                    fontWeight="600"
                    letterSpacing="2px"
                    className="arc-text uppercase"
                    style={{
                      animationDelay: `${labelDelay.toFixed(2)}s`,
                    }}
                  >
                    {arc.statLabel}
                  </text>
                </g>
              );
            })}

            {/* Region Callout Indicator: BIHAR / INDIA */}
            <g>
              <circle
                cx={255}
                cy={620}
                r="3"
                fill="#f59e0b"
                className="arc-dot"
                style={{ animationDelay: '1.8s' }}
              />
              <circle
                cx={255}
                cy={620}
                r="6.5"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="0.8"
                strokeOpacity="0.4"
                className="arc-ring"
                style={{ animationDelay: '2.0s' }}
              />
              <text
                x={268}
                y={623}
                fill="white"
                fontSize="12"
                fontWeight="700"
                letterSpacing="1px"
                className="arc-text"
                style={{ animationDelay: '1.9s' }}
              >
                BIHAR <tspan fill="#f59e0b" fontSize="10">/ INDIA</tspan>
              </text>
            </g>
          </svg>
        </div>

        {/* LAYER 5: Hero Text Block (z-50) */}
        <div className="absolute bottom-10 sm:bottom-14 md:bottom-20 left-5 sm:left-8 md:left-12 max-w-[340px] sm:max-w-lg z-50 text-white">
          {/* Eyebrow & Location */}
          <div
            className="hero-rise flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.14em] text-amber-400 uppercase mb-2.5 sm:mb-3"
            style={{ animationDelay: '0.15s' }}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>GRAPHIC DESIGNER • DARBHANGA, BIHAR</span>
          </div>

          {/* H1 Heading: HEMANT KUMAR MUKHIYA */}
          <h1
            className="hero-rise text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.07em] font-extrabold text-white mb-3 sm:mb-4"
            style={{ animationDelay: '0.3s' }}
          >
            HEMANT<br />
            KUMAR<br />
            MUKHIYA
          </h1>

          {/* Subtitle / Quote */}
          <p
            className="hero-rise text-xs sm:text-sm md:text-[15px] text-white/90 leading-relaxed mb-6 sm:mb-7 font-light max-w-md backdrop-blur-xs"
            style={{ animationDelay: '0.5s' }}
          >
            "Designing visual identities, digital experiences and creative content
            that make brands stand out."
          </p>

          {/* Hero CTA Buttons: VIEW PORTFOLIO / CONTACT ME */}
          <div
            className="hero-rise flex flex-wrap items-center gap-3"
            style={{ animationDelay: '0.7s' }}
          >
            <a
              href="#portfolio"
              className="group relative overflow-hidden bg-white text-gray-950 text-xs sm:text-sm font-semibold px-6 sm:px-7 py-3 rounded-full shadow-lg shadow-black/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 flex items-center gap-2 cursor-pointer border border-white/60"
            >
              <span className="relative z-10 uppercase tracking-wider">View Portfolio</span>
              {/* Shine sweep */}
              <span
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
                aria-hidden="true"
              />
            </a>

            <a
              href="#contact"
              className="bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold px-6 sm:px-7 py-3 rounded-full shadow-md hover:border-amber-400/60 transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Top-Right: Image Switcher / Customizer Trigger */}
        <div className="absolute top-20 right-4 sm:right-6 md:right-8 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="bg-black/80 hover:bg-black/95 backdrop-blur-md border border-amber-500/40 hover:border-amber-400 text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            title="Update or load portrait images"
          >
            <Palette size={13} className="text-amber-400" />
            <span className="font-semibold tracking-wider uppercase text-[10px]">
              Portraits Setup
            </span>
          </button>
        </div>

        {/* Bottom hint */}
        <div className="hidden lg:block absolute bottom-4 right-8 z-40 text-[10px] text-white/50 tracking-widest uppercase pointer-events-none">
          Move cursor to reveal real / professional form
        </div>
      </section>

      {/* =========================================================================
          ABOUT SECTION (#about)
          ========================================================================= */}
      <section id="about" className="py-20 sm:py-28 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
          <Sparkles size={14} />
          <span>Profile & Background</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              ABOUT ME
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-4">
              <MapPin size={14} className="text-amber-400" />
              <span>Darbhanga, Bihar, India</span>
            </div>
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                Discipline
              </span>
              <p className="text-sm font-semibold text-white">
                Graphic Design & Visual Identity
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-light">
              Detail-oriented Civil Engineering graduate with hands-on freelance and project
              experience in Graphic Design.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              I specialize in social media design, branding, visual content and digital creative
              work, with experience using <span className="text-white font-medium">Adobe Photoshop</span>,{' '}
              <span className="text-white font-medium">Adobe Illustrator</span> and{' '}
              <span className="text-white font-medium">Canva</span>.
            </p>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              I combine creative thinking with technical discipline to create clean, consistent
              and engaging visual communication.
            </p>

            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="border border-white/10 bg-white/5 p-3 rounded-lg">
                <span className="text-xs text-amber-400 font-mono block">Specialization</span>
                <span className="text-xs font-medium text-white">Branding & Social Media</span>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 rounded-lg">
                <span className="text-xs text-amber-400 font-mono block">Approach</span>
                <span className="text-xs font-medium text-white">Clean & Consistent</span>
              </div>
              <div className="border border-white/10 bg-white/5 p-3 rounded-lg col-span-2 sm:col-span-1">
                <span className="text-xs text-amber-400 font-mono block">Location</span>
                <span className="text-xs font-medium text-white">Bihar, India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SKILLS SECTION (#skills)
          ========================================================================= */}
      <section id="skills" className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
          <Layers size={14} />
          <span>Technical & Creative Arsenal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
          CORE SKILLS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Design Software */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-3">
              01 • Design Software
            </span>
            <div className="flex flex-wrap gap-2">
              {['Adobe Photoshop', 'Adobe Illustrator', 'Canva', 'AutoCAD'].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-white border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Creative Capabilities */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-3">
              02 • Creative Capabilities
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Social Media Design',
                'Branding & Logo Design',
                'Marketing Collateral',
                'Digital Content Creation'
              ].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-white border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3: Technical & Office */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-3">
              03 • Technical & Office
            </span>
            <div className="flex flex-wrap gap-2">
              {['MS Word', 'MS Excel', 'C', 'C++'].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-white border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4: Professional Qualities */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider block mb-3">
              04 • Professional
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Creativity',
                'Time Management',
                'Team Collaboration',
                'Attention to Detail',
                'Problem Solving'
              ].map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 text-white border border-white/10"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXPERIENCE SECTION (#experience)
          ========================================================================= */}
      <section id="experience" className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
          <Briefcase size={14} />
          <span>Professional History</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
          EXPERIENCE
        </h2>

        <div className="space-y-6">
          {/* Experience Item 1 */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                COORDINATOR / GRAPHIC DESIGNER
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 w-fit">
                2024 – 2026
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-4">
              Government Engineering College, Buxar
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 font-light list-disc list-inside leading-relaxed">
              <li>Developed social media creatives for Facebook, Instagram, LinkedIn and YouTube.</li>
              <li>Assisted with website graphics, landing page visuals and email marketing designs.</li>
              <li>Edited images and created visual assets using Adobe Photoshop and Illustrator.</li>
              <li>Collaborated with senior designers to execute branding and advertising projects.</li>
            </ul>
          </div>

          {/* Experience Item 2 */}
          <div className="p-6 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-white/20 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                GRAPHIC DESIGNER
              </h3>
              <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 w-fit">
                2022 – 2026
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mb-4">
              Self-Employed / College Projects • Government Engineering College, Buxar
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-300 font-light list-disc list-inside leading-relaxed">
              <li>Designed social media posts, banners, advertisements and promotional materials.</li>
              <li>Created branding assets including logos, business cards, brochures and marketing collateral.</li>
              <li>Collaborated with marketing teams to develop creative campaigns.</li>
              <li>Maintained brand consistency across digital and print designs.</li>
              <li>Managed multiple assignments and deadlines.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EDUCATION SECTION (#education)
          ========================================================================= */}
      <section id="education" className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
          <GraduationCap size={14} />
          <span>Academic Background</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
          EDUCATION
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: B.Tech */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-amber-400 block mb-1">
                2022 – 2026
              </span>
              <h3 className="text-base font-bold text-white mb-1">
                B.TECH — CIVIL ENGINEERING
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Bihar Engineering University, Patna
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Score / Grade</span>
              <span className="text-xs font-bold text-white font-mono">CGPA: 7.0</span>
            </div>
          </div>

          {/* Card 2: Intermediate */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-amber-400 block mb-1">
                2019 – 2021
              </span>
              <h3 className="text-base font-bold text-white mb-1">
                INTERMEDIATE
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                Marwari College, Darbhanga (BSEB)
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Score / Grade</span>
              <span className="text-xs font-bold text-white font-mono">60.6%</span>
            </div>
          </div>

          {/* Card 3: Matriculation */}
          <div className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono text-amber-400 block mb-1">
                2019
              </span>
              <h3 className="text-base font-bold text-white mb-1">
                MATRICULATION
              </h3>
              <p className="text-xs text-neutral-400 mb-3">
                SK High School, Kuseshwar Asthan, Darbhanga (BSEB)
              </p>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">Score / Grade</span>
              <span className="text-xs font-bold text-white font-mono">60.3%</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PORTFOLIO SECTION (#portfolio)
          ========================================================================= */}
      <section id="portfolio" className="py-16 sm:py-24 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
              <Award size={14} />
              <span>Creative Showcase</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              SELECTED WORK
            </h2>
          </div>

          {/* Direct Drive / Behance Portfolio Link */}
          <a
            href="https://drive.google.com/drive/folders/1a00Y8xe84HZ7nk-gpfZJUbF6aAdpzOyE"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer w-fit"
          >
            <span>VIEW FULL PORTFOLIO DRIVE</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['ALL', 'BRANDING', 'SOCIAL MEDIA DESIGN', 'MARKETING COLLATERAL', 'DIGITAL DESIGN'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                activeCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 backdrop-blur-md hover:border-amber-400/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-2">
                  {proj.category}
                </span>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-light mb-4">
                  {proj.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-wrap gap-1.5 items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="https://drive.google.com/drive/folders/1a00Y8xe84HZ7nk-gpfZJUbF6aAdpzOyE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                  title="Open Project Drive"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CONTACT SECTION (#contact)
          ========================================================================= */}
      <section id="contact" className="py-20 sm:py-28 px-5 sm:px-8 max-w-6xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
              <Mail size={14} />
              <span>Get in Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
              LET'S WORK<br />TOGETHER
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light mb-6">
              Available for freelance branding projects, social media creative retainers, and graphic design opportunities.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 text-neutral-300">
                <MapPin size={15} className="text-amber-400 shrink-0" />
                <span>Darbhanga, Bihar, India</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Phone size={15} className="text-amber-400 shrink-0" />
                <a href="tel:8252073401" className="hover:text-white transition-colors">
                  +91 8252073401
                </a>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Mail size={15} className="text-amber-400 shrink-0" />
                <a href="mailto:hn8065752@gmail.com" className="hover:text-white transition-colors">
                  hn8065752@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-neutral-900/60 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-4">
              Direct Contact Options
            </h3>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <a
                href="tel:8252073401"
                className="flex items-center justify-center gap-2 bg-white text-black text-xs font-bold py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
              >
                <Phone size={14} />
                <span>CALL ME</span>
              </a>

              <a
                href="mailto:hn8065752@gmail.com"
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-3 px-4 rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                <Mail size={14} />
                <span>EMAIL ME</span>
              </a>

              <a
                href="https://linkedin.com/in/hemant-nishad-4585a227b"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                <Linkedin size={14} />
                <span>LINKEDIN</span>
              </a>
            </div>

            {/* Simple direct message simulator */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormSent(true);
                setTimeout(() => setFormSent(false), 5000);
              }}
              className="space-y-3 pt-4 border-t border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="bg-neutral-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="bg-neutral-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
              <textarea
                required
                rows={3}
                placeholder="Project Scope or Message"
                className="w-full bg-neutral-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={13} />
                <span>SEND MESSAGE</span>
              </button>
              {formSent && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mt-2">
                  <CheckCircle2 size={14} />
                  <span>Thank you! Your message request has been noted.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MINIMAL FOOTER
          ========================================================================= */}
      <footer className="py-8 px-5 border-t border-white/10 text-center font-mono text-xs text-neutral-500">
        <p className="text-neutral-400 font-semibold mb-1">
          HEMANT KUMAR MUKHIYA • GRAPHIC DESIGNER
        </p>
        <p className="text-[11px] mb-2">Darbhanga, Bihar, India</p>
        <p className="text-[10px] text-neutral-600">
          © 2026 Hemant Kumar Mukhiya. All rights reserved.
        </p>
      </footer>

      {/* =========================================================================
          PORTRAIT SETUP MODAL
          Enables loading Hemant's matched 1452x1083 portrait pair with 100% pixel match
          ========================================================================= */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-700 text-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <Upload size={14} />
              <span>Matched Portrait Setup (1452 × 1083 px)</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Hemant's Matched Image Pair
            </h2>
            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              Dono supplied images (1452 × 1083 px) ko direct use karein:
              <br />
              <strong className="text-amber-400">Layer 1 (Base):</strong> Cyberpunk / Armored version of Hemant.
              <br />
              <strong className="text-white">Layer 2 (Reveal):</strong> Normal professional shirt version of Hemant.
            </p>

            <div className="space-y-4 mb-5">
              {/* Slot 1: Cyberpunk Armored Version */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Image 1: Cyberpunk Armored (Base Layer)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">1452×1083</span>
                </div>
                <input
                  ref={fileInputCyberRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, true)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputCyberRef.current?.click()}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-medium py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={13} />
                  <span>Choose Image 1 (Cyberpunk Suit)</span>
                </button>
              </div>

              {/* Slot 2: Normal Professional Shirt Version */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Image 2: Normal Shirt (Reveal Layer)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">1452×1083</span>
                </div>
                <input
                  ref={fileInputNormalRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputNormalRef.current?.click()}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-medium py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={13} />
                  <span>Choose Image 2 (Checkered Shirt)</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-lg transition cursor-pointer"
              >
                Done / View Reveal Effect
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseImage(CYBERPUNK_HEMANT_IMAGE);
                  setRevealImage(NORMAL_HEMANT_IMAGE);
                  try {
                    localStorage.removeItem('hemant_portrait_cyber');
                    localStorage.removeItem('hemant_portrait_normal');
                  } catch {}
                  setShowImageModal(false);
                }}
                className="px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs py-2.5 rounded-lg transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
}
