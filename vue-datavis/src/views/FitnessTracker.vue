<template>
    <v-card tonal>
        <v-card-header>
            <div>
                <div class="text-overline mb-1">OVERLINE</div>
                <div class="text-h6 mb-1">Headline</div>
                <div class="text-caption">
                    Greyhound divisely hello coldly fonwderfully
                </div>
            </div>
        </v-card-header>

        <v-card-text>
            <section id="fitnessTracker">
                <div class="cols">
                    <div class="col is-activities">
                        <button
                            v-for="activity in activities"
                            :class="buttonClass(activity)"
                            v-on:click="setActivity(activity)"
                            :data-activity="activity"
                        >
                            {{ activity }}
                        </button>
                    </div>

                    <form id="ftForm" class="col is-form">
                        <h6>
                            How much
                            <em :data-activity="selectedActivity">{{
                                selectedActivity
                            }}</em>
                            have you done today?
                        </h6>
                        <input
                            v-model="distance"
                            type="text"
                            id="cycling"
                            placeholder="Distance in km"
                        />
                        <p id="ftError"></p>
                    </form>

                    <div class="col is-graph">
                        <div id="canvas" class="canvas js-linegraph-canvas"></div>
                    </div>
                </div>
            </section>
        </v-card-text>

        <v-card-actions>
            <v-btn variant="outlined"> Button </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import * as d3 from 'd3';
    import { ref, onMounted } from 'vue';

    let activities = ['cycling', 'walking', 'swimming', 'running'];

    let selectedActivity = ref('cycling');
    let distance = ref('0');

    const setActivity = (activity) => {
        selectedActivity.value = activity;
    };

    const buttonClass = (activity) => {
        return activity === selectedActivity.value ? 'active' : '';
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

        // update function
        const update = (data) => {
            console.log(data);

            // set scale domains
            x.domain(d3.extent(data, (d) => new Date(d.date)));
            y.domain([0, d3.max(data, (d) => d.distance)]);

            // create circles for points
            const circles = graph.selectAll('circle').data(data);

            // remove unwanted points
            circles.exit().remove();

            // update current points
            circles
                .attr('cx', (d) => x(new Date(d.date)))
                .attr('cy', (d) => y(d.distance));

            // add new points
            circles
                .enter()
                .append('circle')
                .attr('r', '4')
                .attr('cx', (d) => x(new Date(d.date)))
                .attr('cy', (d) => y(d.distance))
                .attr('class', (d) => d.activity);

            // create axes
            const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%b %d'));

            const yAxis = d3
                .axisLeft(y)
                .ticks(4)
                .tickFormat((d) => d + 'm');

            // call axes
            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);

            // rotate axis text
            xAxisGroup
                .selectAll('text')
                .attr('transform', 'rotate(-40)')
                .attr('text-anchor', 'end');
        };

        // data array and firestore
        var data = [];

        db.collection('fitnessTracker')
            .orderBy('date')
            .onSnapshot((res) => {
                // console.log('res', res)
                res.docChanges().forEach((change) => {
                    const doc = { ...change.doc.data(), id: change.doc.id };

                    switch (change.type) {
                        case 'added':
                            //console.log('added');
                            data.push(doc);
                            break;
                        case 'modified':
                            //console.log('modified');
                            const index = data.findIndex((item) => item.id == doc.id);
                            data[index] = doc;
                            break;
                        case 'removed':
                            //console.log('removed');
                            data = data.filter((item) => item.id !== doc.id);
                            break;
                        default:
                            break;
                    }
                });

                // call the update function
                update(data);
            });
    });
</script>

<style lang="scss">
    :root {
        --primary: #0c47de;
        --secondary: #ff7d5f;
        --secondary-light: #ffbe4e;

        --swimming: #0099dc;
        --running: #ff398a;
        --cycling: #00b482;
        --walking: #cb26bc;
        --white: #fff;
        --off-white: #e8e8f1;
        --black: #2a272a;
        --text: #4b4a54;
        --grey: #677381;
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

    body {
        background: var(--grey);
        color: var(--text);
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        font-size: 1.1rem;
    }

    main {
        padding: 2rem;
    }

    section {
        background: var(--white);
        color: var(--text);
        margin: 0 auto 1rem;
        padding: 0;
    }

    button {
        background: var(--off-white);
        border: 0 none;
        color: var(--primary);
        cursor: pointer;
        font-weight: 600;
        padding: 0.5rem;
        transition: all 300ms;
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

    button.active[data-activity='runwalkingning'],
    button[data-activity='walking']:hover,
    button[data-activity='walking']:focus {
        background: var(--walking);
        color: var(--white);
    }

    button[type='submit'] {
        background: var(--secondary);
        color: var(--white);
    }

    button[type='submit']:hover {
        background: var(--secondary-light);
    }

    .active {
        background: var(--primary);
        color: var(--white) !important;
    }

    .fill-primary {
        fill: var(--primary);
    }

    .cols {
        display: flex;
    }

    .col {
        flex: 0 0 auto;
        margin: 1rem;
    }

    .is-activities {
        display: flex;
        flex-direction: column;
    }

    .is-graph {
        margin-left: auto;
    }

    .is-activities button {
        display: block;
        margin: 0 0 0.5rem;
        padding: 0.5rem 1.5rem;
    }

    form fieldset {
        border: 0;
        padding-top: 1rem;
    }

    form em {
        color: var(--primary);
        font-style: normal;
        font-weight: 600;
    }

    h6 {
        font-size: 1.2rem;
        margin: 0 0 1rem;
        padding: 0;
    }

    p {
        margin: 0 0 1rem;
        padding: 0;
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
