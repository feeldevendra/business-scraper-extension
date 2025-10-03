export function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(Boolean);
  const result = lines.map(line => {
    const [name, website] = line.split(',');
    return { name: name.trim(), website: website.trim() };
  });
  return result;
}

export function downloadCSV(data, filename) {
  const headers = Object.keys(data[0]).join(',');
  const csv = [
    headers,
    ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
