// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

console.log("init renderer js");

const {attachOnChangeByName, attachOnChangeById, setNamedAttribute, getNamedAttribute, setIDedAttribute, getIDedAttribute, syncAttributesToObject, syncAttributesFromObject} = require("./js/attribute_utils");

const ipcRenderer = require("electron").ipcRenderer;
const Store = require("electron-store");
const dataset_default = new Store({"name": "dataset/default"});
//todo: Dataset selection
const dataset = dataset_default;
const character_store = new Store({"name": "characters"});

const {Skill, Characteristic, SkillCategory, buildSkillDropdown, SkillSelection, SkillSelectionPredicate} = require("./js/skill");
const Archetype = require("./js/archetype");
const Career = require("./js/career");
const Character = require("./js/character");
const Ability = require("./js/ability");

const characteristics = ["brawn", "agility", "intellect", "cunning", "willpower", "presence"];
// var archetypes = {
//     human: new Archetype("Average Human", [2, 2, 2, 2, 2, 2], 10, 10, 110, [new SkillSelection([], SkillSelectionPredicate.NON_CAREER), new SkillSelection([], SkillSelectionPredicate.NON_CAREER)], [new Ability("Ready for Anything", "Once per session as an out-ofturn incidental, a Human may move one Story Point from the Game Master's pool to the players' pool.", null)]),
//     laborer: new Archetype("The Laborer", [3, 2, 2, 2, 1, 2], 12, 8, 100, [new SkillSelection("Athletics")], [new Ability("Tough as Nails", "Once per session, your character may spend a Story Point as an out-of-turn incidental immediately after suffering a Critical Injury and determining the result. If they do so, they count the result rolled as \"01\".", null)]),
//     intellectual: new Archetype("The Intellectual", [2, 1, 3, 2, 2, 2], 8, 12, 100, [new SkillSelection([], SkillSelectionPredicate.KNOWLEDGE)], [new Ability("Brilliant!", "Once per session, your character may spend a Story Point as an incidental. If they do so, during the next check they make during that turn, you count their ranks in the skill being used as equal to their Intellect.", null)]),
// };
// dataset.set("archetypes", archetypes);

// HTML Elements
const element_main = document.getElementById("main");
const element_characterlist = document.getElementById("characterlist");
const element_archetype = document.getElementById("character_archetype");
const element_career = document.getElementById("character_career");

window.onbeforeunload = function () {
    saveDisplayAttributes();
};
// ipcRenderer.on('reload', function (event, message) {
//     console.log(message);
// });

//Load Skills
// var skills = [
//     new Skill("Alchemy", Characteristic.INT, SkillCategory.GENERAL),
//     new Skill("Ranged (Light)", Characteristic.AG, SkillCategory.COMBAT),
//     new Skill("Coercion", Characteristic.WILL, SkillCategory.SOCIAL),
//     new Skill("Arcana", Characteristic.INT, SkillCategory.POWER),
//     new Skill("Knowledge", Characteristic.INT, SkillCategory.KNOWLEDGE)
// ];
// dataset.set("skills", skills);
var skills = dataset.get("skills");
let element_skilllist = document.getElementById("skilllist");
let elements_skilltable = {};
for (let cat in SkillCategory) {
    cat = SkillCategory[cat];
    let table = document.createElement("table");
    element_skilllist.appendChild(table);
    element_skilllist.appendChild(document.createElement("br"));
    let header = table.createTHead().insertRow(0);
    let h = header.insertCell(-1);
    h.innerText = `${cat} Skills`;
    h = header.insertCell(-1);
    h.innerText = "Career?";
    h = header.insertCell(-1);
    h.innerText = "Rank";
    elements_skilltable[cat] = table.createTBody();
}
for (let skill of skills) {
    let row = elements_skilltable[skill.category].insertRow(-1);
    let cell = row.insertCell(-1);
    cell.innerText = `${skill.name} (${skill.characteristic})`;
    cell = row.insertCell(-1);
    cell.innerHTML = `<label id="skill_${skill.name}_career" class="skill"></label>`;
    cell = row.insertCell(-1);
    cell.innerHTML = `<input id="skill_${skill.name}_free" type="number" class="skill"><input id="skill_${skill.name}"type="range" class="skill" min="0" max="5" value="0">`;
    document.getElementById("skill_" + skill.name).onchange = updateSkillRank;
}

//Load Archetypes
var archetypes = dataset.get("archetypes");
for (let key in archetypes) {
    let option = document.createElement("option");
    option.value = key;
    option.innerText = archetypes[key].name;
    element_archetype.appendChild(option);
}
updateArchetype(); //Set defaults

