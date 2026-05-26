import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const uploadService = {
  async uploadFile(file: File, bucket: 'horoscopes' | 'photos') {
    try {
      if (isMockMode()) {
        console.warn(`[Supabase Upload Service] Mock Mode Active. Returning mock URL for ${file.name}`);
        return { 
          url: bucket === 'horoscopes' 
            ? 'https://gokul-vivaham.supabase/mock_horoscope.pdf' 
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 
          error: null 
        };
      }

      const fileExt = file.name.split('.').pop() || 'dat';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error(`Upload failed for bucket ${bucket}:`, err);
      return { url: null, error: err };
    }
  },

  async uploadBase64(base64Data: string, bucket: 'horoscopes' | 'photos') {
    try {
      if (isMockMode()) {
        console.warn(`[Supabase Upload Service] Mock Mode Active. Returning mock URL for base64 image.`);
        return { 
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', 
          error: null 
        };
      }

      const parts = base64Data.split(';base64,');
      if (parts.length < 2) {
        throw new Error('Invalid base64 string format');
      }
      
      const contentType = parts[0].split(':')[1];
      const fileExt = contentType.split('/')[1] || 'png';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      
      const blob = new Blob([uInt8Array], { type: contentType });
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error(`Base64 Upload failed for bucket ${bucket}:`, err);
      return { url: null, error: err };
    }
  }
};
