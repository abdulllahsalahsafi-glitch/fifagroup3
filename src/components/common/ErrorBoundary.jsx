import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="systemScreen" dir="rtl">
          <div className="systemCard glass">
            <h2>حدث خطأ</h2>
            <p>{this.state.error?.message || "حدث خطأ غير متوقع"}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onRetry) this.props.onRetry();
              }}
              style={{
                marginTop: 16,
                height: 44,
                border: 0,
                borderRadius: 18,
                padding: "0 24px",
                background: "linear-gradient(135deg,#00E676,#00D4FF)",
                color: "#02030A",
                fontWeight: 1000,
                cursor: "pointer",
                fontFamily: "Tajawal,Arial,sans-serif",
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
