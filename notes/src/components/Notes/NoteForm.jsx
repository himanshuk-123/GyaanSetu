import { useState } from 'react';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Input from '../Common/Input';
import Button from '../Common/Button';

export default function NoteForm({ initialData = {}, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    author: initialData.author || '',
    file: initialData.file || null,
    tags: initialData.tags || []
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileChange = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File size exceeds 10MB limit' }));
      return;
    }
    setFormData(prev => ({ ...prev, file }));
    if (errors.file) setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    if (!formData.title.trim()) validationErrors.title = 'Title is required';
    if (!formData.description.trim()) validationErrors.description = 'Description is required';
    if (!formData.file) validationErrors.file = 'File is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        error={errors.title}
        maxLength={100}
      />
      
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        as="textarea"
        rows={4}
        error={errors.description}
        maxLength={500}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          placeholder="Type a tag and press Enter"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File*</label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
              : errors.file 
                ? 'border-red-300' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
          />
          {formData.file ? (
            <div className="flex flex-col items-center">
              <DocumentArrowUpIcon className="w-10 h-10 text-blue-500 mb-2" />
              <p className="text-sm font-medium">{formData.file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(formData.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <DocumentArrowUpIcon className={`w-10 h-10 mb-4 ${
                errors.file ? 'text-red-400' : 'text-gray-400'
              }`} />
              <p className="font-medium">Drag and drop your file here or click to browse</p>
              <p className="text-sm text-gray-500 mt-2">PDF, DOCX, TXT, or PPT (max 10MB)</p>
            </div>
          )}
        </div>
        {errors.file && (
          <p className="mt-1 text-sm text-red-500">{errors.file}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Note'}
        </Button>
      </div>
    </form>
  );
}