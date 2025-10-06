import React, { useState } from "react";
import { MapPin, Users, Heart } from "lucide-react";

const EventCard = ({ event }) => {
  const [participantCount, setParticipantCount] = useState(event.participants);
  const [isParticipating, setIsParticipating] = useState(false);

  const handleParticipate = () => {
    if (isParticipating) {
      setParticipantCount(participantCount - 1);
    } else {
      setParticipantCount(participantCount + 1);
    }
    setIsParticipating(!isParticipating);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
        <p className="text-gray-600 mt-2 flex-grow">{event.description}</p>
        
        <div className="mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center mt-2">
            <Users className="w-4 h-4 mr-2" />
            <span>{participantCount} people participating</span>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleParticipate}
            className={`w-full py-2 rounded-md font-semibold transition-colors ${
              isParticipating
                ? "bg-green-600 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {isParticipating ? "Participating" : "Opt to Participate"}
          </button>
          <button className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;