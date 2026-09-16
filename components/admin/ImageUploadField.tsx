'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
  helpText?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  required?: boolean;
}

export const ImageUploadField = ({
  label,
  value,
  onChange,
  helpText,
  aspectRatio = 'square',
  required = false,
}: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Erro ao enviar imagem.');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err?.message || 'Falha no upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
        ? 'aspect-video'
        : aspectRatio === 'banner'
          ? 'aspect-[21/9]'
          : 'min-h-[160px]';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-cream/80">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {value && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-red-400/80 hover:text-red-400 transition"
          >
            Remover foto
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <div className={`relative overflow-hidden rounded border border-white/15 bg-black/40 ${aspectClass} group`}>
          <Image
            src={value}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-brand-gold text-brand-black text-xs font-semibold rounded hover:bg-brand-gold-light transition"
            >
              Trocar Foto
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="p-1.5 bg-red-600/80 text-white rounded hover:bg-red-600 transition"
              title="Remover"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded cursor-pointer transition-colors ${
            dragActive
              ? 'border-brand-gold bg-brand-gold/10'
              : 'border-white/15 bg-white/[0.02] hover:border-brand-gold/60 hover:bg-white/[0.04]'
          } ${aspectClass}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-brand-gold">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-xs font-medium">Enviando foto para o servidor...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-brand-cream/60">
                <Upload size={18} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs font-medium text-brand-cream">
                  Clique para escolher ou arraste uma foto
                </p>
                <p className="text-[10px] text-brand-cream/45 mt-0.5">
                  Formatos aceitos: PNG, JPG ou WEBP (até 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {helpText && !error && <p className="text-[11px] text-brand-cream/45">{helpText}</p>}
    </div>
  );
};

export default ImageUploadField;
