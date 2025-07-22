import React, {
  Suspense,
  lazy,
  memo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

// Lazy load dashboard components
const PaymentManagement = lazy(() => import("../payments/PaymentManagement"));
const UserManagement = lazy(() => import("../users/User"));
const ProductManagement = lazy(() => import("../auctions/Product"));
const UserProfile = lazy(() => import("../users/UserProfile"));
const DashboardStats = lazy(() => import("./DashboardStats"));
const DashboardCharts = lazy(() => import("./DashboardCharts"));

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  useEffect(() => {
    // Monitor initial load time
    const startTime = performance.now();

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          setMetrics((prev) => ({
            ...prev,
            loadTime: entry.loadEventEnd - entry.loadEventStart,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ["navigation"] });

    // Monitor memory usage (if available)
    if ("memory" in performance) {
      const updateMemory = () => {
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      };

      const interval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Loading component with progress indicator
const LoadingSpinner = memo(
  ({ message = "جاري التحميل...", size = "default" }) => {
    const sizeClasses = {
      small: "w-4 h-4",
      default: "w-8 h-8",
      large: "w-12 h-12",
    };

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div
          className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizeClasses[size]}`}
        />
        <p className="mt-4 text-gray-600 text-sm">{message}</p>
      </div>
    );
  }
);

// Error boundary for dashboard components
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error("Dashboard Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            حدث خطأ في تحميل المكون
          </h3>
          <p className="text-red-600 mb-4">
            عذراً، حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة مرة أخرى.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            إعادة تحميل الصفحة
          </button>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-700 font-medium">
                تفاصيل الخطأ (وضع التطوير)
              </summary>
              <pre className="mt-2 p-4 bg-red-100 rounded text-xs overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Optimized component wrapper with intersection observer
const OptimizedComponent = memo(
  ({
    children,
    threshold = 0.1,
    rootMargin = "50px",
    fallback = <LoadingSpinner />,
    onVisible,
    className = "",
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState(null);

    const refCallback = useCallback((node) => {
      if (node !== null) {
        setRef(node);
      }
    }, []);

    useEffect(() => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            onVisible?.();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(ref);

      return () => {
        if (ref) {
          observer.unobserve(ref);
        }
      };
    }, [ref, threshold, rootMargin, isVisible, onVisible]);

    return (
      <div ref={refCallback} className={className}>
        {isVisible ? children : fallback}
      </div>
    );
  }
);

// Resource preloader
const useResourcePreloader = () => {
  const [preloadedComponents, setPreloadedComponents] = useState(new Set());

  const preloadComponent = useCallback(
    (componentName) => {
      if (preloadedComponents.has(componentName)) return;

      const componentMap = {
        payments: () => import("../payments/PaymentManagement"),
        users: () => import("../users/User"),
        products: () => import("../auctions/Product"),
        profile: () => import("../users/UserProfile"),
        stats: () => import("./DashboardStats"),
        charts: () => import("./DashboardCharts"),
      };

      const loadComponent = componentMap[componentName];
      if (loadComponent) {
        loadComponent()
          .then(() => {
            setPreloadedComponents((prev) => new Set([...prev, componentName]));
          })
          .catch((error) => {
            console.error(`Error preloading ${componentName}:`, error);
          });
      }
    },
    [preloadedComponents]
  );

  const preloadAll = useCallback(() => {
    Object.keys({
      payments: true,
      users: true,
      products: true,
      profile: true,
      stats: true,
      charts: true,
    }).forEach(preloadComponent);
  }, [preloadComponent]);

  return { preloadComponent, preloadAll, preloadedComponents };
};

// Main dashboard optimizer component
const DashboardOptimizer = memo(
  ({
    activeComponent,
    componentProps = {},
    enablePerformanceMonitoring = true,
    enableLazyLoading = true,
    enablePreloading = true,
  }) => {
    const metrics = usePerformanceMonitor();
    const { preloadComponent, preloadAll } = useResourcePreloader();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize optimizer
    useEffect(() => {
      if (enablePreloading) {
        // Preload critical components immediately
        preloadComponent("stats");
        preloadComponent("charts");

        // Preload other components after a delay
        const timer = setTimeout(() => {
          preloadAll();
        }, 2000);

        return () => clearTimeout(timer);
      }
    }, [enablePreloading, preloadComponent, preloadAll]);

    useEffect(() => {
      setIsInitialized(true);
    }, []);

    // Component factory with optimization
    const renderComponent = useCallback(() => {
      const ComponentWrapper = ({ children }) =>
        enableLazyLoading ? (
          <OptimizedComponent
            onVisible={() => {
              if (enablePerformanceMonitoring) {
                console.log(`Component ${activeComponent} became visible`);
              }
            }}
          >
            {children}
          </OptimizedComponent>
        ) : (
          children
        );

      const suspenseFallback = (
        <LoadingSpinner
          message={`جاري تحميل ${getComponentDisplayName(activeComponent)}...`}
          size="large"
        />
      );

      switch (activeComponent) {
        case "payments":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <PaymentManagement {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        case "users":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <UserManagement {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        case "products":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <ProductManagement {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        case "profile":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <UserProfile {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        case "stats":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <DashboardStats {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        case "charts":
          return (
            <ComponentWrapper>
              <Suspense fallback={suspenseFallback}>
                <DashboardCharts {...componentProps} />
              </Suspense>
            </ComponentWrapper>
          );

        default:
          return (
            <div className="text-center py-8">
              <p className="text-gray-500">مكون غير معروف: {activeComponent}</p>
            </div>
          );
      }
    }, [
      activeComponent,
      componentProps,
      enableLazyLoading,
      enablePerformanceMonitoring,
    ]);

    const getComponentDisplayName = (component) => {
      const displayNames = {
        payments: "المدفوعات",
        users: "المستخدمين",
        products: "المزادات",
        profile: "الملف الشخصي",
        stats: "الإحصائيات",
        charts: "الرسوم البيانية",
      };
      return displayNames[component] || component;
    };

    if (!isInitialized) {
      return (
        <LoadingSpinner message="جاري تهيئة لوحة التحكم..." size="large" />
      );
    }

    return (
      <div className="dashboard-optimizer">
        <DashboardErrorBoundary>{renderComponent()}</DashboardErrorBoundary>

        {/* Performance Monitor (Development Only) */}
        {enablePerformanceMonitoring &&
          process.env.NODE_ENV === "development" && (
            <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg z-50">
              <div>تحميل: {metrics.loadTime.toFixed(2)}ms</div>
              <div>ذاكرة: {metrics.memoryUsage.toFixed(1)}MB</div>
              <div>مكون: {getComponentDisplayName(activeComponent)}</div>
            </div>
          )}
      </div>
    );
  }
);

DashboardOptimizer.displayName = "DashboardOptimizer";
LoadingSpinner.displayName = "LoadingSpinner";
OptimizedComponent.displayName = "OptimizedComponent";

export default DashboardOptimizer;
export { LoadingSpinner, DashboardErrorBoundary, OptimizedComponent };
