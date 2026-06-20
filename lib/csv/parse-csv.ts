function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseCsv(text: string): string[][] {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseCsvLine);
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_-]+/g, "");
}

export function mapCsvRows(
  rows: string[][],
  aliases: Record<string, string[]>
): Record<string, string>[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const fieldIndexes: Record<string, number> = {};

  for (const [field, names] of Object.entries(aliases)) {
    const index = headers.findIndex((h) => names.includes(h));
    if (index >= 0) fieldIndexes[field] = index;
  }

  return rows.slice(1).map((row) => {
    const mapped: Record<string, string> = {};
    for (const [field, index] of Object.entries(fieldIndexes)) {
      mapped[field] = row[index] ?? "";
    }
    return mapped;
  });
}

export const TOOL_CSV_ALIASES = {
  name: ["name", "toolname", "tool"],
  assetTag: ["assettag", "asset", "tag", "id"],
  category: ["category", "type"],
  barcode: ["barcode", "barcodeid"],
  conditionNotes: ["conditionnotes", "notes", "condition"],
};

export const TECHNICIAN_CSV_ALIASES = {
  name: ["name", "technician", "fullname"],
  employeeCode: ["employeecode", "employeeid", "id", "code"],
};
