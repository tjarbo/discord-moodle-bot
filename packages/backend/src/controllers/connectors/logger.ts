import { ConnectorLogType } from '.';
import { loggerFile } from '../../configuration/logger';
import { ConnectorLogItem } from './schemas/connectorLogItem.schema';

class ConnectorLogger {

  /**
   * Creates object with message and connector attribute for ConnectorLogItem.
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
   * Creates a new ConnectorLogItem and save it to the database.
   *
   * @private
   * @param {{ [key: string]: any, type: ConnectorLogType }} content
   * @return {Promise<void>} Return nothing
   * @memberof ConnectorLogger
   */
  private async log(content: { [key: string]: any, type: ConnectorLogType }): Promise<void> {
    try {
      await new ConnectorLogItem(content).save();
    } catch (reason) {
      loggerFile.error('Failed to save ConnectorLogItem!', reason);
    }
  }

  /**
   * Prints and stores an info message.
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
    void this.log({ ...content, type: ConnectorLogType.Info });
  }

  /**
   * Prints and stores a warning message.
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
    void this.log({ ...content, type: ConnectorLogType.Warning });
  }

  /**
   * Prints and stores an error message.
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
    void this.log({ ...content, type: ConnectorLogType.Error });
  }
}

// This step is not required, because all functions are static
// But the usage should be similar to the loggerFile object
export const connectorLogger = new ConnectorLogger();
