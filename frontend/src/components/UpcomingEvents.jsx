import React, { useEffect, useState, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  const autoplay = useRef(
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [
    emblaApi,
  ]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [
    emblaApi,
  ]);

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
              poster:
                item.filePath && item.filePath.trim() !== ""
                  ? item.filePath
                  : null,
              date: formData.Event_Date
                ? new Date(formData.Event_Date).toLocaleDateString()
                : "",
              time: formData.Event_Time || "",
              venue: formData.Venue || "",
            };
          });
        setEvents(filtered);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-lg">
        No upcoming events available.
      </div>
    );
  }

  return (
    <div className="relative w-full py-6 px-4">
      {/* Heading */}
      <h2 className="text-3xl font-semibold text-center mb-6">Upcoming Events</h2>

      {/* Left Arrow */}
      <button
        onClick={scrollPrev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center opacity-60"
      >
        <FiChevronLeft className="text-gray-700 text-lg" />
      </button>

      {/* Carousel */}
      <div className="embla overflow-hidden w-full px-2" ref={emblaRef}>
        <div className="embla__container flex gap-2 mx-[-3px]">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="embla__slide flex-shrink-0 w-[280px] sm:w-[370px] mx-2 cursor-pointer"
            >
              <article className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden flex flex-col h-full">
                {/* Poster */}
                <div className="relative w-full h-48 sm:h-56 flex items-center justify-center bg-gray-100">
                  {event.poster ? (
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-gray-500">Not available</span>
                  )}
                  {event.poster && <div className="absolute inset-0 bg-black/20" />}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex justify-between items-start">
                {/* Left side: title and purpose */}
                <div className="max-w-[65%]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {event.title}
                    </h3>
                    {event.purpose && (
                    <p className="text-sm text-gray-700 line-clamp-3">{event.purpose}</p>
                    )}
                </div>

                {/* Right side: date, time, venue */}
                {/* Right side: date, time, venue stacked vertically */}
                    <div className="mt-1 text-xs text-gray-500 flex flex-col space-y-1 flex-shrink-0 text-right">
                    {event.date && <div>{event.date}</div>}
                    {event.time && <div>{event.time}</div>}
                    {event.venue && <div>{event.venue}</div>}
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
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center opacity-60"
      >
        <FiChevronRight className="text-gray-700 text-lg" />
      </button>
    </div>
  );
}
