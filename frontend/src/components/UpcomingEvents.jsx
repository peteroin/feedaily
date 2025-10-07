import React, { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/collaborations");
        const data = await res.json();

        const filtered = data
          .filter(
            (item) =>
              item.type === "event" && item.acceptedByAdmin === "Accepted"
          )
          .map((item) => {
            const formData = JSON.parse(item.formData || "{}");

            return {
              title: formData.Event_name || "Untitled Event",
              purpose: formData.Purpose || "",
              poster: item.filePath && item.filePath.trim() !== "" ? item.filePath : null,
            };
          });
        setEvents(filtered);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    autoplay.current.play();
  }, [emblaApi]);

  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-lg">
        No upcoming events available.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[640px] mx-auto py-6">
      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
      >
        <FiChevronLeft className="text-gray-700 text-lg" />
      </button>

      {/* Carousel */}
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-4">
          {events.map((event, idx) => (
            <div key={idx} className="embla__slide flex-shrink-0 w-full">
              <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02]">
                {/* Poster */}
                <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 flex items-center justify-center bg-gray-100">
                  {event.poster ? (
  <img
    src={event.poster} // now it will display correctly
    alt={event.title}
    className="w-full h-full object-cover object-center"
  />
) : (
  <span className="text-gray-500">Not available</span>
)}
                  {event.poster && (
                    <div className="absolute inset-0 bg-black/20" />
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
                      {event.title}
                    </h3>

                    {event.purpose && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {event.purpose}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollNext}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
      >
        <FiChevronRight className="text-gray-700 text-lg" />
      </button>
    </div>
  );
}
