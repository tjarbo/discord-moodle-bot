/**
 * Defines the interface for FMDBMessageTemplate classes
 *
 * The apply function applies the diffrent values of the value paramter
 * to the template and returns the adjusted message
 *
 * @export
 * @interface FMDBMessage
 */
export interface FMDBMessageTemplate {
  readonly template: string;
  apply(options: object): string;
}