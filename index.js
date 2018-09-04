
const electron = require("electron");
const fs = require("fs");
const Store = require("electron-store");

const {makeDragable, wrapInRow} = require("./js/table_utils");
const {createDefaultDataset} = require("./js/dataset");
const {Skill, characteristics, Characteristic, SkillCategory, SkillSelection, SkillSelectionPredicate, buildSkillSelectionConfiguration, parseSkillSelectionConfiguration} = require("./js/skill");
const {Ability, buildAbilityConfiguration, parseAbilityConfiguration} = require("./js/ability");
const {Archetype} = require("./js/archetype");

const element_datasets = document.getElementById("datasets");
const element_button_continue = document.getElementById("button_continue");
const element_button_openfolder = document.getElementById("button_dataset_openfolder");
const element_button_new = document.getElementById("button_dataset_new");
const element_button_copy = document.getElementById("button_dataset_copy");
const element_button_remove = document.getElementById("button_dataset_remove");
const element_button_save = document.getElementById("button_dataset_save");
const element_archetypes = document.getElementById("archetypes");

const cwd = (electron.app || electron.remote.app).getPath('userData');
if (!fs.existsSync(cwd + "/dataset")) {
    console.log("NO DATASET FOLDEEEEEEEEEEERRRRR!!!");
    fs.mkdirSync(cwd + "/dataset");
}
if (!fs.existsSync(cwd + "/dataset/default.json")) {
    console.log("NO DEFAULT DATASET!!!!");
    fs.writeFileSync(cwd + "/dataset/default.json", createDefaultDataset());
}

let files_dataset = fs.readdirSync(cwd + "/dataset");
let nextCustomIndex = 1;
let patternUsercreated = /usercreated_(\d+)/;
const dataset_stores = {};
for (let ds of files_dataset)
    if (ds.endsWith(".json")) {
        ds = ds.substring(0, ds.length - 5);
        console.log(" adding dataset: " + ds);
        let element_option = document.createElement("option");
        let dataset_store = new Store({"name": "dataset/" + ds});
        let name = dataset_store.get("name");
        if (name) {
            dataset_stores[ds] = dataset_store;
            element_option.value = ds;
            element_option.innerText = name;
            if ("default" === ds)
                element_datasets.insertBefore(element_option, element_datasets.firstChild);
            else
                element_datasets.appendChild(element_option);
        }
        let res = patternUsercreated.exec(ds);
        if (res)
            nextCustomIndex = Math.max(nextCustomIndex, parseInt(res[1]) + 1);
    }
element_datasets.selectedIndex = 0;
element_datasets.onchange = readDataset;
element_button_continue.onclick = () => {
    electron.ipcRenderer.send("continue", element_datasets.value);
};
element_button_openfolder.onclick = () => electron.shell.showItemInFolder(cwd + "/dataset/.");
element_button_new.onclick = newDataset;
element_button_copy.onclick = copyDataset;
element_button_remove.onclick = removeDataset;
element_button_save.onclick = writeDataset;
for (let button of document.getElementsByName("button_add_skill"))
    button.onclick = addSkill;
document.getElementById("button_add_archetype").onclick = addArchetype;
readDataset();

document.getElementById("allow_dataset_edit").onchange = toggleEdit;

function newDataset(e) {
    let key = "usercreated_" + nextCustomIndex;
    let name = "Usercreated #" + (nextCustomIndex++);

    let store = {
        name: name,
        skills: [],
        archetypes: {},
        careers: {}
    };
    fs.writeFileSync(cwd + "/dataset/" + key + ".json", JSON.stringify(store, null, "\t"));
    let element_option = document.createElement("option");
    dataset_stores[key] = new Store({"name": "dataset/" + key});
    element_option.value = key;
    element_option.innerText = store.name;
    element_datasets.appendChild(element_option);
    element_datasets.value = key;
    readDataset();
}


function copyDataset(e) {
    if ("default" !== element_datasets.value)
        writeDataset();
    let dataset_store = dataset_stores[element_datasets.value];
    let key = "usercreated_" + (nextCustomIndex++);

    let store = dataset_store.store;
    store.name += " (Copy)";
    fs.writeFileSync(cwd + "/dataset/" + key + ".json", JSON.stringify(store, null, "\t"));

    let element_option = document.createElement("option");
    dataset_stores[key] = new Store({"name": "dataset/" + key});
    element_option.value = key;
    element_option.innerText = store.name;
    element_datasets.appendChild(element_option);
    element_datasets.value = key;
    readDataset();
}

function removeDataset(e) {
    if ("default" === element_datasets.value)
        return;
    fs.unlinkSync(`${cwd}/dataset/${element_datasets.value}.json`);
    let idx = element_datasets.selectedIndex;
    element_datasets.remove(idx);
    idx = Math.max(idx - 1, 0);
    element_datasets.selectedIndex = idx;
    readDataset();
}

function toggleEdit(e) {
    let allowEdit = e.srcElement.checked;
    for (let element of document.getElementsByClassName("toggleEdit"))
        element.disabled = !allowEdit;
}

function removeSkill(e) {
    let row = e.srcElement.parentElement.parentElement;
    let tbody = row.parentElement;
    tbody.deleteRow(row.sectionRowIndex);
}

function addSkill(e) {
    let row = e.srcElement.parentElement.parentElement;
    let newRow = row.parentElement.insertRow(row.sectionRowIndex);
    populateSkillRow(newRow, null);
}

function populateSkillRow(row, skill) {
    let cell = row.insertCell();
    let button_move = document.createElement("button");
    button_move.textContent = "⭥";
    makeDragable(button_move);
    cell.appendChild(button_move);

    cell = row.insertCell();
    let name = document.createElement("input");
    name.type = "text";
    name.classList.add("toggleEdit");
    cell.appendChild(name);

    cell = row.insertCell();
    let characteristic = document.createElement("select");
    for (let char in Characteristic) {
        let option = document.createElement("option");
        option.value = option.innerText = Characteristic[char];
        characteristic.appendChild(option);
    }
    cell.appendChild(characteristic);

    cell = row.insertCell();
    let remove = document.createElement("button");
    remove.innerText = "Remove";
    remove.onclick = removeSkill;
    remove.classList.add("toggleEdit");
    cell.appendChild(remove);

    for (let e of [button_move, name, characteristic, remove]) {
        e.classList.add("toggleEdit");
        if (skill)
            e.disabled = true;
    }
    if (skill) {
        name.value = skill.name;
        characteristic.value = skill.characteristic;
    }
}

function addArchetype(e) {
    let row = e.srcElement.parentElement.parentElement;
    let newRow = row.parentElement.insertRow(row.sectionRowIndex);
    populateArchetypeRow(newRow, null);
}

function populateArchetypeRow(row, archetype_key, archetype) {
    let cell = row.insertCell();
    let button_move = document.createElement("button");
    button_move.textContent = "⭥";
    button_move.classList.add("toggleEdit");
    makeDragable(button_move);
    cell.appendChild(button_move);

    cell = row.insertCell();
    let innerTable = document.createElement("table");
    innerTable.classList.add("inner-table");
    cell.appendChild(innerTable);

    let topRow = innerTable.insertRow();
    cell = topRow.insertCell();
    let key = document.createElement("input");
    key.type = "text";
    key.placeholder = "Unique Key";
    cell.appendChild(key);
    let name = document.createElement("input");
    name.type = "text";
    name.placeholder = "Name";
    cell.appendChild(name);

    cell = topRow.insertCell();
    cell.rowSpan = 3;
    let ul = document.createElement("ul");
    ul.classList.add("archetype-config-list");
    cell.appendChild(ul);
    let li = document.createElement("li");
    li.innerHTML = "<b>Starting Wound Threshold:</b> ";
    let wounds = document.createElement("input");
    wounds.type = "number";
    li.appendChild(wounds);
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerHTML = "<b>Starting Strain Threshold:</b> ";
    let strain = document.createElement("input");
    strain.type = "number";
    li.appendChild(strain);
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerHTML = "<b>Starting Experience:</b> ";
    let xp = document.createElement("input");
    xp.type = "number";
    li.appendChild(xp);
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerHTML = "<b>Free Ranks in Career Skills:</b> ";
    let careerskills = document.createElement("input");
    careerskills.type = "number";
    careerskills.valueAsNumber = 4;
    li.appendChild(careerskills);
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerHTML = "<b>Starting Skills:</b> ";
    const dataset_skills = dataset_stores[element_datasets.value].get("skills");
    let skills = document.createElement("table").createTBody();
    let addSelectionFunc = function (skillSelection) {
        skills.insertBefore(wrapInRow(buildSkillSelectionConfiguration(dataset_skills, skillSelection)), skills.lastChild);
    };
    let addButton_skills = document.createElement("button");
    addButton_skills.innerText = "Add";
    addButton_skills.onclick = () => addSelectionFunc(null);
    skills.appendChild(wrapInRow(addButton_skills));
    li.appendChild(skills);
    ul.appendChild(li);

    li = document.createElement("li");
    li.innerHTML = "<b>Special Abilities:</b> ";
    let abilities = document.createElement("table").createTBody();
    let addAbilityFunc = function (ability) {
        abilities.insertBefore(buildAbilityConfiguration(ability), abilities.lastChild);
    };
    let addButton_abilities = document.createElement("button");
    addButton_abilities.innerText = "Add";
    addButton_abilities.onclick = () => addAbilityFunc(null);
    abilities.appendChild(wrapInRow(addButton_abilities));
    addButton_abilities.parentElement.colSpan = 3;
    li.appendChild(abilities);
    ul.appendChild(li);


    let bottomRow = innerTable.insertRow();
    bottomRow.classList.add("archetype-characteristics");
    let chars = [];
    for (let i = 0; i < characteristics.length; i++) {
        cell = bottomRow.insertCell();
        chars.push(document.createElement("input"));
        chars[i].type = "number";
        chars[i].min = 1;
        chars[i].max = 5;
        cell.appendChild(chars[i]);
        let label = document.createElement("label");
        label.innerText = characteristics[i].toUpperCase();
        cell.appendChild(chars[i]);
        cell.appendChild(label);
    }

    let allElements = [button_move, key, name, wounds, strain, xp, careerskills, addButton_skills, addButton_abilities];
    allElements = allElements.concat(chars);
    for (let e of allElements) {
        e.classList.add("toggleEdit");
        if (archetype)
            e.disabled = true;
    }
    if (archetype) {
        key.value = archetype_key;
        name.value = archetype.name;
        wounds.valueAsNumber = archetype.wound_threshold;
        strain.valueAsNumber = archetype.strain_threshold;
        xp.valueAsNumber = archetype.experience;
        careerskills.valueAsNumber = archetype.free_careerskills;
        for (let i = 0; i < characteristics.length; i++)
            chars[i].valueAsNumber = archetype.characteristics[i];
        for (let skillSelection of archetype.skills)
            addSelectionFunc(skillSelection);
        for (let ability of archetype.abilities)
            addAbilityFunc(ability);
    }
}

function readDataset() {
    console.log("reading selected dataset: " + element_datasets.value);
    let dataset_store = dataset_stores[element_datasets.value];
    console.log(dataset_store);

    let toggleEdit = document.getElementById("allow_dataset_edit");
    toggleEdit.checked = false;
    if ("default" === element_datasets.value) {
        element_button_save.disabled = element_button_remove.disabled = toggleEdit.disabled = true;
        element_button_save.title = toggleEdit.title = document.getElementById("label_allow_dataset_edit").title = "The default dataset can not be edited";
        element_button_remove.title = "The default dataset can not be removed";
    } else {
        element_button_save.disabled = element_button_remove.disabled = toggleEdit.disabled = false;
        element_button_save.title = element_button_remove.title = toggleEdit.title = document.getElementById("label_allow_dataset_edit").title = null;
    }

    document.getElementById("name").value = dataset_store.get("name");

    let element_skills = {};
    for (let cat in SkillCategory) {
        let table = document.getElementById("skills_" + cat.toLowerCase());
        while (table.rows.length > 2)
            table.deleteRow(1);
        element_skills[SkillCategory[cat]] = table;
    }

    for (let skill of dataset_store.get("skills")) {
        let table = element_skills[skill.category];
        let row = table.insertRow(table.rows.length - 1);
        populateSkillRow(row, skill);
    }

    let archetypes = dataset_store.get("archetypes");
    while (element_archetypes.rows.length > 1)
        element_archetypes.deleteRow(0);
    for (let archetype_key in archetypes) {
        let row = element_archetypes.insertRow(element_archetypes.rows.length - 1);
        populateArchetypeRow(row, archetype_key, archetypes[archetype_key]);
    }
}

function writeDataset() {
    console.log("writing selected dataset: " + element_datasets.value);
    let dataset_store = dataset_stores[element_datasets.value];

    let name = document.getElementById("name").value;
    dataset_store.set("name", name);
    element_datasets.options[element_datasets.selectedIndex].innerText = name;

    let element_skills = {};
    let skills = [];
    for (let cat in SkillCategory) {
        let table = document.getElementById("skills_" + cat.toLowerCase());
        for (let i = 1; i < table.rows.length - 1; i++) {
            let name = table.rows[i].cells[1].firstChild.value;
            let char = table.rows[i].cells[2].firstChild.value;
            console.log("saving skill " + name + ", " + char + " in " + SkillCategory[cat]);
            skills.push(new Skill(name, Characteristic[char], SkillCategory[cat]))
        }
    }
    dataset_store.set("skills", skills);


    let archetypes = {};
    let table = document.getElementById("archetypes");
    for (let i = 0; i < table.rows.length - 1; i++) {
        let innerTable = table.rows[i].cells[1].firstChild;
        let topRow = innerTable.rows[0];
        let key = topRow.cells[0].children[0].value;
        let name = topRow.cells[0].children[1].value;
        let ul = topRow.cells[1].firstChild;
        let wounds = ul.children[0].lastChild.valueAsNumber;
        let strain = ul.children[1].lastChild.valueAsNumber;
        let xp = ul.children[2].lastChild.valueAsNumber;
        let careerskills = ul.children[3].lastChild.valueAsNumber;
        let skillTable = ul.children[4].lastChild;
        let skillSelections = [];
        for (let j = 0; j < skillTable.rows.length - 1; j++)
            skillSelections.push(parseSkillSelectionConfiguration(skillTable.rows[j].cells[0].firstChild));
        let abilityTable = ul.children[5].lastChild;
        let abilities = [];
        for (let j = 0; j < abilityTable.rows.length - 1; j++)
            abilities.push(parseAbilityConfiguration(abilityTable.rows[j]));

        let bottomRow = innerTable.rows[1];
        let chars = [];
        for (let j = 0; j < bottomRow.cells.length; j++)
            chars[j] = bottomRow.cells[j].firstChild.valueAsNumber;

        archetypes[key] = new Archetype(name, chars, wounds, strain, xp, careerskills, skillSelections, abilities);
    }
    dataset_store.set("archetypes", archetypes);


}