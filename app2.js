var data = {
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

window.data = data

init(data)

function init(root) {

  var width = '100%';
  var height = '100%'

  window.container = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height)

  var cutoffMin = Number.MAX_VALUE;
  var cutoffMax = Number.MIN_VALUE;

  d3.hierarchy(data).descendants().forEach(function (node) {
    if (node.data.distance !== null) {
      if (node.data.distance > cutoffMax) cutoffMax = node.data.distance;
      if (node.data.distance < cutoffMin) cutoffMin = node.data.distance;
    }
  });

  document.getElementById("cutoff").min = cutoffMin
  document.getElementById("cutoff").max = cutoffMax
  document.getElementById("cutoff").step = 0.1
  // TODO: First render here?
}


function getAllLeaves(node) {
  var leaves = []
  function _getLeaves(node) {
    if (node.children.length == 0) {
      leaves.push({"name": node.name, "distance": node.distance, "children": []})
      return
    }
    for (let child in node.children) {
      _getLeaves(node.children[child])
    }
  }
  _getLeaves(node)
  return leaves
}

function cutTree(node, threshold) {

  function _cut(node) {
    if (node.distance <= threshold || node.children == null) {
      node.children = getAllLeaves(node)
      return
    }
    for (let child in node.children) {
      _cut(node.children[child])
    }
  }
  _cut(node)

  return node
}

const diagonal = function (d) {
  return d3.line().x(point =>  point.ly).y(point =>  point.lx)(
    [
      {lx: d.source.x, ly: d.source.y},
      {lx: d.target.x, ly: d.source.y},
      {lx: d.target.x, ly: d.target.y}
    ]
  )
}

// Where the magic happens
const render = data => {

  root = d3.hierarchy(data)
  tree = d3.tree().size([500, 800])(root)

  var treeNodes = window.root.descendants()
  var treeLinks = window.root.links()

  var nodes = window.container.selectAll('.node')
        .data(treeNodes)

  const nodesEnter= nodes.enter()
      .append('g')
        .attr("class", "node")
        .attr("transform", d => "translate(" + d.y + "," + d.x + ")")

  nodesEnter.append('rect')
    .attr('class', 'node')
    .attr('width', '10px')
    .attr('height', '10px')
    .attr('fill', 'steelblue')

  nodesEnter.append('text')
    .text((d => d.data.name))

  var links = window.container.selectAll('.link')
        .data(treeLinks)

  const linksEnter= links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1px')
        .attr("d", diagonal)

  nodes.exit().remove()
  links.exit().remove()
}

function updateRange(value) {
  document.getElementById("cutoffLabel").textContent = value

  var data = cutTree(window.data, value)
  render(data)
}
