import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Feather, Wind, Heart, ArrowRight, Sparkles } from 'lucide-react';

// Simple, elegant background gradient
const Background = () => (
  <div className="fixed inset-0 bg-background">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background" />
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[128px]" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-whisper/5 rounded-full blur-[128px]" />
  </div>
);

// Minimal Navigation
const Navigation = ({ onConfessClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-background/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
        <motion.div 
          className="text-xl font-display font-bold text-primary"
          whileHover={{ scale: 1.02 }}
        >
          Stress Buster
        </motion.div>
        
        <div className="hidden md:flex items-center space-x-8">
          {['Home', 'Confess', 'Whisper', 'Breathe'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
          <button
            onClick={onConfessClick}
            className="px-5 py-2.5 bg-accent text-black text-sm font-medium rounded-full hover:bg-white transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

// Hero Section - Clean & Minimal
const HeroSection = ({ onConfessClick }) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative pt-20">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 px-4 py-2 mb-8 rounded-full border border-white/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-secondary">Your safe space to release</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-primary mb-6 leading-tight">
            <motion.span 
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Release Your
            </motion.span>
            <motion.span 
              className="block gradient-text mt-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Inner Stress
            </motion.span>
          </h1>

          <motion.p 
            className="text-base md:text-lg text-secondary max-w-xl mx-auto mb-10 font-light leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            A peaceful sanctuary where you can confess your thoughts and find calm in the chaos.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <button
              onClick={onConfessClick}
              className="px-8 py-4 bg-accent text-black font-medium rounded-full hover:bg-white transition-all hover:scale-105"
            >
              Start Confessing
            </button>
            <a
              href="#whisper"
              className="px-8 py-4 bg-transparent text-primary font-medium rounded-full border border-white/20 hover:bg-white/10 transition-all hover:scale-105"
            >
              Explore
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Feature Card - Ultra Clean
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    className="glass-card p-8 group cursor-pointer"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8 }}
  >
    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-display font-semibold text-primary mb-3">{title}</h3>
    <p className="text-sm text-secondary leading-relaxed font-light">{description}</p>
  </motion.div>
);

// Features Section
const FeaturesSection = ({ onConfessClick }) => {
  const features = [
    {
      icon: Feather,
      title: "Anonymous Confessions",
      description: "Share your deepest thoughts without judgment. Complete anonymity guaranteed.",
    },
    {
      icon: Wind,
      title: "Whisper Stress",
      description: "Let go of worries by whispering them away. Watch them dissolve.",
    },
    {
      icon: Heart,
      title: "Healing Community",
      description: "Connect with others who understand. Find comfort in shared experiences.",
    },
    {
      icon: Sparkles,
      title: "Breathing Exercises",
      description: "Guided breathing sessions to calm your mind instantly.",
    }
  ];

  return (
    <section id="confess" className="py-32">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-primary mb-6">
            Find Your <span className="gradient-text">Peace</span>
          </h2>
          <p className="text-base text-secondary max-w-lg mx-auto font-light">
            Powerful tools designed to help you release stress and find inner calm
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Confession Modal - Minimal Design
const ConfessionModal = ({ isOpen, onClose }) => {
  const [confession, setConfession] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (confession.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setConfession('');
        onClose();
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="glass-card max-w-lg w-full mx-6 p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>

              {!isSubmitted ? (
                <>
                  <div className="text-center mb-6">
                    <Feather className="w-10 h-10 text-accent mx-auto mb-4" />
                    <h3 className="text-2xl font-display font-semibold text-primary mb-2">
                      Share Your Thoughts
                    </h3>
                    <p className="text-sm text-secondary font-light">
                      Write anonymously. Your secrets are safe here.
                    </p>
                  </div>

                  <textarea
                    value={confession}
                    onChange={(e) => setConfession(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent/50 resize-none font-light"
                  />

                  <button
                    onClick={handleSubmit}
                    className="w-full mt-4 px-6 py-3.5 bg-accent text-black font-medium rounded-full hover:bg-white transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Release</span>
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-2">
                    Released
                  </h3>
                  <p className="text-sm text-secondary font-light">
                    Your confession has been shared anonymously
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

// Whisper Section - Dark & Mysterious
const WhisperSection = () => {
  const [whispers, setWhispers] = useState([
    "Work pressure", "Anxiety", "Fear", "Doubt", "Stress", "Worry"
  ]);

  const releaseWhisper = (index) => {
    setWhispers(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <section id="whisper" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface to-background" />
      
      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-primary mb-6">
            Whisper Your <span className="text-whisper">Stress</span>
          </h2>
          <p className="text-base text-secondary font-light">
            Click on a whisper to release it into the void
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 min-h-[200px]">
          <AnimatePresence>
            {whispers.map((whisper, index) => (
              <motion.button
                key={whisper}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, y: -50 }}
                transition={{ duration: 0.4 }}
                onClick={() => releaseWhisper(index)}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-secondary hover:text-whisper hover:border-whisper/50 transition-all hover:scale-105"
              >
                {whisper}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

// Breathing Exercise - Simple & Calming
const BreathingExercise = () => {
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(4);

  useEffect(() => {
    const phases = [
      { name: 'inhale', duration: 4000 },
      { name: 'hold', duration: 4000 },
      { name: 'exhale', duration: 4000 },
    ];

    let phaseIndex = 0;
    let countdown = 4;

    const runCycle = () => {
      setPhase(phases[phaseIndex].name);
      countdown = 4;
      setCount(countdown);

      const interval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
          setCount(countdown);
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        phaseIndex = (phaseIndex + 1) % phases.length;
        runCycle();
      }, phases[phaseIndex].duration);
    };

    runCycle();
  }, []);

  return (
    <section id="breathe" className="py-32">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold text-primary mb-6">
            Breathe
          </h2>
          <p className="text-base text-secondary font-light mb-12">
            Follow the rhythm. Inhale. Hold. Exhale.
          </p>

          <div className="relative w-64 h-64 mx-auto">
            <motion.div
              className="absolute inset-0 bg-accent/10 rounded-full"
              animate={{
                scale: phase === 'inhale' ? 1.5 : phase === 'exhale' ? 0.8 : 1.2,
                opacity: phase === 'inhale' ? 0.3 : phase === 'exhale' ? 0.1 : 0.2,
              }}
              transition={{ duration: 4 }}
            />
            <motion.div
              className="absolute inset-8 bg-accent/20 rounded-full"
              animate={{
                scale: phase === 'inhale' ? 1.3 : phase === 'exhale' ? 0.9 : 1.1,
                opacity: phase === 'inhale' ? 0.4 : phase === 'exhale' ? 0.2 : 0.3,
              }}
              transition={{ duration: 4 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-display font-semibold text-primary capitalize mb-1">
                  {phase}
                </p>
                <p className="text-lg text-secondary font-light">{count}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Footer - Minimal
const Footer = () => (
  <footer className="py-12 border-t border-white/5">
    <div className="max-w-6xl mx-auto px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm text-secondary font-light">
          © 2024 Stress Buster. Your safe space.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Terms</a>
          <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </div>
  </footer>
);

// Main App Component
function App() {
  const [confessionModalOpen, setConfessionModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/30 selection:text-black">
      <Background />
      <Navigation onConfessClick={() => setConfessionModalOpen(true)} />
      <HeroSection onConfessClick={() => setConfessionModalOpen(true)} />
      <FeaturesSection onConfessClick={() => setConfessionModalOpen(true)} />
      <WhisperSection />
      <BreathingExercise />
      <Footer />
      <ConfessionModal 
        isOpen={confessionModalOpen} 
        onClose={() => setConfessionModalOpen(false)} 
      />
    </div>
  );
}

export default App;
