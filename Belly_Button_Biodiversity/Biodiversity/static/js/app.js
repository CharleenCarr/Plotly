function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  var url = "/metadata/" + sample;
  d3.json(url).then(function (metaData) {
    // d3.json(`/metadata/${sample}`).then((metaData) => {

    // Use d3 to select the panel with id of `#sample-metadata`

    var selector = d3.select("#sample-metadata");
    var dataWFREQ = 0;

    // Use `.html("") to clear any existing metadata

    // selector.html("");
    
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    // Log the key and value
    Object.entries(metaData).forEach(([key, value]) => {
      // var row = `${key} : ${value}`;
      selector.append("p")
        .text(`${key} : ${value}`);
      if (key === "WFREQ"){
        dataWFREQ = value;
      };         
    });
    buildGauge(dataWFREQ);
  });
}

  // BONUS: Build the Gauge Chart
// Enter a speed between 0 and 180

function buildGauge(WFREQ) {
  var level = (180 / 9) * WFREQ;

// Trig to calc meter point
  var degrees = 180 - level,
    radius = .7;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 25, color: '850000' },
    showlegend: false,
    name: 'Wash Frequency',
    text: level,
    hoverinfo: 'text+name'
  },
  {
    values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6',
      '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: { colors:
      [ 'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5',
        'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
        'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
        'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)', 
        'rgba(240, 230, 215, .5', 'rgba(255, 255, 255, 0)'
      ]},
   
      // ['#008000', '#228d1b',
      //   '#359a2d', '#46a83e',
      //   '#55b54e', '#64c35f',
      //   '#73d26f', '#81e07f',
      //   '#90ee90', 'FFFFFF']
    
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
    hoverinfo: 'label',
    hole: .25,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week',
    height: 500,
    width: 500,
    margin: { 1: 25, r: 25, b: 25, t: 75 },
    xaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    },
    yaxis: {
      zeroline: false, showticklabels: false,
      showgrid: false, range: [-1, 1]
    }

  };  
  Plotly.newPlot("gauge", data, layout);
}

function buildCharts(sample) {

    // @TODO: Use `d3.json` to fetch the sample data for the plots
    // @TODO: Build a Bubble Chart using the sample data

    d3.json(`/samples/${sample}`).then((sampleData) => {
      console.log(sampleData["otu_ids"]);

      var bubbleLayout = {
        margin: { t: 0 },
        hovermode: "closest",
        xaxis: { title: "OTU ID" }
      };

      var bubbleData = [{
        x: sampleData["otu_ids"],
        y: sampleData["sample_values"],
        text: sampleData["otu_labels"],
        mode: "markers",
        marker: {
          size: sampleData["sample_values"],
          color: sampleData["otu_ids"],
          colorscale: "Earth"
        }
      }];

      Plotly.newPlot("bubble", bubbleData, bubbleLayout);

      // Pie //
      var data = [];

      for (var i = 0; i < 80; i++) {
        dataDict = {};
        console.log(sampleData.length);
        dataDict["otu_ids"] = sampleData.otu_ids[i];
        dataDict["otu_labels"] = sampleData.otu_labels[i];
        dataDict["sample_values"] = sampleData.sample_values[i];
        data.push(dataDict)
      }
      console.log(data);
      data.sort(function (a, b) {
        return parseFloat(b.sample_values) - parseFloat(a.sample_values);
      });

      var pieData = data.slice(0, 10);
      console.log(pieData);

      // var pieValue = data.sample_values.slice(0,10);
      // var pielabel = data.otu_ids.slice(0, 10);
      // var pieHover = data.otu_labels.slice(0, 10);

      var pie = [{
        values: pieData.map(row => row.sample_values),
        labels: pieData.map(row => row.otu_ids),
        hovertext: pieData.map(row => row.otu_labels),
        type: 'pie'
      }];
      Plotly.newPlot('pie', pie);
    });
};
// @TODO: Build a Pie Chart
// HINT: You will need to use slice() to grab the top 10 sample_values,
// otu_ids, and labels (10 each).
// y: sampleData["sample_values"].slice(0,10),

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  d3.select("#bubble").selectAll("*").remove();
  d3.select("#pie").selectAll("*").remove();
  d3.select("#sample-metadata").selectAll("*").remove();
  d3.select("#guage").selectAll("*").remove();
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
