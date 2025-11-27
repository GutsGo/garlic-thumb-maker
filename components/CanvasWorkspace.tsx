import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Upload, Download, RefreshCw, LayoutTemplate, Image as ImageIcon, Palette, Layers, FileCheck } from 'lucide-react';

// Canvas constants
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const LEFT_SECTION_WIDTH = 320; // 1/2 of canvas
const MARGIN = 30; // Margin around the image

// Helper for rounded rectangles to ensure compatibility
const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    // Polyfill
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  }
  ctx.closePath();
};

interface CanvasWorkspaceProps {}

const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [isTransparent, setIsTransparent] = useState<boolean>(true);
  const [fileName, setFileName] = useState<string>('retro-preview.png');
  const [isDragging, setIsDragging] = useState(false);

  // Drawing Logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear & Background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (!isTransparent) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Draw Guides (Optional grid)
    if (showGuides) {
      ctx.strokeStyle = '#d4d4d4'; // Light gray
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Center line
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();

      // Safe area box on left
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(MARGIN, MARGIN, LEFT_SECTION_WIDTH - (MARGIN * 2), CANVAS_HEIGHT - (MARGIN * 2));
      ctx.setLineDash([]);
    }

    // 3. Draw Uploaded Image (Scaled on Left)
    if (uploadedImage) {
      // Calculate aspect ratio fit
      const maxW = LEFT_SECTION_WIDTH - (MARGIN * 2);
      const maxH = CANVAS_HEIGHT - (MARGIN * 2);

      const imgW = uploadedImage.width;
      const imgH = uploadedImage.height;
      const ratio = Math.min(maxW / imgW, maxH / imgH);

      const finalW = imgW * ratio;
      const finalH = imgH * ratio;

      // Center in left section
      const x = (LEFT_SECTION_WIDTH - finalW) / 2; 
      const y = (CANVAS_HEIGHT - finalH) / 2;

      // Draw shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      ctx.drawImage(uploadedImage, x, y, finalW, finalH);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

  }, [uploadedImage, showGuides, isTransparent]);

  // Effect to re-draw whenever state changes
  useEffect(() => {
    // Small timeout to ensure font loading/DOM readiness
    const timeoutId = setTimeout(() => {
        draw();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [draw]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name.split('.')[0] + '_preview.png');
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      
      setFileName(file.name.split('.')[0] + '_preview.png');
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
      
      {/* Canvas Area */}
      <div className="relative group">
        <div 
          className={`relative rounded-xl overflow-hidden shadow-2xl border-4 transition-colors duration-200 ${isDragging ? 'border-red-500' : 'border-neutral-800'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Overlay drop message */}
          {isDragging && (
            <div className="absolute inset-0 bg-red-900/80 z-50 flex items-center justify-center backdrop-blur-sm">
              <p className="text-white text-xl font-bold">Drop Image Here</p>
            </div>
          )}

          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
            className="w-full h-auto max-w-[640px] bg-white block"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        {/* Quick Toolbar below canvas */}
        <div className="mt-4 flex justify-between items-center text-sm text-neutral-500">
           <span>Drag & drop anywhere on canvas</span>
           <button onClick={() => setUploadedImage(null)} className="hover:text-red-400 transition-colors">Clear Image</button>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        
        {/* Upload Card */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Source Image
          </h3>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-700 border-dashed rounded-lg cursor-pointer hover:bg-neutral-800 hover:border-neutral-500 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-3 text-neutral-500 group-hover:text-white transition-colors" />
              <p className="mb-2 text-sm text-neutral-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-neutral-500">PNG, JPG, GIF (Any Size)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
        </div>

        {/* Adjustments Card */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Palette className="w-4 h-4" /> Appearance
          </h3>

          {/* Guide Lines Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-neutral-300 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-500" />
              Show Safe Area
            </label>
            <button 
              onClick={() => setShowGuides(!showGuides)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${showGuides ? 'bg-red-600' : 'bg-neutral-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${showGuides ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Transparent Background Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-neutral-300 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-neutral-500" />
              Transparent Output
            </label>
            <button 
              onClick={() => setIsTransparent(!isTransparent)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${isTransparent ? 'bg-red-600' : 'bg-neutral-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${isTransparent ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={draw} 
            className="flex items-center justify-center gap-2 w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium border border-neutral-700"
          >
            <RefreshCw className="w-4 h-4" /> Redraw Canvas
          </button>
          
          <button 
            onClick={handleDownload} 
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all transform hover:scale-[1.02] shadow-lg font-bold"
          >
            <Download className="w-5 h-5" /> Download Result
          </button>
        </div>

      </div>
    </div>
  );
};

export default CanvasWorkspace;