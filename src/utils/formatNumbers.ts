/**
 * Форматирует число, добавляя пробелы каждые 3 цифры с конца
 * @param num - число для форматирования
 * @returns отформатированная строка
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Форматирует число с проверкой на null/undefined
 * @param num - число для форматирования
 * @returns отформатированная строка или '0'
 */
export const formatNumberSafe = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return '0';
  return formatNumber(num);
}; 