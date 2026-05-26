import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const uploadService = {
  async uploadFile(file: File, bucket: 'horoscopes' | 'photos') {
    try {
      // 1. File size validation (< 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error('File size exceeds the 5MB safety limit.');
      }

      // 2. MIME type validation
      if (bucket === 'photos') {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.');
        }
      } else if (bucket === 'horoscopes') {
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type. Only PDF documents are permitted for horoscopes.');
        }
      }

      if (isMockMode()) {
        console.warn(`[Supabase Upload Service] Mock Mode Active. Returning mock URL/data for ${file.name}`);
        if (bucket === 'horoscopes') {
          return { 
            url: 'https://gokul-vivaham.supabase/mock_horoscope.pdf', 
            error: null 
          };
        }
        
        // Convert File to base64 for mock local storage persistence
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        return { url: base64, error: null };
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
      const parts = base64Data.split(';base64,');
      if (parts.length < 2) {
        throw new Error('Invalid base64 string format');
      }
      
      const contentType = parts[0].split(':')[1];

      // 1. File size validation (< 5MB)
      const approxSizeBytes = base64Data.length * 0.75;
      const maxSizeBytes = 5 * 1024 * 1024;
      if (approxSizeBytes > maxSizeBytes) {
        throw new Error('Base64 data size exceeds the 5MB safety limit.');
      }

      // 2. MIME type validation
      if (bucket === 'photos') {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(contentType)) {
          throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are permitted.');
        }
      } else if (bucket === 'horoscopes') {
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(contentType)) {
          throw new Error('Invalid file type. Only PDF documents are permitted for horoscopes.');
        }
      }

      if (isMockMode()) {
        console.warn(`[Supabase Upload Service] Mock Mode Active. Returning mock URL/data for base64.`);
        return { 
          url: base64Data, 
          error: null 
        };
      }
      
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
