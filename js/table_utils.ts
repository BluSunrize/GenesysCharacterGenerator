export function makeDragable(dragElement: HTMLElement) {
    dragElement.classList.add("grab");
    dragElement.onmousedown = function (e) {
        let tr = <HTMLTableRowElement>dragElement.closest("TR");
        let oldIdx = tr.sectionRowIndex;
        let tbody = <HTMLTableSectionElement>tr.closest("TBODY");
        const sX = e.clientX;
        const sY = e.clientY;
        let drag = false;
        tr.classList.add("grabbed");
        document.body.classList.add("grab-cursor");

        function move(e) {
            if (!drag && Math.abs(e.clientY - sY) < 10)
                return;
            drag = true;
            let pointed = document.elementFromPoint(sX, e.clientY);
            if (pointed && pointed.classList.contains("grab")) {
                let pointedRow = <HTMLTableRowElement>pointed.closest("TR");
                if (pointedRow) {
                    let pIdx = pointedRow.sectionRowIndex;
                    if (pIdx >= 0 && pIdx < tbody.rows.length && tbody.rows[pIdx] === pointedRow)
                        tbody.insertBefore(tr, tbody.rows[pIdx < tr.sectionRowIndex ? pIdx : pIdx + 1]);
                }
            }
        }

        function up(e) {
            if (drag && oldIdx != tr.sectionRowIndex)
                drag = false;
            tr.classList.remove("grabbed");
            document.body.classList.remove("grab-cursor");
            document.onmousemove = null;
            document.onmouseup = null;
        }

        document.onmousemove = move;
        document.onmouseup = up;
    }
}

module.exports = {makeDragable};