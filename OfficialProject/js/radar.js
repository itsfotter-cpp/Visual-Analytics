window.onload = loadPlayerCSV;

function loadPlayerCSV() {
    var playerDiv = document.getElementById("playerBox");

    d3.csv("dataset/top_300_RadarAttribute.csv", function (error, data) {
        var playerSet = new Set();

        data.forEach(function (d) {
            playerSet.add(d.Name);
        })

        const lastIndexGK = data.findLastIndex((obj) => obj.BestPosition === "GK");
        const lastIndexDEF = data.findLastIndex((obj) => obj.BestPosition === "DEF");
        const lastIndexMID = data.findLastIndex((obj) => obj.BestPosition === "MID");

        var counter = 0;

        playerSet.forEach(function (n) {

            var div = document.createElement("div");
            div.setAttribute("id", "div" + n.replace(/ /g, '').replace(".", ""));
            div.setAttribute("class", "form-check");

            var box = document.createElement("input");
            box.setAttribute("class", "form-check-input");
            box.setAttribute("type", "checkbox");
            box.setAttribute("name", "playerRadio");
            box.setAttribute("value", n);
            box.setAttribute("onClick", "selectPlayer(" + "this" + ")");

            var label = document.createElement("label");
            label.setAttribute("class", "form-check-label");
            label.innerHTML = n;

            if(counter == 0) {
                var GKheader = document.createElement("h3");
                GKheader.setAttribute("class", "py-3 mt-1 text-center");
                GKheader.setAttribute("style", "background: rgb(132, 163, 193); border-radius: 10px; color: white; position: sticky; top: 0;")
                GKheader.innerHTML = "GOALKEEPER";
                playerDiv.appendChild(GKheader);
            }

            if(counter == lastIndexGK+1) {
                var DEFheader = document.createElement("h3");
                DEFheader.setAttribute("class", "py-3 mt-2 text-center");
                DEFheader.setAttribute("style", "background: rgb(132, 163, 193); border-radius: 10px; color: white; position: sticky; top: 0;")
                DEFheader.innerHTML = "DEFENDER";
                playerDiv.appendChild(DEFheader);
            }

            if(counter == lastIndexDEF+1) {
                var MIDheader = document.createElement("h3");
                MIDheader.setAttribute("class", "py-3 mt-2 text-center");
                MIDheader.setAttribute("style", "background: rgb(132, 163, 193); border-radius: 10px; color: white; position: sticky; top: 0;")
                MIDheader.innerHTML = "MIDFIELDER";
                playerDiv.appendChild(MIDheader);
            }

            if(counter == lastIndexMID+1) {
                var FWDheader = document.createElement("h3");
                FWDheader.setAttribute("class", "py-3 mt-2 text-center");
                FWDheader.setAttribute("style", "background: rgb(132, 163, 193); border-radius: 10px; color: white; position: sticky; top: 0;")
                FWDheader.innerHTML = "FORWARDER";
                playerDiv.appendChild(FWDheader);
            }

            playerDiv.appendChild(div);
            div.appendChild(box);
            div.appendChild(label);

            counter++

        })
    })
}

function findLastIndex(array, searchKey, searchValue) {
    var index = array.slice().reverse().findIndex(x => x.BestPosition === searchValue);
    var count = array.length - 1
    var finalIndex = index >= 0 ? count - index : index;
    return finalIndex;
  }

function searchPlayer() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchPlayerInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("playerBox");
    li = ul.getElementsByTagName('input');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
        a = li[i].value;
        if (a.toUpperCase().indexOf(filter) > -1) {
            document.getElementById("div" + a.replace(/ /g, '').replace(".", "")).style.display = "";
        } else {
            document.getElementById("div" + a.replace(/ /g, '').replace(".", "")).style.display = "none";
        }
    }
}

var selectedPlayer = new Set();
var radarSet = new Set();

