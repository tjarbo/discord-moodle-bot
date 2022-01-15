export interface ICourseDetails {
  id: number;
  shortname: string;
  fullname: string;
  enrolledusercount: number;
  idnumber: string;
  visible: number;
  summary: string;
  summaryformat: number;
  format: string;
  showgrades: boolean;
  lang: string;
  enablecompletion: boolean;
  category: number;
  progress: any;
  startdate: number;
  enddate: number;
}
