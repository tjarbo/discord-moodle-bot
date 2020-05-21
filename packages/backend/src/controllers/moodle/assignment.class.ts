import { Config } from './config.class';

export class Assignment {
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
    configs: Config[];
    intro: string;
    introformat: number;
    introfiles: string[];
    introattachments: string[];

    constructor(response: any) {
        this.id                           = response.id;
        this.cmid                         = response.cmid;
        this.course                       = response.course;
        this.name                         = response.name;
        this.nosubmissions                = response.nosubmissions;
        this.submissiondrafts             = response.submissiondrafts;
        this.sendnotifications            = response.sendnotifications;
        this.sendlatenotifications        = response.sendlatenotifications;
        this.sendstudentnotifications     = response.plsendstudentnotificationsugin;
        this.allowsubmissionsfromdate     = response.allowsubmissionsfromdate;
        this.grade                        = response.grade;
        this.timemodified                 = response.timemodified;
        this.completionsubmit             = response.completionsubmit;
        this.cutoffdate                   = response.cutoffdate;
        this.gradingduedate               = response.gradingduedate;
        this.teamsubmission               = response.teamsubmission;
        this.requireallteammemberssubmit  = response.requireallteammemberssubmit;
        this.teamsubmissiongroupingid     = response.teamsubmissiongroupingid;
        this.blindmarking                 = response.blindmarking;
        this.revealidentities             = response.revealidentities;
        this.attemptreopenmethod          = response.attemptreopenmethod;
        this.maxattempts                  = response.maxattempts;
        this.markingworkflow              = response.markingworkflow;
        this.markingallocation            = response.markingallocation;
        this.requiresubmissionstatement   = response.requiresubmissionstatement;
        this.preventsubmissionnotingroup  = response.preventsubmissionnotingroup;
        this.configs                      = response.configs;
        this.intro                        = response.intro;
        this.introformat                  = response.introformat;
        this.introfiles                   = response.introfiles;
        this.introattachments             = response.introattachments;
    }

  }
