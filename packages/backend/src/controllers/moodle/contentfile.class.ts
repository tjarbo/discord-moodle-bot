export class Contentfile {
    filename: string;
    filepath: string;
    filesize: number;
    fileurl: string;
    timemodified: number;
    mimetype: string;
    isexternalfile: boolean;

    constructor(response: any) {
        this.filename       = response.filename;
        this.filepath       = response.filepath;
        this.filesize       = response.filesize;
        this.fileurl        = response.fileurl;
        this.timemodified   = response.timemodified;
        this.mimetype       = response.mimetype;
        this.isexternalfile = response.isexternalfile;
    }
  }
