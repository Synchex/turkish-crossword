/**
 * Utility functions for date comparison in gamification system.
 * Ensures consistent checking regardless of time of day.
 */

export const getCurrentDateISO = (): string => {
    return new Date().toISOString().split('T')[0];
};

export const getYesterdayISO = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
};

/**
 * Returns number of days between two ISO date strings (YYYY-MM-DD).
 * Positive if d2 is after d1.
 */
export const getDaysDifference = (d1: string, d2: string): number => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return date2 > date1 ? diffDays : -diffDays;
};

export const isSameDay = (d1: string, d2: string): boolean => {
    return d1 === d2;
};

export const isYesterday = (today: string, target: string): boolean => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return target === yesterday.toISOString().split('T')[0];
};
