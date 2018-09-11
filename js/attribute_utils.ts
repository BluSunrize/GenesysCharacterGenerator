export function attachOnChangeByName(name: string, onchange: any) {
    let elements = document.getElementsByName(name);
    for (let i = 0; i < elements.length; i++)
        if (elements[i] instanceof HTMLInputElement)
            (<HTMLInputElement>elements[i]).onchange = onchange;
        else if (elements[i] instanceof HTMLSelectElement)
            (<HTMLSelectElement>elements[i]).onchange = onchange;
}

export function attachOnChangeById(id: string, onchange: any) {
    let element = document.getElementById(id);
    if (element instanceof HTMLInputElement)
        (<HTMLInputElement>element).onchange = onchange;
    else if (element instanceof HTMLSelectElement)
        (<HTMLSelectElement>element).onchange = onchange;
}


export function setNamedAttribute(name: string, value: any) {
    let elements = document.getElementsByName(name);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i] instanceof HTMLInputElement) {
            if ((<HTMLInputElement>elements[i]).type == "checkbox")
                (<HTMLInputElement>elements[i]).checked = value;
            else
                (<HTMLInputElement>elements[i]).value = value;
        }
        else if (elements[i] instanceof HTMLSpanElement)
            (<HTMLSpanElement>elements[i]).innerText = value;
        else if (elements[i] instanceof HTMLLabelElement)
            (<HTMLLabelElement>elements[i]).innerText = value;
        else if (elements[i] instanceof HTMLTextAreaElement)
            (<HTMLTextAreaElement>elements[i]).innerText = value;
        else if (elements[i] instanceof HTMLSelectElement) {
            if (typeof value == 'number')
                (<HTMLSelectElement>elements[i]).selectedIndex = value;
            else
                for (let j = 0; j < (<HTMLSelectElement>elements[i]).options.length; j++)
                    if ((<HTMLOptionElement>(<HTMLSelectElement>elements[i]).options[j]).value === value) {
                        (<HTMLSelectElement>elements[i]).selectedIndex = j;
                        break;
                    }
        }
    }
}

export function getNamedAttribute(name: string) {
    let elements = document.getElementsByName(name);
    let val;
    for (let i = 0; i < elements.length; i++) {
        let thisVal;
        if (elements[i] instanceof HTMLInputElement) {
            if ((<HTMLInputElement>elements[i]).type == "checkbox")
                thisVal = (<HTMLInputElement>elements[i]).checked;
            else if ((<HTMLInputElement>elements[i]).type == "number" || (<HTMLInputElement>elements[i]).type == "range")
                thisVal = (<HTMLInputElement>elements[i]).valueAsNumber;
            else
                thisVal = (<HTMLInputElement>elements[i]).value;
        }
        else if (elements[i] instanceof HTMLSpanElement)
            thisVal = (<HTMLSpanElement>elements[i]).innerText;
        else if (elements[i] instanceof HTMLTextAreaElement)
            thisVal = (<HTMLTextAreaElement>elements[i]).innerText;
        else if (elements[i] instanceof HTMLSelectElement)
            thisVal = (<HTMLSelectElement>elements[i]).value;
        if (val && thisVal !== val)
            console.log("mismatching data for field " + name + ", " + thisVal + " instead of " + val);
        else
            val = thisVal
    }
    return val;
}

export function setIDedAttribute(id: string, value: any) {
    let element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        if ((<HTMLInputElement>element).type == "checkbox")
            (<HTMLInputElement>element).checked = value;
        else
            (<HTMLInputElement>element).value = value;
    }
    else if (element instanceof HTMLSpanElement)
        (<HTMLSpanElement>element).innerText = value;
    else if (element instanceof HTMLLabelElement)
        (<HTMLLabelElement>element).innerText = value;
    else if (element instanceof HTMLTextAreaElement)
        (<HTMLTextAreaElement>element).innerText = value;
    else if (element instanceof HTMLSelectElement) {
        if (typeof value == 'number')
            (<HTMLSelectElement>element).selectedIndex = value;
        else
            for (let j = 0; j < (<HTMLSelectElement>element).options.length; j++)
                if ((<HTMLOptionElement>(<HTMLSelectElement>element).options[j]).value === value) {
                    (<HTMLSelectElement>element).selectedIndex = j;
                    break;
                }
    }
}

