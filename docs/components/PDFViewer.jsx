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
  FileOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  InputNumber,
  Space,
  Tooltip,
  Spin,
  Progress,
} from "antd";
import "./PDFViewer.css";

const PDFViewer = ({
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
  const viewerRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScale, setCurrentScale] = useState(scale);
  const [rotation, setRotation] = useState(0);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [viewMode, setViewMode] = useState("continuous");
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

  const handlePageChange = (e) => {
    setInputPage(e.target.value);
  };

  const handlePageSubmit = (e) => {
    if (e.type === "blur" || e.key === "Enter") {
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

  const handleZoomChange = (e) => {
    setZoomInputValue(e.target.value);
  };

  const handleZoomSubmit = (e) => {
    if (e.type === "blur" || e.key === "Enter") {
      e.preventDefault();
      let value = zoomInputValue;

      if (value.includes("%")) {
        value = value.replace("%", "");
        const percentValue = parseFloat(value);
        if (!isNaN(percentValue)) {
          setCurrentScale(Math.min(Math.max(percentValue / 100, 0.3), 3.0));
        }
      } else {
        const decimalValue = parseFloat(value);
        if (!isNaN(decimalValue)) {
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

  const startEditingZoom = () => {
    setZoomInputValue(Math.round(currentScale * 100).toString());
    setIsEditingZoom(true);
  };

  const toggleViewMode = () =>
    setViewMode((prev) => (prev === "single" ? "continuous" : "single"));

  const rotateClockwise = () => setRotation((r) => (r + 90) % 360);
  const rotateCounterClockwise = () => setRotation((r) => (r - 90 + 360) % 360);

  const toggleFullscreen = () => {
    const viewerElement = viewerRef.current;
    if (!viewerElement) return;

    if (!document.fullscreenElement) {
      viewerElement
        .requestFullscreen()
        .then(() => {
          setFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        });
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  if (loading) {
    return (
      <div className={`pdf-viewer-pro ${className}`} style={{ width, height }}>
        <div className="pdf-loading">
          <Spin size="large" />
          <div style={{ marginTop: 16, fontSize: 16 }}>正在加载 PDF...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pdf-viewer-pro ${className}`} style={{ width, height }}>
        <div className="pdf-error">{error}</div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className={`pdf-viewer-pro ${className}`}
      style={{ width, height: "100%" }}
    >
      {showControls && (
        <div className="pdf-toolbar">
          <Space size="middle" className="toolbar-group">
            <Space size="small">
              <Tooltip title="上一页">
                <Button
                  icon={<LeftOutlined />}
                  onClick={goToPrevPage}
                  disabled={viewMode === "continuous" || currentPage <= 1}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>

              <div className="page-control">
                <InputNumber
                  min={1}
                  max={numPages}
                  value={inputPage || undefined}
                  onChange={(value) => setInputPage(value?.toString() || "")}
                  onPressEnter={handlePageSubmit}
                  onBlur={handlePageSubmit}
                  placeholder={currentPage.toString()}
                  className="page-input"
                  controls={false}
                  size="middle"
                  disabled={viewMode === "continuous"}
                />
                <span className="page-divider">/ {numPages}</span>
              </div>

              <Tooltip title="下一页">
                <Button
                  icon={<RightOutlined />}
                  onClick={goToNextPage}
                  disabled={
                    viewMode === "continuous" || currentPage >= numPages
                  }
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>
            </Space>

            <Space size="small">
              <Tooltip
                title={
                  viewMode === "single" ? "切换到连续模式" : "切换到单页模式"
                }
              >
                <Button
                  icon={
                    viewMode === "single" ? (
                      <MenuFoldOutlined />
                    ) : (
                      <FileOutlined />
                    )
                  }
                  onClick={toggleViewMode}
                  size="middle"
                  className="toolbar-button view-mode-button"
                >
                  {viewMode === "single" ? "连续" : "单页"}
                </Button>
              </Tooltip>
            </Space>
          </Space>

          <Space size="middle" className="toolbar-group">
            <Space size="small">
              <Tooltip title="缩小">
                <Button
                  icon={<ZoomOutOutlined />}
                  onClick={zoomOut}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>

              {isEditingZoom ? (
                <Input
                  value={zoomInputValue}
                  onChange={handleZoomChange}
                  onBlur={handleZoomSubmit}
                  onPressEnter={handleZoomSubmit}
                  autoFocus
                  className="zoom-input"
                  size="middle"
                  suffix="%"
                />
              ) : (
                <Button
                  onClick={startEditingZoom}
                  className="zoom-display toolbar-button"
                  size="middle"
                >
                  {Math.round(currentScale * 100)}%
                </Button>
              )}

              <Tooltip title="放大">
                <Button
                  icon={<ZoomInOutlined />}
                  onClick={zoomIn}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>
            </Space>

            <Space size="small">
              <Tooltip title="逆时针旋转">
                <Button
                  icon={<RotateLeftOutlined />}
                  onClick={rotateCounterClockwise}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>

              <Tooltip title="顺时针旋转">
                <Button
                  icon={<RotateRightOutlined />}
                  onClick={rotateClockwise}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>

              <Tooltip title={fullscreen ? "退出全屏" : "全屏"}>
                <Button
                  icon={
                    fullscreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )
                  }
                  onClick={toggleFullscreen}
                  size="middle"
                  className="toolbar-button"
                />
              </Tooltip>
            </Space>
          </Space>
        </div>
      )}

      <div className="pdf-content">
        {viewMode === "single" ? (
          <canvas ref={canvasRef} className="pdf-canvas" />
        ) : (
          <div ref={containerRef} className="pdf-pages-container">
            {allPages.map((canvas, index) => {
              const canvasClone = canvas.cloneNode(true);
              const context = canvasClone.getContext("2d");
              context.drawImage(canvas, 0, 0);

              return (
                <div key={index} className="pdf-page-wrapper">
                  <canvas
                    ref={(el) => {
                      if (el && canvasClone) {
                        el.width = canvasClone.width;
                        el.height = canvasClone.height;
                        el.getContext("2d").drawImage(canvasClone, 0, 0);
                      }
                    }}
                    className="pdf-page-canvas"
                  />
                  <div className="pdf-page-number">第 {index + 1} 页</div>
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
