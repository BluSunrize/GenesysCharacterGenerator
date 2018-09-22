'use strict';

import {Dataset} from "./dataset";

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

export function createCustomCareer(dataset: Dataset)
{
    let skillChoice = [];
    for(let skill of dataset.skills)
        skillChoice.push(skill.name);
    return new Career("Custom",
        "This is a custom career. Please choose 8 unique skills that define it.",
        [skillChoice, skillChoice, skillChoice, skillChoice, skillChoice, skillChoice, skillChoice, skillChoice]);
}

module.exports = {Career, createCustomCareer};