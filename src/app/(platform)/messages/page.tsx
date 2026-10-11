"use client";

import { useState } from "react";

export default function MessagesPage() {
  const [message, setMessage] = useState("");

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">
        Messages
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Connect and communicate with people on Africa CEOs.
      </p>

      <div className="rounded-xl border border-gray-200 p-5">
        <p className="mb-4 font-medium">
          Start a conversation
        </p>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a message..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-transparent p-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="mt-2 text-sm text-gray-500">
          {message.length} characters
        </p>
      </div>
    </main>
  );
}
