import { useEffect, useRef, useState } from 'react';

const PDFViewer = ({ 
  src, 
  width = '100%', 
  height = '100%',
  showControls = true,
  initialPage = 1,
  scale = 1.0,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScale, setCurrentScale] = useState(scale);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'continuous'
  const [inputPage, setInputPage] = useState('');
  const [allPages, setAllPages] = useState([]); // 连续模式下存储所有页面

  // 样式定义
  const styles = {
    container: {
      width,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    loadingContainer: {
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #e1e5e9',
      borderRadius: '12px',
      backgroundColor: '#f8f9fa'
    },
    loadingContent: {
      textAlign: 'center',
      color: '#495057'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #0066cc',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    errorContainer: {
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #dc3545',
      borderRadius: '12px',
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    errorContent: {
      textAlign: 'center'
    },
    retryButton: {
      marginTop: '12px',
      padding: '8px 16px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s'
    },
    controlsBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e1e5e9',
      borderBottom: 'none',
      borderRadius: '12px 12px 0 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      flexWrap: 'wrap',
      gap: '12px'
    },
    controlGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    pageNavGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    button: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      outline: 'none'
    },
    primaryButton: {
      backgroundColor: '#0066cc',
      color: 'white'
    },
    primaryButtonDisabled: {
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    successButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    pageInfo: {
      fontSize: '14px',
      color: '#495057',
      whiteSpace: 'nowrap',
      fontWeight: '500'
    },
    pageInput: {
      width: '60px',
      padding: '4px 8px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px',
      textAlign: 'center'
    },
    zoomInfo: {
      fontSize: '14px',
      minWidth: '50px',
      textAlign: 'center',
      fontWeight: '500',
      color: '#495057'
    },
    modeToggle: {
      padding: '6px 12px',
      border: '1px solid #0066cc',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      color: '#0066cc',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    modeToggleActive: {
      backgroundColor: '#0066cc',
      color: 'white'
    },
    viewerContainer: {
      width: '100%',
      height,
      overflow: 'auto',
      border: '1px solid #e1e5e9',
      borderRadius: showControls ? '0 0 12px 12px' : '12px',
      backgroundColor: '#f8f9fa'
    },
    singlePageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '24px',
      minHeight: '100%'
    },
    continuousContainer: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    },
    canvas: {
      maxWidth: '100%',
      height: 'auto',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: 'white',
      borderRadius: '4px'
    }
  };

  // 动态加载 PDF.js
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        
        setPdfjsLib(window.pdfjsLib);
      } catch (err) {
        setError('加载 PDF.js 库失败');
        console.error('PDF.js loading error:', err);
      }
    };

    loadPDFJS();
  }, []);

  useEffect(() => {
    if (pdfjsLib && src) {
      loadPDF();
    }
  }, [pdfjsLib, src]);

  useEffect(() => {
    if (pdf) {
      if (viewMode === 'single') {
        renderPage(currentPage);
      } else {
        renderAllPages();
      }
    }
  }, [pdf, currentPage, currentScale, viewMode]);

  const loadPDF = async () => {
    if (!pdfjsLib) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const loadingTask = pdfjsLib.getDocument(src);
      const pdfDoc = await loadingTask.promise;
      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
      setCurrentPage(Math.min(initialPage, pdfDoc.numPages));
    } catch (err) {
      setError(`加载 PDF 失败: ${err.message}`);
      console.error('PDF loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale: currentScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      setError(`渲染页面失败: ${err.message}`);
      console.error('Page rendering error:', err);
    }
  };

  const renderAllPages = async () => {
    if (!pdf || !containerRef.current) return;

    try {
      const pages = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: currentScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.cssText = `
          max-width: 100%;
          height: auto;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background-color: white;
          border-radius: 4px;
          margin-bottom: 24px;
        `;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        pages.push(canvas);
      }
      setAllPages(pages);
    } catch (err) {
      setError(`渲染页面失败: ${err.message}`);
      console.error('Pages rendering error:', err);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = () => {
    const pageNumber = parseInt(inputPage);
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      setInputPage('');
    }
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      goToPage();
    }
  };

  const zoomIn = () => {
    setCurrentScale(prev => Math.min(prev * 1.2, 3.0));
  };

  const zoomOut = () => {
    setCurrentScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const resetZoom = () => {
    setCurrentScale(scale);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'continuous' : 'single');
  };

  if (!pdfjsLib || loading) {
    return (
      <div className={`pdf-viewer-container ${className}`} style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p>{!pdfjsLib ? '加载 PDF 库中...' : '加载 PDF 中...'}</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pdf-viewer-container ${className}`} style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <p>⚠️ {error}</p>
          <button 
            onClick={loadPDF}
            style={styles.retryButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0052a3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0066cc'}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer-container ${className}`} style={styles.container}>
      {showControls && (
        <div style={styles.controlsBar}>
          <div style={styles.pageNavGroup}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1 || viewMode === 'continuous'}
              style={{
                ...styles.button,
                ...(currentPage <= 1 || viewMode === 'continuous' ? styles.primaryButtonDisabled : styles.primaryButton)
              }}
            >
              ← 上一页
            </button>
            
            <div style={styles.controlGroup}>
              <input
                type="number"
                min="1"
                max={numPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyPress={handlePageInputKeyPress}
                placeholder={currentPage.toString()}
                style={styles.pageInput}
                disabled={viewMode === 'continuous'}
              />
              <button
                onClick={goToPage}
                disabled={!inputPage || viewMode === 'continuous'}
                style={{
                  ...styles.button,
                  ...(!inputPage || viewMode === 'continuous' ? styles.primaryButtonDisabled : styles.primaryButton)
                }}
              >
                跳转
              </button>
            </div>

            <span style={styles.pageInfo}>
              {viewMode === 'single' ? `第 ${currentPage} 页 / ` : ''}共 {numPages} 页
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages || viewMode === 'continuous'}
              style={{
                ...styles.button,
                ...(currentPage >= numPages || viewMode === 'continuous' ? styles.primaryButtonDisabled : styles.primaryButton)
              }}
            >
              下一页 →
            </button>
          </div>
          
          <div style={styles.controlGroup}>
            <button
              onClick={toggleViewMode}
              style={{
                ...styles.modeToggle,
                ...(viewMode === 'continuous' ? styles.modeToggleActive : {})
              }}
            >
              {viewMode === 'single' ? '连续模式' : '单页模式'}
            </button>

            <div style={styles.controlGroup}>
              <button
                onClick={zoomOut}
                style={{...styles.button, ...styles.secondaryButton}}
              >
                −
              </button>
              <span style={styles.zoomInfo}>
                {Math.round(currentScale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                style={{...styles.button, ...styles.secondaryButton}}
              >
                +
              </button>
              <button
                onClick={resetZoom}
                style={{...styles.button, ...styles.successButton}}
              >
                重置
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div style={styles.viewerContainer}>
        {viewMode === 'single' ? (
          <div style={styles.singlePageContainer}>
            <canvas ref={canvasRef} style={styles.canvas} />
          </div>
        ) : (
          <div 
            ref={containerRef} 
            style={styles.continuousContainer}
          >
            {allPages.map((canvas, index) => {
              const canvasClone = canvas.cloneNode(true);
              const context = canvasClone.getContext('2d');
              context.drawImage(canvas, 0, 0);
              
              return (
                <div key={index} style={{ position: 'relative' }}>
                  <div 
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '10px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      zIndex: 1
                    }}
                  >
                    第 {index + 1} 页
                  </div>
                  <canvas
                    ref={(el) => {
                      if (el && canvasClone) {
                        el.width = canvasClone.width;
                        el.height = canvasClone.height;
                        const ctx = el.getContext('2d');
                        ctx.drawImage(canvasClone, 0, 0);
                      }
                    }}
                    style={styles.canvas}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;