var data = [
  { id: 0, data: ["elem1", "elem2"]},
  { id: 1, data: ["elem3", "elem4"]},
  { id: 3, data: ["elem5", "elem6", "elem7"]}
]

const width = 600;
const height = 600;

const container = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height);

container.selectAll('rect')
  .data(data)
  .enter().append('g')
  .attr("class", "stack")
  .each(function(elem, idx){
    d3.select(this).selectAll('rect')
      .data(elem.data)
      .enter().append('rect')
      .attr("class", "elem")
      .attr('y', function(elem, idx) { return idx * 100; })
      .attr('x', function() { return idx * 100; })
      .attr('width', function() { return 90; })
      .attr('height', function() { return 90; })
      .attr('fill', 'red')
  });

//   .attr('x', d => xScale(d.id))
