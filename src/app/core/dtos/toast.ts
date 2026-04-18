export interface Toast {
    id: string;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}
