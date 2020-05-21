import { Contentfile } from './contentfile.class';

export class Ressource {
    id: number;
    coursemodule: number;
    course: number;
    name: string;
    intro: string;
    introformat: number;
    introfiles: any[];
    contentfiles: Contentfile[];
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

    constructor(response: any) {
        this.id              = response.id;
        this.coursemodule    = response.coursemodule;
        this.course          = response.course;
        this.name            = response.name;
        this.intro           = response.intro;
        this.introformat     = response.introformat;
        this.introfiles      = response.introfiles;
        this.contentfiles    = response.contentfiles;
        this.tobemigrated    = response.tobemigrated;
        this.legacyfiles     = response.legacyfiles;
        this.legacyfileslast = response.legacyfileslast;
        this.display         = response.display;
        this.displayoptions  = response.displayoptions;
        this.filterfiles     = response.filterfiles;
        this.revision        = response.revision;
        this.timemodified    = response.timemodified;
        this.section         = response.section;
        this.visible         = response.visible;
        this.groupmode       = response.groupmode;
        this.groupingig      = response.groupingig;
    }
  }
