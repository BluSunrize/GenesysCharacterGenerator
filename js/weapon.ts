'use strict';

export class Weapon {
    name: string;
    skill: string;
    damage: number;
    crit: number;
    range: string;
    special: string;

    constructor(name: string, skill: string, damage: number, crit: number, range: string, special: string) {
        this.name = name;
        this.skill = skill;
        this.damage = damage;
        this.crit = crit;
        this.range = range;
        this.special = special;
    }
}

module.exports = {Weapon};