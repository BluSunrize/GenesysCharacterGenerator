'use strict';

export class Ability {
    name: string;
    description: string;
    effect: AbilityEffect;

    constructor(name: string, description: string, effect?: AbilityEffect) {
        this.name = name;
        this.description = description;
        this.effect = effect;
    }
}

export enum AbilityEffectType {
    TEXT = "TEXT",
    INCREASE_DEFENSE = "INCREASE_DEFENSE",
    INCREASE_SOAK = "INCREASE_DEFENSE",
    GAIN_CAREER_SKILL = "INCREASE_DEFENSE"
}

export class AbilityEffect {
    type: AbilityEffectType;
    params: any[];

    constructor(type: AbilityEffectType, params?: any[]) {
        this.type = type;
        this.params = params;
    }
}

const makeReadable = str => {
    return str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
};

export function buildAbilityConfiguration(ability: Ability) {
    let row = document.createElement("tr");
    row.classList.add("abilityrow");

    let cell = row.insertCell();
    let remove = document.createElement("button");
    remove.classList.add("toggleEdit");
    remove.innerText = "X";
    remove.onclick = () => {
        let highestChild = <HTMLElement>row;
        while (highestChild.parentElement.tagName !== "DIV" && highestChild.parentElement.tagName !== "TBODY")
            highestChild = highestChild.parentElement;
        highestChild.parentElement.removeChild(highestChild);
    };
    cell.appendChild(remove);

    cell = row.insertCell();
    let name = document.createElement("input");
    name.classList.add("toggleEdit");
    cell.appendChild(name);

    let dropdown = document.createElement("select");
    dropdown.classList.add("toggleEdit");
    cell.appendChild(dropdown);
    dropdown.appendChild(document.createElement("option"));
    for (let type in AbilityEffectType) {
        let option = document.createElement("option");
        option.value = type;
        option.innerText = makeReadable(type);
        dropdown.appendChild(option);
    }

    cell = row.insertCell();
    let desc = document.createElement("textarea");
    desc.classList.add("toggleEdit");
    cell.appendChild(desc);

    if (ability) {
        remove.disabled = name.disabled = dropdown.disabled = desc.disabled = true;
        name.value = ability.name;
        desc.value = ability.description;
        if (ability.effect)
            dropdown.value = ability.effect.type;
    }

    return row;
}

module.exports = {Ability, AbilityEffect, AbilityEffectType, buildAbilityConfiguration};