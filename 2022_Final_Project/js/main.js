//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables
        //var attrArray=[]
        //var expresed = attrArray[0];
    
    //Scatterplot dimensions
    var plotWidth = window.innerWidth * 0.425,
        plotHeight = 473,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        plotInnerWidth = plotWidth - leftPadding - rightPadding,
        plotInnerHeight = plotHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    var yScale= d3.scaleLinear().range([463,0]).domain([0,600]);//Scale bar range; Y scale bar

    window.onload = setMap();

    function setMap() {
        //map frame dimensions
        var width = window.innerWidth * 0.55,
        height = 1000;

        //create new svg container for the map
        var map = d3
            .select(".mapframe")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on Midwest
        var projection = d3.geoAlbers()
            .center([0, 41.60])//centered on Midwest states
            .rotate([89.35, 0, 0])
            .parallels([45, 38])//Standard parallels (latitudes)
            .scale(4800)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);//Applies projection to the data

        //Data for map
        var promises = [
            d3.json("data/Midwest_States_Project.topojson"),
            d3.json("data/USA_Counties_Midwest_Project.topojson"),
            d3.json("data/USA_Project.topojson"),
        ]
        var promisesCsv=[
            d3.csv("data/Positive_Cases.csv"),
            d3.csv("data/Total_Harvested.csv"),
            d3.csv("data/Deer_Licenses_Sold.csv")
            ]
        ;
        Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All
        Promise.all(promisesCsv).then(callback);//Fetching multiple datasets at once with Promise.All

        //Callback function to retrieve the data
        function callback(data) {
            var midwest = data[0]
                midCounties = data[1]
                background = data[2]
                caseData = data[3]
                harvestData=data[4]
                deerData=data[5]
                //console.log(midwest);
                //console.log(midCounties);
                //console.log(background);
                //console.log(caseData);
                //console.log(harvestData);
                //console.log(deerData);

            //translate TopoJSONs to geoJsons
            var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project).features;
            console.log(midwestStates);

           //midwestStates = joinData(midwestStates, csvData);
        
            var midwestCounties = topojson.feature(midCounties, midCounties.objects.USA_Counties_Midwest_Project).features;
            console.log(midwestCounties);

            //var country = topojson.feature(usa, usa.objects.cb_2018_us_state_20m);
            var backgroundStates = topojson.feature(background, background.objects.USA_Project);
            console.log(backgroundStates)
        
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
            
            //add midwest counties to the map
            var counties = map
                .selectAll(".counties")
                .data(midwestCounties)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "midwestCounties" + d.properties.STATE_NAME;
                })
                .attr("d", path);//d defines the coordinates of path
            }
//            setPlot();
        }

        function joinData(midwestStates,csvData){
            //loop through csv to assign each set of csv attribute values to geojson region
             for (var i=0; i<csvData.length; i++){
                var  state = csvData[i]; //the current district
                var csvKey = state.STATE_NAME; //the CSV primary key

                //loop through geojson districts to find correct district
                for (var a=0; a<Positive_Cases.length; a++){

                    var geojsonProps = midwestStates[a].properties; //the current region geojson properties
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
            return midwestStates;
    }

/*
    function setPlot(){
    
            //create a second svg element to hold the scatter plot
            var plot = d3.select("body")
                .append("svg")
                .attr("width", plotWidth)
                .attr("height", plotHeight)
                .attr("class", "plot");
        
            //rectangle for plot background
            var plotBackground = plot.append("rect")
                .attr("class", "plotBackground")
                .attr("width", plotInnerWidth)
                .attr("height", plotInnerHeight)
                .attr("transform", translate);
        
            //dots for each state
            var dots = plot.selectAll(".dot")
                .data()
                .enter()
                .append("rect")
                .sort(function(a, b){
                    return b[expressed]-a[expressed]
                })
                .attr("class", function(d){
                    //return "dots " + d.STATE_NAME;
                })
                //.attr("width", plottInnerWidth / csvData.length - 1)
                //.on("mouseover", function(event,d){
                 //   highlight(d)
                //})
                //.on("mouseout", function(event, d){
                 //   dehighlight()
                //})
                //.on("mousemove", moveLabel); 
    
            //Text element for plot title and define title placement
            var plotTitle = plot.append("text")
                .attr("x", 45)
                .attr("y", 35)
                .attr("class", "plotTitle");
        
            //updatePlot(bars, csvData.length, colorScale);
        
            //Create a vertical axis generator on left (y)
            var yAxis = d3.axisLeft()
                .scale(yScale);
        
            //Place the axis
            var axis = plot.append("g")
                .attr("class", "axis")
                .attr("transform", translate)
                .call(yAxis);
        
            //create a frame for border of plot
            var plotFrame = plot.append("rect")
                .attr("class", "plotFrame")
                .attr("width", plotInnerWidth)
                .attr("height", plotInnerHeight)
                .attr("transform", translate);
    }
        
        /*
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
                .text('Positive Cases');
        })*/
    }) ();
