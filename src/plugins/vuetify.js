import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#6C63FF",
                secondary: "#ECECEC",
                accent: "#FFC300",
                danger: "#FF1818"
            },
        },
    },
});
