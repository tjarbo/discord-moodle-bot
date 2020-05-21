export class Config {
    plugin: string;
    subtype: string;
    name: string;
    value: string;

    constructor(response: any) {
        this.plugin  = response.plugin;
        this.subtype = response.subtype;
        this.name    = response.name;
        this.value   = response.value;
    }
}
