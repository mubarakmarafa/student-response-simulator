'use client';

import { useState, useEffect } from 'react';
import { SavedPrompt } from '@/lib/types';
import { getSavedPrompts, savePrompt, deleteSavedPrompt, updateSavedPrompt } from '@/lib/demoData';

interface SavedPromptsManagerProps {
  currentPromptText: string;
  onSelectPrompt: (promptText: string) => void;
}

export default function SavedPromptsManager({ currentPromptText, onSelectPrompt }: SavedPromptsManagerProps) {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedPrompts, setShowSavedPrompts] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);
  const [editName, setEditName] = useState('');
  const [editText, setEditText] = useState('');

  // Load saved prompts on component mount
  useEffect(() => {
    setSavedPrompts(getSavedPrompts());
  }, []);

  const handleSavePrompt = async () => {
    if (!newPromptName.trim() || !currentPromptText.trim()) return;
    
    try {
      const savedPrompt = savePrompt(newPromptName, currentPromptText);
      setSavedPrompts([...savedPrompts, savedPrompt]);
      setNewPromptName('');
      setShowSaveDialog(false);
    } catch (error) {
      alert('Failed to save prompt. Please try again.');
    }
  };

  const handleDeletePrompt = (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        deleteSavedPrompt(id);
        setSavedPrompts(savedPrompts.filter(prompt => prompt.id !== id));
      } catch (error) {
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };

  const handleEditPrompt = (prompt: SavedPrompt) => {
    setEditingPrompt(prompt);
    setEditName(prompt.name);
    setEditText(prompt.text);
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt || !editName.trim() || !editText.trim()) return;
    
    try {
      const updatedPrompt = updateSavedPrompt(editingPrompt.id, editName, editText);
      setSavedPrompts(savedPrompts.map(prompt => 
        prompt.id === editingPrompt.id ? updatedPrompt : prompt
      ));
      setEditingPrompt(null);
      setEditName('');
      setEditText('');
    } catch (error) {
      alert('Failed to update prompt. Please try again.');
    }
  };

  const canSave = currentPromptText.trim().length > 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Your Custom Prompts</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!canSave}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              canSave 
                ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
            title={canSave ? 'Save current prompt' : 'Enter a prompt to save'}
          >
            💾 Save Current Prompt
          </button>
          <button
            onClick={() => setShowSavedPrompts(!showSavedPrompts)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded transition-colors border border-blue-200"
          >
            {showSavedPrompts ? '▼' : '▶'} Saved Prompts ({savedPrompts.length})
          </button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-yellow-800 mb-2">Save Analysis Prompt</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Prompt Name:
              </label>
              <input
                type="text"
                value={newPromptName}
                onChange={(e) => setNewPromptName(e.target.value)}
                placeholder="e.g., Common Misconceptions Check"
                className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSavePrompt()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">
                Prompt Text:
              </label>
              <textarea
                value={currentPromptText}
                readOnly
                className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm bg-yellow-50 text-gray-700"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!newPromptName.trim()}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Prompts List */}
      {showSavedPrompts && (
        <div className="space-y-2">
          {savedPrompts.length === 0 ? (
            <p className="text-sm text-gray-500 italic text-center py-4">
              No saved prompts yet. Save your first prompt above! 
            </p>
          ) : (
            savedPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h6 className="font-medium text-gray-800 text-sm">{prompt.name}</h6>
                      <span className="text-xs text-gray-500">
                        {new Date(prompt.dateCreated).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">"{prompt.text}"</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectPrompt(prompt.text)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                      >
                        Use This Prompt
                      </button>
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h5 className="font-medium text-gray-800 mb-4">Edit Prompt</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Name:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Text:
                </label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingPrompt(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrompt}
                  disabled={!editName.trim() || !editText.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 