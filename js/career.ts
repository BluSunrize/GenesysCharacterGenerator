'use strict';

export class Career {
    name: string;
    description: string;
    skills: string[][];

    constructor(name: string, description: string, skills: string[][]) {
        this.name = name;
        this.description = description;
        this.skills = skills;
    }
}

module.exports = {Career};