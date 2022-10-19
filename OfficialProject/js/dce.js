var margin = {
    top: 30,
    right: 10,
    bottom: 30,
    left: 60
  },
  width = 460 + margin.left + margin.right,
  height = 400 - margin.top - margin.bottom;

var reset = false;
var color = d3.scaleOrdinal(d3.schemeCategory10);
var sizeSquare = 10

// Gene Scatterplot
var svg = d3.select("#genescatter")
  .append("svg")
  .attr("width", (width + margin.left))
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.top + "," + margin.top + ")");

// Parallel Coordinates
var prl = d3.select("#parallel")
  .append("svg")
  .attr("width", (width + (margin.left * 2 + margin.top * 2)))
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + -(margin.left - margin.right * 2) + "," + margin.top + ")");

d3.csv("./dataset/pca_attaccanti_official.csv", function (data) {

  /////////////////////////////////////////////////////
  //////////////  GENE VIEW SECTION  //////////////////
  /////////////////////////////////////////////////////

  //data = data.filter(function(d,i){ return filter.indexOf(d.id) >= 0 })

  var x = d3.scaleLinear()
    .domain([d3.min(data, function (d) {
        return parseFloat(d.pc1);
      }) - 0.5,
      d3.max(data, function (d) {
        return parseFloat(d.pc1);
      }) + 0.5
    ])
    .range([0, width]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([d3.min(data, function (d) {
        return parseFloat(d.pc2);
      }) - 1,
      d3.max(data, function (d) {
        return parseFloat(d.pc2);
      }) + 1
    ])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  // // var color = d3.scaleOrdinal()
  // //         .domain(["0","1","2", "3"])
  // //         .range(["#F8766D","black","#619CFF", "#EDEDED"])

  // var color = d3.scaleOrdinal(d3.schemeCategory10);

  var myCircle = svg.append('g')
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return "circle" + d["ID"]
    })
    .attr("cx", function (d) {
      return x(d.pc1);
    })
    .attr("cy", function (d) {
      return y(d.pc2);
    })
    .attr("r", 4)
    .style("fill", function (d) {
      return color(d.Position)
    })
    .style("opacity", 0.5)

    var legend = svg.selectAll(".legend-scatter")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-scatter")
    .attr("transform", function (d, i) {
      return "translate(0," + (i * sizeSquare * 2) + ")"
    })
    .append("rect")
    .attr("x", width - (0.1 * width))
    .attr("width", sizeSquare)
    .attr("height", sizeSquare)
    .style("fill", function (d) {
      console.log(d);
      return color(d);
    });

  d3.selectAll(".legend-scatter").append("text")
    .attr("class", "legendText-scatter")
    .attr("x", width)
    .attr("y", sizeSquare / 2)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function (d) {
      if (d == 2) {
        d = "GK";
      } else if (d == 0) {
        d = "DEF";
      } else if (d == 3) {
        d = "MID";
      } else if (d == 1) {
        d = "FWD"
      }
      return d
    });

  //brushing
  svg.call(d3.brush()
    .extent([
      [0, 0],
      [width, height]
    ])
    // .on("start brush",updateChart)
    .on("end brush", updateChart)
  )

  table(data)

  var x0 = 0,
    x1 = 0,
    y0 = 0,
    y1 = 0,
    foreground, ScatterplotBrushList = [],
    parallelBrushList = [],
    parallelData = [],
    scatterData = [],
    extent, extentP = 0;

  function updateChart() {
    extent = d3.event.selection;
    myCircle.classed('selected', false) //initially unselect all circles
    myCircle.classed('intersected', false) //unselect all intersected cirlces
    foreground.style("stroke", "steelblue"); //function(d) {return prlcolor(d.Position)}) //set the stroke of lines as default
    ScatterplotBrushList = []
    databrush = data.filter(function (d) {
      return x0 <= x(d.pc1) && x(d.pc1) <= x1 && y0 <= y(d.pc2) && y(d.pc2) <= y1;
    });
    databrush.forEach(d => {
      ScatterplotBrushList.push(d["ID"]) //add the id of selected circles into scatterplot list
    })
    scatterData = databrush; //set scatterplot data as the selected data
    intersectionOfBrush(extent, extentP, ScatterplotBrushList, parallelBrushList) //call the hightlight on intersection function
    myCircle.classed("selected", function (d) {
      let result = isBrushed(extent, x(d.pc1), y(d.pc2))
      return result
    });
  }

  //hightlight on intersection function
  function intersectionOfBrush(extentScatter, extentParallel, SPList, PCList) {
    foreground.style("stroke", "steelblue"); //function(d) {return prlcolor(d.Position)}) //set the stroke of lines as default
    myCircle.classed('intersected', false) //unselect all intersected cirlces

    const filteredArray = SPList.filter(value => PCList.includes(value)); //filter data ids based on intersecting data ids from both scatterplot and parallel coordinate chart
    console.log("here");

    if ((extentScatter === null)) {
      if (reset) {
        PCList.forEach(d => {
          d3.select('.circle' + d).classed('intersected', false).raise() //set the class of intersected circle as true (the css for intersected class is added in style.css file)
        })
        console.log("here1");
        reset = false;
      } else {
        console.log("here2");
        PCList.forEach(d => {
          d3.select('.circle' + d).classed('intersected', true).raise()
        })
      }
      if (parallelData.length == 0)
        table(data)
      else
        table(parallelData)
    } else if (extentScatter == undefined || (extentScatter[0][0] === extentScatter[1][0] && extentScatter[0][1] === extentScatter[1][1])) {
      //SPERIMENTAL
      if (reset) {
        PCList.forEach(d => {
          d3.select('.circle' + d).classed('intersected', false).raise()
        })
        reset = false;
      }
      //SPERIMENTALEND
      else {
        PCList.forEach(d => {
          d3.select('.circle' + d).classed('intersected', true).raise()
        })
      }
      //if you want to create table based on parallel selected data, set the perimeter as 
      table(parallelData)

    } else if (extentParallel == 0) {
      SPList.forEach(d => {
        d3.select('.foreground' + d).style("stroke", 'red').raise() //set the stroke of selected line as red
        d3.select('.foreground' + d).raise();
      })
      parallelBrushList = [];
      parallelData = [];
      // if you want to create table based on scatterplot selected data, set the perimeter as 
      table(scatterData)



    } else {
      filteredArray.forEach(d => {
        d3.select('.foreground' + d).style("stroke", 'red').raise(); //set the stroke of selected line as red
        d3.select('.circle' + d).classed('intersected', true) //set the class of intersected circle as true (the css for intersected class is added in style.css file)
      })
      const filteredDataArray = parallelData.filter(value => scatterData.includes(value)); //filter data based on intersecting data from both scatterplot and parallel coordinate chart
      table(filteredDataArray) //create table
    }
  }


  // function to create table
  function table(data) {
    d3.selectAll("thead").remove();
    d3.selectAll("tbody").remove()

    var columns = ["Name", "Club", "BestPosition"] //select columns to display
    var table = d3.select("div table")
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
      .selectAll('th')
      .data(columns)
      .enter()
      .append('th')
      .text(function (d) {
        return d
      })

    var rows = tbody.selectAll('tr')
      .data(data)
      .enter()
      .append('tr')

    rows.selectAll('td')
      .data(function (row) {
        return columns.map(function (column) {
          return {
            column: column,
            value: row[column]
          }
        })
      })
      .enter()
      .append('td')
      .text(function (d) {
        return d.value
      })
  }



  function isBrushed(brush_coords, cx, cy) {
    x0 = brush_coords[0][0]
    x1 = brush_coords[1][0]
    y0 = brush_coords[0][1]
    y1 = brush_coords[1][1]

    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  }

  ////////////////////////////////////////////////////////////////
  //////////////  PARALLEL COORDINATE  SECTION  //////////////////
  ////////////////////////////////////////////////////////////////

  var myparallelReset = document.getElementById('parallelReset');

  myparallelReset.onclick = function () {
    d3.selectAll(".brush").remove();
    g.append("g")
      .attr("class", "brush")
      .each(function (d) {
        d3.select(this).call(py[d].brush = d3.brushY()
          .extent([
            [-10, 0],
            [10, height]
          ])
          .on("brush", brush)
          .on("end", brush)
        )
      })
    g.selectAll("rect")
      .attr("x", -8)
      .attr("width", 16)
    reset = true;
    brush()

  }

  var dimensions = d3.keys(data[0]).filter(function (d) {
    return /*d == "pc1" || d == "pc2" ||*/ d == "Finishing" || d == "Penalties" || d == "HeadingAccuracy" || d == "ShotPower" || d == "Position" || d == "FKAccuracy" || d == "Dribbling" || d == "BallControl"
  })
  // console.log(dimensions)
  var px = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  var py = {};
  // var c = {};
  // c["BestPosition"] =  d3.map(data, function(d){return(d.BestPosition)}).keys().sort()

  for (i in dimensions) {
    dname = dimensions[i]
    // if (dname == "BestPosition") {
    //   py[dname] = d3.scalePoint()
    //   .domain(c[dname])     
    //   .range([height, 0])
    // } else {
    py[dname] = d3.scaleLinear()
      .domain(d3.extent(data, function (d) {
        return +d[dname];
      }))
      .range([height, 0])
    //}
  }

  // var prlcolor = d3.scaleOrdinal()
  //     .domain(["0","1","2", "3"])
  //     .range(["#F8766D","#808080","#619CFF", "#EDEDED"]);

  var prlcolor = d3.scaleOrdinal(d3.schemeCategory10);

  // Extract the list of dimensions and create a scale for each.
  var axis = d3.axisLeft(),
    background,
    parallelChart = false;


  // Add grey background lines for context.
  background = prl.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = prl.append("g")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("class", function (d) {
      return "foreground" + d["ID"]
    })
    .attr("d", path)

  foreground.style("stroke", "steelblue") //function(d) {return prlcolor(d.Position)})
    .style("fill", "none")


  // Add a group element for each dimensions
  const g = prl.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function (d) {
      return "translate(" + ((px(d) * 1.5)) + ")"
    });

  // Add an axis and title.
  g.append("g")
    .attr("class", "axis")
    .each(function (d) {
      var renderAxis = d == "FDR" ?
        axis.scale(py[d]) // custom 
        :
        axis.scale(py[d]); // default 
      d3.select(this).call(renderAxis)
    })
    .append("text")
    .attr("style", "text-anchor: middle; fill: black;")
    .attr("y", -9)
    .attr("class", "parallelColumnDescription")
    .text(function (d) {
      return d;
    });

  // Add and store a brush for each axis.
  g.append("g")
    .attr("class", "brush")
    .each(function (d) {
      d3.select(this).call(py[d].brush = d3.brushY()
        .extent([
          [-10, 0],
          [10, height]
        ])
        .on("brush", brush)
        .on("end", brush)
      )
    })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16)

  // Returns the path for a given data point.
  function path(d) {
    return d3.line()(dimensions.map(function (p) {
      return [((px(p) * 1.5)), py[p](d[p])];
    }));
  }
  // Handles a brush event, toggling the display of foreground lines.    
  function brush() {
    parallelBrushList = []
    var actives = [];
    prl.selectAll(".brush")
      .filter(function (d) {
        py[d].brushSelectionValue = d3.brushSelection(this);
        return d3.brushSelection(this);
      })
      .each(function (d) {
        // Get extents of brush along each active selection axis (the Y axes)
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this).map(py[d].invert)
        });
      });
    var selected = [];
    // console.log(actives)

    // Update foreground to only display selected values
    foreground.style("display", function (d) {
      let isActive = actives.every(function (active) {
        let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
        // d3.selectAll('.circle'+d[""]).classed('selected' , result)
        return result;
      });
      // console.log('extent' , d3.brushSelection(this))
      if (actives.length != 0)
        extentP = actives[0].extent
      // else if(actives.length == 0)
      // extentP = -1;
      else
        extentP = 0;


      // When no selectors are active, all data should be visible.
      isActive = (actives.length == 0) ? true : isActive;

      // Only render rows that are active across all selectors      
      if (isActive) {
        selected.push(d)
        parallelBrushList.push(d["ID"])
      }; //add id of selected lines into parallel brush list
      parallelData = selected; //set the parallel data as the selected data

      return (isActive) ? null : "none";
    });
    // console.log(extentP)
    //call intersection functions
    intersectionOfBrush(extent, extentP, ScatterplotBrushList, parallelBrushList)
  }
})