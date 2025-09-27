export default function ReportPreview({ report }) {
  return (
    <div className="rounded-xl border border-emerald-700 bg-emerald-950/60 p-6 text-sm leading-relaxed text-emerald-100">
      <h2 className="text-lg font-semibold text-emerald-200">Generated Report</h2>
      <div
        className="prose prose-invert prose-emerald mt-4 max-w-none"
        dangerouslySetInnerHTML={{ __html: report }}
      />
    </div>
  );
}
