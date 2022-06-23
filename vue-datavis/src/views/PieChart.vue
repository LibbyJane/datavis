<template>
    <v-card tonal>
        <v-card-header>
            <div>
                <div class="text-overline mb-1">Stay Motivated</div>
                <div class="text-h6 mb-1">Fitness Tracker</div>
                <!--
                <div class="text-caption"></div> -->
            </div>
        </v-card-header>

        <v-card-text>
            <section id="fitnessTracker">
                <v-row>
                    <v-col sm="6" md="2" class="d-flex flex-column justify-start">
                        <v-btn
                            v-for="activity in activities"
                            :class="buttonClass(activity)"
                            v-on:click="setActivity(activity)"
                            :data-activity="activity"
                        >
                            {{ activity }}
                        </v-btn>
                    </v-col>
                    <v-col sm="6" md="3" class="col-form">
                        <form v-on:submit="handleFormSubmit">
                            <label class="d-block mb-2" for="distance">
                                How much
                                <em :data-activity="selectedActivity">{{
                                    selectedActivity
                                }}</em>
                                have you done today?
                            </label>
                            <v-text-field
                                id="distanct"
                                placeholder="0"
                                hint="Distance in km"
                                persistent-hint
                                v-model="distance"
                                hide-details="auto"
                            ></v-text-field>
                        </form>
                    </v-col>
                    <v-col class="col-graph">
                        <div id="canvas" class="canvas js-linegraph-canvas"></div>
                    </v-col>
                </v-row>
            </section>
        </v-card-text>
    </v-card>
</template>

