
import React, { useEffect, useState } from 'react';
import { Heart, Shield, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Heart, text: "SmartCare", color: "text-red-500" },
    { icon: Shield, text: "Secure Admin", color: "text-blue-500" },
    { icon: Activity, text: "Dashboard", color: "text-green-500" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(onComplete, 1000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete, steps.length]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center animate-fade-in-up">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            {React.createElement(steps[currentStep].icon, {
              className: `w-12 h-12 ${steps[currentStep].color} animate-pulse-slow`
            })}
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {steps[currentStep].text}
          </h1>
          <p className="text-white/80 text-lg">
            Platform Administrasi Kesehatan
          </p>
        </div>
        
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-white scale-125' 
                  : index < currentStep 
                    ? 'bg-white/70' 
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
