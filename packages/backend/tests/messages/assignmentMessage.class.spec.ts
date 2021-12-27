import { AssignmentMessage } from '../../src/controllers/messages/templates';

jest.mock('../../src/configuration/environment.ts');

describe('assignmentMessage.class.ts', () => {
  let assignmentMessage: AssignmentMessage;

  beforeAll(() => {
    assignmentMessage = new AssignmentMessage('TEST_COURSE', 'Title', new Date(1640607181113).toDateString());
  });

  it('should match Markdown', () => {
    expect(assignmentMessage.Markdown).toMatchSnapshot();
  });
});
