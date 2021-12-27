import { Message } from '../message.class';

export class ResourceMessage extends Message {

  protected markdownTemplate = {
    'EN': `**{{course}} - New File**:
    :file_folder: {{title}}
    :link: {{link}}`,

    'DE': `**{{course}} - Neue Datei**:
    :file_folder: {{title}}
    :link: {{link}}`
  };

  protected context: any;

  constructor(course: string, title: string, link: string) {
    super();
    this.context = { course, title, link };
  }
}
