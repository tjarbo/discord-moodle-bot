import { loggerFile } from '../../src/configuration/logger';
import { connectorLogger } from '../../src/controllers/connectors/logger';
import { ConnectorLogItem } from '../../src/controllers/connectors/schemas/connectorLogItem.schema';

jest.mock('../../src/configuration/environment.ts');
jest.mock('../../src/controllers/connectors/schemas/connectorLogItem.schema');

describe('connectors/logger.ts info()', () => {
  let spyLogger: jest.SpyInstance;
  const message = 'Test';

  beforeEach(() => {
    spyLogger = jest.spyOn(loggerFile, 'info');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save the message to logs', () => {
    connectorLogger.info(message, '123');
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).toHaveBeenCalled();
  });

  it('should skip saving the message to logs', () => {
    connectorLogger.info(message, '123', true);
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).not.toHaveBeenCalled();
  });
});

describe('connectors/logger.ts warn()', () => {
  let spyLogger: jest.SpyInstance;
  const message = 'Test';

  beforeEach(() => {
    spyLogger = jest.spyOn(loggerFile,'warn');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save the message to logs', () => {
    connectorLogger.warn(message, '123');
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).toHaveBeenCalled();
  });

  it('should skip saving the message to logs', () => {
    connectorLogger.warn(message, '123', true);
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).not.toHaveBeenCalled();
  });
});

describe('connectors/logger.ts error()', () => {
  let spyLogger: jest.SpyInstance;
  const message = 'Test';

  beforeEach(() => {
    spyLogger = jest.spyOn(loggerFile,'error');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save the message to logs', () => {
    connectorLogger.error(message, '123');
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).toHaveBeenCalled();
  });

  it('should skip saving the message to logs', () => {
    connectorLogger.error(message, '123', true);
    expect(spyLogger).toHaveBeenCalledWith(message);
    expect(ConnectorLogItem).not.toHaveBeenCalled();
  });
});
