import {Characteristic, Skill, SkillCategory, SkillSelection, SkillSelectionPredicate} from "./skill";
import {Archetype} from "./archetype";
import {Career} from "./career";
import {Ability} from "./ability";
import {ElectronStore} from "electron-store";

export class Dataset {
    name: string;
    skills: Skill[] = [];
    archetypes: { [name: string]: Archetype; } = {};
    careers: { [name: string]: Career; } = {};

    constructor(name: string) {
        this.name = name;
    }
}

export function createDefaultDataset(): string {
    let defaultSet = new Dataset("Genesys CRB");

    //Skills
    defaultSet.skills.push(new Skill("Alchemy", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Astrocartography", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Athletics", Characteristic.BR, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Computers", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Cool", Characteristic.PR, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Coordination", Characteristic.AG, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Discipline", Characteristic.WILL, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Driving", Characteristic.AG, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Mechanics", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Medicine", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Operating", Characteristic.INT, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Perception", Characteristic.CUN, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Piloting", Characteristic.AG, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Resilience", Characteristic.BR, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Riding", Characteristic.AG, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Skulduggery", Characteristic.CUN, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Stealth", Characteristic.AG, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Streetwise", Characteristic.CUN, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Survival", Characteristic.CUN, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Vigilance", Characteristic.WILL, SkillCategory.GENERAL));
    defaultSet.skills.push(new Skill("Arcana", Characteristic.INT, SkillCategory.POWER));
    defaultSet.skills.push(new Skill("Divine", Characteristic.WILL, SkillCategory.POWER));
    defaultSet.skills.push(new Skill("Primal", Characteristic.CUN, SkillCategory.POWER));
    defaultSet.skills.push(new Skill("Charm", Characteristic.PR, SkillCategory.SOCIAL));
    defaultSet.skills.push(new Skill("Coercion", Characteristic.WILL, SkillCategory.SOCIAL));
    defaultSet.skills.push(new Skill("Deception", Characteristic.CUN, SkillCategory.SOCIAL));
    defaultSet.skills.push(new Skill("Leadership", Characteristic.PR, SkillCategory.SOCIAL));
    defaultSet.skills.push(new Skill("Negotiation", Characteristic.PR, SkillCategory.SOCIAL));
    defaultSet.skills.push(new Skill("Brawl", Characteristic.BR, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Melee", Characteristic.BR, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Melee-Light", Characteristic.BR, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Melee-Heavy", Characteristic.BR, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Ranged", Characteristic.AG, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Ranged-Light", Characteristic.AG, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Ranged-Heavy", Characteristic.AG, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Gunnery", Characteristic.AG, SkillCategory.COMBAT));
    defaultSet.skills.push(new Skill("Knowledge", Characteristic.INT, SkillCategory.KNOWLEDGE));

    //Archetypes
    defaultSet.archetypes["human"] = new Archetype("Average Human",
        "The average human archetype is our baseline for character creation, and portrays the most customizable example of a person. You should choose this archetype if you prefer to play “generalist” characters, who are never going to be terrible at anything.",
        [2, 2, 2, 2, 2, 2],
        10, 10, 110, 4,
        [new SkillSelection([], SkillSelectionPredicate.ANY_NON_CAREER), new SkillSelection([], SkillSelectionPredicate.ANY_NON_CAREER)],
        [new Ability("Ready for Anything", "Once per session as an out-ofturn incidental, a Human may move one Story Point from the Game Master's pool to the players' pool.")]);
    defaultSet.archetypes["laborer"] = new Archetype("The Laborer",
        "The laborer archetype represents a character who has a background in some form of manual labor, and who is generally strong and tough. You should choose this archetype if you're planning on making a character who focuses on fighting, especially fighting in melee combat. You should also choose this archetype if your character has a background of manual labor and hard work.",
        [3, 2, 2, 2, 1, 2], 12, 8, 100, 4,
        [new SkillSelection(["Athletics"])],
        [new Ability("Tough as Nails", "Once per session, your character may spend a Story Point as an out-of-turn incidental immediately after suffering a Critical Injury and determining the result. If they do so, they count the result rolled as \"01\".")]);
    defaultSet.archetypes["intellectual"] = new Archetype("The Intellectual",
        "The intellectual archetype represents a character who has a background grounded in some sort of intellectual pursuit. This pursuit could be science, medicine, teaching, or even magic. You should choose this archetype if you want to make a character who focuses on one of those intellectual pursuits. You should also choose this archetype if your character comes from a highly educated background.",
        [2, 1, 3, 2, 2, 2], 8, 12, 100, 4,
        [new SkillSelection([], SkillSelectionPredicate.ANY_KNOWLEDGE)],
        [new Ability("Brilliant!", "Once per session, your character may spend a Story Point as an incidental. If they do so, during the next check they make during that turn, you count their ranks in the skill being used as equal to their Intellect.")]);
    defaultSet.archetypes["aristocrat"] = new Archetype("The Aristocrat",
        "The aristocrat archetype represents any character who has the gift of a silver tongue. This could be a noble of some sort, a politician, a bard, or even a salesperson or merchant. You should use this archetype if you want to build a character who fits one of these molds. You should also choose this archetype if your character is good at communicating.",
        [1, 2, 2, 2, 2, 3], 10, 10, 100, 4,
        [new SkillSelection(["Cool"])],
        [new Ability("Forceful Personality", "Once per session, your character may spend a Story Point as an incidental. If they do so, during the next skill check they make during that turn, you character doubles the strain they inflict or the strain they heal (you choose before making the check).")]);

    //Careers
    defaultSet.careers["Entertainer"] = new Career("Entertainer", [["Charm"], ["Coordination"], ["Deception"], ["Discipline"], ["Leadership"], ["Melee", "Melee-Light"], ["Skulduggery"], ["Stealth"]]);
    defaultSet.careers["Explorer"] = new Career("Explorer", [["Athletics"], ["Brawl"], ["Coordination"], ["Deception"], ["Perception"], ["Ranged", "Ranged-Heavy"], ["Stealth"], ["Survival"]]);
    defaultSet.careers["Healer"] = new Career("Healer", [["Cool"], ["Discipline"], ["Knowledge"], ["Medicine"], ["Melee", "Melee-Light"], ["Resilience"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Leader"] = new Career("Leader", [["Charm"], ["Coercion"], ["Cool"], ["Discipline"], ["Leadership"], ["Melee", "Melee-Light"], ["Negotiation"], ["Perception"]]);
    defaultSet.careers["Scoundrel"] = new Career("Scoundrel", [["Charm"], ["Cool"], ["Coordination"], ["Deception"], ["Ranged", "Ranged-Light"], ["Skulduggery"], ["Stealth"], ["Streetwise"]]);
    defaultSet.careers["Socialite"] = new Career("Socialite", [["Charm"], ["Cool"], ["Deception"], ["Knowledge"], ["Negotiation"], ["Perception"], ["Streetwise"], ["Vigilance"]]);
    defaultSet.careers["Soldier"] = new Career("Soldier", [["Athletics"], ["Brawl", "Gunnery"], ["Coercion"], ["Melee", "Melee(Heavy)"], ["Perception"], ["Ranged", "Ranged-Heavy"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Tradesperson"] = new Career("Tradesperson", [["Athletics"], ["Brawl"], ["Discipline"], ["Mechanics"], ["Negotiation"], ["Perception"], ["Resilience"], ["Streetwise"]]);
    defaultSet.careers["Hacker"] = new Career("Hacker", [["Computers"], ["Discipline"], ["Knowledge"], ["Mechanics"], ["Perception"], ["Piloting"], ["Streetwise"], ["Vigilance"]]);
    defaultSet.careers["Fighter Pilot"] = new Career("Fighter Pilot", [["Cool"], ["Driving"], ["Gunnery"], ["Mechanics"], ["Perception"], ["Piloting"], ["Ranged-Light"], ["Vigilance"]]);
    defaultSet.careers["Knight"] = new Career("Knight", [["Athletics"], ["Discipline"], ["Leadership"], ["Melee-Heavy", "Melee"], ["Melee-Light", "Gunnery"], ["Resilience"], ["Riding", "Driving", "Piloting", "Operating"], ["Vigilance"]]);
    defaultSet.careers["Mad Scientist"] = new Career("Mad Scientist", [["Alchemy"], ["Coercion"], ["Knowledge"], ["Mechanics"], ["Medicine"], ["Operating"], ["Skulduggery"], ["Ranged-Heavy", "Arcana"]]);
    defaultSet.careers["Priest"] = new Career("Priest", [["Charm"], ["Coercion"], ["Cool"], ["Discipline"], ["Divine"], ["Medicine"], ["Melee", "Melee-Light"], ["Negotiation"]]);
    defaultSet.careers["Druid"] = new Career("Druid", [["Athletics"], ["Brawl"], ["Coordination"], ["Melee", "Melee-Heavy"], ["Primal"], ["Resilience"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Starship Captain"] = new Career("Starship Captain", [["Computers"], ["Discipline"], ["Gunnery"], ["Knowledge", "Astrocartography"], ["Leadership"], ["Mechanics"], ["Operating"], ["Perception"]]);
    defaultSet.careers["Wizard"] = new Career("Wizard", [["Arcana"], ["Coercion"], ["Discipline"], ["Knowledge"], ["Leadership"], ["Skulduggery"], ["Stealth", "Alchemy"], ["Vigilance"]]);

    return JSON.stringify(defaultSet, null, "\t");
}

export function fromStore(store: ElectronStore): Dataset {
    let dataset = new Dataset(store.get("name"));
    dataset.skills = store.get("skills");
    dataset.archetypes = store.get("archetypes");
    dataset.careers = store.get("careers");
    return dataset;
}

module.exports = {Dataset, createDefaultDataset, fromStore};