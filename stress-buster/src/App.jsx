import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Wind, MessageCircle, Heart, Sparkles, X, Send, Feather, Waves, Sun, ArrowRight, Play, Pause, RefreshCw } from 'lucide-react';

// Animated background orbs component
const FloatingOrb = ({ delay, duration, size, color, start, blur = "blur-3xl" }) => (
  <motion.div
    className={`absolute rounded-full ${blur} opacity-20 ${color}`}
    style={{ width: size, height: size }}
    animate={{
      x: [0, 150, -100, 0],
      y: [0, -200, 150, 0],
      scale: [1, 1.3, 0.9, 1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    initial={{ x: start.x, y: start.y }}
  />
);

// Navigation Component
const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Home', 'Confess', 'Whisper', 'Breathe'];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <motion.div 
          className="text-2xl font-display font-bold gradient-text cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Stress Buster
        </motion.div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-sm text-white/70 hover:text-white font-medium transition-colors rounded-full hover:bg-white/5"
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
          <motion.button
            className="ml-4 btn-primary text-sm px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-white/70 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((item) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section Component
const HeroSection = ({ onConfessClick }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} duration={25} size="700px" color="bg-primary-600" start={{ x: -300, y: -200 }} />
        <FloatingOrb delay={3} duration={30} size="600px" color="bg-accent-600" start={{ x: '70%', y: '10%' }} />
        <FloatingOrb delay={6} duration={28} size="500px" color="bg-serene-600" start={{ x: '20%', y: '90%' }} />
        <FloatingOrb delay={2} duration={22} size="400px" color="bg-calm-500" start={{ x: '90%', y: '70%' }} blur="blur-2xl" />
      </div>

      {/* Gradient Mesh Overlay */}
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-10 border border-white/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-white/80 text-sm font-medium">Your Safe Space to Release</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold mb-8 leading-tight tracking-tight">
            <motion.span 
              className="block text-white"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Release Your
            </motion.span>
            <motion.span 
              className="gradient-text block mt-2"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Inner Stress
            </motion.span>
          </h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            A peaceful sanctuary where you can confess your thoughts, whisper your worries, 
            and find calm in the chaos of life.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.button
              className="btn-primary text-base px-10 py-5 flex items-center space-x-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfessClick}
            >
              <Feather className="w-5 h-5" />
              <span>Start Confessing</span>
            </motion.button>
            <motion.a
              href="#whisper"
              className="btn-secondary text-base px-10 py-5 flex items-center space-x-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wind className="w-5 h-5" />
              <span>Explore</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-6 h-10 border border-white/20 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-2 bg-white/40 rounded-full mt-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <motion.div
    className="glass-card p-8 hover:shadow-glow transition-all duration-500 group cursor-pointer"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7 }}
    whileHover={{ y: -12, scale: 1.02 }}
  >
    <motion.div
      className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="w-8 h-8 text-white" />
    </motion.div>
    <h3 className="text-2xl font-serif font-bold text-white mb-3">{title}</h3>
    <p className="text-white/60 leading-relaxed font-light">{description}</p>
    
    {/* Hover arrow indicator */}
    <motion.div 
      className="mt-6 flex items-center text-accent-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
      initial={{ x: -10 }}
      whileHover={{ x: 0 }}
    >
      <span>Learn more</span>
      <ArrowRight className="w-4 h-4 ml-2" />
    </motion.div>
  </motion.div>
);

