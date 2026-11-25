import React, { useEffect, useState } from 'react';
import mammoth from 'mammoth';

function decodeDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUrl.slice(0, commaIdx);
  const base64 = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+)/i);
  const mimeType = mimeMatch ? mimeMatch[1].toLowerCase() : '';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { bytes, mimeType };
}

export default function ApplicantCvPreview({
  cvDataUrl,
  cvFileName = '',
  cvMimeType = '',
  isLoading = false,
  onRequestLoad,
}) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [docxHtml, setDocxHtml] = useState('');
  const [textContent, setTextContent] = useState('');
  const [previewKind, setPreviewKind] = useState('none'); // 'pdf' | 'docx' | 'image' | 'text' | 'unsupported' | 'none'
  const [parseError, setParseError] = useState('');

  // Auto-request CV load from Supabase if we have a filename but cvDataUrl hasn't loaded yet
  useEffect(() => {
    if (!cvDataUrl && !isLoading && cvFileName && typeof onRequestLoad === 'function') {
      onRequestLoad();
    }
  }, [cvDataUrl, isLoading, cvFileName]);

  useEffect(() => {
    let activeBlobUrl = null;
    let cancelled = false;

    setBlobUrl(null);
    setDocxHtml('');
    setTextContent('');
    setParseError('');

    if (!cvDataUrl) {
      setPreviewKind('none');
      return;
    }

    const decoded = decodeDataUrl(cvDataUrl);
    if (!decoded) {
      setPreviewKind('unsupported');
      setParseError('CV file format could not be decoded for inline preview.');
      return;
    }

    const mime = (decoded.mimeType || cvMimeType || '').toLowerCase();
    const lowerName = String(cvFileName || '').toLowerCase();

    const isPdf = mime.includes('pdf') || lowerName.endsWith('.pdf');
    const isDocx =
      mime.includes('wordprocessingml') ||
      mime.includes('msword') ||
      lowerName.endsWith('.docx');
    const isImage =
      mime.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif)$/i.test(lowerName);
    const isText = mime.startsWith('text/') || lowerName.endsWith('.txt');

    if (isPdf) {
      try {
        const blob = new Blob([decoded.bytes], { type: 'application/pdf' });
        activeBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(activeBlobUrl);
        setPreviewKind('pdf');
      } catch (err) {
        setPreviewKind('unsupported');
        setParseError(err?.message || 'Could not render PDF preview.');
      }
    } else if (isDocx) {
      setPreviewKind('docx');
      mammoth
        .convertToHtml({ arrayBuffer: decoded.bytes.buffer })
        .then((result) => {
          if (!cancelled) {
            setDocxHtml(result.value || '<p>Document appears empty.</p>');
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setPreviewKind('unsupported');
            setParseError(`Could not render Word document inline (${err?.message || 'unsupported format'}).`);
          }
        });
    } else if (isImage) {
      try {
        const blob = new Blob([decoded.bytes], { type: mime || 'image/png' });
        activeBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(activeBlobUrl);
        setPreviewKind('image');
      } catch (err) {
        setPreviewKind('unsupported');
        setParseError(err?.message || 'Could not render image preview.');
      }
    } else if (isText) {
      try {
        const txt = new TextDecoder('utf-8').decode(decoded.bytes);
        setTextContent(txt);
        setPreviewKind('text');
      } catch (err) {
        setPreviewKind('unsupported');
        setParseError(err?.message || 'Could not read text file.');
      }
    } else {
      setPreviewKind('unsupported');
    }

    return () => {
      cancelled = true;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [cvDataUrl, cvFileName, cvMimeType]);

  if (isLoading && !cvDataUrl) {
    return (
      <div
        style={{
          padding: '28px 20px',
          textAlign: 'center',
          borderRadius: '10px',
          background: '#FFFFFF',
          border: '1.5px dashed #0D9488',
          color: '#0F766E',
          fontWeight: 700,
          fontSize: '13px',
        }}
      >
        ⏳ Loading CV preview from Supabase...
      </div>
    );
  }

  if (!cvDataUrl) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          borderRadius: '10px',
          background: '#FFFFFF',
          border: '1px dashed #CBD5E1',
          color: '#64748B',
          fontSize: '12.5px',
        }}
      >
        {cvFileName ? (
          <button
            type="button"
            onClick={() => onRequestLoad && onRequestLoad()}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#0F766E',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            📄 Load CV Preview ({cvFileName})
          </button>
        ) : (
          'No CV file attached to this application.'
        )}
      </div>
    );
  }

  if (previewKind === 'pdf' && blobUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F766E' }}>
            📄 Live PDF Preview ({cvFileName || 'CV.pdf'})
          </span>
          <a
            href={blobUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              background: '#FFFFFF',
              border: '1px solid #0D9488',
              color: '#0F766E',
              fontSize: '11.5px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            🔍 Open Fullscreen Preview
          </a>
        </div>
        <iframe
          title={`CV Preview - ${cvFileName || 'Applicant CV'}`}
          src={`${blobUrl}#toolbar=1&navpanes=0&view=FitH`}
          style={{
            width: '100%',
            height: '540px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            background: '#FFFFFF',
          }}
        />
      </div>
    );
  }

  if (previewKind === 'docx') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F766E' }}>
          📝 Live Word Document (.docx) Preview ({cvFileName})
        </span>
        <div
          style={{
            width: '100%',
            maxHeight: '520px',
            overflowY: 'auto',
            padding: '22px 26px',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            background: '#FFFFFF',
            color: '#0F172A',
            fontSize: '13px',
            lineHeight: 1.6,
            boxSizing: 'border-box',
          }}
          dangerouslySetInnerHTML={{
            __html: docxHtml || '<p style="color:#64748B;">Rendering Word document preview...</p>',
          }}
        />
      </div>
    );
  }

  if (previewKind === 'image' && blobUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F766E' }}>
            🖼️ Live Image CV Preview ({cvFileName})
          </span>
          <a
            href={blobUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              background: '#FFFFFF',
              border: '1px solid #0D9488',
              color: '#0F766E',
              fontSize: '11.5px',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            🔍 Open Fullscreen Image
          </a>
        </div>
        <div
          style={{
            maxHeight: '540px',
            overflowY: 'auto',
            borderRadius: '10px',
            border: '1.5px solid #CBD5E1',
            background: '#FFFFFF',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          <img
            src={blobUrl}
            alt={cvFileName || 'Applicant CV'}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px' }}
          />
        </div>
      </div>
    );
  }

  if (previewKind === 'text') {
    return (
      <pre
        style={{
          width: '100%',
          maxHeight: '480px',
          overflowY: 'auto',
          padding: '18px',
          borderRadius: '10px',
          border: '1.5px solid #CBD5E1',
          background: '#FFFFFF',
          color: '#0F172A',
          fontSize: '12.5px',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {textContent}
      </pre>
    );
  }

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '10px',
        background: '#FFFBEB',
        border: '1px solid #FCD34D',
        color: '#92400E',
        fontSize: '12.5px',
      }}
    >
      {parseError || `Inline preview is not supported for "${cvFileName || 'this file type'}". Use the Download Attached CV button above to view it.`}
    </div>
  );
}
