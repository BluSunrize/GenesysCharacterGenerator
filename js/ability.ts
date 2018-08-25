'use strict';

export class Ability {
    name: string;
    description: string;
    affect_stats: Function;

    constructor(name: string, description: string, affect_stats: Function) {
        this.name = name;
        this.description = description;
        this.affect_stats = affect_stats;
    }
}
module.exports = Ability;