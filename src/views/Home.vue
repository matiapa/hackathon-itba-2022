<template>
  <v-row class="flex-column">
    <v-col>
      <HomeHeader />
    </v-col>
    <v-col>
      <v-row class="justify-center align-center px-8 py-10">
        <v-col class="d-flex flex-column align-center">
          <img src="@/assets/light-eyeglasses-violet.png" alt="Light Eyeglasses Logo" style="width: 180px; height: 78px">
          <h1 class="primary--text text-center mt-4" style="font-size: 60px">¡Bienvenido a Focus!</h1>
          <p class="text-center primary--text" style="font-size: 20px">Simplifica tu vida</p>
        </v-col>
        <v-col cols="auto" class="mr-14">
          <img src="@/assets/undraw_dev_focus_re_6iwt.svg" style="width: 600px;" />
        </v-col>
      </v-row>
    </v-col>
    <v-col>
      <v-row class="primary px-14 py-10">

        <v-col cols="auto" class="ml-8">
          <v-card class="pa-10">
            <img src="@/assets/undraw_insert_re_s97w.svg" style="width: 400px; height:400px" />
          </v-card>
        </v-col>
        <v-col class="ml-8 mr-10">
          <h1 class="secondary--text">¿Qué es Focus?</h1>
          <p class="secondary--text mt-4" style="font-size: 20px">
            Focus es una aplicación web que te ayudará a organizar tus tareas.
            <br>
            Analizará tus mails y te ayudará a mejorar tu productividad al traducir tus correos en tareas y 
            analizar la prioridad de cada uno.
            <br>
            <br>
          </p>
          <p class="secondary--text mt-4" style="font-size: 20px"> Focus se integra con:</p>
            <!-- add gmail logo -->
            <v-btn style="height: 60px" class="mr-5">
              <img src="@/assets/gmail.png" style="width: 40px; height: 40px" class="mr-3" /> <span style="font-size: 18px">Gmail</span>
            </v-btn>
            <v-btn style="height: 60px">
              <img src="@/assets/google-calendar.png" style="width: 40px; height: 40px" class="mr-3" /> <span style="font-size: 18px">Google Calendar</span>
            </v-btn>
          <p class="secondary--text mt-4" style="font-size: 20px">
            <br>
            <br>
            <!-- TODO: go to sign up -->
            <router-link to="login" class="white--text">¡Regístrate y empieza a usarla!</router-link>
          </p>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import HomeHeader from "@/components/Headers/HomeHeader.vue";

export default {
  name: 'Home',
  components: {
    HomeHeader
  }
}
</script>
