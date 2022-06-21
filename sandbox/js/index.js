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
    },
    transition: d3.transition().duration(666)
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

xAxisGroup.selectAll('text')
    .attr('fill', 'orange')
    .attr('transform', 'rotate(-40)')
    .attr('text-anchor', 'end')
    ;

const yAxisGroup = graph.append('g');

const y = d3.scaleLinear()
    .range([graphHeight, 0])
    ;

// create a band scale, based on the number of items to be displayed & the graph width
// domain = input values (min, max)
// range = output values (min, max)
const x = d3.scaleBand()
    .range([0, graphWidth])
    .paddingInner(config.padding.inner)
    .paddingOuter(config.padding.outer)
    ;

// create & call axes
const xAxis = d3.axisBottom(x)

    .tickFormat(d => {
        let date = new Date(d.seconds * 1000 + d.nanoseconds);
        console.log('nanoseconds, seconds, diff', d.nanoseconds, d.seconds);
        console.log('date from nanoseconds', new Date(d.nanoseconds));
        console.log('date from seconds', new Date(d.seconds));
        console.log('date from both', new Date(d.seconds * 1000 + d.nanoseconds));
        const localeString = date.toLocaleString('en-GB', {
            weekday: 'short',
            day: 'numeric',

            month: 'short'
        });
        return localeString
    }
    )
    ;
const yAxis = d3.axisLeft(y)
    .ticks(3)
    .tickFormat(d => d + ' PAI')
    ;

const update = (data) => {
    // create a linear scale, based on the Y axis
    // domain = input values (min, max)
    // range = output values (min, max)

    // could hardcode min / max, or use a D3 function
    // get min/max individually
    // const dataMin = d3.min(data, d => d.value);
    const dataMax = d3.max(data, d => d.value);
    // get an array with both min & max
    // const extent = d3.extent(data, d => d.value);
    // console.log('min, max, extent', dataMin, dataMax, extent)

    y.domain([0, dataMax]);
    x.domain(data.map(item => item.date));


    // join the data to shapes
    const rects = graph.selectAll('rect')
        .data(data);

    // remove any un-needed shapes
    rects.exit().remove();

    // add attrs to shapes already in the DOM
    rects
        .attr('width', x.bandwidth)
        .attr('fill', 'orange')
        .attr('x', d => x(d.date))
        ;

    // append additional shapes as need by the data
    rects.enter()
        .append('rect')
        .attr('fill', 'orange')
        .attr('x', d => x(d.date))
        .attr('height', d => 0)  // start with height of 0, offset is graph height to keep it aligned to the bottom of the Y axis
        .attr('y', d => graphHeight)
        .merge(rects) // subsequent steps apply to both shapes already in the dom and new shapes
        .transition(config.transition)
        .attrTween('width', widthTween)
        .attr("height", d => graphHeight - y(d.value))  // transition to a height of the data value, adjust offset to keep it bottom aligned
        .attr('y', d => y(d.value))
        ;

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
}

db.collection('PAI').onSnapshot(res => {
    let data = [];

    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id };

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => item.id == doc.id);
                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }
    });

    update(data);
});

// Tweens
const widthTween = (d) => {
    let i = d3.interpolate(0, x.bandwidth());
    return function (t) {
        return i(t);
    }
};
// db.collection('PAI').get().then(res => {
//     let data = [];

//     res.docs.forEach(doc => {
//         data.push(doc.data());
//     })

//     // d3.interval(() => {
//     //     data.pop();
//     //     update(data);
//     // }, 3000);

//     // d3.interval(() => {
//     //     data[0].value += 1;
//     //     update(data);
//     // }, 1000);

//     update(data);
// });
