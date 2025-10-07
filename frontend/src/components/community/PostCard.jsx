import React from "react";

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
        <p className="text-gray-600 mt-2">{post.description}</p>
        <p className="text-xs text-gray-400 mt-4">Posted by {post.author}</p>
      </div>
    </div>
  );
};

export default PostCard;