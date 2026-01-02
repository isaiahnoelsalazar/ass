
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { logActivity } from '../services/activityService';
import { ToolType } from '../types';

const QRGeneratorView: React.FC = () => {
  const [value, setValue] = useState('https://example.com');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQR();
  }, [value, fgColor, bgColor]);

  const generateQR = async () => {
    if (!value.trim()) {
      setQrDataUrl('');
      return;
    }
    try {
      const url = await QRCode.toDataURL(value, {
        width: 1024,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    logActivity(ToolType.QR_GENERATOR, 'Generated QR Code', `Encoded: ${value.slice(0, 30)}...`);
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">QR Studio</h1>
        <p className="text-slate-500">Create high-quality, customized QR codes for any content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Content (URL or Text)</label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://..."
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-violet-500 outline-none resize-none text-slate-700 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Foreground</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-sm font-mono text-slate-500 uppercase">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Background</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-sm font-mono text-slate-500 uppercase">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-violet-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>💡</span> Design Tip
            </h3>
            <p className="text-xs text-violet-200 leading-relaxed">
              Ensure there is high contrast between the foreground and background colors. Dark foregrounds on light backgrounds scan most reliably.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="w-full aspect-square max-w-[400px] bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex items-center justify-center group relative overflow-hidden">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Preview" className="w-full h-full object-contain transition-transform group-hover:scale-105" />
            ) : (
              <div className="text-slate-300 text-center">
                <div className="text-6xl mb-4 opacity-20">📱</div>
                <p className="text-sm font-medium">Enter content to preview</p>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="w-full max-w-[400px] py-5 bg-violet-600 text-white rounded-3xl font-bold hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 disabled:opacity-50 flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
          >
            <span>📥</span> Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorView;