//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    //pseudo-global variables

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
            //d3.json("data/Positive_Cases.csv")
        ];
        Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All

        //Callback function to retrieve the data
        function callback(data) {
            var midwest = data[0]
                midCounties = data[1]
                background = data[2]
                //csvData = data[3]
                //console.log(midwest);
                //console.log(midCounties);
                //console.log(background);

            //translate TopoJSONs to geoJsons
            var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project);
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
        }
/*
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
*/
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
        })
    }) ();
