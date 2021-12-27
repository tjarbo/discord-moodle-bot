import { AssignmentReminderMessage } from '../../src/controllers/messages/templates';

jest.mock('../../src/configuration/environment.ts');

describe('assignmentReminderMessage.class.ts', () => {
  let assignmentMessage: AssignmentReminderMessage;

  beforeAll(() => {
    assignmentMessage = new AssignmentReminderMessage('TEST_COURSE', 'Title');
  });

  it('should match Markdown', () => {
    expect(assignmentMessage.Markdown).toMatchSnapshot();
  });
});
