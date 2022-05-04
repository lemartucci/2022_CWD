//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
        var attrArray=["y2005", "y2010", "y2015", "y2020"]
        var expressed = attrArray[0];

        var attrArray2=["deer harvested", "deer_licenses_sold"]
        var expressed = attrArray2[0]
        
        var yScale= d3.scaleLinear().range([140,0]).domain([0,1600]);//Scale bar range; Y scale bar
        var xScale= d3.scaleLinear().range([700,0]).domain([2020,2005]);//Scale bar range; X scale bar

    window.onload = setMap();

    //creates help popup 
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".help").style.display = "block"; 
            },5000
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

    //creates help popup 
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".help").style.display = "block"; 
            },4000
        )
    });      
   
    document.querySelector("#close").addEventListener("click", function(){
        document.querySelector(".help").style.display = "none";
    });

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
            //d3.json("data/USA_Counties_Midwest_Project.topojson"),
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

        //function to create color scale generator
        function makeColorScale(data){
            var colorClasses = [
                "#f6eff7",
                "#bdc9e1",
                "#67a9cf",
                "#1c9099",
                "#016c59"
            ];

            //create color scale generator
            var colorScale = d3.scaleQuantile()
                .range(colorClasses);

            //build array of all values of the expressed attribute
            var domainArray = [];
            for (var i=0; i<data.length; i++){
                var val = parseFloat(data[i][expressed]);
                domainArray.push(val);
            };

            //assign array of expressed values as scale domain
            colorScale.domain(domainArray);

            return colorScale;
        };

        //Callback function to retrieve the data
        function callback(data) {
            var midwest = data[0]
                //midCounties = data[1]
                background = data[1]
                midwestPoints = data[2].features
                caseData = data[3]
                harvestData=data[4]
                deerData=data[5]
                caseChartData=data[6]
                overlayData=data[7]
                console.log(midwest);
                //console.log(midCounties);
                console.log(background);
                console.log(caseData);
                console.log(harvestData);
                console.log(deerData);
                console.log(caseChartData);
            
            midwestPoints = joinData(midwestPoints,caseData);
            createDropdown();
            createDropdown2(overlayData);
            //setLabel();
            //moveLabel();

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
                    var area= d.properties.y2005*6;
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
                /*
                .style("fill", function(d){
                    var value = d.properties[expressed];            
                     if(value) {                
                         return colorScale(d.properties[expressed]);            
                     } else {                
                         return "#ccc";            
                     } 
                 })  
                */
                .style("stroke", "darkgrey"); //dark grey border of circle          
                }                                               
                
            setGraph();
            //setEnumerationUnits();
        }

        // Creating line graph and axis
        function setGraph(){
            var w= 800,
                h= 200;
            
            var graph = d3.select("#graph")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("class", "graph");
            
            var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickValues([2005, 2010,2015, 2020])
                .tickFormat(d3.format("d"));
            
            var yAxis = d3.axisLeft()
                .scale(yScale);
        
                graph.append("g")
                .attr("transform", "translate (58,10)")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("dy", "-4em")
                .attr("y", 3)
                .style("text-anchor", "bottom")
                .text("Individual Cases");
            
            var xAxisTranslate = h/1.5 + 10;
                graph.append("g")
                .attr("transform", "translate (65, 153)")
                .call(xAxis)
                .append("text")
                .attr("dx", "28em")
                .attr("text-anchor", "bottom")
                .attr("x", -5)
                .attr("y", 26)
                .text("Year")
            
                d3.csv("Positive_Cases_For_Chart.csv").then(function(data) {

                var x = d3.scaleTime().range([0, width]);  
                var y = d3.scaleLinear().range([height, 0]);
                
                // Define the line
                var lineGraph = d3.line()	
                .x(function(d) { return x(d.year); })
                .y(function(d) { return y(d.cases); });
                    
                    data.forEach(function(d) {
                          d.year = parseDate(d.year);
                          d.cases = +d.cases;
                      });
                  
                      // Scale the range of the data
                      x.domain(d3.extent(data, function(d) { return d.year; }));
                      y.domain([0, d3.max(data, function(d) { return d.cases; })]);
                  
                      // Group the entries by symbol
                      dataNest = Array.from(
                          d3.group(data, d => d.symbol), ([key, value]) => ({key, value})
                        );
                    
                      // set the colour scale
                      var color = d3.scaleOrdinal(d3.schemeCategory10);
                  
                      legendSpace = width/dataNest.length; // spacing for the legend
                  
                      // Loop through each symbol / key
                      dataNest.forEach(function(d,i) { 
                  
                          svg.append("path")
                              .attr("class", "line")
                              .style("stroke", function() { // Add the colours dynamically
                                  return d.color = color(d.key); })
                              .attr("d", priceline(d.value));
                  
                          // Add the Legend
                          svg.append("text")
                              .attr("x", (legendSpace/2)+i*legendSpace)  // space legend
                              .attr("y", height + (margin.bottom/2)+ 5)
                              .attr("class", "legend")    // style the legend
                              .style("fill", function() { // Add the colours dynamically
                                  return d.color = color(d.key); })
                              .text(d.key); 
                            })
                })
    }
        //function to create a dropdown menu for attribute selection
        function createDropdown(csvData) {
            //add select element
            var dropdown = d3
                .select(".controls")
                .append("select")
                .attr("class", "dropdown")
                .on("change", function () {
                    changeAttribute(this.value, csvData);
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
        function changeAttribute(attribute, csvData) {
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
                .attr("id", function(d){
                    return d.STATE_NAME;
                })
                .style("stroke", "darkgrey") //dark grey border of circle  
        }

        //function to create a dropdown menu for attribute selection
        function createDropdown2(csvData) {
            //add select element
            var dropdown = d3
                .select(".controls")
                .append("select")
                .attr("class", "dropdown2")
                .on("change", function () {
                    changeColor(this.value,csvData);
                });

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
        
        //function to create dynamic label
        function setLabel(props){
            //label content
            console.log(props)
            var labelAttribute =  "<h3>" + props.STATE_NAME + ","+ props[expressed]+ "</h3>";
    
            //create info label div
            var infolabel = d3.select(".map")
                .append("div")
                .attr("class", "infolabel")
                .attr("id", props.STATE_NAME + "_label")
                .html(labelAttribute);
        }; 
          
        //function to move info label with mouse
        function moveLabel(){
           // get width of label
            var labelWidth = d3.select(".infolabel")
                .node()
                .getBoundingClientRect()
                .width
    
            //use coordinates of mousemove event to set label coordinates
            var x1 = event.clientX + 10,
                y1 = event.clientY + 200,
                x2 = event.clientX - labelWidth + 10,
                y2 = event.clientY + 50;
    
                //console.log(y1)
    
            //horizontal label coordinate, testing for overflow
            var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
            //vertical label coordinate, testing for overflow
            var y = event.clientY < 75 ? y2 : y1; 
    
            d3.select(".infolabel")
                .style("left", x + "px")
                .style("top", y + "px");
        };
       
            // group the data: I want to draw one line per group
            var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.STATE_NAME;})
            .entries(data);
        
            // Add X axis --> it is a date format
            var x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([ 0, width ]);
            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(4));
        
            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.cases; })])
            .range([ height, 0 ]);
            svg.append("g")
            .call(d3.axisLeft(y));
        
            // color palette
            var res = sumstat.map(function(d){ return d.key }) // list of group names
            var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33'])
        
            // Draw the line
            svg.selectAll(".line")
                .data(sumstat)
                .enter()
                .append("path")
                .attr("fill", "none")
                .attr("stroke", function(d){ return color(d.key) })
                .attr("stroke-width", 1.5)
                .attr("d", function(d){
                    return d3.line()
                    .x(function(d) { return x(d.year); })
                    .y(function(d) { return y(+d.cases); })
                    (d.values)
                })
      
    

    /*function setEnumerationUnits(midwestStates,map,path){
            var state = map
                .selectAll("STATE_NAME")
                .data(midwestStates)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "state " + d.properties.STATE_NAME;
                })
                .attr("d", path)//d defines the coordinates of path
                };*/

    
    
    /*
    function setGraph(){
        // set the dimensions and margins of the graph
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#cwd_data")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

        //Read the data
        d3.csv("data/Positive_Cases.csv", function(data) {

        // group the data: I want to draw one line per group
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d.STATE_NAME;})
        .entries(data);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.Year; }))
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5));

        // Add Y axis
        var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.n; })])
        .range([ height, 0 ]);
        svg.append("g")
        .call(d3.axisLeft(y));

        // color palette
        var res = sumstat.map(function(d){ return d.key }) // list of group names
        var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

        // Draw the line
        svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
            return d3.line()
                .x(function(d) { return x(d.Year); })
                .y(function(d) { return y(+d.n); })
                (d.values)
            })

})*/
        
      
     })();
