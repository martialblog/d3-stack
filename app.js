const width = 600;
const height = 600;

const elemWidth = 100
const elemHeight = 30

const tree = {
  "name": "root",
  "distance": 5.5,
  "children": [
    {
      "name": "someone",
      "distance": 1.5,
      "children": [
        {
          "name": "ned",
          "distance": 0.0,
          "children": []
        },
        {
          "name": "catelyn",
          "distance": 0.71,
          "children": [
            {
              "name": "sansa",
              "distance": 0.0,
              "children": []
            },
            {
              "name": "rickon",
              "distance": 0.0,
              "children": []
            }
          ]
        }
      ]
    },
    {
      "name": "balon",
      "distance": 2.05,
      "children": [
        {
          "name": "yara",
          "distance": 0.0,
          "children": []
        },
        {
          "name": "foobar",
          "distance": 1.9,
          "children": [
            {
              "name": "john",
              "distance": 0.0,
              "children": []
            },
            {
              "name": "somebody",
              "distance": 1.12,
              "children": [
                {
                  "name": "euron",
                  "distance": 0.0,
                  "children": []
                },
                {
                  "name": "theon",
                  "distance": 0.0,
                  "children": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const hiera = d3.hierarchy(tree)
var cutoffMin = Number.MAX_VALUE;
var cutoffMax = Number.MIN_VALUE;

hiera.descendants().forEach(function (node) {
    if (node.data.distance !== null) {
      if (node.data.distance > cutoffMax) cutoffMax = node.data.distance;
      if (node.data.distance < cutoffMin) cutoffMin = node.data.distance;
    }
});

document.getElementById("cutoff").min = cutoffMin
document.getElementById("cutoff").max = cutoffMax
document.getElementById("cutoff").step = 0.1


function getAllLeaves(node) {
  var leaves = [];
  function _getLeaves(node) {
    if (node.children.length == 0) {
      leaves.push(node.name)
      return
    }
    for (let child in node.children) {
      _getLeaves(node.children[child]);
    }
  }
  _getLeaves(node);
  return leaves;
}

function cutTree(node, threshold) {
  var clusters = [];

  function _cut(node) {
    if (node.distance <= threshold || node.children == null) {
      var cluster = {
        data: getAllLeaves(node)
      }
      clusters.push(cluster);
      return
    }
    for (let child in node.children) {
      _cut(node.children[child]);
    }
  }
  _cut(node);

  // TODO: Better solution?
  for  (idx = 0; idx < clusters.length; idx++) {
    clusters[idx].id = idx
  }

  return clusters;
}

const render = data => {

  const xScale = d3.scaleBand()
        .domain(data.map(d => d.id))
        .range([0, width])

  const container = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height);

  container.selectAll('rect')
    .data(data)
    .enter().append('g')
    .attr("class", "stack")
    .attr('transform', function(d, i) {
      return "translate(" + xScale(d.id) + ", 0)"
    })
    .each(function(elem, idx){
      d3.select(this).selectAll('rect')
        .data(elem.data)
        .enter().append('rect')
        .attr("class", "elem")
        .attr('y', function(elem, idx) { return idx * (elemHeight + 10); })
        .attr('width', function() { return elemWidth; })
        .attr('height', function() { return elemHeight; })
        .attr('fill', 'steelblue')
    });

}

function updateRange(value) {
  var data = cutTree(tree, value)
  render(data)
}
