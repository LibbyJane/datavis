'use strict';

docReady(function () {
    const dims = {
        height: 300,
        width: 300,
        radius: 150
    };

    const cent = {
        x: (dims.width / 2 + 5),
        y: (dims.height / 2 + 5)
    };

    const transition = {
        duration: 750
    };

    // create svg container
    const svg = d3.select('.js-piechart-canvas')
        .append('svg')
        .attr('width', dims.width + 150)
        .attr('height', dims.height + 150);

    const graph = svg.append('g')
        .attr("transform", `translate(${cent.x}, ${cent.y})`);
    // translates the graph group to the middle of the svg container

    // const pie = d3.pie()
    //     .sort(null) // leave the values in their original order
    //     .value(d => d.cost);
    // the value we are evaluating to create the pie angles

    //This function transform the value of each group to a radius
    //  This radius is then provided to the d3.arc() function that draws on arc per group.
    // const angles = pie([
    //     { name: 'rent', cost: 500 },
    //     { name: 'bills', cost: 300 },
    //     { name: 'gaming', cost: 200 }
    // ]);


    // console.log('angles', angles);
    // console.log('arc path', arcPath(angles[0]));

    const arcPath = d3.arc()
        .outerRadius(dims.radius)
        .innerRadius(dims.radius / 3);


    // d3 colour preset
    const colour = d3.scaleOrdinal(d3['schemeSet2']);

    const legendGroup = svg.append('g').attr('transform', `translate(${dims.width + 40}, 10)`);

    const legend = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle)())
        .shapePadding(10)
        .scale(colour);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html((EVENT, d) => {
            let content = `<h6>${d.name}</h6>
            <p>£${d.value}</p>
            <div class="delete">Click slice to delete</div>`;
            return content;
        });

    // update function
    const update = (data) => {
        // console.log('update', data);
        colour.domain(data.map(
            d => d.name
        ));

        // update legend
        legendGroup.call(legend);
        legendGroup.selectAll('text').attr('fill', 'black');

        const anglesFn = d3.pie()
            .value((d) => d.value);
        const angles = anglesFn(data);
        // remove any un-needed shapes

        // join enhanced (pie) data to path elements
        let paths = graph.selectAll('path').data(angles);

        paths.exit()
            .transition().duration(transition.duration).attrTween('d', arcTweenExit)
            .remove();
        paths = graph.selectAll('path').data(angles);
        paths
            .attr('d', arcPath)
            .transition().duration(transition.duration).attrTween('d', arcTweenUpdate)
            ;
        paths.enter()
            .append('path')
            .attr('class', 'arc')
            //.attr('d', arcPath) // the arc tween takes care of the start position
            .attr('stroke', 'white')
            .attr('stroke-width', 6)
            .attr('fill', d => colour(d.data.name))
            .each(function (d) { this._current = d }) // store the initial state for eache segment
            .transition().duration(transition.duration).attrTween('d', arcTweenEnter)
            ;

        // add events
        graph.selectAll('path')
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut)
            .on('click', handleClick);

        svg.call(tip);
    };
    // event handlers
    const handleMouseOver = (e, d) => {
        d3.select(e.currentTarget)
            .transition('changeSliceFill') // naming the transition prevents it from interacting with other transitions (can cause bugs)
            .duration(transition.duration)
            // .attr('stroke', d => colour(d.data.name))
            .style("opacity", .6)
            // .style('stroke-dasharray', '6,3')
            ;

        tip.show(e, d.data);
    }

    const handleMouseOut = (e) => {
        d3.select(e.currentTarget)
            .transition('changeSliceFill').duration(transition.duration)
            // .attr('stroke', 'white')
            .style("opacity", 1)
            // .style('stroke-dasharray', '0,0 ')
            ;
        tip.hide;
    }

    const handleClick = (e, d) => {
        db.collection('nutrition').doc(d.data.id).delete();
    }

    // data array and firestore
    var data = [];

    db.collection('nutrition').orderBy('value').onSnapshot(res => {
        // console.log('res', res)
        res.docChanges().forEach(change => {
            const doc = { ...change.doc.data(), id: change.doc.id, name: change.doc.id };


            switch (change.type) {
                case 'added':
                    //console.log('added');
                    data.push(doc);
                    break;
                case 'modified':
                    //console.log('modified');
                    const index = data.findIndex(item => item.id == doc.id);
                    data[index] = doc;
                    break;
                case 'removed':
                    //console.log('removed');
                    data = data.filter(item => item.id !== doc.id);
                    break;
                default:
                    break;
            }

        });

        // call the update function
        update(data);

    });

    const arcTweenEnter = (d) => {
        const i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

        return function (t) {
            d.startAngle = i(t);
            return arcPath(d);
        };
    }


    const arcTweenExit = (d) => {
        const i = d3.interpolate(d.startAngle, d.endAngle);

        return function (t) {
            d.startAngle = i(t);
            return arcPath(d);
        };
    }

    // function keyword to allow use of 'this'
    function arcTweenUpdate(d) {
        const i = d3.interpolate(this._current, d);
        this._current = i(1);

        return function (t) {
            return arcPath(i(t));
        };
    }
});