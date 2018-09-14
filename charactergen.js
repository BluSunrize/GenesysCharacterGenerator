const electron = require("electron");
const fs = require("fs");
const Store = require("electron-store");

const {Dataset, createDefaultDataset, fromStore} = require("./js/dataset");
const {Skill, characteristics, Characteristic, getIndexOfCharacteristic, SkillCategory, buildSkillDropdown, SkillSelection, SkillSelectionPredicate} = require("./js/skill");
const Archetype = require("./js/archetype");
const Career = require("./js/career");
const Character = require("./js/character");
const {Ability, AbilityEffectType} = require("./js/ability");
const {Talent, TalentActivation} = require("./js/talent");
const {Weapon} = require("./js/weapon");
const {attachOnChangeByName, attachOnChangeById, setNamedAttribute, getNamedAttribute, setIDedAttribute, getIDedAttribute, syncAttributesToObject, syncAttributesFromObject} = require("./js/attribute_utils");
const {addOption} = require("./js/table_utils");

let initialCharacterLoad = false;
const derrived = ["soak", "wound_threshold", "strain_threshold", "defense_ranged", "defense_melee"];

electron.ipcRenderer.on("init", function (event, message) {
    console.log("initializing chargen");
    init(message);
});
console.log("send init request");
electron.ipcRenderer.send("init");

