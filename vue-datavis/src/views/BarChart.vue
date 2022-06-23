<template>
    <v-card tonal>
        <v-card-header>
            <div>
                <div class="text-overline mb-1">Stay Motivated</div>
                <div class="text-h6 mb-1">Personal Activity Index</div>
                <!--
                <div class="text-caption"></div> -->
            </div>
        </v-card-header>

        <v-card-text>
            <section id="fitnessTracker">
                <v-row>
                    <v-col sm="6" md="2" class="col-form">
                        <form v-on:submit="handleFormSubmit">
                            <div class="d-flex flex-column mb-2">
                                <label for="date">Date</label>
                                <input type="date" v-model="date" id="date" required />
                            </div>
                            <v-text-field
                                label="Today's PAI"
                                v-model="PAI"
                                required
                            ></v-text-field>
                        </form>
                    </v-col>
                    <v-col md="5" class="col-graph">
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

    const config = {
        height: 500,
        width: 500,
        margin: {
            top: 20,
            right: 20,
            bottom: 100,
            left: 100,
        },
        padding: {
            inner: 0.2,
            outer: 0.1,
        },
        transition: {
            duration: 666,
        },
    };

    const graphWidth = config.width - config.margin.left - config.margin.right;
    const graphHeight = config.height - config.margin.top - config.margin.bottom;

    let data = reactive([]);

    let date = ref('');
    let PAI = ref('');
    let formError = ref('');

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const d = new Date(date.value);

        if (d && PAI.value) {
            console.log('d, pai', d, PAI.value);
            const item = {
                date: firebase.firestore.Timestamp.fromDate(d),
                value: parseInt(PAI.value),
            };

            db.collection('PAI')
                .add(item)
                .then((res) => {
                    console.log('res', res);
                    date.value = '';
                    PAI.value = '';
                });
        } else {
            formError = 'Please enter values before submitting';
        }
    };

    onMounted(() => {
        // select the container first
        const svg = d3
            .select('#canvas')
            .append('svg')
            .attr('viewBox', `0 0 ${config.width} ${config.height}`);

        const graph = svg
            .append('g')
            .attr('width', graphWidth)
            .attr('height', graphHeight)
            .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`);
        // create axes groups
        const xAxisGroup = graph
            .append('g')
            .attr('transform', `translate(0, ${graphHeight})`);

        xAxisGroup
            .selectAll('text')
            .attr('fill', 'var(--secondary)')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end');

        const yAxisGroup = graph.append('g');

        const y = d3.scaleLinear().range([graphHeight, 0]);
        // create a band scale, based on the number of items to be displayed & the graph width
        // domain = input values (min, max)
        // range = output values (min, max)
        const x = d3
            .scaleBand()
            .range([0, graphWidth])
            .paddingInner(config.padding.inner)
            .paddingOuter(config.padding.outer);
        // create & call axes
        const xAxis = d3.axisBottom(x).tickFormat((d) => {
            let date = new Date(d.seconds * 1000 + d.nanoseconds);
            const localeString = date.toLocaleString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
            });
            return localeString;
        });
        const yAxis = d3
            .axisLeft(y)
            .ticks(3)
            .tickFormat((d) => d + ' PAI');

        // update function
        const update = () => {
            //console.log('update', data);
            // create a linear scale, based on the Y axis
            // domain = input values (min, max)
            // range = output values (min, max)

            // could hardcode min / max, or use a D3 function
            // get min/max individually
            // const dataMin = d3.min(data, d => d.value);
            const dataMax = d3.max(data, (d) => d.value);
            // get an array with both min & max
            // const extent = d3.extent(data, d => d.value);
            // console.log('min, max, extent', dataMin, dataMax, extent)

            y.domain([0, dataMax]);
            x.domain(data.map((item) => item.date));

            // join the data to shapes
            const rects = graph.selectAll('rect').data(data);

            // remove any un-needed shapes
            rects.exit().remove();

            // add attrs to shapes already in the DOM
            rects
                .attr('x', (d) => x(d.date))
                .attr('fill', 'var(--secondary)')
                .attr('x', (d) => x(d.date))
                .attr('height', (d) => 0) // start with height of 0, offset is graph height to keep it aligned to the bottom of the Y axis
                .attr('y', (d) => graphHeight);

            // append additional shapes as need by the data
            rects
                .enter()
                .append('rect')
                .attr('fill', 'var(--secondary)')
                .attr('x', (d) => x(d.date))
                .attr('height', (d) => 0) // start with height of 0, offset is graph height to keep it aligned to the bottom of the Y axis
                .attr('y', (d) => graphHeight)
                .merge(rects) // subsequent steps apply to both shapes already in the dom and new shapes
                .transition()
                .duration(config.transition.duration)
                .attrTween('width', widthTween)
                .attr('height', (d) => graphHeight - y(d.value)) // transition to a height of the data value, adjust offset to keep it bottom aligned
                .attr('y', (d) => y(d.value));

            xAxisGroup.call(xAxis);
            yAxisGroup.call(yAxis);

            xAxisGroup
                .selectAll('text')
                .attr('transform', 'rotate(-33)')
                .attr('text-anchor', 'end');
        };

        // watch(selectedActivity, () => {
        //     update();
        // });

        // Tweens
        const widthTween = (d) => {
            let i = d3.interpolate(0, x.bandwidth());
            return function (t) {
                return i(t);
            };
        };

        db.collection('PAI')
            //.orderBy('date')
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

                update();
            });
    });
</script>
