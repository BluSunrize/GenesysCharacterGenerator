'use strict';

export class Talent {
    name: string;
    tier: number;
    description: string;
    active: boolean;

    constructor(name: string, tier: number, description: string, active: boolean) {
        this.name = name;
        this.tier = tier;
        this.description = description;
        this.active = active;
    }
}

module.exports = {Talent};