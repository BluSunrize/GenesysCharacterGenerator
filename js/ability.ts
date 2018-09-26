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
    INCREASE_DEFENSE = "INCREASE_DEFENSE",
    INCREASE_SOAK = "INCREASE_SOAK",
    FREE_TALENT = "FREE_TALENT",
    GAIN_CAREER_SKILL = "GAIN_CAREER_SKILL",
    GAIN_NATURAL_WEAPON = "GAIN_NATURAL_WEAPON"
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
    let option = document.createElement("option");
    option.innerText = "No Effect";
    dropdown.appendChild(option);
    for (let type in AbilityEffectType) {
        option = document.createElement("option");
        option.value = type;
        option.innerText = makeReadable(type);
        dropdown.appendChild(option);
    }

    let params = document.createElement("textarea");
    params.classList.add("toggleEdit");
    params.placeholder = "Effect parameters, separated by semicolon";
    params.cols = 17;
    params.style.display = "none";
    cell.appendChild(params);
    dropdown.onchange = () =>
        params.style.display = dropdown.selectedIndex < 1 ? "none" : "initial";

    cell = row.insertCell();
    let desc = document.createElement("textarea");
    desc.classList.add("toggleEdit");
    desc.rows = 3;
    desc.style.resize = "vertical";
    cell.appendChild(desc);

    if (ability) {
        remove.disabled = name.disabled = dropdown.disabled = params.disabled = desc.disabled = true;
        name.value = ability.name;
        desc.value = ability.description;
        if (ability.effect) {
            dropdown.value = ability.effect.type;
            if (ability.effect.params)
                params.value = ability.effect.params.join(";");
        }
        params.style.display = dropdown.selectedIndex < 1 ? "none" : "initial";
    }
    return row;
}

export function parseAbilityConfiguration(row: HTMLTableRowElement) {
    let name = (<HTMLInputElement>row.cells[1].firstChild).value;
    let desc = (<HTMLTextAreaElement>row.cells[2].firstChild).value;
    let dropdown = <HTMLSelectElement>row.cells[1].children[1];
    let params = <HTMLInputElement>row.cells[1].children[2];

    if (dropdown.selectedIndex>0) {
        if (!params.value)
            return new Ability(name, desc, new AbilityEffect(AbilityEffectType[dropdown.value]));
        else {
            let paramsArray = [];
            params.value.split(";").forEach(val => paramsArray.push(val));
            return new Ability(name, desc, new AbilityEffect(AbilityEffectType[dropdown.value], paramsArray));
        }
    }
    else
        return new Ability(name, desc)
}

module.exports = {Ability, AbilityEffect, AbilityEffectType, buildAbilityConfiguration, parseAbilityConfiguration};