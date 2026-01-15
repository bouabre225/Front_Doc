import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Activity, 
  Heart, 
  Thermometer,
  Syringe,
  Pill,
  Microscope,
  Brain,
  Droplet,
  Zap
} from 'lucide-react';

const AnimatedBackground = () => {
  const equipments = [
    { icon: Stethoscope, delay: 0, x: 8, y: 15, size: 'w-16 h-16', duration: 6 },
    { icon: Activity, delay: 0.7, x: 85, y: 10, size: 'w-20 h-20', duration: 7 },
    { icon: Heart, delay: 1.2, x: 15, y: 75, size: 'w-14 h-14', duration: 5 },
    { icon: Thermometer, delay: 1.8, x: 92, y: 82, size: 'w-18 h-18', duration: 8 },
    { icon: Syringe, delay: 2.3, x: 48, y: 45, size: 'w-22 h-22', duration: 6 },
    { icon: Pill, delay: 2.9, x: 72, y: 28, size: 'w-16 h-16', duration: 7 },
    { icon: Microscope, delay: 3.4, x: 28, y: 38, size: 'w-20 h-20', duration: 5 },
    { icon: Brain, delay: 4, x: 65, y: 68, size: 'w-18 h-18', duration: 6 },
    { icon: Droplet, delay: 0.5, x: 40, y: 20, size: 'w-14 h-14', duration: 7 },
    { icon: Zap, delay: 1.5, x: 55, y: 85, size: 'w-16 h-16', duration: 8 }
  ];

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/50'></div>
      
      {equipments.map((equipment, index) => {
        const Icon = equipment.icon;
        return (
          <motion.div
            key={index}
            className='absolute'
            style={{
              left: `${equipment.x}%`,
              top: `${equipment.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.15, 0.25, 0.15],
              y: [0, -40, 0],
              x: [0, 15, -15, 0],
              rotate: [0, 15, -15, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: equipment.duration,
              delay: equipment.delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut'
            }}
          >
            <motion.div
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Icon className={`${equipment.size} text-[#1DBF73]`} />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className='absolute w-2 h-2 bg-[#09B1BA] rounded-full'
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;