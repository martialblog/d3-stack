// window.data = data
// init(data)

d3.json("http://localhost:8000/dendrogram.json").then(function(data){
  window.data = data
  init(data)
})


function init(root) {

  var width = '100%'
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
  document.getElementById("cutoff").step = 1
  // TODO: First render here?
}

function getAllLeaves(node) {
  var leaves = []
  function _getLeaves(node) {
    if (node.children.length == 0) {
      leaves.push({
        "name": node.name,
        "distance": node.distance,
        "children": []
      })
      return
    }
    for (let child in node.children) {
      _getLeaves(node.children[child])
    }
  }
  _getLeaves(node)

  // Add index to each node, so that we can use it later
  for  (idx = 0; idx < leaves.length; idx++) {
    leaves[idx].index = idx + 1
  }

  return leaves
}

function cutTree(node, threshold) {

  function _cut(node) {
    if (node.distance <= threshold && node.children.length > 0) {
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

const list = data => {

  // TODO

}

const leaves = function (d) {
  if (d.children == null) {
    // TODO: This can probably be fixed elsewhere
    const idx = d.data.index ? d.data.index : 1
    return `translate(${d.parent.y + (idx * 12)}, ${d.parent.x})`
  }
  else {
    return `translate(${d.y},${d.x})`
  }
}

const colour = function (d) {
  if (d.data.children.length == 0) {
    return 'steelblue'
  }
  else {
    return 'red'
  }
}

// Where the magic happens
const render = data => {

  const root = d3.hierarchy(data)
  // TODO: better size calculation
  const tree = d3.cluster().size([800, 1000])(root)

  var treeNodes = root.descendants()

  var nodes = window.container.selectAll('.node')
        .data(treeNodes)

  var nodesEnter= nodes.enter()
      .append('g')
      .attr("class", "node")
      .on("click", function(d){list(d)})

  nodesEnter.merge(nodes)
    .attr("transform", leaves)

  nodesEnter.append('rect')
    .attr('width', '8px')
    .attr('height', '8px')

  nodesEnter.merge(nodes)
    .attr('fill', colour)

  nodes.exit().remove()

  var treeLinks = root.links()

  // filters out all leaves
  var links = window.container.selectAll('.link')
      .data(treeLinks.filter(d => d.target.data.children.length > 1))

  const linksEnter= links.enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '1px')

  linksEnter.merge(links)
    .attr('d', diagonal)

  links.exit().remove()
}

function updateRange(value) {
  document.getElementById("cutoffLabel").textContent = value

  // Needs a pass-by-value
  // Use d3-hierachy copy?
  var _data = JSON.parse(JSON.stringify(window.data))
  var data = cutTree(_data, value)
  render(data)
}
