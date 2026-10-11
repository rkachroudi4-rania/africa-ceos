
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Settings</h1>

      <p className="mb-6 text-sm text-gray-500">
        Manage your Africa CEOs preferences.
      </p>

      <section className="space-y-4 rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold">Preferences</h2>

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-medium">Email notifications</span>
            <span className="text-sm text-gray-500">
              Receive updates by email.
            </span>
          </span>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(event) =>
              setEmailNotifications(event.target.checked)
            }
          />
        </label>

        <hr className="border-gray-200" />

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-medium">Public profile</span>
            <span className="text-sm text-gray-500">
              Allow other members to discover your profile.
            </span>
          </span>
          <input
            type="checkbox"
            checked={publicProfile}
            onChange={(event) => setPublicProfile(event.target.checked)}
          />
        </label>

        <hr className="border-gray-200" />

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-medium">Dark mode preference</span>
            <span className="text-sm text-gray-500">
              Choose your preferred appearance.
            </span>
          </span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(event) => setDarkMode(event.target.checked)}
          />
        </label>
      </section>

      <p className="mt-4 text-sm text-gray-500">
        These preferences are currently temporary and reset when the page reloads.
      </p>
    </main>
  );
}
