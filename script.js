let calcType = 1

const radioHeader = document.getElementsByClassName("select-1")
const radioBody = document.getElementsByClassName("select-2")

for (let i = 0; i < radioHeader.length; i++) {
    radioHeader[i].addEventListener('change', function () {
        let el = document.getElementById("wrapper-" + this.value)
        document.getElementById("wrapper-1").classList.remove("active")
        document.getElementById("wrapper-2").classList.remove("active")
        el.classList.add("active")
        calcType = this.value
    })
}

for (let i = 0; i < radioBody.length; i++) {
    radioBody[i].addEventListener('change', function () {
        let el = document.getElementById("body-input-" + this.value)
        document.getElementById("body-input-1").classList.remove("active")
        document.getElementById("body-input-2").classList.remove("active")
        el.classList.add("active")
        calcType = this.value
    })
}

let word = ""
let alphabet = []
let chance = []
let code = []

document.getElementById("submit").addEventListener('click', function () {
    word = ""
    alphabet = []
    chance = []
    code = []

    const alp1 = document.getElementById("input-value-1")
    const alp2 = document.getElementById("input-value-2")
    const chan = document.getElementById("input-value-3")

    if (calcType == 1) {
        parseString(alp1.value.toUpperCase())
        parseUnique()
        getChance()
        alp1.value = word
    } else {
        parseString(alp2.value.toUpperCase())
        parseUnique()
        parseChance(chan.value)
        alp2.value = alphabet.join('')
    }

    generateCode()
    generateTable()
})

function keepUniqueCharacters(str) {
    let uniqueChars = '';
    for (let i = 0; i < str.length; i++) {
        if (uniqueChars.indexOf(str[i]) === -1) {
            uniqueChars += str[i];
        }
    }
    return uniqueChars;
}

function getCountCharacters(str, c) {
    let count = 0
    for (let i = 0; i < str.length; i++) {
        if (str[i] == c) {
            count++
        }
    }
    return count
}

function parseString(s) {
    word = s.replace(/[^a-zA-Z]/gi, '').replaceAll(' ', '')
}

function parseUnique() {
    let distinct = keepUniqueCharacters(word)
    for (let i = 0; i < distinct.length; i++) {
        alphabet.push(distinct[i])
    }
}

function getChance() {
    for (let i = 0; i < alphabet.length; i++) {
        let ch = getCountCharacters(word, alphabet[i])
        chance.push(ch / word.length)
    }
}

function parseChance(s) {
    let filtered = s.replace(/[^0-9.' ']/gi, '')

    let val = ""
    for (let i = 0; i < filtered.length; i++) {
        if (val == "" && filtered[i] == ' ') {
            continue
        }
        val += filtered[i]
        if (filtered[i] == ' ') {
            chance.push(Number(val) / 100)
            val = ""
        }
        if (i == filtered.length - 1) {
            chance.push(Number(val) / 100)
        }
    }
}

function generateCode() {
    let input = []
    let structure = []

    for (let i = 0; i < alphabet.length; i++) {
        input.push({
            symbol: alphabet[i],
            chance: chance[i]
        })
    }

    input.sort((a, b) => b.chance - a.chance)

    // Рекурсивна функція, яка знаходить коди символів та виводить структуру бінарного дерева у консоль
    function recursive(start, end, level = 0, parent = null, isLeftChild = false) {
        // Випадок, коли залишилась лише одна літера
        if (start === end) {
            const node = { symbol: alphabet[start], code: "", chance: chance[start], level: level, parent: parent, isLeftChild: isLeftChild };
            structure.push(node);
            return [node];
        }

        // Розрахунок суми ймовірностей у підмасиві
        const sum = chance.slice(start, end + 1).reduce((a, b) => a + b);

        // Розрахунок оптимального розділу
        let temp = 0;
        let index = -1;

        for (let i = start; i <= end; i++) {
            temp += chance[i];
            const diff = Math.abs(sum - 2 * temp);

            if (index === -1 || diff < smallestDiff) {
                index = i;
                smallestDiff = diff;
            }
        }

        // Рекурсивний виклик для лівого та правого підмасивів
        const left = recursive(start, index, level + 1, alphabet[index], true);
        const right = recursive(index + 1, end, level + 1, alphabet[index], false);

        // Додавання префіксу до кодів лівого та правого підмасивів
        left.forEach(item => (item.code = "0" + item.code));
        right.forEach(item => (item.code = "1" + item.code));

        // Об'єднання двох підмасивів та повернення результату
        return left.concat(right);
    }

    const codes = recursive(0, input.length - 1)
    console.log(codes)
    codes.forEach((item) => {
        let index = alphabet.indexOf(item.symbol)
        code[index] = item.code
    })

    const tree = generateTreeData(structure)
    if (tree == null) return;
    console.log(JSON.stringify(tree)) 
    drawTree({width: 1000, height: 600, padding: 50, treeData: tree})
} 

