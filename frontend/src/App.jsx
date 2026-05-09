import React, { useState } from 'react';
import { UploadCloud, Settings, Download, RefreshCw, AlertCircle } from 'lucide-react';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const [borderThickness, setBorderThickness] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [pdfError, setPdfError] = useState(false);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setSuccessData(null);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setSuccessData(null);
    } else {
      alert("Please drop a valid PDF file.");
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rows', rows);
    formData.append('cols', cols);
    formData.append('borderThickness', borderThickness);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setSuccessData(data);
      } else {
        alert("Error generating PDF: " + data.error);
      }
    } catch (error) {
      alert("Error connecting to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSuccessData(null);
    setPdfError(false);
    setRows(3);
    setCols(2);
    setBorderThickness(0.7);
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar / Editing Dashboard */}
        <div className="sidebar">
        <div className="sidebar-header">
          <Settings size={24} className="upload-icon" />
          <h2>Cour Editer</h2>
        </div>
        
        <div className="sidebar-content">
          <div className="form-group">
            <label className="form-label">Rows ({rows})</label>
            <input 
              type="range" 
              className="form-range" 
              min="1" max="10" 
              value={rows} 
              onChange={(e) => setRows(Number(e.target.value))}
              disabled={!file}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Columns ({cols})</label>
            <input 
              type="range" 
              className="form-range" 
              min="1" max="10" 
              value={cols} 
              onChange={(e) => setCols(Number(e.target.value))}
              disabled={!file}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Border Thickness ({borderThickness} pt)</label>
            <input 
              type="range" 
              className="form-range" 
              min="0" max="5" step="0.1" 
              value={borderThickness} 
              onChange={(e) => setBorderThickness(Number(e.target.value))}
              disabled={!file}
            />
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label className="form-label">Page Size</label>
            <select className="form-select" disabled>
              <option>A4 (Default)</option>
            </select>
          </div>
        </div>

        <div className="sidebar-footer">
          {successData ? (
            <button 
              className="btn btn-primary"
              onClick={async () => {
                if (window.pywebview && window.pywebview.api) {
                  const result = await window.pywebview.api.save_file_dialog(successData.filename);
                  if (result && result.success) {
                    alert("تم حفظ الملف بنجاح في:\n" + result.path);
                  } else if (result && result.error !== "Cancelled") {
                    alert("خطأ أثناء حفظ الملف: " + result.error);
                  }
                } else {
                  // Fallback for browser
                  const a = document.createElement('a');
                  a.href = successData.download_url;
                  a.download = successData.filename;
                  a.click();
                }
              }}
            >
              <Download size={18} /> Download PDF
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleGenerate} 
              disabled={!file || loading}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : "Generate PDF"}
            </button>
          )}
          
          <button className="btn btn-secondary" onClick={handleReset} disabled={!file && !successData}>
            Reset
          </button>
        </div>
      </div>

      {/* Main Content / Upload / Preview */}
      <div className="main-content">
        {!file ? (
          <div 
            className="upload-area" 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileUpload').click()}
          >
            <UploadCloud size={48} className="upload-icon" />
            <h3>Upload your PDF</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Drag & drop a file here, or click to browse
            </p>
            <input 
              type="file" 
              id="fileUpload" 
              style={{ display: 'none' }} 
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </div>
        ) : successData ? (
          <div className="preview-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <h3>Generated PDF</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Review your generated PDF layout below
              </p>
            {pdfError ? (
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                gap: '1rem',
                padding: '2rem'
              }}>
                <AlertCircle size={48} color="var(--accent-primary)" />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    PDF Preview Not Available
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Unable to display PDF in browser. Use the Download button below to view it.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = successData.download_url;
                      a.download = successData.filename;
                      a.click();
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    <Download size={18} /> Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <iframe 
                src={successData.download_url + '#toolbar=1&view=fitH'} 
                title="Generated PDF Viewer"
                width="100%" 
                style={{ 
                  flex: 1, 
                  minHeight: '500px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  backgroundColor: '#fff' 
                }}
                onError={() => {
                  setPdfError(true);
                }}
                onLoad={() => {
                  setPdfError(false);
                }}
              />
            )}}}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3>{file.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Previewing Grid Layout
              </p>
            </div>
            
            <div 
              className="preview-paper" 
              style={{ 
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`
              }}
            >
              {Array.from({ length: rows * cols }).map((_, i) => (
                <div 
                  key={i} 
                  className={`preview-cell ${borderThickness > 0 ? 'has-border' : ''}`}
                  style={{ borderWidth: `${borderThickness}px` }}
                >
                  Page {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modern Footer */}
      <div className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            © 2024 Cour Editer. Made by <span className="footer-highlight">Dr. Said</span> & <span className="footer-highlight">Dr. Mamoune</span>
          </p>
          <p className="footer-rights">All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default App;
