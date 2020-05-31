import { IConfig } from './config.interface';

export interface IAssignment {
    id: number;
    cmid: number;
    course: number;
    name: string;
    nosubmissions: number;
    submissiondrafts: number;
    sendnotifications: number;
    sendlatenotifications: number;
    sendstudentnotifications: number;
    duedate: number;
    allowsubmissionsfromdate: number;
    grade: number;
    timemodified: number;
    completionsubmit: number;
    cutoffdate: number;
    gradingduedate: number;
    teamsubmission: number;
    requireallteammemberssubmit: number;
    teamsubmissiongroupingid: number;
    blindmarking: number;
    revealidentities: number;
    attemptreopenmethod: string;
    maxattempts: number;
    markingworkflow: number;
    markingallocation: number;
    requiresubmissionstatement: number;
    preventsubmissionnotingroup: number;
    configs: IConfig[];
    intro: string;
    introformat: number;
    introfiles: string[];
    introattachments: string[];
  }
