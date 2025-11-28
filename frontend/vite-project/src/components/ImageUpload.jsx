import { useState } from 'react';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsUploading(true);
    setError('');

    try {
      // Use relative URL so it works via Vite dev proxy
      const response = await fetch('/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Upload failed, status:', response.status, text);
        throw new Error('Upload failed');
      }

      const data = await response.json();
      // The backend returns { url: "/uploads/<filename>" }
      setImageUrl(data.url.startsWith('http') ? data.url : data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Image Upload</h2>
      <div style={{ marginBottom: '20px' }}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || isUploading}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (!selectedFile || isUploading) ? 0.6 : 1,
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img 
            src={imageUrl} 
            alt="Uploaded content" 
            style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #ddd' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
