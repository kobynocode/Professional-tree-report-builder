import { useCallback } from 'react';

const formFields = [
  { name: 'species', label: 'Species', placeholder: 'Eucalyptus camaldulensis' },
  { name: 'common_name', label: 'Common Name', placeholder: 'River Red Gum' },
  { name: 'height_m', label: 'Height (m)', type: 'number', step: '0.1' },
  { name: 'crown_spread_m', label: 'Crown Spread (m)', type: 'number', step: '0.1' },
  { name: 'dbh_m', label: 'DBH (m)', type: 'number', step: '0.01' },
  { name: 'circumference_m', label: 'Circumference (m)', type: 'number', step: '0.01' },
  { name: 'age_class', label: 'Age Class', placeholder: 'Mature' },
  { name: 'structure', label: 'Structure', placeholder: 'Good' },
  { name: 'health', label: 'Health', placeholder: 'Good' },
  { name: 'ule_category', label: 'ULE Category', placeholder: '1' },
  { name: 'ule_description', label: 'ULE Description', placeholder: 'Long, life span greater than 40 years' },
  { name: 'legislative_status', label: 'Legislative Status', placeholder: 'Exempt under ...' },
  { name: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'No work required' },
  { name: 'comments', label: 'Comments', type: 'textarea', placeholder: 'Foliage vigorous...' },
];

const riskFields = [
  { name: 'failure_potential', label: 'Failure Potential', type: 'number', min: 1, max: 4 },
  { name: 'limb_size', label: 'Limb Size', type: 'number', min: 1, max: 4 },
  { name: 'target_rating', label: 'Target Rating', type: 'number', min: 1, max: 4 },
  { name: 'overall', label: 'Overall Risk', placeholder: 'Low' },
];

export default function TreeForm({ tree, onChange, onSubmit }) {
  const handleChange = useCallback(
    (event) => {
      const { name, value, type, files } = event.target;

      if (name === 'photo') {
        const file = files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          onChange((prev) => ({ ...prev, photo_url: e.target?.result || '' }));
        };
        reader.readAsDataURL(file);
        return;
      }

      if (name.startsWith('risk_rating.')) {
        const [, key] = name.split('.');
        onChange((prev) => ({
          ...prev,
          risk_rating: {
            ...prev.risk_rating,
            [key]: type === 'number' ? value : value,
          },
        }));
      } else {
        onChange((prev) => ({
          ...prev,
          [name]: type === 'number' ? value : value,
        }));
      }
    },
    [onChange]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      onSubmit(tree);
    },
    [tree, onSubmit]
  );

  return (
    <section className="bg-emerald-900/70 rounded-xl p-6 shadow-lg">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-emerald-100">
            Tree #{tree.number} Details
          </h2>
          <span className="rounded-full bg-emerald-800 px-3 py-1 text-xs text-emerald-200">
            Add trees individually to build your report
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {formFields.map(({ name, label, type = 'text', placeholder, step }) => (
            <label key={name} className="flex flex-col text-sm text-emerald-100">
              {label}
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  value={tree[name] || ''}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="mt-1 min-h-[96px] rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={tree[name] || ''}
                  onChange={handleChange}
                  placeholder={placeholder}
                  step={step}
                  className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              )}
            </label>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {riskFields.map(({ name, label, type = 'text', min, max, placeholder }) => (
            <label key={name} className="flex flex-col text-sm text-emerald-100">
              {label}
              <input
                type={type}
                name={`risk_rating.${name}`}
                value={tree.risk_rating?.[name] || ''}
                onChange={handleChange}
                placeholder={placeholder}
                min={min}
                max={max}
                className="mt-1 rounded-lg bg-emerald-800/60 border border-emerald-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </label>
          ))}
        </div>

        <label className="flex flex-col text-sm text-emerald-100">
          Tree Photo
          <input
            type="file"
            accept="image/*"
            name="photo"
            onChange={handleChange}
            className="mt-1 cursor-pointer rounded-lg border border-dashed border-emerald-600 bg-emerald-800/40 px-3 py-4 text-emerald-200"
          />
        </label>
        {tree.photo_url && (
          <div className="flex justify-center">
            <img
              src={tree.photo_url}
              alt="Tree preview"
              className="h-40 w-40 rounded-lg object-cover border border-emerald-700"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-center font-semibold text-emerald-950 transition hover:bg-emerald-400"
        >
          Add Tree to Report
        </button>
      </form>
    </section>
  );
}
