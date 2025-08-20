import React from "react";
import "./LandingPage.css";

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-purple-600 to-indigo-700 text-white overflow-hidden">
      {/* Top split section */}
      <div className="relative flex flex-1 w-full">
        {/* Left half: dark violet background */}
        <div className="flex w-1/2 items-center justify-center bg-violet-900 px-12">
          <h1 className="font-zentry text-[6rem] font-black uppercase leading-tight drop-shadow-lg">
            feed<b>aily</b>
          </h1>
        </div>

        {/* Right half: light gradient background */}
        <div className="flex w-1/2 flex-col items-center justify-center bg-indigo-50 px-16 text-black space-y-8">
          <div className="flex space-x-6">
            <button
              onClick={onLoginClick}
              className="rounded-full border-2 border-violet-800 bg-violet-600 px-8 py-3 font-general text-xl font-semibold text-white shadow-lg transition hover:bg-violet-700 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onGetStartedClick}
              className="rounded-full border-2 border-violet-600 bg-yellow-300 px-8 py-3 font-general text-xl font-semibold text-black shadow-lg transition hover:bg-yellow-400 cursor-pointer"
            >
              Get Started
            </button>
          </div>
          <p className="max-w-sm text-center font-circular-web text-lg font-semibold tracking-wide">
            Join us in reducing food waste & feeding those in need.
          </p>
        </div>

        {/* Center image with drop shadow and bobbing animation */}
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png"
          alt="Hand drawn food illustration"
          className="absolute top-[65%] left-1/2 w-56 -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl animate-bounce-slow pointer-events-none"
          style={{ filter: "drop-shadow(0 12px 8px rgba(0,0,0,0.25))" }}
        />
      </div>

      {/* Bottom section with split colors and large text */}
      <div className="flex h-40 w-full">
        <div className="flex w-1/2 items-center justify-center bg-violet-900">
          <p className="font-zentry text-3xl font-bold uppercase tracking-widest text-yellow-300 drop-shadow-lg">
            Save Food. Save Planet.
          </p>
        </div>
        <div className="flex w-1/2 items-center justify-center bg-indigo-50">
          <p className="font-zentry text-3xl font-bold uppercase tracking-widest text-violet-900 drop-shadow-lg">
            Reduce Waste. Feed People.
          </p>
        </div>
      </div>
    </div>
  );
}
