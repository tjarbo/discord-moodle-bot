import { Message } from '../message.class';

export class AssignmentMessage extends Message {

  protected markdownTemplate = {
    "EN": `**{{course}} - New submission added!**
    :information_source: "{{title}}" is to be submitted
    :alarm_clock: until \`{{dueDate}}\``,

    "DE": `**{{course}} - Neue Abgabe hinzugefügt!**
    :information_source: "{{title}}" ist abzugeben
    :alarm_clock: bis \`{{dueDate}}\``
  }

  protected context: any;

  constructor(course: string, title: string, dueDate: string) {
    super();
    this.context = { course, title, dueDate };
  }
}
