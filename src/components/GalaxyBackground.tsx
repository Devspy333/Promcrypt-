import React, { useEffect, useRef } from 'react';
import { ThemeName, THEMES } from '../themes';

interface GalaxyBackgroundProps {
  theme?: ThemeName;
}

const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({ theme = 'purple' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const currentTheme = THEMES[theme];

    // Star properties
    const stars: { x: number, y: number, z: number, radius: number, alpha: number, color: string }[] = [];
    const numStars = 800;
    const colors = currentTheme.stars;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width * 2 - width / 2,
        y: Math.random() * height * 2 - height / 2,
        z: Math.random() * 2 + 0.1, // Depth for parallax
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Shooting star properties
    const shootingStars: { x: number, y: number, length: number, speed: number, angle: number, active: boolean, opacity: number }[] = [];
    const numShootingStars = 3;

    for (let i = 0; i < numShootingStars; i++) {
      shootingStars.push({
        x: 0, y: 0, length: 0, speed: 0, angle: 0, active: false, opacity: 0
      });
    }

    // Nebula properties
    const nebulas: { x: number, y: number, radius: number, color: string, vx: number, vy: number, phase: number }[] = [];
    const numNebulas = 6;
    const nebulaColors = currentTheme.nebula;

    for (let i = 0; i < numNebulas; i++) {
      nebulas.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 500 + 300,
        color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      
      const mouseOffsetX = (mouseX - width / 2) * 0.05;
      const mouseOffsetY = (mouseY - height / 2) * 0.05;

      // Clear canvas with deep space background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, currentTheme.gradient[0]);
      gradient.addColorStop(0.5, currentTheme.gradient[1]);
      gradient.addColorStop(1, currentTheme.gradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw nebulas (slowly pulsing and moving)
      nebulas.forEach(nebula => {
        nebula.x += nebula.vx;
        nebula.y += nebula.vy;
        nebula.phase += 0.005;

        if (nebula.x < -nebula.radius) nebula.x = width + nebula.radius;
        if (nebula.x > width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y < -nebula.radius) nebula.y = height + nebula.radius;
        if (nebula.y > height + nebula.radius) nebula.y = -nebula.radius;

        const pulseRadius = nebula.radius * (1 + Math.sin(nebula.phase) * 0.1);
        
        // Parallax for nebulas
        const drawX = nebula.x - mouseOffsetX * 0.5;
        const drawY = nebula.y - mouseOffsetY * 0.5;

        const radGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, pulseRadius);
        radGrad.addColorStop(0, nebula.color);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(drawX, drawY, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stars with parallax and movement
      stars.forEach(star => {
        // Base movement (drifting left)
        star.x -= 0.5 / star.z;
        
        // Wrap around
        if (star.x < -width / 2) star.x = width * 1.5;
        if (star.x > width * 1.5) star.x = -width / 2;
        if (star.y < -height / 2) star.y = height * 1.5;
        if (star.y > height * 1.5) star.y = -height / 2;

        // Twinkle effect
        star.alpha += (Math.random() - 0.5) * 0.1;
        if (star.alpha < 0.2) star.alpha = 0.2;
        if (star.alpha > 1) star.alpha = 1;

        // Apply parallax based on z-depth
        const drawX = star.x - mouseOffsetX / star.z;
        const drawY = star.y - mouseOffsetY / star.z;

        // Only draw if on screen
        if (drawX > 0 && drawX < width && drawY > 0 && drawY < height) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
          
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.alpha;
          ctx.fill();
          
          // Add glow to brighter/closer stars
          if (star.z < 0.5 && star.alpha > 0.8) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });
      ctx.globalAlpha = 1.0; // Reset

      // Handle shooting stars
      shootingStars.forEach(ss => {
        if (!ss.active) {
          // Randomly spawn shooting stars
          if (Math.random() < 0.005) {
            ss.active = true;
            ss.x = Math.random() * width * 1.5;
            ss.y = -50;
            ss.length = Math.random() * 100 + 50;
            ss.speed = Math.random() * 15 + 10;
            ss.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2; // roughly 45 degrees
            ss.opacity = 1;
          }
        } else {
          // Move shooting star
          ss.x -= Math.cos(ss.angle) * ss.speed;
          ss.y += Math.sin(ss.angle) * ss.speed;
          ss.opacity -= 0.015;

          if (ss.opacity <= 0 || ss.y > height || ss.x < 0) {
            ss.active = false;
          } else {
            // Draw shooting star
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
            
            const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + Math.cos(ss.angle) * ss.length, ss.y - Math.sin(ss.angle) * ss.length);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none"
    />
  );
};

export default GalaxyBackground;
