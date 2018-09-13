'use strict';

export const TalentActivation: string[] = ["Passive","Action","Maneuver","Incidental","Incidental OoT"];

export class Talent {
    name: string;
    tier: number;
    description: string;
    activation: string;

    constructor(name: string, tier: number, description: string, activation: string) {
        this.name = name;
        this.tier = tier;
        this.description = description;
        this.activation = activation;
    }
}

module.exports = {Talent, TalentActivation};