//Load Careers
// var careers = [
//     new Career("Entertainer", [["Charm"], ["Coordination"], ["Deception"], ["Discipline"], ["Leadership"], ["Melee", "Melee (Light)"], ["Skulduggery"], ["Stealth"]]),
//     new Career("Explorer", [["Athletics"], ["Brawl"], ["Coordination"], ["Deception"], ["Perception"], ["Ranged", "Ranged (Heavy)"], ["Stealth"], ["Survival"]])
// ];
// dataset.set("careers", careers);
var careers = dataset.get("careers");
for (let key in careers) {
    let option = document.createElement("option");
    option.value = key;
    option.innerText = careers[key].name;
    element_career.appendChild(option);
}

//Load Characters
var characters = character_store.get("characters");
if (!characters)
    characters = [];
var selectedChar = -1;

function saveCharacters() {
    character_store.set("characters", characters);
}

let tr = document.createElement("tr");
tr.innerHTML = "<td>+ New Character</td>";
tr.onclick = createNewCharacter;
element_characterlist.appendChild(tr);
for (let i = 0; i < characters.length; i++)
    insertCharacter(characters[i]);

//Attach Change Handlers
attachOnChangeById("character_name", updateCharacterList);
attachOnChangeById("character_player", updateCharacterList);
attachOnChangeById("character_campaign", updateCharacterList);
element_archetype.onchange = updateArchetype;
element_career.onchange = updateCareer;
for (let i = 0; i < characteristics.length; i++) {
    attachOnChangeById(`bought_${characteristics[i]}`, autocalcCharacteristics);
    attachOnChangeById(`talent_${characteristics[i]}`, autocalcCharacteristics);
    attachOnChangeById(`equipment_${characteristics[i]}`, autocalcCharacteristics);
}
for (let i = 0; i < 8; i++)
    attachOnChangeById(`careerskill_${i}_freerank`, selectCareerFreeSkill);

function loadDisplayAttributes() {
    if (selectedChar < 0)
        return;
    let character = characters[selectedChar];

    //All general, IDed attributes
    syncAttributesFromObject("character_", character);
    //Characteristics
    for (let i = 0; i < characteristics.length; i++) {
        setIDedAttribute(`bought_${characteristics[i]}`, character.characteristics[i][0]);
        setIDedAttribute(`talent_${characteristics[i]}`, character.characteristics[i][1]);
        setIDedAttribute(`equipment_${characteristics[i]}`, character.characteristics[i][2]);
    }
    for (let i = 0; i < 8; i++)
        setIDedAttribute(`careerskill_${i}_freerank`, character.career_skills_free_ranks[i]);


    updateArchetype();
    updateCareer();
}

function saveDisplayAttributes() {
    if (selectedChar < 0)
        return;
    let character = characters[selectedChar];

    //All general, IDed attributes
    syncAttributesToObject("character_", character);
    //Characteristics
    for (let i = 0; i < characteristics.length; i++)
        character.characteristics[i] = [
            getIDedAttribute(`bought_${characteristics[i]}`),
            getIDedAttribute(`talent_${characteristics[i]}`),
            getIDedAttribute(`equipment_${characteristics[i]}`)];
    //Archetype Skills
    let archetype_skills = document.getElementById("archetype_skills").children;
    character.archetype_skills = [];
    for (let i = 0; i < archetype_skills.length; i++)
        if (archetype_skills[i].value)
            character.archetype_skills.push(archetype_skills[i].value);
    //Free Career Skill Ranks
    character.career_skills_free_ranks = [getIDedAttribute("careerskill_0_freerank"), getIDedAttribute("careerskill_1_freerank"),
        getIDedAttribute("careerskill_2_freerank"), getIDedAttribute("careerskill_3_freerank"),
        getIDedAttribute("careerskill_4_freerank"), getIDedAttribute("careerskill_5_freerank"),
        getIDedAttribute("careerskill_6_freerank"), getIDedAttribute("careerskill_7_freerank")];

    saveCharacters();
}

function initDropdownStateWithOld(dropdown, old) {
    let found = false;
    for (let option of dropdown.options)
        if (option.value === old) {
            found = true;
            break;
        }
    if (found)
        dropdown.value = old;
    else
        dropdown.selectedIndex = 0;
}


/* CHARACTER CREATION & SELECTION METHODS */

function insertCharacter(character) {
    const i = element_characterlist.rows.length - 1;
    let tr = element_characterlist.insertRow(i);
    tr.onclick = () => selectCharacter(i);
    let content = `<td>Character #${i + 1}<br>&nbsp&nbsp<span id='character${i}_name'>${character.name ? character.name : ""}</span><br>`;
    content += `&nbsp&nbsp&nbsp<span id='character${i}_archetype'>${character.archetype ? archetypes[character.archetype].name : ""}</span><br>`;
    content += `&nbsp&nbsp&nbsp<span id='character${i}_career'>${character.career ? careers[character.career].name : ""}</span><br>`;
    content += `&nbsp&nbsp&nbsp<span id='character${i}_player'>${character.player ? character.player : ""}</span><br>`;
    content += `&nbsp&nbsp&nbsp<span id='character${i}_campaign'>${character.campaign ? character.campaign : ""}</span><br>`;
    content += "</td>";
    tr.innerHTML = content;
}

