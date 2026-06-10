import { useState } from 'react';
import axios from 'axios';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_ENDPOINT || 'https://app.kingdomagency.es/upload.php';
  const DELETE_ENDPOINT = UPLOAD_ENDPOINT.replace('upload.php', 'delete.php');
  // Use the key from the PHP file we inspected
  const API_KEY = import.meta.env.VITE_API_KEY || 'kingdom_secret_key_2024';

  async function upload(file: File): Promise<string> {
    console.log('UseUpload: Starting upload to:', UPLOAD_ENDPOINT);
    setLoading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${API_KEY}`,
        },
        withCredentials: false,
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setProgress(pct);
          }
        },
      });

      if (response.data && response.data.success !== false && (response.data.url || response.data.success)) {
        let rawUrl = (response.data.url || response.data.message) as string;

        // FIX: The server returns a direct upload URL (e.g. /uploads/file.png) which fails (422).
        // The user specifies we must use serve_image.php.
        // We transform: .../uploads/filename.ext -> .../api/serve_image.php?file=filename.ext
        if (rawUrl.includes('/uploads/')) {
          const filename = rawUrl.split('/uploads/').pop();
          if (filename) {
            // Construct the serve endpoint based on the upload endpoint location or hardcoded base
            // Assuming serve_image.php is in the same /api/ base as upload.php
            const baseUrl = UPLOAD_ENDPOINT.substring(0, UPLOAD_ENDPOINT.lastIndexOf('/')); // e.g. https://.../api
            rawUrl = `${baseUrl}/serve_image.php?file=${filename}`;
          }
        }

        return rawUrl;
      }

      console.error('UseUpload: Invalid response structure:', response.data);
      let msg = 'Respuesta de servidor inválida';

      if (typeof response.data === 'string') {
        try {
          // Try parsing it manually in case header was missing
          const parsed = JSON.parse(response.data);
          if (parsed.url) return parsed.url;
          if (parsed.error) msg = parsed.error;
        } catch (e) {
          msg = `Error del servidor: ${response.data.substring(0, 100)}...`;
        }
      } else if (response.data?.error) {
        msg = response.data.error;
      }

      setError(msg);
      throw new Error(msg);
    } catch (e: any) {
      setError(e?.message || 'Error subiendo imagen');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setLoading(false);
    setProgress(0);
    setError(null);
  }

  async function deleteFile(url: string): Promise<boolean> {
    if (!DELETE_ENDPOINT || !API_KEY) {
      setError('Falta configurar DELETE_ENDPOINT o API KEY');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(DELETE_ENDPOINT, { url }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        withCredentials: false,
      });

      if (response.data && response.data.success) {
        return true;
      }
      const msg = response.data?.error || 'Delete fallido';
      setError(msg);
      return false;
    } catch (e: any) {
      console.error('Delete error:', e);
      setError(e?.message || 'Error eliminando archivo');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { upload, deleteFile, loading, progress, error, reset };
}
