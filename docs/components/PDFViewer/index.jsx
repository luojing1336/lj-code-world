import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
} from "antd";
import "./index.css";
import { convertGithubToJsdelivr } from "../../utils";

// 常量定义
const CONSTANTS = {
  DEFAULT_SCALE: 1.2,
  MIN_SCALE: 0.3,
  MAX_SCALE: 3.0,
  SCALE_STEP: 1.2,
  ROTATION_STEP: 90,
  PDFJS_VERSION: "3.11.174",
};

// PDF.js CDN URLs
const PDFJS_URLS = {
  lib: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${CONSTANTS.PDFJS_VERSION}/pdf.min.js`,
  worker: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${CONSTANTS.PDFJS_VERSION}/pdf.worker.min.js`,
};

// 工具函数
const utils = {

  // 限制数值范围
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),

  // 解析缩放值
  parseZoomValue: (value) => {
    if (!value) return null;
    
    const cleanValue = value.toString().replace("%", "");
    const numValue = parseFloat(cleanValue);
    
    if (isNaN(numValue)) return null;
    
    // 如果数值大于10，认为是百分比形式
    return numValue > 10 ? numValue / 100 : numValue;
  },
};

// 自定义hooks
const usePDFJS = () => {
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPDFJS = async () => {
      try {
        if (window.pdfjsLib) {
          setPdfjsLib(window.pdfjsLib);
          return;
        }

        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = PDFJS_URLS.lib;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_URLS.worker;
        setPdfjsLib(window.pdfjsLib);
      } catch (err) {
        setError("加载 PDF.js 库失败");
        console.error("PDF.js loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPDFJS();
  }, []);

  return { pdfjsLib, loading, error };
};

const useFullscreen = (viewerRef) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const viewerElement = viewerRef.current;
    if (!viewerElement) return;

    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(`Error entering fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(`Error exiting fullscreen: ${err.message}`));
    }
  }, [viewerRef]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const events = [
      'fullscreenchange',
      'webkitfullscreenchange', 
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
};

// 工具栏组件
const Toolbar = ({
  currentPage,
  numPages,
  onPageChange,
  onPrevPage,
  onNextPage,
  viewMode,
  onToggleViewMode,
  scale,
  onZoomIn,
  onZoomOut,
  onScaleChange,
  rotation,
  onRotateLeft,
  onRotateRight,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [inputPage, setInputPage] = useState("");
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [zoomInputValue, setZoomInputValue] = useState("");

  const handlePageSubmit = useCallback((e) => {
    if (e.type === "blur" || e.key === "Enter") {
      e.preventDefault();
      const pageNumber = parseInt(inputPage);
      if (!isNaN(pageNumber)) {
        onPageChange(pageNumber);
        setInputPage("");
      }
    }
  }, [inputPage, onPageChange]);

  const handleZoomSubmit = useCallback((e) => {
    if (e.type === "blur" || e.key === "Enter") {
      e.preventDefault();
      const newScale = utils.parseZoomValue(zoomInputValue);
      if (newScale !== null) {
        onScaleChange(utils.clamp(newScale, CONSTANTS.MIN_SCALE, CONSTANTS.MAX_SCALE));
      }
      setIsEditingZoom(false);
    }
  }, [zoomInputValue, onScaleChange]);

  const startEditingZoom = useCallback(() => {
    setZoomInputValue(Math.round(scale * 100).toString());
    setIsEditingZoom(true);
  }, [scale]);

  const isNavigationDisabled = viewMode === "continuous";

  return (
    <div className="pdf-toolbar">
      <Space size="middle" className="toolbar-group">
        {/* 页面导航 */}
        <Space size="small">
          <Tooltip title="上一页">
            <Button
              icon={<LeftOutlined />}
              onClick={onPrevPage}
              disabled={isNavigationDisabled || currentPage <= 1}
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
              disabled={isNavigationDisabled}
            />
            <span className="page-divider">/ {numPages}</span>
          </div>

          <Tooltip title="下一页">
            <Button
              icon={<RightOutlined />}
              onClick={onNextPage}
              disabled={isNavigationDisabled || currentPage >= numPages}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>
        </Space>

        {/* 视图模式 */}
        <Space size="small">
          <Tooltip title={viewMode === "single" ? "切换到连续模式" : "切换到单页模式"}>
            <Button
              icon={viewMode === "single" ? <MenuFoldOutlined /> : <FileOutlined />}
              onClick={onToggleViewMode}
              size="middle"
              className="toolbar-button view-mode-button"
            >
              {viewMode === "single" ? "连续" : "单页"}
            </Button>
          </Tooltip>
        </Space>
      </Space>

      <Space size="middle" className="toolbar-group">
        {/* 缩放控制 */}
        <Space size="small">
          <Tooltip title="缩小">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={onZoomOut}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>

          {isEditingZoom ? (
            <Input
              value={zoomInputValue}
              onChange={(e) => setZoomInputValue(e.target.value)}
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
              {Math.round(scale * 100)}%
            </Button>
          )}

          <Tooltip title="放大">
            <Button
              icon={<ZoomInOutlined />}
              onClick={onZoomIn}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>
        </Space>

        {/* 旋转和全屏 */}
        <Space size="small">
          <Tooltip title="逆时针旋转">
            <Button
              icon={<RotateLeftOutlined />}
              onClick={onRotateLeft}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>

          <Tooltip title="顺时针旋转">
            <Button
              icon={<RotateRightOutlined />}
              onClick={onRotateRight}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>

          <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={onToggleFullscreen}
              size="middle"
              className="toolbar-button"
            />
          </Tooltip>
        </Space>
      </Space>
    </div>
  );
};

// 单页视图组件
const SinglePageView = ({ canvasRef }) => (
  <canvas ref={canvasRef} className="pdf-canvas" />
);

// 连续视图组件
const ContinuousView = ({ allPages }) => {
  if (!allPages.length) return null;

  return (
    <div className="pdf-pages-container">
      {allPages.map((canvas, index) => (
        <PageCanvas key={index} canvas={canvas} pageNumber={index + 1} />
      ))}
    </div>
  );
};

// 页面画布组件
const PageCanvas = ({ canvas, pageNumber }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (canvasElement && canvas) {
      canvasElement.width = canvas.width;
      canvasElement.height = canvas.height;
      const context = canvasElement.getContext("2d");
      context.drawImage(canvas, 0, 0);
    }
  }, [canvas]);

  return (
    <div className="pdf-page-wrapper">
      <canvas ref={canvasRef} className="pdf-page-canvas" />
      <div className="pdf-page-number">第 {pageNumber} 页</div>
    </div>
  );
};

// 主要PDF查看器组件
const PDFViewer = ({
  src,
  width = "100%",
  height = "100%",
  showControls = true,
  initialPage = 1,
  scale = CONSTANTS.DEFAULT_SCALE,
  className = "",
}) => {
  // Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // Custom hooks
  const { pdfjsLib, loading: pdfjsLoading, error: pdfjsError } = usePDFJS();
  const { isFullscreen, toggleFullscreen } = useFullscreen(viewerRef);

  // State
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScale, setCurrentScale] = useState(scale);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState("single");
  const [allPages, setAllPages] = useState([]);

  // Memoized values
  const pdfSrc = useMemo(() => convertGithubToJsdelivr(src), [src]);

  // PDF loading
  const loadPDF = useCallback(async () => {
    if (!pdfjsLib || !pdfSrc) return;

    setLoading(true);
    setError(null);

    try {
      const loadingTask = pdfjsLib.getDocument(pdfSrc);
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
  }, [pdfjsLib, pdfSrc, initialPage]);

  // Page rendering
  const renderPage = useCallback(async (pageNum) => {
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
  }, [pdf, currentScale, rotation]);

  const renderAllPages = useCallback(async () => {
    if (!pdf) return;

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
  }, [pdf, numPages, currentScale, rotation]);

  // Event handlers
  const handlePageChange = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  }, [numPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < numPages) setCurrentPage(prev => prev + 1);
  }, [currentPage, numPages]);

  const handleZoomIn = useCallback(() => {
    setCurrentScale(prev => utils.clamp(prev * CONSTANTS.SCALE_STEP, CONSTANTS.MIN_SCALE, CONSTANTS.MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentScale(prev => utils.clamp(prev / CONSTANTS.SCALE_STEP, CONSTANTS.MIN_SCALE, CONSTANTS.MAX_SCALE));
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => (prev - CONSTANTS.ROTATION_STEP + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => (prev + CONSTANTS.ROTATION_STEP) % 360);
  }, []);

  const handleToggleViewMode = useCallback(() => {
    setViewMode(prev => prev === "single" ? "continuous" : "single");
  }, []);

  // Effects
  useEffect(() => {
    if (pdfjsLib && pdfSrc) {
      loadPDF();
    }
  }, [loadPDF]);

  useEffect(() => {
    if (!pdf) return;

    if (viewMode === "single") {
      renderPage(currentPage);
    } else {
      renderAllPages();
    }
  }, [pdf, currentPage, currentScale, viewMode, rotation, renderPage, renderAllPages]);

  // Loading state
  if (pdfjsLoading || loading) {
    return (
      <div className={`pdf-viewer-pro ${className}`} style={{ width, height }}>
        <div className="pdf-loading">
          <Spin size="large" />
          <div style={{ marginTop: 16, fontSize: 16 }}>正在加载 PDF...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (pdfjsError || error) {
    return (
      <div className={`pdf-viewer-pro ${className}`} style={{ width, height }}>
        <div className="pdf-error">{pdfjsError || error}</div>
      </div>
    );
  }

  return (
    <div ref={viewerRef} className={`pdf-viewer-pro ${className}`} style={{ width, height: "100%" }}>
      {showControls && (
        <Toolbar
          currentPage={currentPage}
          numPages={numPages}
          onPageChange={handlePageChange}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          scale={currentScale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onScaleChange={setCurrentScale}
          rotation={rotation}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      <div className="pdf-content">
        {viewMode === "single" ? (
          <SinglePageView canvasRef={canvasRef} />
        ) : (
          <ContinuousView allPages={allPages} />
        )}
      </div>
    </div>
  );
};

export default PDFViewer;