// Features Section
const FeaturesSection = ({ onConfessClick }) => {
  const features = [
    {
      icon: MessageCircle,
      title: "Anonymous Confessions",
      description: "Share your deepest thoughts without judgment. Our platform ensures complete anonymity.",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-700"
    },
    {
      icon: Wind,
      title: "Whisper Your Stress",
      description: "Let go of your worries by whispering them away. Watch them dissolve into nothingness.",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-700"
    },
    {
      icon: Heart,
      title: "Healing Community",
      description: "Connect with others who understand. Find comfort in shared experiences.",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-700"
    },
    {
      icon: Waves,
      title: "Breathing Exercises",
      description: "Guided breathing sessions to calm your mind and reduce anxiety instantly.",
      gradient: "bg-gradient-to-br from-teal-500 to-teal-700"
    }
  ];

  return (
    <section id="confess" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60">
              Discover Peace
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 tracking-tight">
            Find Your <span className="gradient-text">Peace</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Discover powerful tools designed to help you release stress and find inner calm
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              delay={index * 0.15}
              onClick={index === 0 ? onConfessClick : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Confession Modal
const ConfessionModal = ({ isOpen, onClose }) => {
  const [confession, setConfession] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  const handleSubmit = () => {
    if (confession.trim()) {
      setIsReleasing(true);
      setTimeout(() => {
        setIsReleasing(false);
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setConfession('');
          onClose();
        }, 3000);
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="glass-card max-w-2xl w-full mx-6 p-10 pointer-events-auto relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>

              {!isSubmitted ? (
                <>
                  <div className="text-center mb-8 relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                      <Feather className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-3xl font-serif font-bold text-white mb-3">
                      Share Your Thoughts
                    </h3>
                    <p className="text-white/60 font-light">
                      Write anonymously. Your secrets are safe here.
                    </p>
                  </div>

                  <motion.textarea
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    value={confession}
                    onChange={(e) => setConfession(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full h-48 p-6 rounded-2xl border border-white/10 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none resize-none text-white text-lg bg-white/5 placeholder:text-white/30 transition-all"
                  />

                  <div className="mt-8 flex justify-end">
                    <motion.button
                      onClick={handleSubmit}
                      className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!confession.trim() || isReleasing}
                    >
                      {isReleasing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>{isReleasing ? 'Releasing...' : 'Release'}</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <Sun className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-3">
                    Released!
                  </h3>
                  <p className="text-white/60 font-light">
                    Your confession has been let go. Feel lighter?
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Whisper Section
const WhisperSection = () => {
  const [whispers, setWhispers] = useState([]);
  const containerRef = useRef(null);

  const addWhisper = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newWhisper = {
      id: Date.now(),
      x,
      y,
      text: ['Stress', 'Worry', 'Fear', 'Anxiety', 'Doubt'][Math.floor(Math.random() * 5)]
    };
    
    setWhispers(prev => [...prev, newWhisper]);
    setTimeout(() => {
      setWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
    }, 3000);
  };

  return (
    <section id="whisper" className="py-32 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
      
      {/* Animated stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60">
              Let It Go
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 tracking-tight">
            Whisper Away Your <span className="text-accent-400">Stress</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Click anywhere to release your stress into the universe. Watch it float away and disappear.
          </p>
        </motion.div>

        {/* Interactive Area */}
        <motion.div 
          ref={containerRef}
          className="relative h-[500px] glass-card-light overflow-hidden cursor-crosshair"
          onClick={addWhisper}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence>
            {whispers.map((whisper) => (
              <motion.div
                key={whisper.id}
                className="absolute text-white/50 text-lg font-light pointer-events-none select-none"
                style={{ left: `${whisper.x}%`, top: `${whisper.y}%` }}
                initial={{ opacity: 1, scale: 0.5, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  y: -150,
                  x: (Math.random() - 0.5) * 200,
                  rotate: (Math.random() - 0.5) * 60,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
              >
                {whisper.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Center button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center shadow-glow"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 40px rgba(244, 63, 94, 0.3)',
                  '0 0 80px rgba(244, 63, 94, 0.6)',
                  '0 0 40px rgba(244, 63, 94, 0.3)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Wind className="w-16 h-16 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.p 
          className="text-center text-white/40 mt-8 font-light"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Click anywhere to release your stress
        </motion.p>
      </div>
    </section>
  );
};

// Breathing Exercise Component
const BreathingExercise = () => {
  const [phase, setPhase] = useState('ready');
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 4000 },
    ];

    let currentPhase = 0;

    const runPhase = () => {
      setPhase(phases[currentPhase].name);
      
      timerRef.current = setTimeout(() => {
        currentPhase = (currentPhase + 1) % phases.length;
        if (currentPhase === 0) setCycles(c => c + 1);
        runPhase();
      }, phases[currentPhase].duration);
    };

    runPhase();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  const getInstruction = () => {
    switch(phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Ready';
    }
  };

  const getCircleScale = () => {
    switch(phase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      default: return 1;
    }
  };

  return (
    <section id="breathe" className="py-32 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60">
              Find Calm
            </span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 tracking-tight">
            Find Your <span className="gradient-text">Calm</span>
          </h2>
          <p className="text-xl text-white/60 mb-16 font-light leading-relaxed">
            Follow the breathing pattern to reduce anxiety and center yourself
          </p>
        </motion.div>

        {/* Breathing Circle Animation */}
        <div className="relative h-96 flex items-center justify-center mb-12">
          {/* Outer rings */}
          <motion.div
            className="absolute w-56 h-56 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10"
            animate={{
              scale: isActive ? getCircleScale() : 1,
              opacity: isActive ? [0.3, 0.5, 0.3] : 0.3,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-56 h-56 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 border border-white/15"
            animate={{
              scale: isActive ? getCircleScale() * 0.85 : 1,
              opacity: isActive ? [0.4, 0.6, 0.4] : 0.4,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
          
          {/* Main circle */}
          <motion.div
            className="w-56 h-56 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow relative overflow-hidden"
            animate={{
              scale: isActive ? 1 : [1, 1.03, 1],
            }}
            transition={{ duration: isActive ? 4 : 2, ease: "easeInOut" }}
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
            
            <motion.span 
              className="text-2xl font-semibold text-white relative z-10"
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isActive ? getInstruction() : 'Start'}
            </motion.span>
          </motion.div>
        </div>

        {/* Cycle counter and controls */}
        <div className="space-y-8">
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl text-white/60 font-light"
              key={cycles}
            >
              Cycle <span className="text-white font-semibold">{cycles + 1}</span>
            </motion.div>
          )}
          
          <motion.button
            onClick={() => {
              setIsActive(!isActive);
              if (!isActive) {
                setPhase('inhale');
                setCycles(0);
              } else {
                setPhase('ready');
              }
            }}
            className={`btn-${isActive ? 'secondary' : 'primary'} inline-flex items-center space-x-2`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Stop Exercise</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Begin Breathing</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-display font-bold gradient-text mb-4">Stress Buster</h3>
            <p className="text-white/50 font-light leading-relaxed">
              Your safe space to release stress and find inner peace.
            </p>
          </div>
          
          {/* Features Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-3 text-white/50">
              <li><a href="#confess" className="hover:text-white transition-colors">Confessions</a></li>
              <li><a href="#whisper" className="hover:text-white transition-colors">Whisper</a></li>
              <li><a href="#breathe" className="hover:text-white transition-colors">Breathing</a></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-white/50">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex space-x-3">
              {['Twitter', 'Instagram', 'Facebook'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-500 hover:border-accent-500 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-4 h-4 text-white" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/40 font-light">
            &copy; 2024 Stress Buster. Made with <Heart className="w-4 h-4 inline text-accent-500" /> for mental wellness.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      <Navigation />
      <HeroSection onConfessClick={() => setIsModalOpen(true)} />
      <FeaturesSection onConfessClick={() => setIsModalOpen(true)} />
      <WhisperSection />
      <BreathingExercise />
      <Footer />
      
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-glow flex items-center justify-center z-40"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </motion.button>
      
      {/* Confession Modal */}
      <ConfessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
