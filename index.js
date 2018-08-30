const electron = require("electron");
const fs = require("fs");
const Store = require("electron-store");

const {Skill, Characteristic, SkillCategory, SkillSelection, SkillSelectionPredicate} = require("./js/skill");
const element_datasets = document.getElementById("datasets");

let cwd = (electron.app || electron.remote.app).getPath('userData');
if (!fs.existsSync(cwd + "/dataset")) {
    console.log("NO DATASET FOLDEEEEEEEEEEERRRRR!!!");
    fs.mkdirSync(cwd + "/dataset");
}
if (!fs.existsSync(cwd + "/dataset/default.json")) {
    console.log("NO DEFAULT DATASET!!!!");
    fs.writeFile(cwd + "/dataset/default.json", createDefaultDataset());
}
let files_dataset = fs.readdirSync(cwd + "/dataset");
for (let ds of files_dataset) {
    ds = ds.substring(0, ds.lastIndexOf("."));
    console.log(" adding dataset: " + ds);
    let element_option = document.createElement("option");
    const dataset_store = new Store({"name": "dataset/" + ds});
    element_option.value = ds;
    element_option.innerText = dataset_store.get("name");
    element_datasets.appendChild(element_option);
}
element_datasets.onchange = updateDataset;
updateDataset();

function updateDataset() {
    console.log("selected dataset: " + element_datasets.value);
    const dataset_store = new Store({"name": "dataset/" + element_datasets.value});

    let element_skills = document.getElementById("skills");
    while (element_skills.children.length > 1)
        element_skills.removeChild(element_skills.firstChild);
    for (let skill of dataset_store.get("skills")) {
        console.log("adding skill "+skill.name);

        let row = element_skills.insertRow(element_skills.rows.length - 1);
        let cell = row.insertCell();
        cell.innerHTML = `<input type="text" value="${skill.name}">`;

        cell = row.insertCell();
        let charactSelect = document.createElement("select");
        for (let char in Characteristic) {
            let option = document.createElement("option");
            option.value = option.innerText = Characteristic[char];
            charactSelect.appendChild(option);
        }
        charactSelect.value = skill.characteristic;
        cell.appendChild(charactSelect);

        cell = row.insertCell();
        let categSelect = document.createElement("select");
        for (let cat in SkillCategory) {
            let option = document.createElement("option");
            option.value = option.innerText = SkillCategory[cat];
            categSelect.appendChild(option);
        }
        categSelect.value = skill.category;
        cell.appendChild(categSelect);

        cell = row.insertCell();
        cell.innerHTML = "<button>Remove</button>"
    }
}