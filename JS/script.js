//A global object to hold all of our logic.
let chart = {};


//Here's where we call our data. We're calling more than one file, so we're gonna stack our calls in a promise
//This gives us a single callback once all of our files are loaded.
//Asynchronous data loading rules!
Promise.all([
    d3.json("./Data/Missouri County Boundaries Map.geojson"), //States
    d3.csv("./Data/FIPS-Code_FoodInsecurity_MissouriData_2016 - Sheet1.csv")
]).then(data => {
    //This is the callback

    console.log(data);

    init(data);
});

function init(data) {

    console.log(data);

    chart.county = data[0];
    chart.foodinsecurity = data[1];
    chart.lookup = {};


    //Append our elements to the page. This only happens on load.
    appendElements();

    console.log();

    //Update positions and styles for everything on the page
    //whenever we update the page (on re-size, for example).
    update();

    d3.select(window).on("resize", d => {
        update();
    });


}


function update() {
    setDimensions();
    setScales();
    updateElements();
}


function setDimensions() {

    chart.margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    let targetWidth = document.querySelector(".chart").offsetWidth;
    let targetHeight = document.querySelector(".chart").offsetHeight;

    chart.width = targetWidth - chart.margin.left - chart.margin.right;
    chart.height = targetHeight - chart.margin.top - chart.margin.bottom;

}


function setScales() {

    //chart.projection = d3.geoAlbersUsa();

    //Missouri Central State Plane Projection
    //Taken from here:
    //https://github.com/veltman/d3-stateplane#nad83--missouri-central-epsg26997
    //NOTE: I've added a `fitSize` definition, which conveniently makes the map fil your screen size.
    //Documentation for `fitSize` is here: https://github.com/d3/d3-geo#projection_fitSize
    chart.projection = d3.geoTransverseMercator()
        .rotate([92 + 30 / 60, -35 - 50 / 60])
        .fitSize([chart.width, chart.height], chart.county);



    chart.path = d3.geoPath()
        .projection(chart.projection);

    let domain = d3.extent(chart.foodinsecurity, d => {
        return +d["Food Insecurity Rate"];
    })

    chart.color = d3.scaleQuantize(domain, d3.schemeBlues[9])


}





function appendElements() {

    //SVG is the container.
    chart.svg = d3.select(".chart").append("svg");

    //The plot is where the charting action happens.
    chart.plot = chart.svg.append("g").attr("class", "chart-g");

    //Make sure to add your elements to the `plot` group
    //so that your chart appears with offset margins
    chart.countyMap = chart.plot.selectAll("path.county")
        .data(chart.county.features).enter()
        .append("path")
        .attr("class", "county")

}


function updateElements() {

    //The this.svg will be the FULL width and height of the parent container (this.element)
    chart.svg.attr("width", chart.width + chart.margin.left + chart.margin.right);
    chart.svg.attr("height", chart.height + chart.margin.top + chart.margin.bottom);

    //this.plot is offset from the top and left of the this.svg
    chart.plot.attr("transform", `translate(${chart.margin.left},${chart.margin.top})`);

    chart.countyMap.attr("d", chart.path)
        .style("fill", d => {
            //WRITE YOUR DATA ACCESSING LOGIC HERE
            return 'lightgreen';
            //return chart.color(median);

    })


}
