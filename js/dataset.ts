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
    allowCustomCareer: boolean = false;

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
    defaultSet.careers["Entertainer"] = new Career("Entertainer",
        "For the Entertainer, the whole world really is a stage. Whatever their chosen medium, these artists, actors, and musicians make their living brightening the days of others. However, there can be a lot more to these individuals than meets the eye, as some Entertainers use their acting skills to cover more serious agendas.",
        [["Charm"], ["Coordination"], ["Deception"], ["Discipline"], ["Leadership"], ["Melee", "Melee-Light"], ["Skulduggery"], ["Stealth"]]);
    defaultSet.careers["Explorer"] = new Career("Explorer",
        "The Explorer is at home in the wild, able to handle anything the wilderness throws at them. Explorers tend to excel at surviving in the wilderness, and they often are pretty good with ranged weapons. Explorers may be military scouts, gruff and unsociable hunters, or people who just prefer living in the wild.",
        [["Athletics"], ["Brawl"], ["Coordination"], ["Deception"], ["Perception"], ["Ranged", "Ranged-Heavy"], ["Stealth"], ["Survival"]]);
    defaultSet.careers["Healer"] = new Career("Healer",
        "The Healer focuses their efforts on keeping themself and their friends alive under dire circumstances. Healers are good at keeping cool under pressure, maintaining focus, and - of course-  healing. However, these aren’t their only capabilities. Depending on their background and personality, Healers can also be good negotiators, tough and durable medics, or even morally depraved surgeons with a penchant for experimenting on their patients.",
        [["Cool"], ["Discipline"], ["Knowledge"], ["Medicine"], ["Melee", "Melee-Light"], ["Resilience"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Leader"] = new Career("Leader",
        "The Leader focuses on leading and directing their fellows, as well as interacting with others. Leaders have a knack for taking charge and overseeing a situation, but their methods of leadership can vary wildly. A Leader can be a kind and caring boss, a soft-spoken politician, or a military commander who believes in absolute discipline.",
        [["Charm"], ["Coercion"], ["Cool"], ["Discipline"], ["Leadership"], ["Melee", "Melee-Light"], ["Negotiation"], ["Perception"]]);
    defaultSet.careers["Scoundrel"] = new Career("Scoundrel",
        "The Scoundrel’s business is crime in all forms. Whether swindling, burgling, or running a complicated con, the Scoundrel has the skills needed to separate marks from their money and valuables. A Scoundrel could be a cat burglar, con artist, or quick-draw specialist, or just a smooth-talking person who cheats at cards.",
        [["Charm"], ["Cool"], ["Coordination"], ["Deception"], ["Ranged", "Ranged-Light"], ["Skulduggery"], ["Stealth"], ["Streetwise"]]);
    defaultSet.careers["Socialite"] = new Career("Socialite",
        "Socialites are the consummate social butterflies, at ease in any interactions involving talking to someone else. Whether a rich debutante in the highest circles of society or a good-natured bartender who knows everyone’s name, a Socialite can get along with anyone and everyone. More importantly, they always know how to get the best out of any social interaction.",
        [["Charm"], ["Cool"], ["Deception"], ["Knowledge"], ["Negotiation"], ["Perception"], ["Streetwise"], ["Vigilance"]]);
    defaultSet.careers["Soldier"] = new Career("Soldier",
        "Soldiers are warriors through and through. At home on the battlefield, they know everything there is to know about surviving the horrors of combat—and making sure the opposition doesn’t. Whether your Soldier is a tough legionnaire armed with spear and shield, a modern soldier with an assault rifle and body armor, or a futuristic marine carrying a laser cannon depends on your setting. However, the basics of a career member of the military never really change.",
        [["Athletics"], ["Brawl", "Gunnery"], ["Coercion"], ["Melee", "Melee-Heavy"], ["Perception"], ["Ranged", "Ranged-Heavy"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Tradesperson"] = new Career("Tradesperson",
        "A Tradesperson can be anyone who has skills in a job that requires special training and some manual labor. The form this career takes depends a lot on the setting. Your Tradesperson could be a medieval blacksmith, modern auto mechanic, futuristic computer customizer, or chief engineer aboard a starship. They could also be a no-nonsense worker who has no time for anything but the job at hand, or a creative craftsperson who delights in building something innovative.",
        [["Athletics"], ["Brawl"], ["Discipline"], ["Mechanics"], ["Negotiation"], ["Perception"], ["Resilience"], ["Streetwise"]]);
    defaultSet.careers["Hacker"] = new Career("Hacker",
        "When we say Hacker, we’re talking about the type of computer operator who can do things with computers that are well beyond modern reality. Hackers are a staple of futuristic settings, where they can use their unparalleled affinity for computers to gain access to remote servers, control and override robotic drones, and engage in virtual duels on the Internet or its equivalent.",
        [["Computers"], ["Discipline"], ["Knowledge"], ["Mechanics"], ["Perception"], ["Piloting"], ["Streetwise"], ["Vigilance"]]);
    defaultSet.careers["Fighter Pilot"] = new Career("Fighter Pilot",
        "Though what a Fighter Pilot flies changes a lot depending on the setting, the Fighter Pilot career stays roughly similar. Whether they’re flying a prop-driven fighter plane, modern jet fighter, or futuristic starfighter, your Fighter Pilot is probably a cool, cocky, and confident individual with lightning-fast reflexes.",
        [["Cool"], ["Driving"], ["Gunnery"], ["Mechanics"], ["Perception"], ["Piloting"], ["Ranged-Light"], ["Vigilance"]]);
    defaultSet.careers["Knight"] = new Career("Knight",
        "The Knight is a warrior of the nobility. A Knight’s title comes with privilege, lands, and wealth, but also a responsibility to defend their liege lord and the common people who rely on the Knight for protection. Knights often train for war from childhood, and they equip themselves with the best arms and armor available.",
        [["Athletics"], ["Discipline"], ["Leadership"], ["Melee-Heavy", "Melee"], ["Melee-Light", "Gunnery"], ["Resilience"], ["Riding", "Driving", "Piloting", "Operating"], ["Vigilance"]]);
    defaultSet.careers["Mad Scientist"] = new Career("Mad Scientist",
        "For a Mad Scientist, the laws of physics are mere guidelines, achieving the impossible is a goal, and the morality of everyday society is a petty annoyance. Mad Scientists could be arcane researchers trying to fuse magic and technology or brilliant inventors crafting terrifying new mechanical creations. They don’t have to be truly evil or even amoral, but generally Mad Scientists are a little myopic. They get so focused on their grand goals that they ignore the consequences of their actions.",
        [["Alchemy"], ["Coercion"], ["Knowledge"], ["Mechanics"], ["Medicine"], ["Operating"], ["Skulduggery"], ["Ranged-Heavy", "Arcana"]]);
    defaultSet.careers["Priest"] = new Career("Priest",
        "Although you can find priests in any setting, this career represents the priest whose prayers to their deity have powerful and tangible results. We represent those results with the magic alternate rules, so you should only use the Priest career when you’re playing in a game with magic. Whether a soft-spoken priest who channels divine energy to heal the wounded, or a raging battle-priest who smites enemies with a mace as often as with holy wrath, a Priest is a devout believer in something greater than themself.",
        [["Charm"], ["Coercion"], ["Cool"], ["Discipline"], ["Divine"], ["Medicine"], ["Melee", "Melee-Light"], ["Negotiation"]]);
    defaultSet.careers["Druid"] = new Career("Druid",
        "Druids have a special connection with the primal powers of the natural world. They may be individuals who live in the wilderness, or regular people who have a particular affinity for life and nature. Druids can tap into the primal power of life to summon magic and perform fantastical feats.",
        [["Athletics"], ["Brawl"], ["Coordination"], ["Melee", "Melee-Heavy"], ["Primal"], ["Resilience"], ["Survival"], ["Vigilance"]]);
    defaultSet.careers["Starship Captain"] = new Career("Starship Captain",
        "The Starship Captain fits into any setting where starships are big, complex, and common enough that you could have a character who makes a living commanding one. Starship Captains are equally adept at repairing, programming, and piloting a starship, but their primary responsibility is leading and directing the crew under their command.",
        [["Computers"], ["Discipline"], ["Gunnery"], ["Knowledge", "Astrocartography"], ["Leadership"], ["Mechanics"], ["Operating"], ["Perception"]]);
    defaultSet.careers["Wizard"] = new Career("Wizard",
        "Magic can be brought into nearly any setting, and the Wizard is the career that really specializes in it. The Wizard focuses on the arcane: magic as a discipline that can be learned through study and practice. Rituals, cantrips, and chanted spells are all means by which the Wizard channels arcane energies.",
        [["Arcana"], ["Coercion"], ["Discipline"], ["Knowledge"], ["Leadership"], ["Skulduggery"], ["Stealth", "Alchemy"], ["Vigilance"]]);

    return JSON.stringify(defaultSet, null, "\t");
}

export function fromStore(store: ElectronStore): Dataset {
    let dataset = new Dataset(store.get("name"));
    dataset.skills = store.get("skills");
    dataset.archetypes = store.get("archetypes");
    dataset.careers = store.get("careers");
    dataset.allowCustomCareer = store.get("allowCustomCareer");
    return dataset;
}

module.exports = {Dataset, createDefaultDataset, fromStore};