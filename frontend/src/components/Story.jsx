import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import Button from "./Button";
import AnimatedTitle from "./AnimatedTitle";

const FloatingImage = () => {
  const frameRef = useRef(null);
  const sectionRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const yPos = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((yPos - centerY) / centerY) * -10;
    const rotateY = ((xPos - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  const handleMouseLeave = () => {
    const element = frameRef.current;

    if (element) {
      gsap.to(element, {
        duration: 0.3,
        rotateX: 0,
        rotateY: 0,
        ease: "power1.inOut",
      });
    }
  };

  // 🔊 Toggle mute/unmute when clicking video
  const toggleMute = () => {
    if (frameRef.current) {
      frameRef.current.muted = !frameRef.current.muted;
      setIsMuted(frameRef.current.muted);
    }
  };

  // 👀 Auto mute when section not visible
  useEffect(() => {
    if (!sectionRef.current || !frameRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          // Section out of view → force mute
          frameRef.current.muted = true;
          setIsMuted(true);
        }
      },
      { threshold: 0.2 } // 20% of section visible counts as "in view"
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="prologue"
      ref={sectionRef}
      className="min-h-dvh w-screen bg-black text-blue-50"
    >
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
          Join the ranks. Save food. Shape the story.
        </p>

        <div className="relative size-full">
          <AnimatedTitle
            title="Where w<b>a</b>ste  ends,<br />impact be<b>g</b>ins."
            containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10"
          />

          <div className="story-img-container relative">
            <div className="story-img-mask">
              <div className="story-img-content relative">
                <video
                  ref={frameRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  onClick={toggleMute} // 👈 click video to toggle sound
                  src="videos/entrance.mp4"
                  loop
                  muted
                  autoPlay
                  className="object-contain"
                />

                {/* 🔊 Sound Status Icon */}
                <div className="absolute bottom-3 right-3 z-50 bg-black/60 p-2 rounded-full text-white">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </div>
              </div>
            </div>

            {/* for the rounded corner */}
            <svg
              className="invisible absolute size-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="flt_tag">
                  <feGaussianBlur
                    in="SourceGraphic"
                    stdDeviation="8"
                    result="blur"
                  />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                    result="flt_tag"
                  />
                  <feComposite
                    in="SourceGraphic"
                    in2="flt_tag"
                    operator="atop"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        <div className="-mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-3 max-w-sm text-center font-circular-web text-violet-50 md:text-start">
              Every shared meal adds to a bigger story. Every donor, every
              recipient, every rescued plate — together, they climb the
              leaderboard of change.
            </p>

            <Button
              id="realm-btn"
              title="discover prologue"
              containerClass="mt-5"
              to="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingImage;