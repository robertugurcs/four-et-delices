export default function LocaleLoading() {
  return (
    <div
      className="locale-route-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="locale-route-loading__bar" aria-hidden />
    </div>
  );
}
