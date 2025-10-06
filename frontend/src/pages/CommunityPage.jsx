import React, { useState, useEffect } from "react";
import AddPostForm from "../components/community/AddPostForm";
import PostCard from "../components/community/PostCard";
import EventCard from "../components/community/EventCard";

// Mock data to simulate fetching from a backend
const MOCK_POSTS = [
  {
    id: 1,
    type: "post",
    title: "Neighborhood Cleanup Drive Success!",
    description: "Thank you to everyone who joined our cleanup drive last weekend. We collected over 50 bags of trash and made our streets beautiful.",
    imageUrl: "https://images.unsplash.com/photo-1618479124194-1a9b4050ab1d?q=80&w=2070",
    author: "Jane Doe",
  },
];

const MOCK_EVENTS = [
  {
    id: 2,
    type: "event",
    title: "Annual Food Donation Marathon",
    description: "Join us to pack and distribute food to local shelters. We aim to prepare 1,000 meals for those in need. Every volunteer counts!",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070",
    author: "Local Charity Group",
    venue: "Community Hall, 123 Main St.",
    participants: 42,
  },
];


const CommunityPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);

  // Simulate fetching approved posts from backend on component mount
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    setPosts(MOCK_POSTS);
    setEvents(MOCK_EVENTS);
  }, []);

  const handlePostSubmit = (newPost) => {
    // In a real app, this would send the post to the backend for admin approval.
    // For now, we just show an alert.
    alert(
      `'${newPost.title}' submitted for admin approval.\nIt will appear here once approved.`
    );
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Community Hub</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          + Create Post
        </button>
      </div>

      {showForm && (
        <AddPostForm
          onSubmit={handlePostSubmit}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Display Section for Events */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">
          Upcoming Social Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Display Section for Posts */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">
          Social Work Updates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;