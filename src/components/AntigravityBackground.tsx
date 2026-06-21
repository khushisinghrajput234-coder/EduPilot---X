import React, { useEffect, useRef } from "react";

/**
 * AntigravityBackground
 * 
 * Renders a high-performance 60fps interactive HTML5 Canvas background.
 * Theme: White canvas with glowing Google-styled Blue, Purple, and Orange particles.
 * Mechanics: Floating movement, cursor attraction/repulsion with natural swirling,
 * parallax depth layers, returning home mechanism, and mouse-velocity driven ripple/shockwaves.
 */
export default function AntigravityBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Track mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      lastX: -1000,
      lastY: -1000,
      vx: 0,
      vy: 0,
    };

    // Performance adaptation: dynamic density
    let particleCount = 1000;
    interface Particle {
      x: number; // Current x
      y: number; // Current y
      ox: number; // Original/Base x (before parallax and forces)
      oy: number; // Original/Base y
      vx: number; // velocity x
      vy: number; // velocity y
      size: number; // radius of particle
      color: string; // filled color (rgba)
      depth: number; // parallax multiplier (0.5 to 2.0)
      angle: number; // floating phase angle
      floatSpeed: number; // speed of floating offset
      floatRange: number; // floating distance magnitude
    }

    let particles: Particle[] = [];

    // Active ripples generated from mouse motion/clicks
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      speed: number;
      strength: number;
      active: boolean;
    }
    const ripples: Ripple[] = [];

    // Colors list based on Google's modern color palette (Aesthetic Antigravity)
    const particleColors = [
      "rgba(66, 133, 244, 0.7)",  // Google Blue (semi-transparent)
      "rgba(168, 85, 247, 0.7)",  // Vibrant Purple
      "rgba(234, 67, 53, 0.65)",  // Google Red/Coral Orange
      "rgba(251, 188, 5, 0.7)",   // Google Yellow/Amber
      "rgba(52, 168, 83, 0.6)",   // Google Green accent
      "rgba(99, 102, 241, 0.75)", // Electric Indigo
    ];

    const initParticles = (w: number, h: number) => {
      // Calculate count based on viewport size for consistent density
      const area = w * h;
      particleCount = Math.min(2200, Math.max(800, Math.floor(area / 1000)));
      
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const ox = Math.random() * w;
        const oy = Math.random() * h;
        const depth = 0.5 + Math.random() * 1.5; // Layer depth (forces + speed proportional to visual depth)
        
        particles.push({
          x: ox,
          y: oy,
          ox: ox,
          oy: oy,
          vx: 0,
          vy: 0,
          size: (1 + Math.random() * 2) * (depth >= 1.5 ? 1.2 : 0.8), // deep/closer particles look bigger
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          depth: depth,
          angle: Math.random() * Math.PI * 2,
          floatSpeed: 0.005 + Math.random() * 0.012,
          floatRange: 3 + Math.random() * 7,
        });
      }
    };

    const handleResize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles(width, height);
    };

    // Listen to resize on container
    window.addEventListener("resize", handleResize);
    handleResize();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (mouse.lastX !== -1000) {
        mouse.vx = currentX - mouse.lastX;
        mouse.vy = currentY - mouse.lastY;

        // Dynamic shockwave trigger on fast flicks
        const speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
        if (speed > 25 && ripples.length < 5) {
          ripples.push({
            x: currentX,
            y: currentY,
            radius: 5,
            maxRadius: 160 + speed * 2,
            speed: 5 + speed * 0.15,
            strength: Math.min(12, speed * 0.3),
            active: true,
          });
        }
      }

      mouse.x = currentX;
      mouse.y = currentY;
      mouse.lastX = currentX;
      mouse.lastY = currentY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.lastX = -1000;
      mouse.lastY = -1000;
      mouse.vx = 0;
      mouse.vy = 0;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Click generates a massive interactive ripple that pushes particles away with authority
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 0,
        maxRadius: 280,
        speed: 7,
        strength: 25,
        active: true,
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("mousedown", handleMouseDown);

    // Let's implement mobile touch inputs for perfect responsive coverage
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const currentX = e.touches[0].clientX - rect.left;
        const currentY = e.touches[0].clientY - rect.top;
        
        mouse.x = currentX;
        mouse.y = currentY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      handleMouseLeave();
    };

    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Physics parameters
    const friction = 0.88; // Damping
    const springFactor = 0.04; // Return to baseline speed
    const baseInteractiveRadius = 140; // Proximity to sense mouse
    
    // Animation loop
    const updateAndRender = () => {
      // White clear rect with premium glowing background gradient
      ctx.clearRect(0, 0, width, height);
      
      // Subtle ambient vignetting/glow under canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Decelerate mouse velocity slightly
      mouse.vx *= 0.85;
      mouse.vy *= 0.85;

      // Update ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        if (rip.active) {
          rip.radius += rip.speed;
          if (rip.radius >= rip.maxRadius) {
            rip.active = false;
            ripples.splice(r, 1);
          }
        }
      }

      // Parallax shifts when mouse is active
      let targetParallaxX = 0;
      let targetParallaxY = 0;
      if (mouse.active) {
        // Shift baseline in opposite direction of cursor for visual depth
        targetParallaxX = (mouse.x - width / 2) * -0.05;
        targetParallaxY = (mouse.y - height / 2) * -0.05;
      }

      // Render and simulate particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // 1. Natural idle floating floating path
        p.angle += p.floatSpeed;
        const idleOffsetX = Math.cos(p.angle) * p.floatRange;
        const idleOffsetY = Math.sin(p.angle * 1.5) * p.floatRange;

        // Apply depth-based parallax to target base position
        const targetBaselineX = p.ox + idleOffsetX + (targetParallaxX * p.depth);
        const targetBaselineY = p.oy + idleOffsetY + (targetParallaxY * p.depth);

        // 2. Cursor interaction forces
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          
          const maxDist = baseInteractiveRadius * p.depth; // Deeper layer responds in larger/smaller scale
          
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist; // Strongest force close to mouse
            
            // Combination of Attraction/Repulsion + Swirling Vortex logic
            // Base physical drag pushes particles in direction of mouse drag
            p.vx += mouse.vx * force * 0.15 * p.depth;
            p.vy += mouse.vy * force * 0.15 * p.depth;

            // Swirl swirl logic: perpendicular vectors relative to cursor coordinates
            const swirlStrength = 0.5 * p.depth;
            p.vx += (-dy / dist) * force * swirlStrength;
            p.vy += (dx / dist) * force * swirlStrength;

            // Slight push away (repulsion) to prevent all dots collapsing on exact center
            const repulsion = 0.35 * (1 / p.depth);
            p.vx -= (dx / dist) * force * repulsion;
            p.vy -= (dy / dist) * force * repulsion;
          }
        }

        // 3. Shockwave ripples force
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          if (rip.active) {
            const rDx = p.x - rip.x;
            const rDy = p.y - rip.y;
            const rDistSq = rDx * rDx + rDy * rDy;
            const rDist = Math.sqrt(rDistSq);

            // If particle intersects or is close to ripple front, blast it outwards!
            const widthTolerance = 25;
            if (Math.abs(rDist - rip.radius) < widthTolerance) {
              const insideRatio = 1 - Math.abs(rDist - rip.radius) / widthTolerance;
              const pushIntensity = rip.strength * insideRatio * (1.5 - p.depth * 0.5);
              const angle = Math.atan2(rDy, rDx);
              
              p.vx += Math.cos(angle) * pushIntensity;
              p.vy += Math.sin(angle) * pushIntensity;
            }
          }
        }

        // 4. Return home spring force
        // Tug particle back to its baseline target position
        const homeDx = targetBaselineX - p.x;
        const homeDy = targetBaselineY - p.y;
        
        p.vx += homeDx * springFactor * (1.2 - p.depth * 0.2);
        p.vy += homeDy * springFactor * (1.2 - p.depth * 0.2);

        // 5. Integrate velocity & apply friction damping
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        // Render particle point on the Canvas
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // High quality aesthetic detail: subtle halo/glow border for closer/larger particles
        if (p.size > 2.0) {
          ctx.strokeStyle = p.color.replace("0.7", "0.2").replace("0.65", "0.15");
          ctx.lineWidth = p.size * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(updateAndRender);
    };

    animationFrameId = requestAnimationFrame(updateAndRender);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      id="antigravity-particles-canvas"
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full pointer-events-auto"
      style={{ mixBlendMode: "multiply", zIndex: 0 }}
    />
  );
}
