'use strict';

const config = {
    height: 600,
    width: 600,
    margin: {
        top: 20,
        right: 20,
        bottom: 100,
        left: 100
    },
    padding: {
        inner: 0.2,
        outer: 0.1
    }
}

const graphWidth = config.width - config.margin.left - config.margin.right;
const graphHeight = config.height - config.margin.top - config.margin.bottom;

// select the container first
const svg = d3.select('.js-canvas')
    .append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    ;

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`)
    ;

// create axes groups
const xAxisGroup = graph.append('g')
    .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

// async load the json data
d3.json('data/bar-chart.json').then(data => {

    // create a linear scale, based on the Y axis
    // domain = input values (min, max)
    // range = output values (min, max)

    // could hardcode min / max, or use a D3 function
    // get min/max individually
    const dataMin = d3.min(data, d => d.orders);
    const dataMax = d3.max(data, d => d.orders);
    // get an array with both min & max
    const extent = d3.extent(data, d => d.orders);
    // console.log('min, max, extent', dataMin, dataMax, extent)

    const y = d3.scaleLinear()
        .domain([0, dataMax])
        .range([graphHeight, 0])
        ;

    // create a band scale, based on the number of items to be displayed & the graph width
    // domain = input values (min, max)
    // range = output values (min, max)
    const x = d3.scaleBand()
        .domain(data.map(item => item.name))
        .range([0, graphWidth])
        .paddingInner(config.padding.inner)
        .paddingOuter(config.padding.outer)
        ;

    // join the data to circs
    const rects = graph.selectAll('rect')
        .data(data);

    // add attrs to circs already in the DOM
    rects
        .attr('width', x.bandwidth)
        .attr("height", d => graphHeight - y(d.orders))
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.orders))
        ;

    // append the enter selection to the DOM
    rects.enter().append('rect')
        .attr('width', x.bandwidth)
        .attr("height", d => graphHeight - y(d.orders))
        .attr('fill', 'orange')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.orders))
        ;

    // create & call axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(d => d + ' orders')
        ;

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);


    xAxisGroup.selectAll('text')
        .attr('fill', 'orange')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
        ;
    const msInADay = 864e5;
    var yesterday = new Date(Date.now() - msInADay);
    console.log(Date.now());
});
