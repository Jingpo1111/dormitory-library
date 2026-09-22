import Papa from 'papaparse';

/**
 * Normalizes Google Sheets URL into direct CSV export link
 */
/**
 * Normalizes Google Sheets URL or Apps Script Web App URL into fetchable endpoint
 */
export const formatGoogleSheetUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();

  // If Google Apps Script Web App URL
  if (trimmed.includes('script.google.com')) {
    return trimmed;
  }

  if (trimmed.includes('output=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  const matches = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (matches && matches[1]) {
    const sheetId = matches[1];
    const gidMatch = trimmed.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  }

  return trimmed;
};

/**
 * Maps raw Google Sheet row to Thesis object with schema:
 * - Department
 * - Title Thesis
 * - Link PDF
 */
export const mapRowToThesis = (row, index) => {
  const keys = Object.keys(row);

  const findValue = (possibleNames, colIdx, defaultValue = '') => {
    // 1. Try matching by header name fuzzy search
    for (const key of keys) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const target of possibleNames) {
        if (normalizedKey.includes(target)) {
          if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
            return String(row[key]).trim();
          }
        }
      }
    }

    // 2. Fallback to column index position (0 = Department, 1 = Title Thesis, 2 = Link PDF)
    if (keys[colIdx] !== undefined && row[keys[colIdx]] !== undefined && row[keys[colIdx]] !== null) {
      const indexVal = String(row[keys[colIdx]]).trim();
      if (indexVal !== '') return indexVal;
    }

    return defaultValue;
  };

  const department = findValue(['department', 'dept', 'faculty', 'major', 'branch'], 0, 'General');
  const titleThesis = findValue(['titlethesis', 'title', 'thesis', 'name', 'topic', 'subject', 'paper'], 1, `Thesis Title ${index + 1}`);
  let linkPdf = findValue(['linkpdf', 'pdf', 'link', 'url', 'file', 'drive'], 2, '');

  // Normalize URL prefix if user pasted link starting with www. or drive.google.com
  if (linkPdf && !linkPdf.startsWith('http://') && !linkPdf.startsWith('https://')) {
    linkPdf = `https://${linkPdf}`;
  }

  return {
    id: `thesis-${Date.now()}-${index}`,
    department,
    titleThesis,
    linkPdf,
    addedDate: new Date().toISOString().split('T')[0]
  };
};

/**
 * Fetches published Google Sheet CSV or Google Apps Script JSON and returns thesis array
 */
export const fetchGoogleSheetData = async (rawUrl) => {
  const csvUrl = formatGoogleSheetUrl(rawUrl);
  if (!csvUrl) {
    throw new Error('Invalid Google Sheet URL provided.');
  }

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch data (Status: ${response.status}). Make sure the sheet/script is set to "Anyone" access.`);
  }

  // Handle Google Apps Script JSON Endpoint
  if (csvUrl.includes('script.google.com')) {
    try {
      const jsonData = await response.json();
      const rows = Array.isArray(jsonData) ? jsonData : (jsonData.data || jsonData.rows || []);

      if (!rows || rows.length === 0) {
        throw new Error('Google Apps Script returned empty data.');
      }

      const theses = rows.map((row, idx) => mapRowToThesis(row, idx));
      return { theses, rawCount: rows.length };
    } catch (jsonErr) {
      // If HTML sign-in page returned instead of JSON
      throw new Error('Google Apps Script requires authentication. In Apps Script, click Deploy > Manage deployments, set "Who has access" to "Anyone", and re-deploy.');
    }
  }

  // Handle standard CSV text
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('The Google Sheet table is empty or missing headers.'));
          return;
        }

        const theses = results.data.map((row, idx) => mapRowToThesis(row, idx));
        resolve({ theses, rawCount: results.data.length });
      },
      error: (err) => {
        reject(new Error(`CSV Parsing error: ${err.message}`));
      }
    });
  });
};

/**
 * Parses uploaded local CSV file
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('Uploaded CSV is empty.'));
          return;
        }

        const theses = results.data.map((row, idx) => mapRowToThesis(row, idx));
        resolve({ theses, count: theses.length });
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * Exports current thesis table to CSV with exact headers: Department, Title Thesis, Link PDF
 */
export const exportToCSV = (theses) => {
  const exportData = theses.map(thesis => ({
    'Department': thesis.department,
    'Title Thesis': thesis.titleThesis,
    'Link PDF': thesis.linkPdf
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Dormitory_Library_Thesis_Table_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// -------------------------------------------------------------------
// POST helper to send a single thesis row to the Apps Script endpoint
// -------------------------------------------------------------------
export const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxYGhfrU3UkxJlZ4gIf1ofkymtruSCih7t7Oad8MnBfYNuZAJF2StCFBt0wZgLPmiZI/exec';

/**
 * Sends a thesis to the Apps Script endpoint via GET query params.
 * Google Apps Script redirects (302) on requests, which causes POST bodies
 * to be dropped. Using GET with URL params avoids this entirely.
 * @param {string} rawUrl - optional Apps Script URL; defaults to SHEET_WEBAPP_URL.
 * @param {object} thesis - { department, titleThesis, linkPdf }
 */
export const postThesis = async (rawUrl = SHEET_WEBAPP_URL, thesis) => {
  const endpoint = formatGoogleSheetUrl(rawUrl);
  if (!endpoint) throw new Error('Invalid Apps Script URL');

  const params = new URLSearchParams({
    action: 'addThesis',
    department: thesis.department || '',
    titleThesis: thesis.titleThesis || '',
    linkPdf: thesis.linkPdf || '',
  });

  await fetch(`${endpoint}?${params.toString()}`, { mode: 'no-cors' });
};
