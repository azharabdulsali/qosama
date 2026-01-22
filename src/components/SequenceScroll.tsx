"use client";

import { useScroll, useTransform, motion, useMotionValueEvent } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const FRAME_COUNT = 192;

export default function SequenceScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress to frame index
  const currentIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  // Preload images
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const promises = [];

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const promise = new Promise<void>((resolve, reject) => {
          const img = new Image();
          const frameIndex = i.toString().padStart(3, "0"); // 001, 002, ...
          img.src = `/sequence/ezgif-frame-${frameIndex}.jpg`;
          img.onload = () => {
            loadedImages[i - 1] = img;
            resolve();
          };
          img.onerror = reject;
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Draw to canvas
  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || images.length === 0) return;

    // Standardize index
    const safeIndex = Math.min(
      Math.max(Math.floor(index) - 1, 0),
      images.length - 1
    );
    const img = images[safeIndex];

    if (!img) return;

    // Draw image to cover the canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw background color to blend seamlessly (optional if image covers all)
    ctx.fillStyle = "#1e1e20"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Resize canvas handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Re-render current frame on resize
        renderFrame(currentIndex.get()); 
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener("resize", handleResize);
  }, [images]); // detailed dependency to ensure re-render if images load after resize

  // Update canvas on scroll
  useMotionValueEvent(currentIndex, "change", (latest) => {
    renderFrame(latest);
  });
  
  // Initial render when loading finishes
  useEffect(() => {
      if (!isLoading && images.length > 0) {
          renderFrame(1);
      }
  }, [isLoading, images]);


  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#1e1e20]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
        />
        
        {/* Loading State */}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e20] z-50 text-white">
                <div className="text-2xl font-light tracking-widest animate-pulse">MEMUAT SEQUENCE...</div>
            </div>
        )}

        {/* Text Overlays - Positioned absolutely based on scroll */}
        {/* We can use opacity mapped to scrollYProgress for strict control, or separate motion divs */}
        
        {/* Section 1: 0-25% */}
        <OpacitySection progress={scrollYProgress} start={0} end={0.2} fadeIn={false} className="flex items-center justify-center">
             <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-center uppercase mix-blend-difference">
                 QOSAMA<br />
                 <span className="text-xl md:text-3xl font-light tracking-[0.5em] block mt-4">Kemurnian Mutlak</span>
             </h1>
        </OpacitySection>

        {/* Section 2: 25-50% */}
        <OpacitySection progress={scrollYProgress} start={0.25} end={0.45} className="flex items-center justify-start px-12 md:px-32">
             <div className="max-w-2xl">
                 <h2 className="text-5xl md:text-7xl font-bold mb-4">Teknologi <br/><span className="text-gray-400">Busa Mikro</span></h2>
                 <p className="text-lg text-gray-300">Membersihkan hingga ke serat terdalam tanpa merusak material. Efektif, aman, dan revolusioner.</p>
             </div>
        </OpacitySection>
        
        {/* Section 3: 50-75% */}
        <OpacitySection progress={scrollYProgress} start={0.55} end={0.75} className="flex items-center justify-end px-12 md:px-32">
             <div className="max-w-2xl text-right">
                 <h2 className="text-5xl md:text-7xl font-bold mb-4">Pengeringan <br/><span className="text-gray-400">Tanpa Gravitasi</span></h2>
                 <p className="text-lg text-gray-300">Sistem sirkulasi udara presisi menjaga bentuk sepatu Anda tetap sempurna saat proses pengeringan.</p>
             </div>
        </OpacitySection>

        {/* Section 4: 80-100% */}
        <OpacitySection progress={scrollYProgress} start={0.85} end={1.0} className="flex items-center justify-center">
             <div className="text-center">
                 <h2 className="text-4xl md:text-6xl font-bold mb-8">Hidupkan Kembali Langkahmu</h2>
                 <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform duration-300">
                    MULAI SEKARANG
                 </button>
             </div>
        </OpacitySection>

      </div>
    </div>
  );
}

import { MotionValue } from "motion/react";

function OpacitySection({ progress, start, end, children, className, fadeIn = true }: { 
    progress: MotionValue<number>, 
    start: number, 
    end: number, 
    children: React.ReactNode, 
    className?: string,
    fadeIn?: boolean 
}) {
    const opacity = useTransform(progress, 
        fadeIn ? [start, start + 0.05, end - 0.05, end] : [start, end - 0.05, end], 
        fadeIn ? [0, 1, 1, 0] : [1, 1, 0]
    );
    const y = useTransform(progress,
        fadeIn ? [start, start + 0.05, end - 0.05, end] : [start, end - 0.05, end],
        fadeIn ? [50, 0, 0, -50] : [0, 0, -50]
    );
    const pointerEvents = useTransform(progress, (v: number) => v >= start && v <= end ? "auto" : "none");

    return (
        <motion.div 
            style={{ opacity, y, pointerEvents }}
            className={clsx("absolute inset-0 z-10 w-full h-full text-white pointer-events-none", className)}
        >
            {children}
        </motion.div>
    )
}
