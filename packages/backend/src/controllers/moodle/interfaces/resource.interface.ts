import { IContentfile } from './contentfile.interface';

export interface IResource {
  id: number;
  coursemodule: number;
  course: number;
  name: string;
  intro: string;
  introformat: number;
  introfiles: any[];
  contentfiles: IContentfile[];
  tobemigrated: number;
  legacyfiles: number;
  legacyfileslast: any;
  display: number;
  displayoptions: string;
  filterfiles: number;
  revision: number;
  timemodified: number;
  section: number;
  visible: number;
  groupmode: number;
  groupingig: number;
}
