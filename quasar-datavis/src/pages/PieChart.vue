<template>
    <div class="fullscreen q-pa-md flex flex-center">
        <div>
            <div class="text-h2" style="opacity: 0.4">Pie Chart</div>

            <q-btn
                class="q-mt-xl"
                color="white"
                text-color="blue"
                unelevated
                to="/"
                label="Go Home"
                no-caps
            />
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'PieChartPage',
    });
</script>