function generateTreeData(inpData) {
    let groups = []
    let parents = []

    for (let i = 0; i < inpData.length; i++) {
        if (!parents.includes(inpData[i].parent)) {
            groups.push({
                parent: inpData[i].parent,
                level: inpData[i].level,
                chance: 0,
                children: []
            })
            parents.push(inpData[i].parent)
        }
        let indx = parents.indexOf(inpData[i].parent)
        groups[indx].children.push(inpData[i])
        groups[indx].chance += inpData[i].chance
    }

    let groupss = [...groups]

    for (let i = 0; i < groupss.length; i++) {
        if (groupss[i].level > 2) {
            groupss.push({
                parent: (groupss[i].parent).concat(groupss[i + 1].parent),
                level: groupss[i].level - 1,
                chance: groupss[i].chance + groupss[i + 1].chance,
                children: [
                    groupss[i],
                    groupss[i + 1]
                ]
            })
            parents.push((groupss[i].parent).concat(groupss[i + 1].parent))

            groupss[i] = null
            groupss[i + 1] = null
            i++
        }
    }

    let clearData = []
    for (let i = 0; i < groupss.length; i++) {
        if (groupss[i] != null) {
            clearData.push(groupss[i])
        }
    }

    if (clearData.length == 1) {
        clearData[0].level = 1
        return clearData[0]
    }
    else if (clearData.length == 2) {
        return {
            parent: (clearData[0].parent).concat(clearData[1].parent),
            level: 1,
            chance: clearData[0].chance + clearData[1].chance,
            children: [
                clearData[0],
                clearData[1]
            ]
        }
    }
    else if (clearData.length == 3) {
        clearData[1].parent.concat(clearData[2].parent)
        clearData[1].chance += clearData[2].chance
        clearData[1].children.push(clearData[2])
        return {
            parent: (clearData[0].parent).concat(clearData[1].parent),
            level: 1,
            chance: clearData[0].chance + clearData[1].chance,
            children: [
                clearData[0],
                clearData[1]
            ]
        }
    }
    return null
}

function generateTable() {
    const table = document.getElementById("table")

    table.removeChild(table.getElementsByTagName("tbody")[0])
    table.appendChild(document.createElement("tbody"))

    const tbody = document.getElementById("table").getElementsByTagName("tbody")[0]

    let sum = 0
    for (let i = 0; i < chance.length; i++) {
        sum += chance[i]
    }

    if (sum > 0.9 && sum < 1.001) {
        for (let i = 0; i < alphabet.length; i++) {
            let row = tbody.insertRow()
            let cell1 = row.insertCell(0)
            let cell2 = row.insertCell(1)
            let cell3 = row.insertCell(2)
            let cell4 = row.insertCell(3)
            cell1.innerHTML = i
            cell2.innerHTML = alphabet[i]
            cell3.innerHTML = chance[i]
            cell4.innerHTML = code[i]
        }
    }
}


// ************** Generate the tree diagram  *****************

function drawTree(o) {
    d3.select("#body-input-2").select("svg").remove() 

    var viz = d3.select("#body-input-2")
        .append("svg")
        .attr("width", o.width)
        .attr("height", o.height)  

    var vis = viz.append("g")
        .attr("id","treeg")
        .attr("transform", "translate("+ o.padding +","+ o.padding +")") 

    var tree = d3.layout.tree()
        .size([o.width - (2 * o.padding), o.height - (2 * o.padding)]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });

    var nodes = tree.nodes(o.treeData);

    var link = vis.selectAll("pathlink")
        .data(tree.links(nodes)).enter()
        .append("path")
        .attr("class", "link")
        .attr("d", diagonal)

    var node = vis.selectAll("g.node")
        .data(nodes).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    node.append("circle")
        .attr("r", 25)
        .style("fill", function(d) { return (d.children) ? "#ED3024" : "#3137C9" });

    node.append("svg:text")
        .attr("dx", 0)
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .style("fill", "white").text(function(d) { return (d.children) ? d.chance : d.symbol; })
}
