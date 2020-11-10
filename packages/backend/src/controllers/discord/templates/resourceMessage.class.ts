import { MessageTemplate } from '../message.class';

export interface ResourceMessageOptions {
  course: string;
  title: string;
  link: string;
}

export class ResourceMessage extends MessageTemplate {
  readonly template = `**{course} - Neue Datei**:
  :file_folder: {title}
  :link: {link}`;
}
