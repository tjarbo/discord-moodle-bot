import { AssignmentMessage } from './assignmentMessage.class';
import { AssignmentReminderMessage } from './assignmentReminderMessage.class';
import { ResourceMessage } from './resourceMessage.class';

export { AssignmentMessage, AssignmentMessageOptions } from './assignmentMessage.class';
export { AssignmentReminderMessage, AssignmentReminderMessageOptions } from './assignmentReminderMessage.class';
export { ResourceMessage, ResourceMessageOptions } from './resourceMessage.class';

export type Message = AssignmentMessage | AssignmentReminderMessage | ResourceMessage;
