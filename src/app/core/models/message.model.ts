/* Defines the allowed message types */
export type MessageType = 'info' | 'success' | 'warning' | 'error' | 'question';

/* Defines the structure of the message payload */
export interface MessageData {
    type: MessageType;
    title: string;
    text: string;
    // Optional callback function to resolve the Promise when asking a question
    resolve?: (value: boolean) => void;
}

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastData {
    id: number;
    type: ToastType;
    text: string;
}