<script setup>
    import * as d3 from 'd3';
    import { ref, reactive, onMounted, watch } from 'vue';

    let activities = ['cycling', 'walking', 'swimming', 'running'];

    let selectedActivity = ref('cycling');
    let distance = ref('');
    let data = reactive([]);
    let formError = ref('');

    const setActivity = (activity) => {
        selectedActivity.value = activity;
    };

    const buttonClass = (activity) => {
        return activity === selectedActivity.value ? 'active mb-2' : 'mb-2';
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        if (distance) {
            db.collection('fitnessTracker')
                .add({
                    distance: distance.value,
                    activity: selectedActivity.value,
                    date: new Date().toString(),
                })
                .then(() => {
                    formError.value = '';
                    distance.value = '';
                })
                .catch((err) => console.log(err));
        } else {
            formError = 'Please enter a valid distance';
        }
    };

    const margin = { top: 40, right: 20, bottom: 50, left: 100 };
    const graphWidth = 560 - margin.right - margin.left;
    const graphHeight = 400 - margin.top - margin.bottom;

    const transition = {
        duration: 750,
    };

    onMounted(() => {
        // create svg container
        const svg = d3
            .select('#canvas')
            .append('svg')
            .attr('width', graphWidth + margin.left + margin.right)
            .attr('height', graphHeight + margin.top + margin.bottom);

        const graph = svg
            .append('g')
            .attr('width', graphWidth)
            .attr('height', graphHeight)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // scales
        const x = d3.scaleTime().range([0, graphWidth]);
        const y = d3.scaleLinear().range([graphHeight, 0]);

        // axes groups
        const xAxisGroup = graph
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,  ${graphHeight})`);

        const yAxisGroup = graph.append('g').attr('class', 'y-axis');

        // d3 line path generator
        const line = d3
            .line()
            //.curve(d3.curveCardinal)
            .x(function (d) {
                return x(new Date(d.date));
            })
            .y(function (d) {
                return y(d.distance);
            });

        // line path element
        const path = graph.append('path');

        // create dotted line group and append to graph
        const dottedLines = graph.append('g').attr('class', 'lines').style('opacity', 1);

        // create x dotted line and append to dotted line group
        const xDottedLine = dottedLines
            .append('line')
            .attr('stroke', 'var(--grey)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', 4);

        // create y dotted line and append to dotted line group
        const yDottedLine = dottedLines
            .append('line')
            .attr('stroke', 'var(--grey)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', 4);

        // update function
        const update = () => {
            // filter data based on current activity
            let filteredData = data.filter(
                (item) => item.activity === selectedActivity.value
            );

            // sort the data based on date objects
            filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

            //console.log('filteredData', filteredData);

            // set scale domains
            x.domain(d3.extent(filteredData, (d) => new Date(d.date)));
            y.domain([0, d3.max(filteredData, (d) => d.distance)]);

            // update path data
            path.data([filteredData])
                .attr('fill', 'none')
                .attr('stroke', 'var(--grey)')
                .attr('stroke-width', '2')
                .attr('d', line);

            // create circles for points
            const circles = graph.selectAll('circle').data(filteredData);

            // remove unwanted points
            circles.exit().remove();

            // update current points
            circles
                .attr('r', '4')
                .attr('cx', (d) => x(new Date(d.date)))
                .attr('cy', (d) => y(d.distance))
                .attr('class', (d) => d.activity)
                .attr('title', (d) => d.distance);

            // add new points
            circles
                .enter()
                .append('circle')
                .attr('r', '4')
                .attr('cx', (d) => x(new Date(d.date)))
                .attr('cy', (d) => y(d.distance))
                .attr('class', (d) => d.activity)
                .attr('title', (d) => d.distance);

            // add event listeners to circle (and show dotted lines)
            graph
                .selectAll('circle')
                .on('mouseover', (e, d) => {
                    d3.select(e.currentTarget)
                        .transition()
                        .duration(100)
                        .attr('r', 8)
                        .attr('class', (d) => d.activity);
                    // set x dotted line coords (x1,x2,y1,y2)
                    xDottedLine
                        .attr('x1', x(new Date(d.date)))
                        .attr('x2', x(new Date(d.date)))
                        .attr('y1', graphHeight)
                        .attr('y2', y(d.distance));
                    // set y dotted line coords (x1,x2,y1,y2)
                    yDottedLine
                        .attr('x1', 0)
                        .attr('x2', x(new Date(d.date)))
                        .attr('y1', y(d.distance))
                        .attr('y2', y(d.distance));
                    // show the dotted line group (opacity)
                    dottedLines.style('opacity', 1);
                })
                .on('mouseleave', (e, d) => {
                    d3.select(e.currentTarget).transition().duration(100).attr('r', 4);
                    // hide the dotted line group (opacity)
                    dottedLines.style('opacity', 0);
                });

            // create axes
            const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %d'));

            const yAxis = d3
                .axisLeft(y)
                .ticks(4)
                .tickFormat((d) => d + 'km');

            // call axes
            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);

            // rotate axis text
            xAxisGroup
                .selectAll('text')
                .attr('transform', 'rotate(-33)')
                .attr('text-anchor', 'end');
        };

        watch(selectedActivity, () => {
            update();
        });

        // data array and firestore
        db.collection('fitnessTracker')
            .orderBy('date')
            .onSnapshot((res) => {
                console.log('res', res);
                console.log('data', data);

                res.docChanges().forEach((change) => {
                    const doc = { ...change.doc.data(), id: change.doc.id };

                    switch (change.type) {
                        case 'added':
                            //console.log('added');
                            data.value = data.push(doc);
                            break;
                        case 'modified':
                            //console.log('modified');
                            const index = data.findIndex((item) => item.id == doc.id);
                            data[index] = doc;
                            break;
                        case 'removed':
                            //console.log('removed');
                            data.value = data.filter((item) => item.id !== doc.id);
                            break;
                        default:
                            break;
                    }
                });

                // call the update function
                update();
            });
    });
</script>

<style lang="scss">
    :root {
        --swimming: #0099dc;
        --running: #ff398a;
        --cycling: #00b482;
        --walking: #cb26bc;
    }

    .swimming {
        background-color: var(--swimming);
        fill: var(--swimming);
    }

    .running {
        background-color: var(--running);
        fill: var(--running);
    }

    .walking {
        background-color: var(--walking);
        fill: var(--walking);
    }

    .cycling {
        background-color: var(--cycling);
        fill: var(--cycling);
    }

    .text-swimming,
    [data-activity='swimming'] {
        color: var(--swimming);
    }

    .text-running,
    [data-activity='running'] {
        color: var(--running);
    }

    .text-walking,
    [data-activity='walking'] {
        color: var(--walking);
    }

    .text-cycling,
    [data-activity='cycling'] {
        color: var(--cycling);
    }

    button[data-activity='swimming'] {
        color: var(--swimming);
    }

    button[data-activity='running'] {
        color: var(--running);
    }

    button[data-activity='cycling'] {
        color: var(--cycling);
    }

    button[data-activity='walking'] {
        color: var(--walking);
    }

    button.active[data-activity='swimming'],
    button[data-activity='swimming']:hover,
    button[data-activity='swimming']:focus {
        background: var(--swimming);
        color: var(--white);
    }

    button.active[data-activity='running'],
    button[data-activity='running']:hover,
    button[data-activity='running']:focus {
        background: var(--running);
        color: var(--white);
    }

    button.active[data-activity='cycling'],
    button[data-activity='cycling']:hover,
    button[data-activity='cycling']:focus {
        background: var(--cycling);
        color: var(--white);
    }

    button.active[data-activity='walking'],
    button[data-activity='walking']:hover,
    button[data-activity='walking']:focus {
        background: var(--walking);
        color: var(--white);
    }

    .x-axis path,
    .y-axis path,
    .x-axis line,
    .y-axis line {
        stroke: var(--text);
    }

    .x-axis text,
    .y-axis text {
        fill: var(--text);
    }
</style>
