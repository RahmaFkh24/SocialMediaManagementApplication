/*import React, { useState } from "react";

export default function PostModal({ date, onClose }) {
    const [content, setContent] = useState("");
    const [platforms, setPlatforms] = useState([]);

    const togglePlatform = (platform) => {
        setPlatforms((prev) =>
            prev.includes(platform)
                ? prev.filter((p) => p !== platform)
                : [...prev, platform]
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="text-lg font-semibold mb-2">
                    Schedule post for {date.toDateString()}
                </h3>
                <textarea
                    className="w-full border rounded p-2 mb-4"
                    rows="4"
                    placeholder="What would you like to share?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="mb-4">
                    <span className="block mb-1 font-medium">Platforms</span>
                    <div className="flex gap-2">
                        {["Facebook", "Instagram", "Twitter"].map((platform) => (
                            <button
                                key={platform}
                                className={`px-3 py-1 rounded-full text-sm ${platforms.includes(platform)
                                        ? "bg-purple-500 text-white"
                                        : "bg-gray-200"
                                    }`}
                                onClick={() => togglePlatform(platform)}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between">
                    <button className="px-3 py-1 border rounded">Save as Draft</button>
                    <button className="px-3 py-1 bg-gray-300 rounded">Share Now</button>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded">
                        Schedule Post
                    </button>
                </div>
            </div>
        </div>
    );
}
*/