
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseNumberBR = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  
  // Clean string: remove spaces and currency symbols
  let str = String(val).trim().replace(/[R$€£\s]/g, '');
  
  if (!str) return 0;

  // Handle standard BR format: 1.234,56
  // Or US format with comma: 1,234.56
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    if (str.indexOf('.') < str.indexOf(',')) {
      // BR Format: 1.234,56 -> remove dots, replace comma with dot
      return parseFloat(str.replace(/\./g, '').replace(',', '.'));
    } else {
      // US style with comma: 1,234.56 -> remove commas
      return parseFloat(str.replace(/,/g, ''));
    }
  } else if (hasComma) {
    // Only comma: 1234,56 -> replace with dot
    return parseFloat(str.replace(',', '.'));
  } else if (hasDot) {
    // Only dot: could be 1.234 (BR thousand) or 1234.56 (US decimal)
    // If it looks like a whole number group ending in .00, likely decimal.
    // If it's a large number with dots in thousand positions (e.g. 1.234.567), it's BR.
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots: 1.234.567 -> remove dots
      return parseFloat(str.replace(/\./g, ''));
    }
    
    // Single dot. Heuristic: if it's 3 digits from the end and no decimals follow...
    // But many people write 1.234 for one thousand two hundred.
    // Let's assume dot is decimal unless there are multiple dots.
    return parseFloat(str);
  }
  
  return parseFloat(str) || 0;
};
