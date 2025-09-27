import { useState } from 'react';
import TreeForm from '../components/TreeForm';
import ReportPreview from '../components/ReportPreview';

const defaultTree = {
  number: 1,
  species: '',
  common_name: '',
  photo_url: '',
  height_m: '',
  crown_spread_m: '',
  dbh_m: '',
  circumference_m: '',
  age_class: '',
  structure: '',
  health: '',
  ule_category: '',
  ule_description: '',
  risk_rating: {
    failure_potential: '',
    limb_size: '',
    target_rating: '',
    overall: '',
  },
  legislative_status: '',
  recommendations: '',
  comments: '',
};

export default function Home() {
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    location: '',
    inspectionDate: '',
    arboristName: '',
  });
  const [trees, setTrees] = useState([]);
  const [activeTree, setActiveTree] = useState(defaultTree);
  const [report, setReport] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetActiveTree = () => {
    setActiveTree({
      ...defaultTree,
      number: trees.length + 1,
    });
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleTreeSubmit = (tree) => {
    const normalizeNumber = (value) => {
      if (value === '' || value === null || value === undefined) return '';
      const parsed = Number(value);
      return Number.isNaN(parsed) ? '' : parsed;
    };

    const nextTree = {
      ...tree,
      number: trees.length + 1,
      height_m: normalizeNumber(tree.height_m),
      crown_spread_m: normalizeNumber(tree.crown_spread_m),
      dbh_m: normalizeNumber(tree.dbh_m),
      circumference_m: normalizeNumber(tree.circumference_m),
      risk_rating: {
        failure_potential: normalizeNumber(tree.risk_rating?.failure_potential),
        limb_size: normalizeNumber(tree.risk_rating?.limb_size),
        target_rating: normalizeNumber(tree.risk_rating?.target_rating),
        overall: tree.risk_rating?.overall || '',
      },
    };

    setTrees((prev) => [...prev, nextTree]);
    resetActiveTree();
  };

  const handleGenerateReport = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientInfo, trees }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReport(data.report || '');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportDocx = async () => {
    if (!report) return;

    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: 'Visual Tree Inspection Report',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: `Client: ${clientInfo.clientName}`,
            }),
            new Paragraph({
              text: `Location: ${clientInfo.location}`,
            }),
            new Paragraph({
              text: `Inspection Date: ${clientInfo.inspectionDate}`,
            }),
            new Paragraph({
              text: `Arborist: ${clientInfo.arboristName}`,
            }),
            ...trees.flatMap((tree) => [
              new Paragraph({
                text: `Tree #${tree.number} - ${tree.common_name || tree.species}`,
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({ text: `Species: ${tree.species}` }),
              new Paragraph({ text: `DBH (m): ${tree.dbh_m}` }),
              new Paragraph({ text: `Height (m): ${tree.height_m}` }),
              new Paragraph({ text: `Crown Spread (m): ${tree.crown_spread_m}` }),
              new Paragraph({ text: `Age Class: ${tree.age_class}` }),
              new Paragraph({ text: `Structure: ${tree.structure}` }),
              new Paragraph({ text: `Health: ${tree.health}` }),
              new Paragraph({ text: `ULE Category: ${tree.ule_category}` }),
              new Paragraph({ text: `ULE Description: ${tree.ule_description}` }),
              new Paragraph({ text: `Risk Rating: ${tree.risk_rating.overall}` }),
              new Paragraph({ text: `Recommendations: ${tree.recommendations}` }),
              new Paragraph({ text: `Comments: ${tree.comments}` }),
            ]),
            new Paragraph({
              text: 'Generated Report',
              heading: HeadingLevel.HEADING_2,
            }),
            ...report
              .split('\n')
              .filter(Boolean)
              .map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line })],
                  })
              ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arborist-report.docx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Arborist Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1, h2, h3 { color: #14532d; }
            .tree-section { margin-bottom: 24px; }
            .tree-section h3 { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>Visual Tree Inspection Report</h1>
          <p><strong>Client:</strong> ${clientInfo.clientName}</p>
          <p><strong>Location:</strong> ${clientInfo.location}</p>
          <p><strong>Inspection Date:</strong> ${clientInfo.inspectionDate}</p>
          <p><strong>Arborist:</strong> ${clientInfo.arboristName}</p>
          ${trees
            .map(
              (tree) => `
              <div class="tree-section">
                <h2>Tree #${tree.number} - ${tree.common_name || tree.species}</h2>
                <p><strong>Species:</strong> ${tree.species}</p>
                <p><strong>DBH (m):</strong> ${tree.dbh_m}</p>
                <p><strong>Height (m):</strong> ${tree.height_m}</p>
                <p><strong>Crown Spread (m):</strong> ${tree.crown_spread_m}</p>
                <p><strong>Age Class:</strong> ${tree.age_class}</p>
                <p><strong>Structure:</strong> ${tree.structure}</p>
                <p><strong>Health:</strong> ${tree.health}</p>
                <p><strong>ULE Category:</strong> ${tree.ule_category}</p>
                <p><strong>ULE Description:</strong> ${tree.ule_description}</p>
                <p><strong>Risk Rating:</strong> ${tree.risk_rating.overall}</p>
                <p><strong>Recommendations:</strong> ${tree.recommendations}</p>
                <p><strong>Comments:</strong> ${tree.comments}</p>
              </div>
            `
            )
            .join('')}
          <div>${report}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-semibold">Arborist Report Builder</h1>
          <p className="mt-2 text-emerald-100">
            Document visual tree inspections, capture photos, and generate professional reports.
          </p>
        </header>

        <section className="bg-emerald-900/70 backdrop-blur-sm rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-xl font-semibold text-emerald-100">Client Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm">
              Client Name
              <input
                name="clientName"
                value={clientInfo.clientName}
                onChange={handleClientChange}
                className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Jane Smith"
              />
            </label>
            <label className="flex flex-col text-sm">
              Inspection Location
              <input
                name="location"
                value={clientInfo.location}
                onChange={handleClientChange}
                className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="123 Forest Ave"
              />
            </label>
            <label className="flex flex-col text-sm">
              Inspection Date
              <input
                type="date"
                name="inspectionDate"
                value={clientInfo.inspectionDate}
                onChange={handleClientChange}
                className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
            <label className="flex flex-col text-sm">
              Arborist Name
              <input
                name="arboristName"
                value={clientInfo.arboristName}
                onChange={handleClientChange}
                className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Certified Arborist"
              />
            </label>
          </div>
        </section>

        <TreeForm
          tree={activeTree}
          onSubmit={handleTreeSubmit}
          onChange={setActiveTree}
        />

        {trees.length > 0 && (
          <section className="bg-emerald-900/70 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-emerald-100">Trees in Report</h2>
            <ul className="space-y-4">
              {trees.map((tree) => (
                <li
                  key={tree.number}
                  className="rounded-lg border border-emerald-800 bg-emerald-900/60 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-100">
                        Tree #{tree.number}: {tree.common_name || tree.species || 'Unnamed'}
                      </h3>
                      <p className="text-sm text-emerald-200">Species: {tree.species || '—'}</p>
                      <p className="text-sm text-emerald-200">DBH: {tree.dbh_m || '—'} m</p>
                      <p className="text-sm text-emerald-200">Health: {tree.health || '—'}</p>
                      <p className="text-sm text-emerald-200">Recommendations: {tree.recommendations || '—'}</p>
                    </div>
                    {tree.photo_url && (
                      <img
                        src={tree.photo_url}
                        alt={`Tree ${tree.number}`}
                        className="h-24 w-24 rounded-lg object-cover border border-emerald-700"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-emerald-900/70 rounded-xl p-6 shadow-lg space-y-4">
          <button
            onClick={handleGenerateReport}
            disabled={isSubmitting || trees.length === 0}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-center font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
          >
            {isSubmitting ? 'Generating Report...' : 'Generate Report'}
          </button>
          {error && <p className="text-sm text-red-300">{error}</p>}
          {report && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={handleExportDocx}
                  className="flex-1 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-800"
                >
                  Export DOCX
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex-1 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-800"
                >
                  Export PDF
                </button>
              </div>
              <ReportPreview report={report} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
