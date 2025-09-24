/**
 * validate dates and time to avoid overlapping
 * @param startDate input in string
 * @param endDate input in string
 * @returns object with isValid boolean and errors array
 */
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validateEventDates(date: string, endDate?: string | null): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: [] };

  const parseDateTime = (datetime: string): Date => {
    const [datePart, timePart] = datetime.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hour, min] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new Date(y, m - 1, d, hour, min);
  };

  const formatStartDate = formatDateTime(new Date(date), 'YYYY-MM-DD HH:mm');
  const startDateObj = parseDateTime(formatStartDate);
  const now = new Date();

  if (startDateObj < now) {
    result.isValid = false;
    result.errors.push('Start date and time cannot be in the past.');
  }

  if (endDate && endDate !== null) {
    const formatEndDate = formatDateTime(new Date(endDate), 'YYYY-MM-DD HH:mm');
    const endDateObj = parseDateTime(formatEndDate);

    if (endDateObj < startDateObj) {
      result.isValid = false;
      result.errors.push('End time cannot be before start time.');
    }
  }

  return result;
}
/**
 * Format a date according to the specified format
 * @param date The date to format
 * @param format The format string ('YYYY-MM-DD', 'MM/DD/YYYY', etc.)
 * @returns Formatted date string
 */
export const formatDateTime = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const weekday = weekdays[date.getDay()];

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('DDD', weekday);
};