function init(dataset_path) {
    const dataset_store = new Store({"name": "dataset/" + dataset_path});
    const dataset = fromStore(dataset_store);

    //Key HTML Elements
    const element_main = document.getElementById("main");
    const element_characterlist = document.getElementById("characterlist");
    const element_archetype = document.getElementById("character_archetype");
    const element_career = document.getElementById("character_career");
    let element_skilllist = document.getElementById("skilllist");

    //Load Skills
    const skills = dataset.skills;
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
        cell.innerHTML = `${skill.name} (<span id="skill_${skill.name}_characteristic">${skill.characteristic}</span>)`;
        cell = row.insertCell(-1);
        cell.innerHTML = `<input id="skill_${skill.name}_career" type="checkbox" class="skill">`;
        document.getElementById(`skill_${skill.name}_career`).onchange = updateSkillCareer;
        cell = row.insertCell(-1);
        cell.innerHTML = `<input id="skill_${skill.name}_free" type="number" class="skill"><input id="skill_${skill.name}"type="range" class="skill" min="0" max="5" value="0">`;
        document.getElementById(`skill_${skill.name}`).onchange = updateSkillRank;
        document.getElementById(`skill_${skill.name}`).onmouseenter = (ev) => diceDisplay_prep(ev, skill);
        document.getElementById(`skill_${skill.name}`).onmouseleave = diceDisplay_hide;
    }

    //Load Archetypes
    const archetypes = dataset.archetypes;
    for (let key in archetypes)
        addOption(element_archetype, key, archetypes[key].name);
    updateArchetype(); //Set defaults

    //Load Careers
    const careers = dataset.careers;
    for (let key in careers) {
        addOption(element_career, key, careers[key].name);
    }

    //Load Characters
    var characters = dataset_store.get("characters");
    if (!characters)
        characters = [];
    var selectedChar = -1;

    function saveCharacters() {
        dataset_store.set("characters", characters);
    }

    let tr = document.createElement("tr");
    tr.innerHTML = "<td>+ New Character</td>";
    tr.onclick = createNewCharacter;
    element_characterlist.appendChild(tr);
    for (let i = 0; i < characters.length; i++)
        insertCharacter(characters[i]);

    window.onbeforeunload = function () {
        console.log("unloading window, run save");
        saveDisplayAttributes();
    };

    //Buttons
    document.getElementById("button_save_character").onclick = () => {
        saveDisplayAttributes();
    };
    document.getElementById("button_delete_character").onclick = () => {
        if (confirm("Are you sure you want to delete this character?")) {
            characters.splice(selectedChar, 1);
            element_characterlist.removeChild(element_characterlist.rows[selectedChar]);
            selectCharacter(-1);
        }

    };
    for (let i = 1; i <= 5; i++)
        document.getElementById("button_addtalent_" + i).onclick = () => addTalent(i);
    document.getElementById("button_addweapon").onclick = () => addWeapon();
    //Attach Change Handlers
    attachOnChangeById("character_name", updateCharacterList);
    attachOnChangeById("character_player", updateCharacterList);
    attachOnChangeById("character_campaign", updateCharacterList);
    element_archetype.onchange = updateArchetype;
    element_career.onchange = updateCareer;
    attachOnChangeById("total_experience", updateXPEarned);
    for (let i = 0; i < characteristics.length; i++) {
        attachOnChangeById(`bought_${characteristics[i]}`, autocalcCharacteristics);
        attachOnChangeById(`talent_${characteristics[i]}`, autocalcCharacteristics);
        attachOnChangeById(`equipment_${characteristics[i]}`, autocalcCharacteristics);
    }
    for (let i = 0; i < derrived.length; i++) {
        attachOnChangeById(`talent_${derrived[i]}`, autocalcDerrived);
        attachOnChangeById(`equipment_${derrived[i]}`, autocalcDerrived);
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
        //Derrived Attributes
        for (let i = 0; i < derrived.length; i++) {
            setIDedAttribute(`talent_${derrived[i]}`, character[derrived[i]][0]);
            setIDedAttribute(`equipment_${derrived[i]}`, character[derrived[i]][1]);
        }
        //Free Ranks
        for (let i = 0; i < 8; i++)
            setIDedAttribute(`careerskill_${i}_freerank`, character.career_skills_free_ranks[i]);
        //Talents
        for (let i = 1; i <= 5; i++) {
            let table = document.getElementById("talents_tier" + i);
            while (table.rows.length > 1)
                table.deleteRow(0);
        }
        for (let talent of character.talents)
            addTalent(talent.tier, talent);
        //Inventory
        let table = document.getElementById("tbody_weapons");
        while (table.rows.length > 1)
            table.deleteRow(0);
        for (let weapon of character.weapons)
            addWeapon(weapon);

        updateArchetype();
        updateCareer();
        updateTalentButtons();
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
        //Derrived Attributes
        for (let i = 0; i < derrived.length; i++)
            character[derrived[i]] = [
                getIDedAttribute(`talent_${derrived[i]}`),
                getIDedAttribute(`equipment_${derrived[i]}`)];
        //Archetype Skills
        let archetype_skills = document.getElementById("archetype_skills").children;
        character.archetype_skills = [];
        for (let i = 0; i < archetype_skills.length; i++)
            if (archetype_skills[i].lastChild.value)
                character.archetype_skills.push(archetype_skills[i].lastChild.value);
        //Free Career Skill Ranks
        character.career_skills_free_ranks = [getIDedAttribute("careerskill_0_freerank"), getIDedAttribute("careerskill_1_freerank"),
            getIDedAttribute("careerskill_2_freerank"), getIDedAttribute("careerskill_3_freerank"),
            getIDedAttribute("careerskill_4_freerank"), getIDedAttribute("careerskill_5_freerank"),
            getIDedAttribute("careerskill_6_freerank"), getIDedAttribute("careerskill_7_freerank")];
        //Talents
        character.talents = [];
        for (let tier = 1; tier <= 5; tier++) {
            let table = document.getElementById("talents_tier" + tier);
            for (let j = 0; j < table.rows.length - 1; j++) {
                let name = table.rows[j].cells[0].children[1].value;
                let desc = table.rows[j].cells[0].children[3].value;
                let activation = table.rows[j].cells[0].children[2].value;
                character.talents.push(new Talent(name, tier, desc, activation));
            }
        }
        //Inventory
        character.weapons = [];
        let table = document.getElementById("tbody_weapons");
        for (let i = 0; i < table.rows.length - 1; i++) {
            let name = table.rows[i].cells[0].firstChild.value;
            let skill = table.rows[i].cells[1].firstChild.value;
            let dam = table.rows[i].cells[2].firstChild.valueAsNumber;
            let crit = table.rows[i].cells[3].firstChild.valueAsNumber;
            let range = table.rows[i].cells[4].firstChild.value;
            let special = table.rows[i].cells[5].firstChild.value;
            character.weapons.push(new Weapon(name, skill, dam, crit, range, special));
        }


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
        tr.onclick = () => selectCharacter(tr.rowIndex);
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
        selectedChar = i;
        if (i < 0)
            element_main.classList.add("disabled");
        else {
            element_characterlist.rows[i].classList.add("selected");
            element_main.classList.remove("disabled");
            initialCharacterLoad = true;
            loadDisplayAttributes();
            initialCharacterLoad = false;
        }
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

    function autocalcDerrived() {
        for (let d of derrived) {
            let total = 0;
            if (d === "soak")
                total = parseInt(getIDedAttribute("archetype_soak")) + parseInt(getIDedAttribute(`characteristic_${d}`));
            else if (d === "wound_threshold")
                total = parseInt(getNamedAttribute("archetype_wounds")) + parseInt(getIDedAttribute(`characteristic_${d}`));
            else if (d === "strain_threshold")
                total = parseInt(getNamedAttribute("archetype_strain")) + parseInt(getIDedAttribute(`characteristic_${d}`));
            else if (d === "defense_ranged")
                total = parseInt(getIDedAttribute("archetype_defense_ranged"));
            else if (d === "defense_melee")
                total = parseInt(getIDedAttribute("archetype_defense_melee"));
            total += getIDedAttribute(`talent_${d}`);
            total += getIDedAttribute(`equipment_${d}`);
            setNamedAttribute(`attr_${d}`, total);
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
        setNamedAttribute("archetype_wounds", selectedArchetype.wound_threshold);
        setNamedAttribute("archetype_strain", selectedArchetype.strain_threshold);
        setIDedAttribute("archetype_description", selectedArchetype.description);
        setIDedAttribute("archetype_xp", selectedArchetype.experience);
        setIDedAttribute("archetype_free_careerskills", selectedArchetype.free_careerskills);
        let soakMod = 0;
        let defenseMod = [0, 0];
        let element_list = document.getElementById("archetype_abilities");
        while (element_list.children.length > 4)
            element_list.removeChild(element_list.lastChild);
        for (let ability of selectedArchetype.abilities) {
            let element_li = document.createElement("li");
            element_li.innerHTML = `<b>${ability.name}:</b> ${ability.description}`;
            element_list.appendChild(element_li);

            if (ability.effect && ability.effect.type !== AbilityEffectType.TEXT)
                if (ability.effect.type === AbilityEffectType.INCREASE_DEFENSE) {
                    defenseMod[0] += ability.effect.params ? parseInt(ability.effect.params[0]) : 1;
                    defenseMod[1] += ability.effect.params ? parseInt(ability.effect.params[1]) : 1;
                }
                else if (ability.effect.type === AbilityEffectType.INCREASE_SOAK)
                    soakMod += ability.effect.params ? parseInt(ability.effect.params[0]) : 1;
        }
        setIDedAttribute("archetype_soak", soakMod);
        setIDedAttribute("archetype_defense_ranged", defenseMod[0]);
        setIDedAttribute("archetype_defense_melee", defenseMod[1]);


        let freeRanks = 0;
        for (let i = 0; i < 8; i++) {
            let checkbox = document.getElementById(`careerskill_${i}_freerank`);
            if (checkbox.checked)
                if (++freeRanks > selectedArchetype.free_careerskills)
                    checkbox.checked = false;
        }


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
            let wrapper = document.createElement("p");
            wrapper.innerText = " Rank(s) in ";
            let input = document.createElement("input");
            input.type = "number";
            input.readOnly = true;
            input.valueAsNumber = selection.ranks;
            wrapper.insertBefore(input, wrapper.firstChild);
            wrapper.appendChild(dropdown);
            element_skills.appendChild(wrapper);
        }
        autocalcSkills();
    }

    function updateCareer(e) {
        let selectedCareer = careers[element_career.options[element_career.selectedIndex].value];
        setIDedAttribute("career_description", selectedCareer.description);
        for (let i = 0; i < Math.min(8, selectedCareer.skills.length); i++) {
            let element_careerskill = document.getElementById(`careerskill_${i}`);
            while (element_careerskill.firstChild)
                element_careerskill.removeChild(element_careerskill.firstChild);
            let dropdown = buildSkillDropdown(skills, new SkillSelection(selectedCareer.skills[i], SkillSelectionPredicate.FROM_LIST), null);
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
            let selectedArchetype = archetypes[element_archetype.value];
            let max = selectedArchetype.free_careerskills;
            let count = 0;
            for (let i = 0; i < 8; i++)
                if (document.getElementById(`careerskill_${i}_freerank`).checked)
                    count++;
            if (count > max) {
                e.srcElement.checked = false;
                return;
            }
        }
        autocalcSkills();
    }

    function updateCareerSkills(e) {
        if (selectedChar >= 0) {
            for (let skill of skills)
                document.getElementById(`skill_${skill.name}_career`).checked = false;
            characters[selectedChar].career_skills = [];
            for (let i = 0; i < 8; i++) {
                let element_careerskill = document.getElementById(`careerskill_${i}`).firstChild;
                let element_isCareer = document.getElementById(`skill_${element_careerskill.value}_career`);
                element_isCareer.checked = true;
                element_isCareer.disabled = true;
                characters[selectedChar].career_skills.push(element_careerskill.value);
            }
            for (let ability of archetypes[element_archetype.value].abilities)
                if (ability.effect && ability.effect.type === AbilityEffectType.GAIN_CAREER_SKILL && ability.effect.params)
                    for (let param of ability.effect.params) {
                        let element_isCareer = document.getElementById(`skill_${param}_career`);
                        element_isCareer.checked = true;
                        element_isCareer.disabled = true;
                        characters[selectedChar].career_skills.push(param);
                    }
            for (let skill of characters[selectedChar].extra_career_skills) {
                document.getElementById(`skill_${skill}_career`).checked = true;
                characters[selectedChar].career_skills.push(skill);
            }


            updateArchetypeSkillSelection();
            autocalcSkills();
        }
    }

    function updateSkillCareer(e) {
        let skill = e.srcElement.id.slice("skill_".length, e.srcElement.id.length - "_career".length);
        if (e.srcElement.checked) {
            characters[selectedChar].skills_bought_noncareer[skill] = characters[selectedChar].skills_bought[skill];
            if (!characters[selectedChar].extra_career_skills.includes(skill))
                characters[selectedChar].extra_career_skills.push(skill);
        }
        else {
            characters[selectedChar].skills_bought_noncareer[skill] = undefined;
            characters[selectedChar].extra_career_skills.splice(characters[selectedChar].extra_career_skills.indexOf(skill));
            autocalcXPSpent();
        }
    }

    /* SKILL TABLE METHODS */

    function updateSkillRank(e) {
        if (selectedChar >= 0) {
            let skill = e.srcElement.id.substr("skill_".length);
            let free = document.getElementById(e.srcElement.id + "_free").value;
            let bought = e.srcElement.value - free;
            characters[selectedChar].skills_bought[skill] = bought;
            if (characters[selectedChar].skills_bought_noncareer[skill] && bought < characters[selectedChar].skills_bought_noncareer[skill])
                characters[selectedChar].skills_bought_noncareer[skill] = bought <= 0 ? undefined : bought;
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
        if(diceDisplayTimeout)
            diceDisplay_show(element);
    }

    /* Dice Display functionality */

    const diceDisplay = document.createElement("div");
    diceDisplay.id = "dicedisplay";
    document.getElementById("main").appendChild(diceDisplay);
    let diceDisplayPos = [0, 0];
    let diceDisplayTimeout;

    function diceDisplay_show(rankElement) {
        let char = getIDedAttribute(`${rankElement.id}_characteristic`);
        let i = getIndexOfCharacteristic(Characteristic[char]);
        let charValue = archetypes[getIDedAttribute("character_archetype")].characteristics[i];
        charValue += getIDedAttribute(`bought_${characteristics[i]}`);
        charValue += getIDedAttribute(`talent_${characteristics[i]}`);
        charValue += getIDedAttribute(`equipment_${characteristics[i]}`);
        let diceCount = Math.max(rankElement.value, charValue);
        let upgrade = Math.min(rankElement.value, charValue);
        diceDisplay.style.left = diceDisplayPos[0] + "px";
        diceDisplay.style.top = diceDisplayPos[1] + "px";
        let content = "";
        for (let i = 0; i < diceCount; i++)
            if (i < upgrade)
                content += '<div class="proficiency">⬣</div>';
            else
                content += '<div class="ability">♦</div>';
        diceDisplay.innerHTML = content;
        diceDisplay.style.display = "inline-flex";
    }

    function diceDisplay_prep(mouseEvent, skill) {
        diceDisplayPos = [mouseEvent.pageX - mouseEvent.offsetX + 22, mouseEvent.pageY - mouseEvent.offsetY + 19];
        diceDisplayTimeout = setTimeout(diceDisplay_show, 1000, mouseEvent.srcElement);
    }

    function diceDisplay_hide() {
        if (diceDisplayTimeout) {
            clearTimeout(diceDisplayTimeout);
            diceDisplayTimeout = undefined;
        }
        setTimeout(() => diceDisplay.style.display = "none", 500);
    }

    /* AUTO-CALC METHODS */

    function autocalcCharacteristics(e) {
        if (selectedChar >= 0) {
            for (let i = 0; i < characteristics.length; i++) {
                let total = archetypes[getIDedAttribute("character_archetype")].characteristics[i];
                total += getIDedAttribute(`bought_${characteristics[i]}`);
                total += getIDedAttribute(`talent_${characteristics[i]}`);
                total += getIDedAttribute(`equipment_${characteristics[i]}`);
                setNamedAttribute(`attr_${characteristics[i]}`, total);
            }
            autocalcDerrived();
            autocalcXPSpent();
        }
    }

    function autocalcSkills() {
        if (selectedChar >= 0) {
            let freeRanks = {};
            // From Archetype
            let archetype_skills = document.getElementById("archetype_skills").children;
            for (let i = 0; i < archetype_skills.length; i++) {
                let count = archetype_skills[i].firstChild.valueAsNumber;
                let skill = archetype_skills[i].lastChild.value;
                freeRanks[skill] = (freeRanks[skill] || 0) + count;
            }
            // From Career
            for (let i = 0; i < 8; i++)
                if (getIDedAttribute(`careerskill_${i}_freerank`)) {
                    let element_careerskill = document.getElementById(`careerskill_${i}`).firstChild;
                    if (element_careerskill)
                        freeRanks[element_careerskill.value] = (freeRanks[element_careerskill.value] || 0) + 1;
                }

            for (let skill of skills) {
                let freeRank = freeRanks[skill.name] || 0;
                let boughtRank = characters[selectedChar].skills_bought[skill.name] || 0;
                let skill_free = document.getElementById(`skill_${skill.name}_free`);
                skill_free.value = freeRank;
                let skill_slider = document.getElementById(`skill_${skill.name}`);
                skill_slider.value = freeRank + boughtRank;
                updateSkillRender(skill_slider);
            }
            autocalcXPSpent();
        }
    }

    function updateXPEarned(e) {
        let total = e.srcElement.valueAsNumber;
        let diff = total - e.srcElement.min;
        if (diff < 0) {
            e.srcElement.value = e.srcElement.min;
            diff = 0;
        }
        setIDedAttribute("character_experience_earned", diff);
        autocalcXPAvailable(total);
    }

    function autocalcXPSpent(spentOnSkills) {
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
                let isCareer = document.getElementById(`skill_${skill.name}_career`).checked;

                for (let j = freeRank + 1; j <= boughtRank; j++)
                    xpSpent += 5 * j;
                if (boughtRank > 0)
                    if (!isCareer)
                        xpSpent += 5 * (boughtRank - freeRank);
                    else if (characters[selectedChar].skills_bought_noncareer[skill.name])
                        xpSpent += 5 * characters[selectedChar].skills_bought_noncareer[skill.name];
            }

        for (let tier = 1; tier <= 5; tier++) {
            let table = document.getElementById("talents_tier" + tier);
            xpSpent += (table.rows.length - 1) * (tier * 5);
        }

        let xpArch = parseInt(getIDedAttribute("archetype_xp"));
        let xpTotal = xpArch + getIDedAttribute("character_experience_earned");
        setIDedAttribute("total_experience", xpTotal);
        document.getElementById("total_experience").min = xpArch;
        setIDedAttribute("character_experience_spent", xpSpent);
        autocalcXPAvailable(xpTotal, xpSpent);
    }

    function autocalcXPAvailable(xpTotal, xpSpent) {
        if (!xpSpent)
            xpSpent = getIDedAttribute("character_experience_spent");
        setIDedAttribute("available_experience", xpTotal - xpSpent);
    }

    function addTalent(tier, talent) {
        let table = document.getElementById("talents_tier" + tier);
        let tr = table.insertRow(table.rows.length - 1);
        let td = tr.insertCell();
        // let span = document.createElement("span");
        // span.innerText = "Talent";
        // td.appendChild(span);
        // span = document.createElement("span");
        // span.innerText = "Active?";
        // td.appendChild(span);
        let remove = document.createElement("button");
        remove.innerText = "x";
        remove.onclick = () => {
            table.deleteRow(tr.rowIndex);
            autocalcXPSpent();
            updateTalentButtons();
        };
        td.appendChild(remove);

        let name = document.createElement("input");
        td.appendChild(name);
        // let active = document.createElement("input");
        // active.type = "checkbox";
        // let checkDiv = document.createElement("div");
        // checkDiv.appendChild(active);
        // td.appendChild(checkDiv);

        let activation = document.createElement("select");
        for (let type of TalentActivation)
            addOption(activation, type);
        td.appendChild(activation);

        let desc = document.createElement("textarea");
        desc.rows = 7;
        td.appendChild(desc);

        if (talent) {
            name.value = talent.name;
            activation.value = talent.activation;
            desc.value = talent.description;
        }
        autocalcXPSpent();
        updateTalentButtons();
    }

    function updateTalentButtons() {
        for (let i = 1; i < 5; i++) {
            let table = document.getElementById("talents_tier" + i);
            let tableNext = document.getElementById("talents_tier" + (i + 1));
            document.getElementById("button_addtalent_" + (i + 1)).disabled = table.rows.length <= tableNext.rows.length + 1;
        }
    }

    let ranges = ["Engaged", "Short", "Medium", "Long", "Extreme", "Strategic"];

    function addWeapon(weapon) {
        let tbody = document.getElementById("tbody_weapons");
        let tr = tbody.insertRow(tbody.rows.length - 1);
        let td = tr.insertCell();
        let name = document.createElement("input");
        name.type = "text";
        td.appendChild(name);

        td = tr.insertCell();
        let skill = document.createElement("select");
        for (let s of skills)
            if (s.category === SkillCategory.COMBAT || s.category === SkillCategory.POWER)
                addOption(skill, s.name);
        td.appendChild(skill);

        td = tr.insertCell();
        let damage = document.createElement("input");
        damage.type = "number";
        td.appendChild(damage);

        td = tr.insertCell();
        let crit = document.createElement("input");
        crit.type = "number";
        td.appendChild(crit);

        td = tr.insertCell();
        let range = document.createElement("select");
        for (let r of ranges)
            addOption(range, r);
        td.appendChild(range);

        td = tr.insertCell();
        let special = document.createElement("textarea");
        td.appendChild(special);

        if (weapon) {
            name.value = weapon.name;
            skill.value = weapon.skill;
            damage.valueAsNumber = weapon.damage;
            crit.valueAsNumber = weapon.crit;
            range.value = weapon.range;
            special.value = weapon.special;
        }
    }
}