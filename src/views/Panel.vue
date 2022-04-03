<template>
    <v-row class="flex-column">
        <v-col>
            <Header @preferences="openPreferences" />
        </v-col>
        <v-col class="mt-8">
            <v-container fluid class="mx-4" style="position: relative">
                <v-btn fab absolute top right large class="white--text" color="orange" style="right: 80px;" @click="openCreateTask">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-row class="justify-center">
                    <v-col cols="11">
                        <v-row v-drag-and-drop:options="options">
                            <v-card class="py-4 mx-2 px-1" :class="{'px-8 ml-4': index == groups.length - 1}" v-for="(group, index) in groups" :key="group.id" style="min-height: 800px" :style="index == groups.length - 1 ? 'width: 280px': 'width: 220px'"
                            :color="isDate(index) ? 'primary lighten-4': ''">
                                <div class="d-flex justify-center mb-4">
                                    <div class="primary white--text text-center align-center pt-2" style="border-radius: 100%; width: 40px; height: 40px">
                                        {{getDateNumber(index)}}
                                    </div>
                                </div>
                                
                                <p style="font-size: 20px" class="text-center" :style="index == groups.length - 1 ? 'font-size: 24px': ''">{{ group.name }}</p>
                                <vue-draggable-group
                                    v-model="group.items"
                                    :groups="groups"
                                    :data-id="index"
                                >
                                    <div class="drag-inner-list" style="height: 90%">
                                        <div class="drag-item secondary" style="cursor: pointer;" v-for="item in group.items" :key="item.id" :data-id="item.index" @click="openModal(item.index)">
                                            <div class="circle" :class="{'red': item.priority == '3', 'yellow': item.priority == '2', 'green': item.priority == '1'}"></div>
                                            <span style="font-size: 12px;">{{ item.title }}</span><br>
                                            <span style="font-size: 12px" v-if="item.start_date !== null">{{item.start_hour}} - {{item.end_hour}}</span>
                                        </div>
                                        <p class="text-center" v-if="group.items.length == 0 && index != groups.length - 1">No tienes tareas para este día</p>
                                        <p class="text-center" v-if="group.items.length == 0 && index == groups.length - 1">No tienes tareas pendientes</p>
                                    </div>
                                </vue-draggable-group>
                            </v-card>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
            <v-dialog  v-model="dialog" width="600">
                <v-card v-if="selectedActivity != undefined">
                    <v-card-title class="text-h5 primary white--text">
                    {{selectedActivity.title}}
                    </v-card-title>

                    <table class="pa-8">
                        <tr>
                            <td>Descripción:</td>
                            <td class="mb-4">
                                <textarea rows="3" cols="28" style="border: solid 1px black; padding: 8px; border-radius: 5px"
                                    v-model="selectedActivity.description"
                                ></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td>Prioridad:</td>
                            <td>
                                <v-select
                                    item-text="name"
                                    item-value="value"
                                    :items="priorities"
                                    label="Prioridad"
                                    v-model="selectedActivity.priority"
                                ></v-select>
                            </td>
                        </tr>
                        <tr>
                            <td>Fecha:</td>
                            <td>
                                <v-menu
                                    ref="menu"
                                    v-model="menu"
                                    :close-on-content-click="false"
                                    :return-value.sync="selectedActivity.start_date"
                                    transition="scale-transition"
                                    offset-y
                                    min-width="auto"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="selectedActivity.start_date"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                    ></v-text-field>
                                    </template>
                                    <v-date-picker
                                    v-model="selectedActivity.start_date"
                                    no-title
                                    scrollable
                                    >
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        text
                                        color="primary"
                                        @click="menu = false"
                                    >
                                        Cancelar
                                    </v-btn>
                                    <v-btn
                                        text
                                        color="primary"
                                        @click="$refs.menu.save(selectedActivity.start_date)"
                                    >
                                        OK
                                    </v-btn>
                                    </v-date-picker>
                                </v-menu>
                            </td>
                        </tr>
                        <tr>
                            <td>Hora Inicio:</td>
                            <td>
                                <v-menu
                                    ref="menu2"
                                    v-model="menu2"
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    :return-value.sync="selectedActivity.start_hour"
                                    transition="scale-transition"
                                    offset-y
                                    max-width="290px"
                                    min-width="290px"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                    <v-text-field
                                        v-model="selectedActivity.start_hour"
                                        prepend-icon="mdi-clock-time-four-outline"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                    ></v-text-field>
                                    </template>
                                    <v-time-picker v-if="menu2" v-model="selectedActivity.start_hour" full-width
                                        @click:minute="$refs.menu2.save(selectedActivity.start_hour)"
                                    ></v-time-picker>
                                </v-menu>
                            </td>
                        </tr>
                        <tr>
                            <td>Hora Fin:</td>
                            <td>
                                <v-menu ref="menu3" v-model="menu3" :close-on-content-click="false" :nudge-right="40" :return-value.sync="selectedActivity.end_hour"
                                    transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="selectedActivity.end_hour" prepend-icon="mdi-clock-time-four-outline" readonly
                                            v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-time-picker v-if="menu3" v-model="selectedActivity.end_hour" full-width
                                     @click:minute="$refs.menu3.save(selectedActivity.end_hour)"
                                    ></v-time-picker>
                                </v-menu>
                            </td>
                        </tr>
                    </table>

                    <div class="d-flex justify-center">
                        <v-btn class="mb-8 mx-center primary" @click="updateActivity">Actualizar</v-btn>
                    </div>

                    <v-divider></v-divider>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog2" width="600">
                <v-card>
                    <v-card-title class="text-h5 primary white--text">
                        Preferencias
                    </v-card-title>

                    <v-row class="px-8 py-8 flex-column" no-gutters>
                        <v-col>Usuarios y sus prioridades:</v-col>
                        <v-col>
                            <v-row v-for="(contact, index) in contacts" :key="contact.email" class="mt-2">
                                <v-col>
                                    {{contact.email}}
                                </v-col>
                                <v-col>
                                    {{contact.priority == 1 ? 'Baja' : (contact.priority == 2 ? 'Media' : 'Alta')}}
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn fab small class="accent" @click="deleteContact(index)">
                                        <v-icon>mdi-minus</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row class="align-center">
                                <v-col>
                                    <v-text-field v-model="newContact.email" label="Email"></v-text-field>
                                </v-col>
                                <v-col>
                                    <v-select
                                        item-text="name"
                                        item-value="value"
                                        :items="priorities"
                                        label="Prioridad"
                                        v-model="newContact.priority"
                                    ></v-select>
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn class="primary" fab small @click="addContact">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

            <v-dialog v-model="dialog3" width="500">
                <v-card>
                    <v-card-title class="text-h5 primary white--text">
                        Crear Tarea
                    </v-card-title>

                    <v-row class="px-8 pb-8 pt-4 flex-column" no-gutters>
                        <v-col>
                            <v-text-field v-model="newActivity.title" label="Título"></v-text-field>
                        </v-col>
                        <v-col>
                            <textarea rows="3" cols="40" v-model="newActivity.description" placeholder="Descripción"
                                style="border: solid 1px black; padding: 5px; border-radius: 5px"></textarea>
                        </v-col>
                        <v-col>
                            <v-menu ref="menu4" v-model="menu4" :close-on-content-click="false" :return-value.sync="newActivity.start_date"
                                    transition="scale-transition" offset-y min-width="auto">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-text-field v-model="newActivity.start_date" prepend-icon="mdi-calendar" readonly label="Fecha"
                                            v-bind="attrs" v-on="on"></v-text-field>
                                    </template>
                                    <v-date-picker v-model="newActivity.start_date" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="menu4 = false">Cancelar</v-btn>
                                        <v-btn text color="primary" @click="$refs.menu4.save(newActivity.start_date)">
                                            OK
                                        </v-btn>
                                    </v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col>
                            <v-menu ref="menu5" v-model="menu5" :close-on-content-click="false" :nudge-right="40" :return-value.sync="newActivity.start_hour"
                                transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="newActivity.start_hour" prepend-icon="mdi-clock-time-four-outline" readonly
                                        v-bind="attrs" v-on="on" label="Hora Inicio"></v-text-field>
                                </template>
                                <v-time-picker v-if="menu5" v-model="newActivity.start_hour" full-width
                                    @click:minute="$refs.menu5.save(newActivity.start_hour)"
                                ></v-time-picker>
                            </v-menu>
                        </v-col>
                        <v-col>
                            <v-menu ref="menu6" v-model="menu6" :close-on-content-click="false" :nudge-right="40" :return-value.sync="newActivity.end_hour"
                                transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-text-field v-model="newActivity.end_hour" prepend-icon="mdi-clock-time-four-outline" readonly
                                        v-bind="attrs" v-on="on" label="Hora Inicio"></v-text-field>
                                </template>
                                <v-time-picker v-if="menu6" v-model="newActivity.end_hour" full-width
                                    @click:minute="$refs.menu6.save(newActivity.end_hour)"
                                ></v-time-picker>
                            </v-menu>
                        </v-col>
                        <v-col>
                            <v-select
                                item-text="name"
                                item-value="value"
                                :items="priorities"
                                label="Prioridad"
                                v-model="newActivity.priority"
                            ></v-select>
                        </v-col>
                        <v-col class="d-flex justify-center">
                            <v-btn class="primary mt-6" @click="createTask">
                                Crear
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </v-dialog>

        </v-col>
    </v-row>
