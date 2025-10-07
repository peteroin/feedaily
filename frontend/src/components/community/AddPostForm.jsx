import React, { useState } from "react";

const AddPostForm = ({ onSubmit, onClose }) => {
  const [postType, setPostType] = useState("post");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Title and description are required.");
      return;
    }
    // In a real app, you would handle image upload properly
    const postData = { postType, title, description, venue, imageName: image?.name };
    onSubmit(postData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-4">Create a New Post</h2>
        
        {/* Post Type Selector */}
        <div className="flex border border-gray-300 rounded-md p-1 mb-6">
          <button
            onClick={() => setPostType("post")}
            className={`w-1/2 p-2 rounded-md ${postType === 'post' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600'}`}
          >
            Social Work Post
          </button>
          <button
            onClick={() => setPostType("event")}
            className={`w-1/2 p-2 rounded-md ${postType === 'event' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600'}`}
          >
            Upcoming Event
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required></textarea>
          </div>
          {postType === "event" && (
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">Venue</label>
              <input type="text" id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
            </div>
          )}
          <div>
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Picture</label>
            <input type="file" id="picture" onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit for Approval</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostForm;