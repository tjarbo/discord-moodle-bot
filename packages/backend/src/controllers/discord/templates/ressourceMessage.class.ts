import { MessageTemplate } from '../message.class';

export interface RessourceMessageOptions {
  course: string;
  title: string;
  link: string;
}

export class RessourceMessage extends MessageTemplate {
  readonly template: `**{course} - Neue Datei**:
  :file_folder: {title}
  :link: {link}`;
}