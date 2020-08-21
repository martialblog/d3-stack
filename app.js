var data = [
  { id: 0, data: ["elem1", "elem2"]},
  { id: 1, data: ["elem3", "elem4"]},
  { id: 3, data: ["elem5", "elem6", "elem7"]},
  { i4: 3, data: ["elem5", "elem6", "elem7"]}
]

const width = 600;
const height = 600;

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
      .attr('y', function(elem, idx) { return idx * 200; })
      //.attr('x', function() { return idx * 200; })
      .attr('width', function() { return 100; })
      .attr('height', function() { return 50; })
      .attr('fill', 'red')
  });
