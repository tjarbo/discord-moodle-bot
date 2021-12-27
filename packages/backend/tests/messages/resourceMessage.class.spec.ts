import { ResourceMessage } from '../../src/controllers/messages/templates';

jest.mock('../../src/configuration/environment.ts');

describe('resourceMessage.class.ts', () => {
  let assignmentMessage: ResourceMessage;

  beforeAll(() => {
    assignmentMessage = new ResourceMessage('TEST_COURSE', 'Title', 'https://test.link');
  });

  it('should match Markdown', () => {
    expect(assignmentMessage.Markdown).toMatchSnapshot();
  });
});