function createNewCharacter() {
    let character = new Character();
    character.name = "Unnamed";
    // character.player = "Unnamed";
    // character.name = "Unnamed";
    characters.push(character);
    insertCharacter(character);
}

function selectCharacter(i) {
    if (selectedChar >= 0)
        element_characterlist.rows[selectedChar].classList.remove("selected");
    element_characterlist.rows[i].classList.add("selected");
    if (i < 0)
        element_main.classList.add("disabled");
    else
        element_main.classList.remove("disabled");
    selectedChar = i;
    loadDisplayAttributes();
}


/* ATTRIBUTE UPDATE METHODS */
const listAtrributes = new Set(["name", "player", "campaign"]);

function updateCharacterList(e) {
    let key = event.target.id.substr("character_".length);
    //Set Character List values
    if (listAtrributes.has(key))
        setIDedAttribute(`character${selectedChar}_${key}`, event.target.value);
    else if ("archetype" === key && archetypes[event.target.value])
        setIDedAttribute(`character${selectedChar}_archetype`, archetypes[event.target.value].name);
    else if ("career" === key && careers[event.target.value])
        setIDedAttribute(`character${selectedChar}_career`, careers[event.target.value].name);
}

const derrived = ["soak", "wound_threshold", "strain_threshold"];

function autocalcDerrived(characteristics) {
    for (let d of derrived) {
        let element = document.getElementById(`character_${d}`);
        let curBoost = element.value - element.min;
        let newMin = 0;
        if (d === "soak")
            newMin = characteristics[0];
        else if (d === "wound_threshold")
            newMin = parseInt(getIDedAttribute("archetype_wounds")) + characteristics[0];
        else if (d === "strain_threshold")
            newMin = parseInt(getIDedAttribute("archetype_strain")) + characteristics[4];
        if (element.min < 0)//Initial setup
            curBoost = element.value - newMin;
        element.min = newMin;
        element.value = newMin + curBoost;
    }
}

function updateArchetype(e) {
    let selectedArchetype = archetypes[element_archetype.value];
    setNamedAttribute("archetype_brawn", selectedArchetype.characteristics[0]);
    setNamedAttribute("archetype_agility", selectedArchetype.characteristics[1]);
    setNamedAttribute("archetype_intellect", selectedArchetype.characteristics[2]);
    setNamedAttribute("archetype_cunning", selectedArchetype.characteristics[3]);
    setNamedAttribute("archetype_willpower", selectedArchetype.characteristics[4]);
    setNamedAttribute("archetype_presence", selectedArchetype.characteristics[5]);
    setIDedAttribute("archetype_wounds", selectedArchetype.wound_threshold);
    setIDedAttribute("archetype_strain", selectedArchetype.strain_threshold);
    setIDedAttribute("archetype_xp", selectedArchetype.experience);
    if (selectedChar >= 0) {

        updateArchetypeSkillSelection();
        autocalcCharacteristics();
    }
    if (e)
        updateCharacterList(e);
}

function updateArchetypeSkillSelection() {
    let selectedArchetype = archetypes[element_archetype.value];
    let element_skills = document.getElementById("archetype_skills");
    while (element_skills.firstChild)
        element_skills.removeChild(element_skills.firstChild);
    for (let iSelection in selectedArchetype.skills) {
        let selection = selectedArchetype.skills[iSelection];
        let dropdown = buildSkillDropdown(skills, selection, characters[selectedChar]);
        dropdown.onchange = autocalcSkills;
        if (element_archetype.value === characters[selectedChar].archetype)//if same as cached archetype
            initDropdownStateWithOld(dropdown, characters[selectedChar].archetype_skills[iSelection]);
        element_skills.appendChild(dropdown);
    }
    autocalcSkills();
}

function updateCareer(e) {
    let selectedCareer = careers[element_career.options[element_career.selectedIndex].value];
    for (let i = 0; i < Math.min(8, selectedCareer.skills.length); i++) {
        let element_careerskill = document.getElementById(`careerskill_${i}`);
        while (element_careerskill.firstChild)
            element_careerskill.removeChild(element_careerskill.firstChild);
        let dropdown = buildSkillDropdown(skills, new SkillSelection(selectedCareer.skills[i], SkillSelectionPredicate.LIST), null);
        initDropdownStateWithOld(dropdown, characters[selectedChar].career_skills[i]);
        dropdown.onchange = updateCareerSkills;
        element_careerskill.appendChild(dropdown);
    }
    updateCareerSkills();
    if (e)
        updateCharacterList(e);
}

