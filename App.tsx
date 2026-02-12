import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { Send, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Config ---
// Using the credentials provided by the user.
// Note: Ensure the 'views' table exists in your Supabase project with columns: id (int/text), count (int).
const supabaseUrl = 'https://yufbarjyzyvmcqxhnjys.supabase.co';
const supabaseKey = 'sb_publishable_xhCdE4896OD9j_UuZa3Edg_3ULaHBxk';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Types ---

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

// --- Components ---

/**
 * Old TV / CRT Effect Overlay
 */
const CRTEffect = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden h-full w-full">
      {/* Subtle Scanlines */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.02]"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%)',
          backgroundSize: '100% 4px'
        }}
      />
      {/* Vignette */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)'
        }}
      />
      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}
      />
    </div>
  );
};

/**
 * Global Ash Effect
 * Renders slow falling ash particles for the background.
 */
const GlobalAshEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = 60; // Less dense but visible
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(canvas.width, canvas.height));
      }
    };

    const createParticle = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, // Slight horizontal drift
      vy: Math.random() * 0.5 + 0.2,   // Slow fall
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.3 + 0.1
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Reset if out of bounds
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;

        ctx.fillStyle = `rgba(100, 100, 100, ${p.alpha})`; 
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40" />;
};

/**
 * Local Particle Effect (For nickname)
 */
const ParticleEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = canvas.parentElement?.clientHeight || 100;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.fillStyle = `rgba(120, 120, 120, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/**
 * Shine Button
 */
interface ShineButtonProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ShineButton: React.FC<ShineButtonProps> = ({ href, label, icon }) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <a
      ref={buttonRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center gap-2 px-6 py-3 w-full bg-black/60 border border-neutral-800 rounded-md overflow-hidden group transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900/60 active:scale-[0.98]"
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.08), transparent 40%)`,
        }}
      />
      <div 
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{
          background: `radial-gradient(100px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.15), transparent 100%)`,
          maskImage: 'linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)',
          maskComposite: 'exclude',
          padding: '1px',
          opacity: opacity
        }}
      />
      <span className="relative z-10 text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 flex items-center gap-2 font-mono uppercase text-sm tracking-wider">
        {icon}
        {label}
      </span>
    </a>
  );
};