</template>
<script>
import Header from '@/components/Headers/PanelHeader.vue'
import { db, Timestamp } from '@/db'
import moment from 'moment'


export default {
    components: {
        Header
    },
    data() {
        return {
            newActivity: {
                title: '',
                description: '',
                start_date: '',
                start_hour: '',
                end_date: '',
                end_hour: '',
                priority: '',
            },
            newContact: {
                email: '',
                priority: 1,
            },
            priorities: [
                {
                    name: 'Baja',
                    value: 1
                },
                {
                    name: 'Media',
                    value: 2
                },
                {
                    name: 'Alta',
                    value: 3
                }
            ],
            initialDate: undefined,
            finalDate: undefined,
            dialog: false,
            selectedActivity: undefined,
            activities: [],
            menu: false,
            menu2: false,
            menu3: false,
            menu4: false,
            menu5: false,
            menu6: false,
            dialog2: false,
            dialog3: false,
            days: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'],
            options: {
                dropzoneSelector: ".drag-inner-list",
                draggableSelector: ".drag-item",
                showDropzoneAreas: false,
                onDrop: function(event) {
                    var oldGroup = event.owner.getAttribute('data-id')
                    var groupId = event.droptarget.getAttribute('data-id')
                    var activityId = event.items[0].getAttribute('data-id')
                    this.groups[groupId].items.push(this.activities[activityId])
                    var index = this.groups[oldGroup].items.findIndex(x => x.id ===this.activities[activityId].id)
                    this.groups[oldGroup].items.splice(index, 1)
                    this.changeDate(this.activities[activityId], groupId)
                },
            },
            groups: [
                {
                    name: "Lunes",
                    items: []
                },
                {
                    name: "Martes",
                    items: []
                },
                {
                    name: "Miércoles",
                    items: []
                },
                {
                    name: "Jueves",
                    items: []
                },
                {
                    name: "Viernes",
                    items: []
                },
                {
                    name: "Tareas Pendientes",
                    items: []
                }
            ],
            contacts: []
        }
    },
    methods: {
        createTask() {
            var startDate = moment(this.newActivity.start_date + ' ' + this.newActivity.start_hour).toDate()
            var endDate = moment(this.newActivity.start_date + ' ' + this.newActivity.end_hour).toDate()
            db.collection('activities').add({
                title: this.newActivity.title,
                description: this.newActivity.description,
                start_date: Timestamp.fromDate(startDate),
                end_date: Timestamp.fromDate(endDate),
                owner_id: this.$store.state.user.email,
                priority: this.newActivity.priority,
                type: 'task'
            }).then(() => {
                this.refresh()
                this.newActivity.title = ''
                this.newActivity.description = ''
                this.newActivity.start_date = ''
                this.newActivity.start_hour = ''
                this.newActivity.end_date = ''
                this.newActivity.end_hour = ''
                this.newActivity.priority = ''
                this.dialog3 = false
            })

        },
        openCreateTask() {
            this.dialog3 = true
        },
        isDate(index) {
            // return if current date is equal to initialDate + index
            return moment(this.initialDate).add(index, 'days').format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
        },
        deleteContact(index) {
            this.contacts.splice(index, 1)
            db.collection('users').doc(this.$store.state.user.email).update({
                contacts: this.contacts
            })
        },
        addContact() {
            this.contacts.push(this.newContact)
            this.newContact = {
                email: '',
                priority: 1,
            }
            db.collection('users').doc(this.$store.state.user.email).update({
                contacts: this.contacts
            })
        },
        openPreferences() {
            this.dialog2 = true
        },
        updateActivity() {
            var activity = this.selectedActivity

            var startDate = moment(activity.start_date + ' ' + activity.start_hour).toDate()
            var endDate = moment(activity.start_date + ' ' + activity.end_hour).toDate()

            db.collection('activities').doc(activity.id).update({
                description: activity.description,
                title: activity.title,
                priority: activity.priority,
                start_date: Timestamp.fromDate(startDate),
                end_date: Timestamp.fromDate(endDate)
            }).then(() => {
                this.dialog = false
                this.selectedActivity = undefined
            })

            this.activities = []
            
            this.refresh()

        },
        openModal(index) {
            if (this.activities[index].type == 'event') return

            this.selectedActivity = {
                id: this.activities[index].id,
                title: this.activities[index].title,
                description: this.activities[index].description,
                start_date: this.activities[index].start_date,
                start_hour: this.activities[index].start_hour,
                end_date: this.activities[index].end_date,
                end_hour: this.activities[index].end_hour,
                priority: this.activities[index].priority,
            }
            if (this.selectedActivity.start_date)
                this.selectedActivity.start_date = moment(this.selectedActivity.start_date).format('YYYY-MM-DD')
            this.dialog = true
        },
        changeDate(activity, groupId) {
            if (groupId == this.groups.length - 1) {
                activity.start_date = null
                activity.end_date = null
                db.collection('activities').doc(activity.id).update({
                    start_date: null,
                    end_date: null
                })
            } else {
                // TODO check that there is no google calendar event
                if (this.groups[groupId].items.length == 1) {
                    activity.start_hour = "9:00"
                    activity.end_hour = "9:30"
                } else {
                    var lastActivity = this.groups[groupId].items[this.groups[groupId].items.length - 2]
                    activity.start_hour = lastActivity.end_hour
                    activity.end_hour = moment(lastActivity.end_hour, "HH:mm").add(30, 'minutes').format("HH:mm")


                    this.groups[groupId].items.sort(function(a, b) {
                        const nameB = a.start_hour.toUpperCase();
                        const nameA = b.start_hour.toUpperCase();
                        if (nameB < nameA) {
                            return -1;
                        }
                        if (nameB > nameA) {
                            return 1;
                        }

                        // names must be equal
                        return 0;
                    })
                }

                if (activity.start_date == null) {
                    activity.start_date = moment(this.initialDate).add(groupId, 'days').format('DD/MM/YYYY')
                    activity.end_date = moment(this.initialDate).add(groupId, 'days').format('DD/MM/YYYY')
                }

                var startDate = moment(this.initialDate + ' ' + activity.start_hour).add(groupId, 'days').toDate()
                var endDate = moment(this.initialDate + ' ' + activity.end_hour).add(groupId, 'days').toDate()

                db.collection('activities').doc(activity.id).update({
                    start_date: Timestamp.fromDate(startDate),
                    end_date: Timestamp.fromDate(endDate)
                })
            }

        },
        getDateNumber(index) {
            return moment(this.initialDate).add(index, 'days').format('DD')
        },
        refresh() {
            this.groups.forEach(group => group.items = [])
            db.collection('activities').where('owner_id', '==', this.$store.state.user.email).orderBy('start_date', 'asc').get().then(querySnapshot => {
                var index = 0
                querySnapshot.docs.forEach(doc => {
                    var activity = doc.data()
                    if (activity.start_date !== null) {
                        activity.start_hour = moment(activity.start_date.toDate()).format('HH:mm')
                        activity.start_date = moment(activity.start_date.toDate()).format('MM/DD/YYYY')
                        activity.end_hour = moment(activity.end_date.toDate()).format('HH:mm')
                        activity.end_date = moment(activity.end_date.toDate()).format('MM/DD/YYYY')
                    }
                    activity.index = index
                    activity.id = doc.id
                    index += 1
                    this.activities.push(activity)

                    if (activity.start_date == null) {
                        this.groups[this.groups.length - 1].items.push(activity)
                    } else {
                        var days = moment.duration(moment(activity.start_date).diff(moment(this.initialDate))).asDays()
                        if (days >= 0 && days <= 5) 
                            this.groups[days].items.push(activity)
                    }
                    
                })
            })
        }
    },
    mounted() {
        var date = moment(new Date())
        var dayNum = date.day();

        if (dayNum == 0) {
            this.initialDate = moment(date).add(1, 'days').format('DD/MM/YYYY')
        } else if (dayNum == 6) {
            this.initialDate = moment(date).add(2, 'days').format('DD/MM/YYYY')
        } else {
            this.initialDate = moment(date).subtract(dayNum-1, 'days').format('DD/MM/YYYY')
        }

        this.finalDate = moment(this.initialDate).add(5, 'days').format('DD/MM/YYYY')

        // firebase get user by id
        db.collection('users').doc(this.$store.state.user.email).get().then(doc => {
            if (doc.exists) {
                this.contacts = doc.data().contacts
            }
        })
        this.refresh()

    }
  
}
</script>
<style>

.drag-item {
    border-radius: 5px;
    width: 210px;
    padding: 6px 10px;
    margin-bottom: 15px;
    position: relative;

}

.circle {
    border-radius: 100%;
    width: 15px;
    height: 15px;
    position: absolute;
    top: -4px;
    right: -4px;
}

.red {
    background-color: red;
}

.green {
    background-color: green;
}

.yellow {
    background-color: yellow;
}

.item-dropzone-area {
  height: 60px;
  background: #888;
  opacity: 0.8;
  animation-duration: 0.5s;
  animation-name: nodeInserted;
  margin-bottom: 15px;
  border-radius: 5px;
}

td {
    width: 300px;
}

td {
    height: 40px;
}

</style>