function selectCareerFreeSkill(e) {
    if (e.srcElement.checked)//was flipped on
    {
        let count = 0;
        for (let i = 0; i < 8; i++)
            if (document.getElementById(`careerskill_${i}_freerank`).checked)
                count++;
        if (count > 4) {
            e.srcElement.checked = false;
            return;
        }
    }
    autocalcSkills();
}

function updateCareerSkills(e) {
    if (selectedChar >= 0) {
        for (let old of characters[selectedChar].career_skills)
            document.getElementById(`skill_${old}_career`).classList.remove("checked");
        characters[selectedChar].career_skills = [];
        for (let i = 0; i < 8; i++) {
            let element_careerskill = document.getElementById(`careerskill_${i}`).firstChild;
            document.getElementById(`skill_${element_careerskill.value}_career`).classList.add("checked");
            characters[selectedChar].career_skills.push(element_careerskill.value);
        }

        updateArchetypeSkillSelection();
        autocalcSkills();
    }
}

function updateSkillRank(e) {
    if (selectedChar >= 0) {
        let free = document.getElementById(e.srcElement.id + "_free").value;
        let val = e.srcElement.value;
        characters[selectedChar].skills_bought[e.srcElement.id.substr("skill_".length)] = val - free;
    }
    updateSkillRender(e.srcElement);
    autocalcXPSpent();
}

function updateSkillRender(element) {
    element.classList.remove("rank1", "rank2", "rank3", "rank4", "rank5");
    if (element.value < document.getElementById(element.id + "_free").value)
        element.value = document.getElementById(element.id + "_free").value;
    if (element.value > 0)
        element.classList.add("rank" + element.value);
}

function autocalcCharacteristics(e) {
    if (selectedChar >= 0) {
        let totalChars = [];
        for (let i = 0; i < characteristics.length; i++) {
            let total = archetypes[getIDedAttribute("character_archetype")].characteristics[i];
            total += getIDedAttribute(`bought_${characteristics[i]}`);
            total += getIDedAttribute(`talent_${characteristics[i]}`);
            total += getIDedAttribute(`equipment_${characteristics[i]}`);
            setNamedAttribute(`attr_${characteristics[i]}`, total);
            totalChars[i] = total;
        }
        autocalcDerrived(totalChars);
        autocalcXPSpent();
    }
}

function autocalcSkills() {
    if (selectedChar >= 0) {
        let freeRanks = {};
        // From Archetype
        let archetype_skills = document.getElementById("archetype_skills").children;
        for (let i = 0; i < archetype_skills.length; i++)
            if (archetype_skills[i].value)
                freeRanks[archetype_skills[i].value] = (freeRanks[archetype_skills[i].value] || 0) + 1;
        // From Career
        for (let i = 0; i < 8; i++)
            if (getIDedAttribute(`careerskill_${i}_freerank`)) {
                let element_careerskill = document.getElementById(`careerskill_${i}`).firstChild;
                if (element_careerskill)
                    freeRanks[element_careerskill.value] = (freeRanks[element_careerskill.value] || 0) + 1;
            }

        let xpSpent = 0;
        for (let skill of skills) {
            let freeRank = freeRanks[skill.name] || 0;
            let boughtRank = characters[selectedChar].skills_bought[skill.name] || 0;
            for (let j = 0; j < boughtRank; j++)
                xpSpent += 5 * (freeRank + j);

            let skill_free = document.getElementById(`skill_${skill.name}_free`);
            skill_free.value = freeRank;
            let skill_slider = document.getElementById(`skill_${skill.name}`);
            skill_slider.value = freeRank + boughtRank;
            updateSkillRender(skill_slider);
        }
        autocalcXPSpent(xpSpent);
    }
}

function autocalcXPSpent(spentOnSkills) {
    console.log("Start XP Calculation");
    let xpSpent = 0;
    for (let i = 0; i < characteristics.length; i++) {
        let baseChar = archetypes[getIDedAttribute("character_archetype")].characteristics[i];
        let boughtChar = getIDedAttribute(`bought_${characteristics[i]}`);
        for (let j = 1; j <= boughtChar; j++)
            xpSpent += 10 * (baseChar + j);
    }

    if (spentOnSkills)
        xpSpent += spentOnSkills;
    else
        for (let skill of skills) {
            let freeRank = getIDedAttribute(`skill_${skill.name}_free`) || 0;
            let boughtRank = getIDedAttribute(`skill_${skill.name}`) || 0;
            for (let j = freeRank + 1; j <= boughtRank; j++) {
                let cost = 5 * j;
                console.log("cost for " + skill.name + ", rank " + j + ": " + cost);
                xpSpent += cost;
            }
        }

}
