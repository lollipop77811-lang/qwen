import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, MessageCircle, Heart, Sparkles, X, Send, Feather, Waves, Sun } from 'lucide-react';

const FloatingOrb = ({ delay, duration, size, color, start }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 ${color}`}
    style={{ width: size, height: size }}
    animate={{
      x: [0, 100, -100, 0],
      y: [0, -150, 100, 0],
      scale: [1, 1.2, 0.8, 1],
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

const Navigation = () => {
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
        scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div 
          className="text-2xl font-serif font-bold gradient-text"
          whileHover={{ scale: 1.05 }}
        >
          Stress Buster
        </motion.div>
        <div className="hidden md:flex space-x-8">
          {['Home', 'Confess', 'Whisper', 'Breathe'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-slate-600 hover:text-primary-600 font-medium transition-colors"
              whileHover={{ y: -2 }}
            >
              {item}
            </motion.a>
          ))}
        </div>
        <motion.button
          className="btn-primary px-6 py-2 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </div>
    </motion.nav>
  );
};

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingOrb delay={0} duration={20} size="600px" color="bg-primary-300" start={{ x: -200, y: -200 }} />
        <FloatingOrb delay={2} duration={25} size="500px" color="bg-accent-300" start={{ x: '80%', y: '20%' }} />
        <FloatingOrb delay={4} duration={18} size="400px" color="bg-purple-300" start={{ x: '30%', y: '80%' }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full mb-8 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Sparkles className="w-5 h-5 text-accent-500" />
            <span className="text-slate-700 font-medium">Your Safe Space to Release</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 leading-tight">
            <span className="block text-slate-800">Release Your</span>
            <span className="gradient-text block mt-2">Inner Stress</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            A peaceful sanctuary where you can confess your thoughts, whisper your worries, 
            and find calm in the chaos of life.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.button
              className="btn-primary text-lg px-10 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Confessing
            </motion.button>
            <motion.button
              className="btn-secondary text-lg px-10 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    className="glass-card p-8 hover:shadow-2xl transition-shadow duration-500"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ y: -10 }}
  >
    <motion.div
      className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6`}
      whileHover={{ rotate: 360, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <Icon className="w-8 h-8 text-white" />
    </motion.div>
    <h3 className="text-2xl font-serif font-bold text-slate-800 mb-4">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </motion.div>
);

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Anonymous Confessions",
      description: "Share your deepest thoughts without judgment. Our platform ensures complete anonymity.",
      color: "bg-gradient-to-br from-blue-400 to-blue-600"
    },
    {
      icon: Wind,
      title: "Whisper Your Stress",
      description: "Let go of your worries by whispering them away. Watch them dissolve into nothingness.",
      color: "bg-gradient-to-br from-purple-400 to-purple-600"
    },
    {
      icon: Heart,
      title: "Healing Community",
      description: "Connect with others who understand. Find comfort in shared experiences.",
      color: "bg-gradient-to-br from-pink-400 to-pink-600"
    },
    {
      icon: Waves,
      title: "Breathing Exercises",
      description: "Guided breathing sessions to calm your mind and reduce anxiety instantly.",
      color: "bg-gradient-to-br from-teal-400 to-teal-600"
    }
  ];

  return (
    <section id="confess" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 mb-6">
            Find Your <span className="gradient-text">Peace</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover powerful tools designed to help you release stress and find inner calm
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

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
      }, 3000);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="glass-card max-w-2xl w-full mx-6 p-8 pointer-events-auto relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>

              {!isSubmitted ? (
                <>
                  <div className="text-center mb-8">
                    <Feather className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                    <h3 className="text-3xl font-serif font-bold text-slate-800 mb-2">
                      Share Your Thoughts
                    </h3>
                    <p className="text-slate-600">
                      Write anonymously. Your secrets are safe here.
                    </p>
                  </div>

                  <textarea
                    value={confession}
                    onChange={(e) => setConfession(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="w-full h-48 p-6 rounded-2xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-slate-700 text-lg bg-white/50"
                  />

                  <div className="mt-6 flex justify-end">
                    <motion.button
                      onClick={handleSubmit}
                      className="btn-primary flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                      <span>Release</span>
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Sun className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">
                    Released!
                  </h3>
                  <p className="text-slate-600">
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

const WhisperSection = () => {
  const [isWhispering, setIsWhispering] = useState(false);
  const [whispers, setWhispers] = useState([]);

  const addWhisper = () => {
    const newWhisper = {
      id: Date.now(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      text: ['Stress', 'Worry', 'Fear', 'Anxiety', 'Doubt'][Math.floor(Math.random() * 5)]
    };
    setWhispers([...whispers, newWhisper]);
    setTimeout(() => {
      setWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
    }, 3000);
  };

  return (
    <section id="whisper" className="py-32 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
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
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Whisper Away Your <span className="text-accent-300">Stress</span>
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Click to release your stress into the universe. Watch it float away and disappear.
          </p>
        </motion.div>

        <div className="relative h-96 glass-card/10 rounded-3xl overflow-hidden cursor-pointer" onClick={addWhisper}>
          <AnimatePresence>
            {whispers.map((whisper) => (
              <motion.div
                key={whisper.id}
                className="absolute text-white/60 text-lg font-light"
                style={{ left: `${whisper.x}%`, top: `${whisper.y}%` }}
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  y: -100,
                  x: (Math.random() - 0.5) * 200,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3 }}
              >
                {whisper.text}
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: isWhispering ? 0.95 : 1 }}
          >
            <motion.button
              className="w-32 h-32 rounded-full bg-gradient-to-br from-accent-400 to-purple-600 flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseDown={() => setIsWhispering(true)}
              onMouseUp={() => setIsWhispering(false)}
              onMouseLeave={() => setIsWhispering(false)}
            >
              <Wind className="w-12 h-12 text-white" />
            </motion.button>
          </motion.div>
        </div>

        <p className="text-center text-purple-300 mt-8">
          Click anywhere to release your stress
        </p>
      </div>
    </section>
  );
};

const BreathingExercise = () => {
  const [phase, setPhase] = useState('inhale');
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);

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
      setTimeout(() => {
        currentPhase = (currentPhase + 1) % phases.length;
        if (currentPhase === 0) setCycles(c => c + 1);
        runPhase();
      }, phases[currentPhase].duration);
    };

    runPhase();
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
    <section id="breathe" className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-800 mb-6">
            Find Your <span className="gradient-text">Calm</span>
          </h2>
          <p className="text-xl text-slate-600 mb-16">
            Follow the breathing pattern to reduce anxiety and center yourself
          </p>
        </motion.div>

        <div className="relative h-80 flex items-center justify-center">
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 opacity-30"
            animate={{
              scale: isActive ? getCircleScale() : 1,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 opacity-50"
            animate={{
              scale: isActive ? getCircleScale() * 0.8 : 1,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
          <motion.div
            className="w-48 h-48 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-2xl"
            animate={{
              scale: isActive ? 1 : [1, 1.05, 1],
            }}
            transition={{ duration: isActive ? 4 : 2, ease: "easeInOut" }}
          >
            <span className="text-2xl font-semibold text-white">
              {isActive ? getInstruction() : 'Start'}
            </span>
          </motion.div>
        </div>

        <div className="mt-12">
          {isActive && (
            <motion.p
              className="text-2xl text-slate-600 mb-8"
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Cycle {cycles + 1}
            </motion.p>
          )}
          
          <motion.button
            onClick={() => {
              setIsActive(!isActive);
              if (!isActive) {
                setPhase('inhale');
                setCycles(0);
              }
            }}
            className={`btn-${isActive ? 'secondary' : 'primary'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive ? 'Stop Exercise' : 'Begin Breathing'}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-serif font-bold gradient-text mb-4">Stress Buster</h3>
            <p className="text-slate-400">
              Your safe space to release stress and find inner peace.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#confess" className="hover:text-white transition-colors">Confessions</a></li>
              <li><a href="#whisper" className="hover:text-white transition-colors">Whisper</a></li>
              <li><a href="#breathe" className="hover:text-white transition-colors">Breathing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              {['Twitter', 'Instagram', 'Facebook'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="sr-only">{social}</span>
                  <Heart className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Stress Buster. Made with ❤️ for mental wellness.</p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <WhisperSection />
      <BreathingExercise />
      <Footer />
      <ConfessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Floating CTA Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-2xl flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </motion.button>
    </div>
  );
}

export default App;
