import React, { useState } from 'react';
import { 
  Save, Download, Upload, Bell, Shield, User, 
  Database, Trash2, AlertTriangle, CheckCircle,
  ChevronDown, Settings as SettingsIcon, RefreshCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      lowStock: true,
      dailyReport: false,
      weeklySummary: true,
      emailNotifications: true,
      pushNotifications: false,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      itemsPerPage: 20,
      autoRefresh: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAlerts: true,
      autoLogout: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeSection, setActiveSection] = useState('notifications');
  const [importFile, setImportFile] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    // Create a blob of the settings data
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(importedSettings);
        setSaveStatus('imported');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleResetSettings = () => {
    setSettings({
      notifications: {
        lowStock: true,
        dailyReport: false,
        weeklySummary: true,
        emailNotifications: true,
        pushNotifications: false,
      },
      preferences: {
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        itemsPerPage: 20,
        autoRefresh: true,
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAlerts: true,
        autoLogout: true,
      },
    });
    setShowResetConfirm(false);
    setSaveStatus('reset');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleFileSelect = (event) => {
    setImportFile(event.target.files[0]);
  };

  const settingSections = [
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Manage your notification preferences',
      settings: [
        {
          key: 'lowStock',
          label: 'Low Stock Alerts',
          description: 'Get notified when products reach low stock levels',
          type: 'toggle',
        },
        {
          key: 'dailyReport',
          label: 'Daily Reports',
          description: 'Receive daily inventory summary reports',
          type: 'toggle',
        },
        {
          key: 'weeklySummary',
          label: 'Weekly Summaries',
          description: 'Get weekly performance summaries',
          type: 'toggle',
        },
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          type: 'toggle',
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive browser push notifications',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: User,
      description: 'Customize your application experience',
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred interface theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'Auto (System)' },
          ],
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ],
        },
        {
          key: 'dateFormat',
          label: 'Date Format',
          description: 'Choose how dates are displayed',
          type: 'select',
          options: [
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
          ],
        },
        {
          key: 'timeFormat',
          label: 'Time Format',
          description: 'Choose how time is displayed',
          type: 'select',
          options: [
            { value: '12h', label: '12-hour format' },
            { value: '24h', label: '24-hour format' },
          ],
        },
        {
          key: 'itemsPerPage',
          label: 'Items Per Page',
          description: 'Number of items to show per page in lists',
          type: 'select',
          options: [
            { value: '10', label: '10 items' },
            { value: '20', label: '20 items' },
            { value: '50', label: '50 items' },
            { value: '100', label: '100 items' },
          ],
        },
        {
          key: 'autoRefresh',
          label: 'Auto Refresh',
          description: 'Automatically refresh data periodically',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      description: 'Manage your security preferences',
      settings: [
        {
          key: 'twoFactor',
          label: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          type: 'toggle',
        },
        {
          key: 'sessionTimeout',
          label: 'Session Timeout',
          description: 'Automatically log out after inactivity (minutes)',
          type: 'select',
          options: [
            { value: '15', label: '15 minutes' },
            { value: '30', label: '30 minutes' },
            { value: '60', label: '1 hour' },
            { value: '120', label: '2 hours' },
            { value: '240', label: '4 hours' },
          ],
        },
        {
          key: 'passwordExpiry',
          label: 'Password Expiry',
          description: 'Days before password expires',
          type: 'select',
          options: [
            { value: '30', label: '30 days' },
            { value: '60', label: '60 days' },
            { value: '90', label: '90 days' },
            { value: '180', label: '180 days' },
          ],
        },
        {
          key: 'loginAlerts',
          label: 'Login Alerts',
          description: 'Get notified of new sign-ins from unknown devices',
          type: 'toggle',
        },
        {
          key: 'autoLogout',
          label: 'Auto Logout',
          description: 'Automatically log out when browser closes',
          type: 'toggle',
        },
      ],
    },
  ];

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <SettingsIcon className="h-8 w-8 mr-3 text-indigo-600" />
              System Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your application preferences and configuration</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-4 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-200"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Save Status Indicator */}
        {saveStatus && (
          <div className={`p-4 rounded-xl border ${
            saveStatus === 'success' || saveStatus === 'imported' || saveStatus === 'reset' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {saveStatus === 'success' || saveStatus === 'imported' || saveStatus === 'reset' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-2" />
              )}
              <span>
                {saveStatus === 'success' && 'Settings saved successfully!'}
                {saveStatus === 'imported' && 'Settings imported successfully!'}
                {saveStatus === 'reset' && 'Settings reset to defaults!'}
                {saveStatus === 'error' && 'Error saving settings. Please try again.'}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Settings Categories</h2>
              <div className="space-y-1">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{section.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Data Management Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-gray-500" />
                Data Management
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Export Settings</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Download your current settings as a backup file
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Import Settings</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Restore settings from a previously exported file
                  </p>
                  <label className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Reset Settings</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Restore all settings to their default values
                  </p>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-3">
            {settingSections.map((section) => {
              if (section.id !== activeSection) return null;
              const Icon = section.icon;
              
              return (
                <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center">
                      <Icon className="h-6 w-6 mr-3 text-indigo-600" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {section.settings.map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            {setting.label}
                          </label>
                          <p className="text-sm text-gray-500">{setting.description}</p>
                        </div>
                        <div className="ml-6">
                          {setting.type === 'toggle' && (
                            <ToggleSwitch
                              checked={settings[section.id][setting.key]}
                              onChange={(value) => handleSettingChange(section.id, setting.key, value)}
                            />
                          )}
                          {setting.type === 'select' && (
                            <select
                              value={settings[section.id][setting.key]}
                              onChange={(e) => handleSettingChange(section.id, setting.key, e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-w-[120px]"
                            >
                              {setting.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Reset Settings</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;