import { AssignmentMessage } from './assignmentMessage.class';
import { AssignmentReminderMessage } from './assignmentReminderMessage.class';
import { ResourceMessage } from './resourceMessage.class';

export * from './assignmentMessage.class';
export * from './assignmentReminderMessage.class';
export * from './resourceMessage.class';

export type Message = AssignmentMessage | AssignmentReminderMessage | ResourceMessage;
