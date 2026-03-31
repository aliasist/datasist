export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-3">
      <span style={{ fontSize: "48px", color: "var(--color-green)" }}>⬡</span>
      <div style={{ fontSize: "14px", color: "var(--color-text-muted)", letterSpacing: "0.1em" }}>
        404 · SIGNAL LOST
      </div>
    </div>
  );
}
