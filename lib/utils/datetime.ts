interface DateTimeOptions {
    includeSeconds?: boolean;
    includeTimezone?: boolean;
    format?: 'local' | 'utc' | 'input' | 'display';
}

export class DateTime {
    private static readonly DEFAULT_OPTIONS: DateTimeOptions = {
        includeSeconds: false,
        includeTimezone: true,
        format: 'display'
    };

    /**
     * Converts a UTC date to local timezone for input fields
     * Only use this in client components
     */
    static utcToLocalInput(utcDate: Date | string): string {
        const date = new Date(utcDate);
        if (!this.isValid(date)) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    /**
     * Converts a local date input to UTC
     * Use this when sending data to the server
     */
    static localInputToUTC(localDateString: string): Date {
        if (!localDateString) return new Date();

        const date = new Date(localDateString);
        if (!this.isValid(date)) return new Date();

        // Create UTC date by adjusting for timezone offset
        const utcDate = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes()
        );

        return utcDate;
    }

    /**
     * Gets the current UTC time
     */
    static getCurrentUTCTime(): Date {
        return new Date();
    }

    /**
     * Formats a date for display in the user's local timezone
     * Only use this in client components
     */
    static formatDisplay(date: Date | string, options: Partial<DateTimeOptions> = {}): string {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        const dateObj = new Date(date);

        if (!this.isValid(dateObj)) {
            console.error('Invalid date provided to formatDisplay:', date);
            return 'Invalid date';
        }

        try {
            const formatOptions: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: opts.format === 'utc' ? 'UTC' : undefined,
                timeZoneName: opts.includeTimezone ? 'shortOffset' : undefined,
            };

            if (opts.includeSeconds) {
                formatOptions.second = '2-digit';
            }

            return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }

    /**
     * Format a date range in a consistent way
     */
    static formatDateRange(startDate: Date, endDate: Date): string {
        const sameDay = startDate.toDateString() === endDate.toDateString();
        
        const formatOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        if (sameDay) {
            const date = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric'
            }).format(startDate);

            const startTime = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(startDate);

            const endTime = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZoneName: 'shortOffset'
            }).format(endDate);

            return `${date}, ${startTime} - ${endTime}`;
        }

        return `${new Intl.DateTimeFormat('en-US', formatOptions).format(startDate)} - ${new Intl.DateTimeFormat('en-US', {
            ...formatOptions,
            timeZoneName: 'shortOffset'
        }).format(endDate)}`;
    }

    static getUserTimezone(): string {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return 'UTC';
        }
    }

    static formatTimezoneOffset(): string {
        const offset = -new Date().getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
        return `UTC${sign}${hours}:${minutes}`;
    }

    static isValid(date: Date | string): boolean {
        const dateObj = date instanceof Date ? date : new Date(date);
        return !isNaN(dateObj.getTime());
    }
}