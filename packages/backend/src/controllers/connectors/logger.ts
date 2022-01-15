import { ConnectorLogType } from '.';
import { loggerFile } from '../../configuration/logger';
import { ConnectorLogItem } from './schemas/connectorLogItem.schema';

class ConnectorLogger {

  /**
   * Creates object with message and connector attribute for ConnectorLogItem
   *
   * @param message message that needs to be stored
   * @param objectId objectId of the connector
   * @returns object
   */
  private createContent(message: string, objectId: string): { [key: string]: string } {
    return {
      connector: objectId,
      message,
    };
  }

  /**
   * Prints and stores an info message
   *
   * @param message message that needs to be stored
   * @param objectId objectId of the connector
   * @param skipSave default: true - skips adding the message to ConnectorLogs
   * @returns void
   */
  public info(message: string, objectId: string, skipSave = false): void {
    loggerFile.info(message);

    if (skipSave) return;

    const content = this.createContent(message, objectId);
    new ConnectorLogItem({ ...content, type: ConnectorLogType.Info }).save();
  }

  /**
   * Prints and stores a warning message
   *
   * @param message message that needs to be stored
   * @param objectId objectId of the connector
   * @param skipSave default: true - skips adding the message to ConnectorLogs
   * @returns void
   */
  public warn(message: string, objectId: string, skipSave = false): void {
    loggerFile.warn(message);

    if (skipSave) return;

    const content = this.createContent(message, objectId);
    new ConnectorLogItem({ ...content, type: ConnectorLogType.Warning }).save();
  }

  /**
   * Prints and stores an error message
   *
   * @param message message that needs to be stored
   * @param objectId objectId of the connector
   * @param skipSave default: true - skips adding the message to ConnectorLogs
   * @returns void
   */
  public error(message: string, objectId: string, skipSave = false): void {
    loggerFile.error(message);

    if (skipSave) return;

    const content = this.createContent(message, objectId);
    new ConnectorLogItem({ ...content, type: ConnectorLogType.Error }).save();
  }
}

// This step is not required, because all functions are static
// But the usage should be similar to the loggerFile object
export const connectorLogger = new ConnectorLogger();
