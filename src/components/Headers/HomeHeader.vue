<template>
    <v-row class="primary align-center justify-space-between" style="height: 80px">
        <v-col class="ml-8 mt-2 d-flex align-center">
            <img src="@/assets/light-eyeglasses.png" alt="Light Eyeglasses Logo" style="width: 80px; height: 36px">
            <h1 class="secondary--text ml-4">Focus</h1>
        </v-col>
        <v-col cols="auto" class="d-flex align-center mr-8" v-if="user == undefined"> 
            <router-link to="login">
            <v-btn text class="mt-2 mr-4 secondary--text font-weight-medium">Ingresar</v-btn>
            </router-link>
            <v-btn class="mt-2">Registrarse</v-btn>
        </v-col>
        <v-col cols="auto" class="d-flex align-center mr-8" v-if="user != undefined">
            <router-link to="/panel">
                <h2 class="white--text mr-8 mt-2">Hola {{ user.given_name }}</h2>
            </router-link>
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
    },
    mounted() {
        this.user = this.$store.state.user
    },
}
</script>
<style>
    
</style>