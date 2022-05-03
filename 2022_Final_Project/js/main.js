//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
        var attrArray=["y2000", "y2005", "y2010", "y2015", "y2020"]
        var expressed = attrArray[0];
        
        var yScale= d3.scaleLinear().range([140,0]).domain([0,1600]);//Scale bar range; Y scale bar
        var xScale= d3.scaleLinear().range([700,0]).domain([2020,2000]);//Scale bar range; Y scale bar

    window.onload = setMap();

    //creates info popup upon entering page
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".popup").style.display = "block";
            },
        )
    });      
   
    document.querySelector("#close").addEventListener("click", function(){
        document.querySelector(".popup").style.display = "none";
    });

    //creates help popups 
    window.addEventListener("load", function(){
        setTimeout(
            function open(event){
                document.querySelector(".popup").style.display = "block";
            },
        )
    });      
   
    document.querySelector("#close").addEventListener("click", function(){
        document.querySelector(".popup").style.display = "none";
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
            d3.csv("data/Positive_Cases_For_Chart.csv")
            ]
        ;
        Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All

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
                console.log(midwest);
                //console.log(midCounties);
                console.log(background);
                console.log(caseData);
                console.log(harvestData);
                console.log(deerData);
                console.log(caseChartData);
            
            midwestPoints = joinData(midwestPoints,caseData);
            createDropdown();
            createDropdown2();
            //setLabel();
            //moveLabel();
            //joinData();

            //translate TopoJSONs to geoJsons
            var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project);
            console.log(midwestStates);

           //midwestStates = joinData(midwestStates, caseData);
        
            //var midwestCounties = topojson.feature(midCounties, midCounties.objects.USA_Counties_Midwest_Project).features;
            //console.log(midwestCounties);

            //var country = topojson.feature(usa, usa.objects.cb_2018_us_state_20m);
            var backgroundStates = topojson.feature(background, background.objects.USA_Project);
            console.log(backgroundStates)
            
            function joinData(midwestPoints,caseData){
                //loop through csv to assign each set of csv attribute values to geojson region
                 for (var i=0; i<caseData.length; i++){
                    var  state = caseData[i]; //the current district
                    var csvKey = state.STATE_NAME; //the CSV primary key
    
                    console.log(state);
    
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
                console.log(midwestPoints);
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
                    console.log(d.properties);
                    var area= d.properties.y2015*6;
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
                .style("stroke", "darkgrey"); //dark grey border of circle          
                }

            setGraph();
            //setLabel();
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
                .tickValues([2000, 2005, 2010,2015, 2020])
                .tickFormat(d3.format("d"));
            
                
            var yAxis = d3.axisLeft()
                .scale(yScale);
        
                graph.append("g")
                .attr("transform", "translate (58,10)")
                .call(yAxis);
                
            
            var xAxisTranslate = h/1.5 + 10;
                graph.append("g")
                .attr("transform", "translate (65, 153)")
                .call(xAxis);
            
        };
         
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
        
        //function to create a dropdown menu for attribute selection
        function createDropdown2(csvData) {
            //add select element
            var dropdown = d3
                .select(".controls")
                .append("select")
                .attr("class", "dropdown2")
                .on("change", function () {
                    changeAttribute(this.value, csvData);
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
                .data(attrArray)
                .enter()
                .append("option")
                .attr("value", function (d) {
                    return d;
                })
                .text(function (d) {
                    return d.replaceAll("y", " ")
                        .replace("2000", "Positive Cases")
                        .replace("2005", "Deer Licenses Sold")
                        .replace("2010", "Total Deer Harvested")
                        .replace("2015", " ")
                        .replace("2020", "")
                });
        }
        
        //dropdown change listener handler
        function changeAttribute(attribute, csvData) {
            //change the expressed attribute
            expressed = attribute;

            //recreate the color scale
            var colorScale = makeColorScale(csvData);
        
            //resize circles
            var points = d3
                .selectAll(".points")
                .transition()
                .duration(1000)
                .style("fill", function(d){
                    var value = d.properties[expressed];
                    if (value){
                        return colorScale(value);
                    }else{
                        return "#ccc";
                    }
                })
                .attr("class","points")
                .attr("r", function(d){
                    console.log(d.properties);
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
                .style("stroke", "darkgrey") //dark grey border of circle  
        
            
            //updateSymbol(points, csvData.length, colorScale);
    
        //Update Symbol function
        /*function updateSymbol(points, n, colorScale){
         points.attr("x", function (d,i){
                return i * 
                */
 /*  
        //function to create dynamic label
        function setLabel(props){
            //label content
            var labelAttribute =  "<h3>" + props.STATE_NAME + ","+ props[expressed]+ "</h3>";
    
            //create info label div
            var infolabel = d3.select("map")
                .append("div")
                .attr("class", "infolabel")
                .attr("id", props.STATE_NAME + "_label")
                .html(labelAttribute);
        }; 
          
        //function to move info label with mouse
        function moveLabel(){
            //get width of label
            var labelWidth = d3.select(".infolabel")
                .node()
                .getBoundingClientRect()
                .width;
    
            //use coordinates of mousemove event to set label coordinates
            var x1 = event.clientX + 10,
                y1 = event.clientY + 200,
                x2 = event.clientX - labelWidth + 10,
                y2 = event.clientY + 50;
    
                console.log(y1)
    
            //horizontal label coordinate, testing for overflow
            var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
            //vertical label coordinate, testing for overflow
            var y = event.clientY < 75 ? y2 : y1; 
    
            d3.select(".infolabel")
                .style("left", x + "px")
                .style("top", y + "px");
        };

       /* 
        //dropdown change listener handler
        function changeAttribute(attribute, csvData) {
            //change the expressed attribute
            expressed = attrArray[3];
    
            //resize proportional symbols
            var vermontDistricts = d3
                .selectAll(".midwestPoints")
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
*/
    /*
       
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
                })*/
      
    

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
/*


    }
        
        //Scatterplot Creation....Draft code based on D3 example
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 460-margin.left-margin.right,
            height = 400-margin.top-margin.bottom;
        
        var svg = d3.select(".scatterplot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("tranform",
                        "translate(" + margin.left + "," + margin.top + ")");
        
        d3.csv("data/Positive_Cases.csv", function (data){
            var x = d3.scaleLinear()
                .domain([2005, 2020])
            
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            var y = d3.scaleLinear()
                .domain
                .range
            svg.append("g")
                .call(d3.axisLeft(y));
        
        var color = d3.scaleOrdinal()
            .domain(["Michigan", "Wisconsin", "Missouri", "Iowa", "Illinois", "Minnesota" ])
            .range([ "#440154ff", "#21908dff", "#fde725ff", "#4287f5", "#4a2457", "#4d6e6a"])

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            //.attr("cx", function (d) { return x(d.Year); } )
            //.attr("cy", function (d) { return y(d.Wisconsin); } )
            //.attr("r", 5)
            .style("fill", function (d) { return color(d.Wisconsin) } )
            .style("fill", function (d) { return color(d.Michigan) } )
            .style("fill", function (d) { return color(d.Illinois) } )
            .style("fill", function (d) { return color(d.Iowa) } )
            .style("fill", function (d) { return color(d.Minnesota) } )
            .style("fill", function (d) { return color(d.Missouri) } );
        
        //Title of scatterplot
            svg.append('text')
                .attr('x', width/2 + 100)
                .attr('y', 100)
                .attr('text-anchor', 'middle')
                .style('font-family', 'Helvetica')
                .style('font-size', 20)
                .text('Positive CWD Cases');
            
            // X label
            svg.append('text')
                .attr('x', width/2 + 100)
                .attr('y', height - 15 + 150)
                .attr('text-anchor', 'middle')
                .style('font-family', 'Helvetica')
                .style('font-size', 12)
                .text('Year');
            
            // Y label
            svg.append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate(60,' + height + ')rotate(-90)')
                .style('font-family', 'Helvetica')
                .style('font-size', 12)
                .text('Positive Cases')
        })*/
    } })();
