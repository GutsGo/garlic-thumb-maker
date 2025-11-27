import React from 'react';
import CanvasWorkspace from './components/CanvasWorkspace';
import { Layers, Monitor } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-200">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">RetroUI Scaler</h1>
          </div>
          <div className="text-xs text-neutral-500 font-mono hidden sm:block">
            CANVAS: 640 x 480
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col items-center">
        <div className="w-full mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-center md:text-left">Image Compositor</h2>
          <p className="text-neutral-400 text-center md:text-left max-w-2xl">
            Upload an image to automatically scale and position it within the left viewport of a standard 640x480 retro console layout. 
            Useful for creating box-art previews or theme assets.
          </p>
        </div>

        <CanvasWorkspace />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-neutral-600 text-sm">
          <p>Generated for Retro Handheld Theming</p>
        </div>
      </footer>
    </div>
  );
};

export default App;