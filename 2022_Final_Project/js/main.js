//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
        var attrArray=["y2005", "y2010", "y2015", "y2020"]
        var yearExpressed = attrArray[0];

        var attrArray2=["deer_harvested", "deer_licenses_sold"]
        var typeExpressed = attrArray2[0]

        var colorExpressed = typeExpressed + "_" + yearExpressed.replace("y","");
        var expressed = attrArray[0];

        var colorScale;

    window.onload = setMap();

    /////POPUP CREATION/////    

    //creates help popup 
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".help").style.display = "block"; 
            }
        )
    });      
   
    document.querySelector("#close").addEventListener("click", function(){
        document.querySelector(".help").style.display = "none";
    });

    //creates info popup upon entering page
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".popup").style.display = "block"; 
            }
        )
    });      
   
    document.querySelector("#close").addEventListener("click", function(){
        document.querySelector(".popup").style.display = "none";
    });

    /////COLOR SCALE/////

    //function to create color scale generator
    function makeColorScale(data){
        var colorClasses = [
            "#f7f7f7",
            "#cccccc",
            "#969696",
            "#636363",
            "#252525"
        ];

        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i].properties[colorExpressed]);
            domainArray.push(val);
        };

        //assign array of expressed values as scale domain
        colorScale.domain(domainArray);

        return colorScale;
    };

    /////LOAD MAP AND DATA/////

    function setMap() {
        //map frame dimensions
        var width = (window.innerWidth * 0.7),
            height = 600;
           
        //create new svg container for the map
        var map = d3
            .select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on Midwest
        var projection = d3.geoAlbers()
            .center([0, 41.60])//centered on Midwest states
            .rotate([89.35, 0, 0])
            .parallels([45, 38])//Standard parallels (latitudes)
            .scale(3000)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);//Applies projection to the data

        //Data for map
        var promises = [
            d3.json("data/Midwest_States_Project.topojson"),
            d3.json("data/USA_Project.topojson"),
            d3.json("data/Midwest_Points.geojson"),
            d3.csv("data/Positive_Cases.csv"),
            d3.csv("data/Total_Harvested.csv"),
            d3.csv("data/Deer_Licenses_Sold.csv"),
            d3.csv("data/Positive_Cases_For_Chart.csv"),
            d3.csv("data/overlays.csv")
            ]
        ;
        Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All


        //Callback function to retrieve the data
        function callback(data) {
            var midwest = data[0]
                background = data[1]
                midwestPoints = data[2].features
                caseData = data[3]
                harvestData=data[4]
                deerData=data[5]
                caseChartData=data[6]
                overlayData=data[7]
                console.log(midwest);
                console.log(background);
                console.log(caseData);
                console.log(harvestData);
                console.log(deerData);
                console.log(caseChartData);
            
            midwestPoints = joinData(midwestPoints,caseData);
            createDropdown();
            createDropdown2(overlayData);
            //createSequenceControls();
            //moveLabel();

            colorScale = makeColorScale(midwestPoints);

            //translate TopoJSONs to geoJsons
            var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project);
            //console.log(midwestStates);

            //var country = topojson.feature(usa, usa.objects.cb_2018_us_state_20m);
            var backgroundStates = topojson.feature(background, background.objects.USA_Project);
            //console.log(backgroundStates)
            
            function joinData(midwestPoints,caseData){
                //loop through csv to assign each set of csv attribute values to geojson region
                 for (var i=0; i<caseData.length; i++){
                    var  state = caseData[i]; //the current district
                    var csvKey = state.STATE_NAME; //the CSV primary key
    
                    //console.log(state);
    
                    //loop through geojson districts to find correct district
                    for (var a=0; a<midwestPoints.length; a++){
    
                        var geojsonProps = midwestPoints[a].properties; //the current region geojson properties
                        var geojsonKey = geojsonProps.STATE_NAME; //the geojson primary key
    
                        //where primary keys match, transfer csv data to geojson properties object
                        if (geojsonKey == csvKey){
    
                            //assign all attributes and values
                            attrArray.forEach(function(attr){
                                var val = parseFloat(state[attr]); //get csv attribute value
                                geojsonProps[attr] = val; //assign attribute and value to geojson properties
                            });
                        };
                    };
                };
                //console.log(midwestPoints);
                return midwestPoints;
            }
            
            //add surrounding states for context
            var usa = map
                .append("path")
                .datum(backgroundStates)
                .attr("class", "usa")
                .attr("d", path);
            
            //add midwest states to the map
            var midwestBackground = map
                .append("path")
                .datum(midwestStates)
                .attr("class", "midwestBackground")
                .attr("d", path);

            //add midwest points to the map
            var points = map.selectAll(".points")
                .data(midwestPoints)
                .enter()
                .append("circle")
                .attr("class","points")
                .attr("r", function(d){
                    //console.log(d.properties);
                    var area= d.properties[expressed]*6;
                    return Math.sqrt(area/Math.PI)
                })
                .attr("id", function(d){
                    return d.STATE_NAME;
                })
                .attr("cx",function(d){
                    return projection(d.geometry.coordinates)[0]
                })
                .attr("cy",function(d){
                    return projection(d.geometry.coordinates)[1]
                })
                .style("fill", function(d){
                    var value = d.properties[colorExpressed]; 
                    //console.log(colorScale(value))           
                     if(value) {                
                         return colorScale(value);            
                     } else {                
                         return "#ccc";            
                     } 
                 })
                 .on("mouseover", function(event, d){
                    highlight(d.properties)
                 })
                 .on("mouseout", function(event, d){
                    dehighlight(d)
                    
                })
                .on("mousemove", moveLabel)
                .style("stroke", "darkgrey") //dark grey border of circle          
                };                                        
                
            setGraph();
            createLegend();
            //changeColor();
            //setEnumerationUnits();
        }

        /////GRAPH/////

        function setGraph(){
            var w= 800,
                h= 200;
            var graph = d3.select("#graph")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "graph");
           
                var margin = {top: 15, right: 25, bottom: 35, left: 25},
                width = 800 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;
                
                d3.csv("Data/Positive_Cases_For_Chart.csv").then(function(data) {
                
                var x = d3.scaleTime().range([20, width]);
                var xAxis = d3.scaleTime().range([20, width]);
                var y = d3.scaleLinear().range([height, 20]);

                const parseTime = d3.timeParse("%Y");

                // Define the line
                var lineGraph = d3.line()
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(d.cases); });
                    data.forEach(function(d) {
                          d.year = +d.year;
                          d.cases = +d.cases;
                      });

                      // Scale the range of the data
                      x.domain(d3.extent(data, function(d) {return d.year; }));
                      xAxis.domain(d3.extent(data, function(d) {return parseTime(d.year); }));
                      y.domain([0, d3.max(data, function(d) { return d.cases; })]);

                      // Group the entries by symbol
                      dataNest = Array.from(
                          d3.group(data, d => d.STATE_NAME), ([key, value]) => ({key, value})
                        );

                      // set the colour scale
                      var color = d3.scaleOrdinal(d3.schemeTableau10);
                      legendSpace = width/dataNest.length; // spacing for the legend

                      // Loop through each symbol / key
                      dataNest.forEach(function(d,i) {
                          graph.append("path")
                              .attr("class", "line")
                              .style("stroke", function() { // Add the colours dynamically
                                  return d.color = color(d.key); })
                              .attr("d", lineGraph(d.value))
                              .attr("transform", "translate(20)")
                        
                          // Add the Legend
                        graph.append("text")
                              .attr("x", (legendSpace/1.8)+i*legendSpace)  // space legend
                              .attr("y", height + (margin.bottom)- 160)
                              .attr("class", "legend")    // style the legend
                              .style("fill", function() { // Add the colours dynamically  
                                return d.color = color(d.key); })
                              .text(d.key)
                            });

                        // Add the X Axis
                        graph.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate (20,160)")
                        .call(d3.axisBottom(xAxis).ticks(3))
                       
                        // Add the Y Axis
                        graph.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(40)")
                        .call(d3.axisLeft(y));
});
    }
        function createLegend(){
                var w= 450,
                    h= 200;
                var propLegend = d3.select(".controls")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "propLegend");

                var size = d3.scaleSqrt()
                    .domain([1,50])
                    .range([1,50])
                //Ading the circles
                var dataValues = [5, 15, 20]
                var xCircle = 10
                var xLabel = 20
                var yCircle = 50 

                //Creating a nested legend
                propLegend
                    .selectAll("legend")
                    .data(dataValues)
                    .join("circle")
                    .attr("cx", xCircle)
                    .attr("cx", xCircle)
                    .attr("cy", d => yCircle - size(d))
                    .attr("r", d => size(d))
                    .style("fill", "none")
                    .attr("stroke", "black")
                //Sizes of circles and position
                propLegend
                    .selectAll("legend")
                    .data(dataValues)
                    .join("line")
                    .attr('x1', d => xCircle + size(d))
                    .attr('x2', xLabel)
                    .attr('y1', d => yCircle - size(d))
                    .attr('y2', d => yCircle - size(d))
                    //.attr('stroke', 'black')
                    //.style('stroke-dasharray', ('2,2'))
                    
                //Legend Labels
                /*propLegend
                    .selectAll("legend")
                    .data(dataValues)
                    .join("text")
                    .attr('x', xLabel)
                    .attr('y', d => yCircle - size(d))
                    .text( d => d)
                    .style("font-size", 10)
                    .attr('alignment-baseline', 'middle')
                    .labelOffset(100);*/
        };
        /////DROPDOWNS/////

        //function to create a dropdown menu for attribute selection
        function createDropdown(csvData) {
            //add select element
            var dropdown = d3
                .select(".controls")
                .append("select")
                .attr("class", "dropdown")
                .on("change", function () {
                    changeAttribute(this.value)
                    changeLine();
                });

            //add initial option
            var titleOption = dropdown
                .append("option")
                .attr("class", "titleOption")
                .attr("disabled", "true")
                .text("Select Year");

            //add attribute name options
            var attrOptions = dropdown
                .selectAll("attrOptions")
                .data(attrArray)
                .enter()
                .append("option")
                .attr("value", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d.replaceAll("y", " ");
                });
        }

        //dropdown change listener handler
        function changeAttribute(attribute) {
            //change the expressed attribute
            expressed = attribute;
        
            //resize circles
            var points = d3
                .selectAll(".points")
                .transition()
                .duration(1000)
                .attr("class","points")
                .attr("r", function(d){
                    //console.log(d.properties);
                    var area= d.properties[expressed]*6;
                    return Math.sqrt(area/Math.PI)
                })
                .style("fill", function(d){
                    var value = d.properties[colorExpressed]; 
                     if(value) {                
                         return colorScale(value);            
                     } else {                
                         return "#ccc";            
                     } 
                 })  
                .attr("id", function(d){
                    return d.STATE_NAME;
                })
                .style("stroke", "darkgrey") //dark grey border of circle  

                //update line
                var lines = d3
                .selectAll(".line")
                .transition()
                .duration(1000)   
                
        }

        //function to create a dropdown menu for attribute selection
        function createDropdown2(csvData) {
            //add select element
            var dropdown = d3
                .select(".controls")
                .append("select")
                .attr("class", "dropdown2")
                .on("change", function () {
                    //changeColor(this.value,csvData);
                    colorExpressed = this.value + "_" + expressed.replace("y","");
                    changeAttribute(expressed);
        });

        //dropdown change listener handler
        function changeColor(attribute, csvData) {
            //change the expressed attribute
            expressed = attribute;

            //recreate the color scale
            var colorScale = makeColorScale(csvData);
        
            //recolor enumeration units
            var midwestPoints = d3
                .selectAll(".points")
                .transition()
                .duration(1000)
                .style("fill", function (d) {
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(d.properties[expressed]);
                } else {
                    return "#ccc";
                }
            });
        }  

        //add initial option
        var titleOption = dropdown
                .append("option")
                .attr("class", "titleOption")
                .attr("disabled", "true")
                .text("Select Overlay");

        //add attribute name options
        var attrOptions = dropdown
            .selectAll("attrOptions")
            .data(attrArray2)
            .enter()
            .append("option")
            .attr("value", function (d) {
                    return d;
            })
            .text(function (d) {
                return d.replaceAll("_", " ");
            });

        }
        
        /////LABELS/////

        //function to highlight enumeration units and bars
            function highlight(props){
                //change stroke
                var selected = d3.selectAll(".points" )//props.STATE_NAME)
                    .style("stroke", "blue")
                    .style("stroke-width", "10");
                setLabel(props)
            };
            //function to dehighlight enumeration units and bars
            function dehighlight(){
                //change stroke
                var states = d3.selectAll(".points")
                    .style("stroke", "gray")
                    .style("stroke-width", ".75");
                var bars = d3.selectAll(".bar")
                    .style("stroke", "none")
                    .style('stroke-width', '0')

                //below Example 2.4 line 21...remove info label
                d3.select(".infolabel")
                .remove();
            };

        //function to create dynamic label
        function setLabel(props){
            //d3.select(".infolabel").remove();
            console.log(props)
            var labelAttribute = "<h3>" + props[expressed] +
            "</h3>";
    console.log(labelAttribute)
            //create info label div
            var infolabel = d3.select("body")
                .append("div")
                .attr("class", "infolabel")
                .attr("id", props.STATE_NAME + "_label")
                .html(labelAttribute);
            
            var statename = infolabel.append("div")
                .attr("class", "labelname")
                .html(props.name);
            //moveLabel()
        }; 
          
        //function to move info label with mouse
        function moveLabel(){
            //get width of label
           var labelWidth = d3.select(".infolabel")
           .node()
           .getBoundingClientRect()
           .width;
   //console.log(labelWidth)
           //use coordinates of mousemove event to set label coordinates
           var x1 = event.clientX + 10,
               y1 = event.clientY + 20,
               x2 = event.clientX - 10,
               y2 = event.clientY + 10;
   
           //horizontal label coordinate, testing for overflow
           var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
           //vertical label coordinate, testing for overflow
           var y = event.clientY < 75 ? y2 : y1; 
   
           d3.select(".infolabel")
               .style("left", x + "px")
               .style("top", y + "px");
       };
       
      
     })();
