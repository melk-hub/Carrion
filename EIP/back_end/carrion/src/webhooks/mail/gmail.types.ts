export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePartBody {
  size: number;
  data?: string;
  attachmentId?: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: GmailMessagePart;
}
