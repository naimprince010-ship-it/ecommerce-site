import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Super Deal',
    supportEmail: 'support@example.com',
    notifications: true,
    theme: 'light',
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container">
      <header className="stacked">
        <h1>Settings</h1>
        <p className="muted">Configure the basics of your admin</p>
      </header>

      <div className="grid two-col">
        <div className="card">
          <h2>Store details</h2>
          <label>
            Store name
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
            />
          </label>
          <label>
            Support email
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
            />
          </label>
        </div>

        <div className="card">
          <h2>Preferences</h2>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
            />
            Enable order notifications
          </label>
          <label>
            Theme
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button type="button" className="ghost" disabled>
            Save (mock)
          </button>
        </div>
      </div>
    </div>
  );
}
