import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

interface QueuedImage {
  id: string;
  url: string;
  name: string;
}

const ImageToPdfView: React.FC = () => {
  const [images, setImages] = useState<QueuedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast to File[] to avoid 'unknown' type inference which causes property access errors
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newImg: QueuedImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          name: file.name
        };
        setImages(prev => [...prev, newImg]);
      };
      // Fix: Ensure file is treated as Blob for readAsDataURL
      reader.readAsDataURL(file);
    });
    
    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0 || isGenerating) return;

    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage();
        
        const imgData = images[i].url;
        
        // Wait for image to load to get dimensions for better scaling
        const img = new Image();
        img.src = imgData;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        doc.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      }

      doc.save('image-collection.pdf');
      logActivity(ToolType.IMAGE_TO_PDF, 'Generated PDF from Images', `Created document with ${images.length} pages`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Image to PDF</h1>
        <p className="text-slate-500 text-sm">Upload images and compile them into a professional PDF document.</p>
      </header>

      <div className="space-y-8">
        {/* Upload Zone */}
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 hover:border-violet-400 transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
            🖼️
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Select Images</h2>
          <p className="text-slate-400 text-sm">Drag and drop or click to browse files (JPEG, PNG, WebP)</p>
        </div>

        {/* Sequence Grid */}
        {images.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <span>📑</span> Image Sequence ({images.length})
              </h3>
              <button 
                onClick={() => setImages([])}
                className="text-xs font-bold text-rose-500 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, index) => (
                <div key={img.id} className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group shadow-sm">
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="bg-white text-rose-600 p-2 rounded-lg text-xs font-bold shadow-lg"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <button 
                onClick={generatePdf}
                disabled={isGenerating}
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-100 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating Document...
                  </>
                ) : (
                  <>
                    <span>📄</span> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 text-xs text-indigo-700 leading-relaxed">
          <span className="text-base flex-shrink-0">🔒</span>
          <p>
            <strong>Privacy Note:</strong> Your images are processed entirely within your browser's memory and are never uploaded to our servers. Your data stays on your device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageToPdfView;