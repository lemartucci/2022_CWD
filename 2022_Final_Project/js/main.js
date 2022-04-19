window.onload = setMap();

function setMap() {
    //map frame dimensions
    var width = 960,
        height = 500;

    //create new svg container for the map
    var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Midwest
    var projection = d3.geoAlbers()
        .center([0, 43.7844])//centered on Midwest
        .rotate([88.7879, 0, 0])
        .parallels([89, 38])//Standard parallels
        .scale(4500)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);//Applies projection to the data

    //Data for map
    var promises = [
        d3.json("data/Midwest_States_Project.topojson"),
        d3.json("data/USA_Counties_Midwest_Project.topojson")
    ];
    Promise.all(promises).then(callback);//Fetching multiple datasets at once with Promise.All

    //Callback function to retrieve the data
    function callback(data) {
        var midwest = data[0]
            midCounties = data[1]
            console.log(midwest);
            console.log(midCounties);

        //translate TopoJSON to geoJson
        var midwestStates = topojson.feature(midwest, midwest.objects.Midwest_States_Project);
       
        console.log(midwestStates);
       
        var midwestCounties = topojson.feature(counties, counties.objects.USA_Counties_Midwest_Project).features;
        console.log(midwestCounties);

    
        //add midwest states to the map
        var midwestBackground = map
            .append("path")
            .datum(midwest)
            .attr("class", "area")
            .attr("d", path);
        
        
        //add midwest counties to the map
        var counties = map
            .selectAll(".counties")
            .data(midCounties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "counties" + d.properties.counties;
            })
            .attr("d", path);//d defines the coordinates of path
        }

    }
