const width = '100%';
const height = '400';

const elemWidth = 100;
const elemHeight = 30;

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


const container = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height);

const render = data => {

  var groups = container.selectAll('.stack')
        .data(data)

  var stacks = groups.selectAll('.elem')
        .data(d => d.data)

  var groupsEnter = groups.enter()
      .append('g')
      .attr("class", "stack")

  groupsEnter.merge(groups)
    .attr('transform', function(d) {
      return "translate(" + (d.id * (elemWidth + 10)) + ",0)"
    })

  var stacksEnter= stacks.enter()
      .append('g')
      .attr("class", "elem")

  stacksEnter.merge(stacks)
    .attr('transform', function(d, idx) {
      return "translate(0," + (idx * (elemHeight + 10)) + ")"
    })

  stacksEnter.append('rect')
    .attr('width', elemWidth)
    .attr('height',  elemHeight)
    .attr('fill', 'steelblue')

  stacksEnter.append('text')
    .text(d => d)
    .attr('y', 20)
    .attr('x', 5)

  groups.exit().remove()
  stacks.exit().remove()
}

function updateRange(value) {
  document.getElementById("cutoffLabel").textContent = value

  var data = cutTree(tree, value)
  render(data)
}