/**
 * Tilt Card
 */
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-300 ease-out transform-gpu bg-[#080808] border border-neutral-900 rounded-xl p-8 shadow-2xl"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Dark Glass Reflection */}
        <div 
           className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-10"
        />
        <div style={{ transform: 'translateZ(20px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const handleViews = async () => {
      try {
        // Attempt to increment views. 
        // This assumes a table named 'views' with an 'id' and 'count' column exists.
        // We use row ID 1 as the global counter.
        
        // 1. Fetch current count
        const { data: currentData, error: fetchError } = await supabase
          .from('views')
          .select('count')
          .eq('id', 1)
          .single();

        if (fetchError) {
          // If row doesn't exist (PGRST116), try to insert it
          if (fetchError.code === 'PGRST116') {
             const { data: newData } = await supabase
               .from('views')
               .insert([{ id: 1, count: 1 }])
               .select()
               .single();
             if (newData) setViews(newData.count);
          } else {
             console.error("Error fetching views:", fetchError);
          }
        } else if (currentData) {
          // 2. Increment and Update
          const newCount = currentData.count + 1;
          const { error: updateError } = await supabase
            .from('views')
            .update({ count: newCount })
            .eq('id', 1);

          if (!updateError) {
            setViews(newCount);
          } else {
            // If update fails (e.g. RLS), just show fetched count
            setViews(currentData.count);
          }
        }
      } catch (err) {
        console.error("Unexpected error handling views:", err);
      }
    };

    handleViews();
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans bg-[#020202] text-[#e5e5e5] relative overflow-hidden selection:bg-neutral-800 selection:text-white">
      
      {/* --- Gloomy Background Effects --- */}
      
      {/* 1. Deep Black Base */}
      <div className="absolute inset-0 bg-[#020202]" />
      
      {/* 2. Pulsing Darkness (Breathing Effect) */}
      <style>{`
        @keyframes pulseDarkness {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
          100% { opacity: 0.2; transform: scale(1); }
        }
        .animate-pulse-dark {
          animation: pulseDarkness 10s infinite ease-in-out;
        }
      `}</style>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-[radial-gradient(circle,rgba(30,30,30,0.2)_0%,rgba(0,0,0,1)_70%)] animate-pulse-dark pointer-events-none" />

      {/* 3. Global Falling Ash */}
      <GlobalAshEffect />

      {/* 4. CRT Overlay */}
      <CRTEffect />

      <main className="relative z-10 max-w-sm w-full">
        <TiltCard>
          <div className="flex flex-col items-center text-center">
            
            {/* Avatar Section */}
            <div className="relative group mb-6">
              {/* Cold Ghostly Glow */}
              <div className="absolute -inset-4 bg-slate-300/5 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000" />
              
              <div className="relative w-32 h-32 rounded-full overflow-hidden border border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,1)] bg-black">
                 <img 
                   src="https://i.ibb.co/B2bc7dRf/photo-2026-02-06-23-51-05.jpg" 
                   alt="Avatar" 
                   className="w-full h-full object-cover grayscale brightness-90 contrast-125 transition-all duration-700 group-hover:scale-110 group-hover:brightness-100"
                 />
                 {/* Glitch Overlay */}
                 <div className="absolute inset-0 bg-neutral-500/10 opacity-0 group-hover:opacity-20 mix-blend-overlay transition-opacity duration-200" />
              </div>
            </div>

            {/* Typography Section */}
            <div className="relative w-full mb-8">
               {/* Nickname */}
              <h1 
                className="text-4xl font-bold text-neutral-300 mb-2 tracking-tighter" 
                style={{ 
                  fontFamily: '"Cinzel", serif',
                  textShadow: '0 0 15px rgba(255,255,255,0.1)'
                }}
              >
                <span className="text-neutral-700 select-none mr-1">#</span>кситрен
              </h1>
              
              {/* Particle Container */}
              <div className="relative h-12 w-full overflow-hidden -mt-2 mb-2">
                 {/* Username */}
                <div className="relative z-10 flex items-center justify-center gap-2 text-sm font-mono text-neutral-500 pt-2">
                  <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full"></div>
                  <span className="tracking-[0.2em] uppercase">@evilholic</span>
                </div>
                {/* Local Particles */}
                <ParticleEffect />
              </div>
            </div>

            {/* Divider */}
            <div className="relative w-full flex items-center justify-center mb-8 opacity-40">
                <div className="h-px w-10 bg-gradient-to-r from-transparent via-neutral-600 to-transparent"></div>
                <div className="mx-3 text-neutral-700 font-serif text-xs tracking-widest">†</div>
                <div className="h-px w-10 bg-gradient-to-r from-transparent via-neutral-600 to-transparent"></div>
            </div>

            {/* Quote / Aesthetic Text */}
            <div className="text-neutral-500 mb-8 font-serif leading-relaxed space-y-3">
              <p className="text-lg text-neutral-400 font-medium tracking-wide italic opacity-80" style={{ textShadow: '0 0 5px rgba(0,0,0,0.8)' }}>
                死んだ詩人、<br/>それでも詩人
              </p>
            </div>

            {/* Social Buttons */}
            <div className="flex flex-col w-full gap-3">
              <ShineButton 
                href="https://t.me/+vx4yD0XbY1s3MzNi" 
                label="Канал" 
                icon={<Send size={14} />} 
              />
              <ShineButton 
                href="https://t.me/+0McVLnA4MMo3NTY6" 
                label="Слив Проектов " 
                icon={<Send size={14} />} 
              />
            </div>

            {/* Views Indicator */}
            <div className="mt-8 flex items-center justify-center gap-2 text-neutral-600/80 text-[10px] font-mono tracking-widest border border-neutral-900/50 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Eye size={12} className="opacity-70" />
                <span className="opacity-90">{views !== null ? views.toLocaleString() : '---'}</span>
            </div>

          </div>
        </TiltCard>
        
        {/* Footer */}
        <div className="mt-8 text-center opacity-20 hover:opacity-80 transition-opacity duration-700">
            <p className="text-[9px] text-neutral-600 font-mono tracking-[0.5em] uppercase">
               oblivion
            </p>
        </div>
      </main>
    </div>
  );
};

export default App;