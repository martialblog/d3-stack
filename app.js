d3.json("http://localhost:8000/dendrogram.json").then(function(data){
  window.data = data
  init(data)
})

function init(root) {

  window.container = d3.select("#container")
    .append("svg")

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
      {lx: d.source.x, ly: d.source.y/2},
      {lx: d.target.x, ly: d.source.y/2},
      {lx: d.target.x, ly: d.target.y/2}
    ]
  )
}

const list = data => {
  // TODO
}

const coord = function (d) {
  if (d.children == null) {
    // TODO: This can probably be fixed elsewhere
    const idx = d.data.index ? d.data.index : 1
    return `translate(${d.parent.y/2 + (idx * 11)}, ${d.parent.x})`
  }
  else {
    return `translate(${d.y/2},${d.x})`
  }
}

const colour = function (d) {
  if (d.data.children.length == 0) {
    return 'steelblue'
  }
  else {
    return '#f8766d'
  }
}

// Where the magic happens
const render = data => {

  const root = d3.hierarchy(data)
  var treeNodes = root.descendants()
  var treeLinks = root.links()

  var h_tree = treeNodes.filter(d => d.data.children.length > 1).length * 15
  var h_cont = document.getElementById('container').clientHeight

  var width = 1000
  var height = (h_tree <= h_cont) ? h_cont : h_tree
  // var width = document.getElementById('container').clientWidth

  const tree = d3.cluster().size([height, width])(root)
  window.container.merge(window.container).attr("width", width).attr("height", height)

  var nodes = window.container.selectAll('.node')
        .data(treeNodes)

  var nodesEnter= nodes.enter()
      .append('g')
      .attr("class", "node")
      .on("click", function(d){list(d)})

  nodesEnter.merge(nodes)
    .attr("transform", coord)

  nodesEnter.append('rect')
    .attr('width', '10px')
    .attr('height', '10px')

  nodesEnter.merge(nodes)
    .attr('fill', colour)

  nodes.exit().remove()

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
