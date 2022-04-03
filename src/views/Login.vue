<template>
    <v-row class="secondary fill-height justify-center align-center ma-0">
        <v-col cols="auto" class="mr-14">
            <img src="@/assets/undraw_login_re_4vu2.svg" style="width: 600px;" />
        </v-col>
        <v-col cols="auto" class="ml-10">
            <v-card class="pa-14 fill-height d-flex flex-column align-center" color="primary" style="height: 600px;">
              <router-link to="/" style="cursor: pointer;">
              <img src="@/assets/light-eyeglasses.png" alt="Light Eyeglasses Logo" style="width: 200px; height: 90px;">
              </router-link>
              <h1 class="text-center white--text mt-8">Ingresar</h1>
              <v-btn @click="googleSignIn" class="py-6 px-5 mt-8">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" class="mr-3" />
                  Ingresar con Google
              </v-btn>
            </v-card>
        </v-col>
    </v-row>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
    }
  },
  methods: {
    googleSignIn() {
      this.$gAuth.getAuthCode().then(code => {
        axios.get('/login', {
          params: {
            code: code
          }
        }).then(res => {
          this.$store.commit('setLogged', res.data)
          this.$router.push('/panel')
        }).catch(err => {
          console.log(err)
        })
      })
    },
  },

}
</script>
<style>
    
</style>