d3.json("http://localhost:8000/dendrogram_data.json").then(function(data){
  window.data = data
  init(data)
})

function init(root) {

  window.container = d3.select("#container")
    .append("svg")

  window.listing = d3.select("#list").append("ul")

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

// Used in restructuring/cutting off the tree
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


// Restructures the tree.
function cutTree(node, threshold) {
  function _cut(node) {
    // Restructure hierachy
    // Meaning, everything below the cutoff becomes a leaf
    if (node.distance <= threshold && node.children) {
      node.children = getAllLeaves(node)
      return
    }

    // Go deeper!
    for (let child in node.children) {
      _cut(node.children[child])
    }
  }
  _cut(node)

  return node
}


function list(event, data) {

  var items = data.leaves()

  console.log(items)
  const lists = window.listing.selectAll('li')
        .data(items)

  lists.enter().append('li')
    .merge(lists)
    .html(d => d.data.name)

  lists.exit().remove()

}

// Where the magic happens
const render = data => {

  const root = d3.hierarchy(data)
  var treeNodes = root.descendants()
  var treeLinks = root.links()

  var h_tree = 1000 // treeNodes.filter(d => d.children).length * 15
  var h_cont = document.getElementById('container').clientHeight

  var width = 1000
  var height = (h_tree <= h_cont) ? h_cont : h_tree
  // var width = document.getElementById('container').clientWidth

  const tree = d3.stackedtree().size([height, width]).ratio(0.2)(root)
  window.container.merge(window.container).attr("width", width).attr("height", height)

  var nodes = window.container.selectAll('.node')
        .data(treeNodes)

  var nodesEnter= nodes
      .enter().append("g")
      .attr("class", "node")
      .on("click", list)

  nodesEnter.append("circle")
    .attr("r", 4)

  nodesEnter.merge(nodes)
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
    .attr("fill", function(d) { return d.children ? "black" : "steelblue"; });

  nodes.exit().remove()

  // filters out all leaves
  // var links = window.container.selectAll('.link')
  //     .data(treeLinks.filter(d => d.target.children))

  // const linksEnter= links.enter()
  //       .append('path')
  //       .attr('class', 'link')
  //       .attr('fill', 'none')
  //       .attr('stroke', 'steelblue')
  //       .attr('stroke-width', '1px')

  // linksEnter.merge(links)
  //   .attr('d', diagonal)

  // links.exit().remove()
}

function updateRange(value) {
  document.getElementById("cutoffLabel").textContent = value

  var _data = JSON.parse(JSON.stringify(window.data))
  var data = cutTree(_data, value)

  render(data)
}
