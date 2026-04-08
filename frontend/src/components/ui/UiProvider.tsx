import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info" | "warning";
type Toast = { id: string; kind: ToastKind; title?: string; message: string };

type ConfirmState = null | {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (val: boolean) => void;
};

type PromptState = null | {
  title?: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  resolve: (val: string | null) => void;
};

type UiApi = {
  toast: (t: { kind?: ToastKind; title?: string; message: string }) => void;
  confirm: (c: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
  prompt: (p: {
    title?: string;
    message: string;
    defaultValue?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<string | null>;
};

const UiContext = createContext<UiApi | null>(null);

function randomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [promptState, setPromptState] = useState<PromptState>(null);
  const [promptValue, setPromptValue] = useState("");

  const toast = useCallback(
    (t: { kind?: ToastKind; title?: string; message: string }) => {
      const id = randomId();
      const next: Toast = {
        id,
        kind: t.kind ?? "info",
        title: t.title,
        message: t.message,
      };
      setToasts((prev) => [next, ...prev].slice(0, 5));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 3200);
    },
    []
  );

  const confirm = useCallback(
    (c: {
      title?: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
    }) => {
      return new Promise<boolean>((resolve) => {
        setConfirmState({ ...c, resolve });
      });
    },
    []
  );

  const prompt = useCallback(
    (p: {
      title?: string;
      message: string;
      defaultValue?: string;
      placeholder?: string;
      confirmText?: string;
      cancelText?: string;
    }) => {
      return new Promise<string | null>((resolve) => {
        setPromptValue(p.defaultValue ?? "");
        setPromptState({ ...p, resolve });
      });
    },
    []
  );

  const api = useMemo<UiApi>(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  const toastClass = (kind: ToastKind) => {
    switch (kind) {
      case "success":
        return "text-bg-success";
      case "error":
        return "text-bg-danger";
      case "warning":
        return "text-bg-warning";
      default:
        return "text-bg-dark";
    }
  };

  return (
    <UiContext.Provider value={api}>
      {children}

      {/* Toasts */}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 360,
          width: "calc(100vw - 36px)",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast show ${toastClass(t.kind)} shadow`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              borderRadius: 14,
              overflow: "hidden",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="toast-header">
              <strong className="me-auto">{t.title ?? "Notice"}</strong>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              />
            </div>
            <div className="toast-body">{t.message}</div>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState ? (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 2100 }}
          onClick={() => {
            confirmState.resolve(false);
            setConfirmState(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header">
                <h5 className="modal-title">{confirmState.title ?? "Confirm"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    confirmState.resolve(false);
                    setConfirmState(null);
                  }}
                />
              </div>
              <div className="modal-body">{confirmState.message}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    confirmState.resolve(false);
                    setConfirmState(null);
                  }}
                >
                  {confirmState.cancelText ?? "Cancel"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    confirmState.resolve(true);
                    setConfirmState(null);
                  }}
                >
                  {confirmState.confirmText ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Prompt modal */}
      {promptState ? (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.45)", zIndex: 2100 }}
          onClick={() => {
            promptState.resolve(null);
            setPromptState(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header">
                <h5 className="modal-title">{promptState.title ?? "Update"}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    promptState.resolve(null);
                    setPromptState(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-2">{promptState.message}</div>
                <input
                  className="form-control"
                  value={promptValue}
                  placeholder={promptState.placeholder}
                  onChange={(e) => setPromptValue(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    promptState.resolve(null);
                    setPromptState(null);
                  }}
                >
                  {promptState.cancelText ?? "Cancel"}
                </button>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => {
                    const val = promptValue.trim();
                    promptState.resolve(val.length ? val : null);
                    setPromptState(null);
                  }}
                >
                  {promptState.confirmText ?? "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}

