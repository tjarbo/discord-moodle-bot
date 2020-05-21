import { Assignment } from './assignment.class';

export class Course {
    id: number;
    fullname: string;
    shortname: string;
    timemodified: number;
    assignments: Assignment[];

    constructor(response: any) {
        this.id           = response.id;
        this.fullname     = response.fullname;
        this.shortname    = response.shortname;
        this.timemodified = response.timemodified;
        this.assignments  = response.assignments;
    }
}