function selectPlayer(player) {
    //var textArea = document.getElementById("data");

    if (validateSelectionPlayers(player)) {
        if (player.checked) {
            selectedPlayer.add(player.value)
        } else {
            selectedPlayer.delete(player.value)
        }

        if (selectedPlayer.size != 0) {
            d3.csv("dataset/top_300_RadarAttribute.csv", function (error, data) {

                data.forEach(function (d) {
                    if (selectedPlayer.has(d.Name)) {

                        radarSet.add(d);
                    }
                })

                showRadar(radarSet)
                radarSet.clear();

            })
        } else {
            var arr = [{
                className: "",
                axes: [{
                        axis: ["Crossing"],
                        value: 0,
                        x: 0,
                        y: 0
                    },
                    {
                        axis: ["Finishing"],
                        value: 0,
                        x: 0,
                        y: 0
                    },
                    {
                        axis: ["HeadingAccuracy"],
                        value: 0,
                        x: 0,
                        y: 0
                    },
                    {
                        axis: ["Acceleration"],
                        value: 0,
                        x: 0,
                        y: 0
                    },
                    {
                        axis: ["GKReflexes"],
                        value: 0,
                        x: 0,
                        y: 0
                    },
                    {
                        axis: ["DefensiveAwareness"],
                        value: 0,
                        x: 0,
                        y: 0
                    }
                ]
            }];

            RadarChart.defaultConfig.radius = 3;
            RadarChart.defaultConfig.w = 350;
            RadarChart.defaultConfig.h = 350;

            RadarChart.draw("#chart-container", arr);

            if (flagSwitch) {
                var valDesc = document.querySelectorAll(".valueDescription");

                for (let index = 0; index < valDesc.length; index++) {
                    // newTick[index].firstChild.setAttribute("stroke", "#FFF");
                    valDesc[index].setAttribute("fill", "#FFF");

                }
            }
        }
    }
}

function validateSelectionPlayers(player) {
    var checkboxes = document.getElementsByName("playerRadio");
    var numberOfCheckedItems = 0;
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            numberOfCheckedItems++;
        }
    }

    if (numberOfCheckedItems > 3) {
        player.checked = false;
        alert("You cannot select more than 3 players for the comparison!");
        return false;
    } else {
        return true;
    }

}

function showRadar(radarSet) {
    var arr = [
        ["Name", "Crossing", "Finishing", "HeadingAccuracy", "Acceleration", "GKReflexes",
            "DefensiveAwareness"
        ]
    ];
    radarSet.forEach(function (r) {

        delete r["ID"];
        delete r["Nationality"];
        delete r["Overall"];
        delete r["BestPosition"];
        arr.push(Object.values(r))
    })

    var data = [];
    var chart = RadarChart.chart();

    var w = 350,
        h = 350
    headers = []
    arr.forEach(function (item, i) {
        if (i == 0) {
            headers = item;
        } else {
            newSeries = {};
            item.forEach(function (v, j) {
                if (j == 0) {
                    newSeries.className = v;
                    newSeries.axes = [];
                } else {
                    newSeries.axes.push({
                        "axis": [headers[j]],
                        "value": parseFloat(v)
                    });
                }
            });
            data.push(newSeries);
        }
    })

    RadarChart.defaultConfig.radius = 3;
    RadarChart.defaultConfig.w = w;
    RadarChart.defaultConfig.h = h;
    RadarChart.draw("#chart-container", data);

    function animate(elem, time) {
        if (!elem) return;
        var to = elem.offsetTop;
        var from = window.scrollY;
        var start = new Date().getTime(),
            timer = setInterval(function () {
                var step = Math.min(1, (new Date().getTime() - start) / time);
                window.scrollTo(0, (from + step * (to - from)) + 1);
                if (step == 1) {
                    clearInterval(timer);
                };
            }, 25);
        window.scrollTo(0, (from + 1));
    }

    var divVal = document.getElementById('chart-container');
    animate(divVal, 600);

    if (flagSwitch) {
        var valDesc = document.querySelectorAll(".valueDescription");
  
        for (let index = 0; index < valDesc.length; index++) {
            // newTick[index].firstChild.setAttribute("stroke", "#FFF");
            valDesc[index].setAttribute("fill", "#FFF");
  
        }
    }

}

