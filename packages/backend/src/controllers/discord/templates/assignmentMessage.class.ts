import { MessageTemplate } from '../message.class';

export interface AssignmentMessageOptions {
  course: string;
  title: string;
  dueDate: string;
}

export class AssignmentMessage extends MessageTemplate {
  readonly template: `**{course} - Neue Abgabe hinzugefügt!**
  :information_source: "{title}" ist abzugeben
  :alarm_clock: bis \`{dueDate}\``;
}