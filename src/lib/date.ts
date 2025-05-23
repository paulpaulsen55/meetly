import { format, isToday, isTomorrow, isThisWeek, parseISO, parse, addDays, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Format a date string into a human-readable format
 */
export function formatDate(dateStr: string): string {
    if (!dateStr) return dateStr;

    // Parse the date string (handles DD.MM.YYYY format)
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) return dateStr;

    // Display "Today" or "Tomorrow"
    if (isToday(parsedDate)) return "Today";
    if (isTomorrow(parsedDate)) return "Tomorrow";

    // If it's within this week, show the weekday name
    if (isThisWeek(parsedDate)) {
        return format(parsedDate, 'EEEE', { locale: de });
    }

    // For other dates, return a formatted date
    return format(parsedDate, 'd. MMM', { locale: de });
}

/**
 * Parse various date formats into a Date object with strict validation
 */
export function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Normalize input: trim and convert to lowercase
    const normalizedStr = dateStr.trim().toLowerCase();

    // Handle German and English natural language date references
    if (/^(heute|today|morgen|tomorrow|übermorgen)$/i.test(normalizedStr)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (normalizedStr === 'heute' || normalizedStr === 'today') {
            return today;
        } else if (normalizedStr === 'morgen' || normalizedStr === 'tomorrow') {
            return addDays(today, 1);
        } else if (normalizedStr === 'übermorgen') {
            return addDays(today, 2);
        }
    }

    // Handle phrase-based date references (in X days)
    const germanInDaysMatch = normalizedStr.match(/^in\s+(\d+|zwei|drei|vier|fünf|sechs|sieben)\s+tag(en|e)?$/i);
    if (germanInDaysMatch) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let days = 0;
        const dayText = germanInDaysMatch[1].toLowerCase();

        // Convert text numbers to numeric values
        if (dayText === 'zwei') days = 2;
        else if (dayText === 'drei') days = 3;
        else if (dayText === 'vier') days = 4;
        else if (dayText === 'fünf') days = 5;
        else if (dayText === 'sechs') days = 6;
        else if (dayText === 'sieben') days = 7;
        else days = parseInt(dayText, 10);

        if (days > 0) {
            return addDays(today, days);
        }
    }

    // Handle English "in X days" format
    const englishInDaysMatch = normalizedStr.match(/^in\s+(\d+|two|three|four|five|six|seven)\s+days?$/i);
    if (englishInDaysMatch) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let days = 0;
        const dayText = englishInDaysMatch[1].toLowerCase();

        // Convert text numbers to numeric values
        if (dayText === 'two') days = 2;
        else if (dayText === 'three') days = 3;
        else if (dayText === 'four') days = 4;
        else if (dayText === 'five') days = 5;
        else if (dayText === 'six') days = 6;
        else if (dayText === 'seven') days = 7;
        else days = parseInt(dayText, 10);

        if (days > 0) {
            return addDays(today, days);
        }
    }

    // Handle German weekday names
    const weekdayMap: Record<string, (date: Date) => Date> = {
        'montag': nextMonday,
        'dienstag': nextTuesday,
        'mittwoch': nextWednesday,
        'donnerstag': nextThursday,
        'freitag': nextFriday,
        'samstag': nextSaturday,
        'sonntag': nextSunday,
        // Add common abbreviations
        'mo': nextMonday,
        'di': nextTuesday,
        'mi': nextWednesday,
        'do': nextThursday,
        'fr': nextFriday,
        'sa': nextSaturday,
        'so': nextSunday,
        // English weekday names
        'monday': nextMonday,
        'tuesday': nextTuesday,
        'wednesday': nextWednesday,
        'thursday': nextThursday,
        'friday': nextFriday,
        'saturday': nextSaturday,
        'sunday': nextSunday,
    };

    for (const [weekday, nextFn] of Object.entries(weekdayMap)) {
        if (normalizedStr === weekday || normalizedStr.startsWith(weekday)) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return nextFn(today);
        }
    }

    // Handle German format with month name (e.g., "22. März")
    if (/^\d{1,2}\.\s+[A-Za-zäöüÄÖÜß]+$/i.test(dateStr)) {
        try {
            // Parse with date-fns using German locale
            const date = parse(dateStr, 'd. MMMM', new Date(), { locale: de });
            return isNaN(date.getTime()) ? null : date;
        } catch {
            return null;
        }
    }

    // Handle German format DD.MM.YYYY or DD.MM.
    if (/^\d{1,2}\.\d{1,2}\.(\d{4})?$/.test(dateStr)) {
        const parts = dateStr.split('.');
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-based

        // If year is omitted, use current year
        const year = parts[2] && parts[2].length ? parseInt(parts[2], 10) : new Date().getFullYear();

        // Create the date object
        const date = new Date(year, month, day);

        // Validate that the date is real (check if day and month match what we set)
        // This catches invalid dates like February 30th
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
        ) {
            return null; // Invalid date
        }

        return date;
    }

    // Try ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = parseISO(dateStr);
        if (isNaN(date.getTime())) return null;
        return date;
    }

    // Try standard parsing as fallback
    try {
        const date = parseISO(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

/**
 * Convert a date to ISO format string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}