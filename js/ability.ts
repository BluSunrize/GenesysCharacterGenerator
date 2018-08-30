'use strict';

export class Ability {
    name: string;
    description: string;
    affect_stats: Function;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }
}

module.exports = {Ability};