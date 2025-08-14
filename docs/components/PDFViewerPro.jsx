import { useEffect, useRef, useState } from "react";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";

const PDFViewerPro = ({
  src,
  width = "100%",
  height = "100%",
  showControls = true,
  initialPage = 1,
  scale = 1.0,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const viewerRef = useRef(null); // Ref for the viewer container
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScale, setCurrentScale] = useState(scale);
  const [rotation, setRotation] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [viewMode, setViewMode] = useState("single"); // 'single' | 'continuous'
  const [inputPage, setInputPage] = useState("");
  const [allPages, setAllPages] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState("");

  // 动态加载 PDF.js
  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }

        setPdfjsLib(window.pdfjsLib);
      } catch (err) {
        setError("加载 PDF.js 库失败");
        console.error("PDF.js loading error:", err);
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
      if (viewMode === "single") {
        renderPage(currentPage);
      } else {
        renderAllPages();
      }
    }
  }, [pdf, currentPage, currentScale, viewMode, rotation]);

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
      console.error("PDF loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum) => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({
        scale: currentScale,
        rotation: rotation,
      });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
    } catch (err) {
      setError(`渲染页面失败: ${err.message}`);
      console.error("Page rendering error:", err);
    }
  };

  const renderAllPages = async () => {
    if (!pdf || !containerRef.current) return;

    try {
      const pages = [];
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const viewport = page.getViewport({
          scale: currentScale,
          rotation: rotation,
        });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        pages.push(canvas);
      }
      setAllPages(pages);
    } catch (err) {
      setError(`渲染页面失败: ${err.message}`);
      console.error("Pages rendering error:", err);
    }
  };

  // 控制功能
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
      setInputPage("");
    }
  };

  // Handle page input change
  const handlePageChange = (e) => {
    setInputPage(e.target.value);
  };

  // Handle page input blur or enter key
  const handlePageSubmit = (e) => {
    if (e.type === 'blur' || e.key === 'Enter') {
      e.preventDefault();
      const pageNumber = parseInt(inputPage);
      if (!isNaN(pageNumber)) {
        goToPage(pageNumber);
      }
    }
  };

  const zoomIn = () => setCurrentScale((prev) => Math.min(prev * 1.2, 3.0));
  const zoomOut = () => setCurrentScale((prev) => Math.max(prev / 1.2, 0.3));
  const resetZoom = () => setCurrentScale(scale);

  // Handle zoom input change
  const handleZoomChange = (e) => {
    setZoomInputValue(e.target.value);
  };

  // Handle zoom input blur or enter key
  const handleZoomSubmit = (e) => {
    if (e.type === 'blur' || e.key === 'Enter') {
      e.preventDefault();
      let value = zoomInputValue;
      
      // If value contains %, remove it and convert to decimal
      if (value.includes('%')) {
        value = value.replace('%', '');
        const percentValue = parseFloat(value);
        if (!isNaN(percentValue)) {
          setCurrentScale(Math.min(Math.max(percentValue / 100, 0.3), 3.0));
        }
      } else {
        // Handle direct decimal input
        const decimalValue = parseFloat(value);
        if (!isNaN(decimalValue)) {
          // If the value is greater than 10, assume it's a percentage
          if (decimalValue > 10) {
            setCurrentScale(Math.min(Math.max(decimalValue / 100, 0.3), 3.0));
          } else {
            setCurrentScale(Math.min(Math.max(decimalValue, 0.3), 3.0));
          }
        }
      }
      
      setIsEditingZoom(false);
    }
  };

  // Start editing zoom
  const startEditingZoom = () => {
    setZoomInputValue(Math.round(currentScale * 100).toString());
    setIsEditingZoom(true);
  };

  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "single" ? "continuous" : "single"));

  const rotateClockwise = () => setRotation((r) => (r + 90) % 360);
  const rotateCounterClockwise = () => setRotation((r) => (r - 90 + 360) % 360);

  // Toggle fullscreen for PDF viewer area only
  const toggleFullscreen = () => {
    const viewerElement = viewerRef.current;
    if (!viewerElement) return;
    
    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen().then(() => {
        setFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        });
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "#555",
        }}
      >
        正在加载 PDF...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "red",
        }}
      >
        {error}
      </div>
    );
  }

  // Toolbar button style
  const toolbarButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    margin: "0 2px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.3s",
    fontSize: "14px",
    minWidth: "32px",
    height: "32px",
  };

  const toolbarButtonHoverStyle = {
    border: "1px solid #40a9ff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const toolbarButtonDisabledStyle = {
    opacity: 0.5,
    cursor: "not-allowed",
  };

  // Page input style
  const pageInputStyle = {
    width: "50px",
    padding: "4px 8px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    textAlign: "center",
    margin: "0 4px",
  };

  // Zoom input/display style
  const zoomStyle = {
    width: "70px",
    padding: "4px 8px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
    textAlign: "center",
    margin: "0 4px",
    background: "#fff",
    color: "#555",
    fontWeight: "500",
  };

  return (
    <div 
      ref={viewerRef}
      className={`pdf-viewer-pro ${className}`} 
      style={{ width, height: "100%" }}
    >
      {showControls && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#f5f5f5",
            borderBottom: "1px solid #e8e8e8",
            position: "sticky",
            top: 0,
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            borderRadius: "8px 8px 0 0",
          }}
        >
          {/* 页面导航 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              style={{
                ...toolbarButtonStyle,
                ...(currentPage <= 1 ? toolbarButtonDisabledStyle : {}),
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  Object.assign(e.target.style, toolbarButtonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage > 1) {
                  e.target.style.border = "1px solid #d9d9d9";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              <LeftOutlined />
            </button>
            <input
              type="number"
              min="1"
              max={numPages}
              value={inputPage}
              onChange={handlePageChange}
              onBlur={handlePageSubmit}
              onKeyDown={handlePageSubmit}
              placeholder={currentPage.toString()}
              style={pageInputStyle}
            />
            <span style={{ margin: "0 8px", color: "#555" }}>/ {numPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              style={{
                ...toolbarButtonStyle,
                ...(currentPage >= numPages ? toolbarButtonDisabledStyle : {}),
              }}
              onMouseEnter={(e) => {
                if (currentPage < numPages) {
                  Object.assign(e.target.style, toolbarButtonHoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage < numPages) {
                  e.target.style.border = "1px solid #d9d9d9";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              <RightOutlined />
            </button>
            
            {/* 视图模式切换 */}
            <button
              onClick={toggleViewMode}
              title="切换视图模式"
              style={{
                ...toolbarButtonStyle,
                marginLeft: "8px",
                padding: "6px 12px",
              }}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              {viewMode === "single" ? "连续模式" : "单页模式"}
            </button>
          </div>

          {/* 工具栏按钮 */}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <button
              onClick={zoomOut}
              title="缩小"
              style={toolbarButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              <ZoomOutOutlined />
            </button>
            {isEditingZoom ? (
              <input
                type="text"
                value={zoomInputValue}
                onChange={handleZoomChange}
                onBlur={handleZoomSubmit}
                onKeyDown={handleZoomSubmit}
                autoFocus
                style={zoomStyle}
              />
            ) : (
              <div 
                style={zoomStyle}
                onClick={startEditingZoom}
              >
                {Math.round(currentScale * 100)}%
              </div>
            )}
            <button
              onClick={zoomIn}
              title="放大"
              style={toolbarButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              <ZoomInOutlined />
            </button>
            <button
              onClick={rotateCounterClockwise}
              title="逆时针旋转"
              style={{
                ...toolbarButtonStyle,
                marginLeft: "8px",
              }}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              <RotateLeftOutlined />
            </button>
            <button
              onClick={rotateClockwise}
              title="顺时针旋转"
              style={toolbarButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              <RotateRightOutlined />
            </button>
            <button
              onClick={toggleFullscreen}
              title={fullscreen ? "退出全屏" : "全屏"}
              style={{
                ...toolbarButtonStyle,
                marginLeft: "8px",
              }}
              onMouseEnter={(e) =>
                Object.assign(e.target.style, toolbarButtonHoverStyle)
              }
              onMouseLeave={(e) => {
                e.target.style.border = "1px solid #d9d9d9";
                e.target.style.boxShadow = "none";
              }}
            >
              {fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </button>
          </div>
        </div>
      )}

      {/* PDF 内容 */}
      <div
        style={{
          height: showControls ? `calc(${height} - 60px)` : height,
          overflow: "auto",
          background: "#f8f9fa",
          padding: "16px",
        }}
      >
        {viewMode === "single" ? (
          <canvas
            ref={canvasRef}
            style={{ display: "block", margin: "auto" }}
          />
        ) : (
          <div
            ref={containerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {allPages.map((canvas, index) => {
              const canvasClone = canvas.cloneNode(true);
              const context = canvasClone.getContext("2d");
              context.drawImage(canvas, 0, 0);

              return (
                <div key={index}>
                  <div
                    style={{
                      background: "#1890ff",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginBottom: "8px",
                      fontWeight: "500",
                    }}
                  >
                    第 {index + 1} 页
                  </div>
                  <canvas
                    ref={(el) => {
                      if (el && canvasClone) {
                        el.width = canvasClone.width;
                        el.height = canvasClone.height;
                        el.getContext("2d").drawImage(canvasClone, 0, 0);
                      }
                    }}
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

export default PDFViewerPro;