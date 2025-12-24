
export const generateCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  
  // Format rows with proper escaping for values containing commas
  const rows = data.map(item => {
    return headers.map(header => {
      let val = item[header] === null || item[header] === undefined ? "" : item[header];
      // Clean up number formatting for CSV
      if (typeof val === 'number') return `"${val}"`;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = [
    headers.join(','), 
    ...rows
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
