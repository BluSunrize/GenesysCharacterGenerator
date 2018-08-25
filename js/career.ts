'use strict';

export class Career {
    name: string;
    skills: string[][];

    constructor(name: string, skills: string[][]) {
        this.name = name;
        this.skills = skills;
    }
}

module.exports = Career;