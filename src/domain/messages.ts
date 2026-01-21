export enum MessageType {
    LOOKUP = 'LOOKUP',
    TTS = 'TTS',
}

export interface ExtensionMessage {
    type: MessageType;
    payload?: any;
}
