<template>
    <v-layout>
        <v-app-bar>
            <v-app-bar-title>Data Visualisation with D3</v-app-bar-title>
        </v-app-bar>

        <v-main>
            <v-container class="site-nav" fluid>
                <v-row dense>
                    <RouterLink class="" to="/">Line</RouterLink>
                    <v-divider class="mx-4" vertical></v-divider>

                    <RouterLink to="/pie">Pie</RouterLink>
                    <v-divider class="mx-4" vertical></v-divider>

                    <RouterLink to="/bar">Bar</RouterLink>
                </v-row>
            </v-container>
        </v-main>
    </v-layout>
</template>

<style lang="scss">
    .site-nav {
        a {
            color: var(--secondary);
            text-decoration: none;
        }

        .router-link-active {
            color: var(--secondary-light);

            &:hover,
            &:focus {
                pointer-events: none;
            }
        }
    }
</style>
