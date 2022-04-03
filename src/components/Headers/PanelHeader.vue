<template>
    <v-row class="primary align-center justify-space-between" style="height: 80px">
        <router-link to="/" style="cursor: pointer;">
            <v-col class="ml-8 mt-2 d-flex align-center">
                <img src="@/assets/light-eyeglasses.png" alt="Light Eyeglasses Logo" style="width: 80px; height: 36px">
                <h1 class="secondary--text ml-4">Focus</h1>
            </v-col>
        </router-link>
        <v-col cols="auto" class="d-flex align-center mr-8">
            <h2 class="white--text mr-8 mt-2">Hola {{ user.given_name }}</h2>
            <v-btn class="mt-2 mr-4" fab small @click="openPreferences">
                <v-icon dark>
                    mdi-cog
                </v-icon>
            </v-btn> 
            <v-btn class="mt-2" @click="logout" fab small>
                <v-icon dark>
                    mdi-exit-to-app
                </v-icon>
            </v-btn>
        </v-col>
    </v-row>
</template>
<script>

export default {
    data() {
        return {
            user: {
                given_name: '',
            }
        }
    },
    methods: {
        logout() {
            this.$store.commit('logout')
            this.$router.push('/')
        },
        openPreferences() {
            this.$emit('preferences')
        }
    },
    mounted() {
        this.user = this.$store.state.user
    },
}
</script>
<style>
    
</style>