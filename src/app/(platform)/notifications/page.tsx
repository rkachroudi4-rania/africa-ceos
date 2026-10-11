
"use client";

import { useState } from "react";

type Notification = {
  id: number;
  title: string;
  description: string;
  time: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Welcome to Africa CEOs",
      description: "Discover the community and connect with other members.",
      time: "Just now",
    },
    {
      id: 2,
      title: "Complete your profile",
      description: "Add information to help others discover you.",
      time: "Today",
    },
  ]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Notifications</h1>

        <button
          onClick={() => setNotifications([])}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-xl border p-6 text-center text-gray-500">
          You have no notifications.
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-xl border border-gray-200 p-4"
            >
              <h2 className="font-semibold">{notification.title}</h2>
              <p className="mt-1 text-sm text-gray-600">
                {notification.description}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {notification.time}
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
