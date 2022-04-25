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
        d3.json("data/USA_Project.topojson")
    ];
    Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All

    //Callback function to retrieve the data
function callback(data) {
        var midwest = data[0]
            midCounties = data[1]
            background = data[2]
            //console.log(midwest);
            //console.log(midCounties);
            //console.log(background);

        //translate TopoJSONs to geoJsons
        var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project);
        console.log(midwestStates);
       
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
