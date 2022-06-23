<template>
    <!-- <RouterView /> -->
    <SiteHeader />
    <v-card class="mx-3">
        <RouterView v-slot="{ Component }">
            <template v-if="Component">
                <Transition mode="out-in">
                    <Suspense>
                        <component :is="Component"></component>
                        <template #fallback> Loading... </template>
                    </Suspense>
                </Transition>
            </template>
        </RouterView>
    </v-card>
</template>

<script setup>
    import SiteHeader from '@/components/layout/SiteHeader.vue';
</script>

<style lang="scss">
    :root {
        --primary: #0c47de;
        --secondary: #ff7d5f;
        --secondary-light: #ffbe4e;

        --white: #fff;
        --off-white: #e8e8f1;
        --black: #2a272a;
        --grey-4: #4b4a54;
        --grey: #677381;

        --text: var(--off-white);
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
        //color: var(--white) !important;
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

    form fieldset {
        border: 0;
        padding-top: 1rem;
    }

    form em {
        color: var(--primary);
        font-style: normal;
        font-weight: 600;
    }

    .input-field {
        border: thin solid var(--off-white);
        position: relative;
    }
</style>
