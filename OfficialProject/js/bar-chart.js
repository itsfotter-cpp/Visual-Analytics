  // set the dimensions and margins of the graph
  var margin_bar = {
          top: 30,
          right: 30,
          bottom: 70,
          left: 60
      },
      width_bar = 460 - margin_bar.left - margin_bar.right + 350,
      height_bar = 400 - margin_bar.top - margin_bar.bottom,
      adjust = 30

  var colorScaleBar = d3.scaleOrdinal(d3.schemeCategory10);

  // append the svg object to the body of the page
  var svg_bar = d3.select("#bar_chart_height_weight")
      .append("svg")
      .attr("width", 810)
      .attr("height", 389)
      .append("g")
      .attr("transform",
          "translate(" + 60 + "," + 30 + ")");

  // Initialize the X axis
  var x = d3.scaleBand()
      .range([0, width_bar])
      .padding(0.2);
  var xAxis = svg_bar.append("g")
      .attr("transform", "translate(0," + (height_bar + adjust) + ")")

  // Initialize the Y axis
  var y = d3.scaleLinear()
      .range([height_bar + adjust, 0]);
  var yAxis = svg_bar.append("g")
      .attr("class", "myYaxis")


  // A function that create / update the plot for a given variable:
  function update(selectedVar) {

      if (selectedVar == "Height") {
          //   document.getElementById("btnHeight").classList.remove("btn-outline-primary")
          //   document.getElementById("btnHeight").classList.add("btn-primary")
          //   document.getElementById("btnWeight").classList.remove("btn-primary")
          //   document.getElementById("btnWeight").classList.add("btn-outline-primary")
          document.getElementById("btnHeight").classList.add("my-btn-selected");
          document.getElementById("btnWeight").classList.add("my-btn-not-selected")

          document.getElementById("btnHeight").classList.remove("my-btn-not-selected");
          document.getElementById("btnWeight").classList.remove("my-btn-selected")

      }

      if (selectedVar == "Weight") {
          //   document.getElementById("btnWeight").classList.remove("btn-outline-primary")
          //   document.getElementById("btnWeight").classList.add("btn-primary")
          //   document.getElementById("btnHeight").classList.remove("btn-primary")
          //   document.getElementById("btnHeight").classList.add("btn-outline-primary")
          document.getElementById("btnWeight").classList.add("my-btn-selected");
          document.getElementById("btnHeight").classList.add("my-btn-not-selected")

          document.getElementById("btnWeight").classList.remove("my-btn-not-selected");
          document.getElementById("btnHeight").classList.remove("my-btn-selected")
      }

      // Parse the Data
      d3.csv("dataset/PlayerHeightWeight.csv", function (data) {

          // X axis
          x.domain(data.map(function (d) {
              return d.BestPosition;
          }))
          xAxis.transition().duration(1000).call(d3.axisBottom(x))

          // Add Y axis
          y.domain([0, d3.max(data, function (d) {
              return +d[selectedVar] + 20;
          })])


          yAxis.transition()
              .duration(1000)
              .call(d3.axisLeft(y));

          colorScaleBar.domain(data.map(function (d) {
              return d["BestPosition"];
          }));


          // variable u: map data to existing bars
          var u = svg_bar.selectAll("rect")
              .data(data)

          // update bars
          u
              .enter()
              .append("rect")
              .merge(u)
              .transition()
              .duration(1000)
              .attr("x", function (d) {
                  return x(d.BestPosition);
              })
              .attr("y", function (d) {
                  return y(d[selectedVar]);
              })
              .attr("width", x.bandwidth())
              .attr("height", function (d) {
                  return height_bar + adjust - y(d[selectedVar]);
              })
              //   .attr("fill", function (d) {
              //       return colorScaleBar(d["BestPosition"])
              //   })
              .attr("fill", "steelblue");

          if (flagSwitch) {
              var newTick = document.querySelectorAll("g.tick");

              for (let index = 0; index < newTick.length; index++) {
                  newTick[index].firstChild.setAttribute("stroke", "#FFF");
                  newTick[index].lastChild.setAttribute("fill", "#FFF");

              }
          }
      })
  }

  update('Height')