export function getIDedAttribute(id: string) {
    let element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
        if ((<HTMLInputElement>element).type == "checkbox")
            return (<HTMLInputElement>element).checked;
        else if ((<HTMLInputElement>element).type == "number" || (<HTMLInputElement>element).type == "range")
            return (<HTMLInputElement>element).valueAsNumber;
        else
            return (<HTMLInputElement>element).value;
    }
    else if (element instanceof HTMLSpanElement)
        return (<HTMLSpanElement>element).innerText;
    else if (element instanceof HTMLTextAreaElement)
        return (<HTMLTextAreaElement>element).innerText;
    else if (element instanceof HTMLSelectElement)
        return (<HTMLSelectElement>element).value;
    return null;
}

export function syncAttributesFromObject(prefix: string, object: object) {
    let inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++)
        if (inputs[i].id.indexOf(prefix) === 0) {
            let key = inputs[i].id.substr(prefix.length);
            if ((<HTMLInputElement>inputs[i]).type == "number" || (<HTMLInputElement>inputs[i]).type == "range") {
                if (object[key])
                    (<HTMLInputElement>inputs[i]).valueAsNumber = object[key];
                else
                    (<HTMLInputElement>inputs[i]).valueAsNumber = parseInt((<HTMLInputElement>inputs[i]).min) || 0;
            }
            else if (object[key])
                (<HTMLInputElement>inputs[i]).value = object[key];
            else
                (<HTMLInputElement>inputs[i]).value = "";
        }

    let textAreas = document.getElementsByTagName("textarea");
    for (let i = 0; i < textAreas.length; i++)
        if (textAreas[i].id.indexOf(prefix) === 0) {
            let key = textAreas[i].id.substr(prefix.length);
            if (object[key])
                (<HTMLTextAreaElement>textAreas[i]).innerText = object[key];
            else
                (<HTMLTextAreaElement>textAreas[i]).innerText = "";
        }

    let selections = document.getElementsByTagName("select");
    for (let i = 0; i < selections.length; i++)
        if (selections[i].id.indexOf(prefix) === 0) {
            let key = selections[i].id.substr(prefix.length);
            if (object[key])
                (<HTMLSelectElement>selections[i]).value = object[key];
            else
                (<HTMLSelectElement>selections[i]).selectedIndex = 0;
        }
}

export function syncAttributesToObject(prefix: string, object: object) {
    let inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++)
        if (inputs[i].id.indexOf(prefix) === 0) {
            let key = inputs[i].id.substr(prefix.length);
            if ((<HTMLInputElement>inputs[i]).type == "number" || (<HTMLInputElement>inputs[i]).type == "range")
                object[key] = (<HTMLInputElement>inputs[i]).valueAsNumber;
            else
                object[key] = (<HTMLInputElement>inputs[i]).value;
        }

    let textAreas = document.getElementsByTagName("textarea");
    for (let i = 0; i < textAreas.length; i++)
        if (textAreas[i].id.indexOf(prefix) === 0) {
            let key = textAreas[i].id.substr(prefix.length);
            object[key] = (<HTMLTextAreaElement>textAreas[i]).innerText;
        }

    let selections = document.getElementsByTagName("select");
    for (let i = 0; i < selections.length; i++)
        if (selections[i].id.indexOf(prefix) === 0) {
            let key = selections[i].id.substr(prefix.length);
            object[key] = (<HTMLSelectElement>selections[i]).value;
        }
}