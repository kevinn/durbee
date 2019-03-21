const vm = new Vue({
  el: "#app",
  data: {
    workoutList: [],
    workoutSelectedData: [],
    isTimerSelected: '',
    timer: null,
    timerPaused: true,
    timerElapsed: null,
    timerChoices: [
      { 'length': '3 minutes', 'ms': 180000 },
      { 'length': '2 minutes', 'ms': 120000 },
      { 'length': '1 minute', 'ms': 60000 },
      { 'length': '3 seconds (test)', 'ms': 3000 } // testing
    ],
    currWorkout: null,
    currWorkoutImg: null,
    currWorkoutNum: null,
    disableNext: false,
    disablePrev: true,
    modalOpen: false,
    isAutoplay: false
  },
  methods: {
    modal: function(action) {
      if (action == 'show') {
        vm.modalOpen = true;
      } else {
        vm.modalOpen = false;
      }
    },
    modalClose: function() {
      // reset everything?
      vm.modalOpen = false;
      vm.workoutClear();
    },
    selectChange: function() {
      // assign to variable for countdown
      vm.timerElapsed = vm.isTimerSelected;
      console.log('time is set to: ', vm.timerElapsed);
    },
    timerStart: function() {
      vm.timerPaused = false;
      vm.timer = setInterval(()=>{
        vm.countdown();
      }, 1000);
    },
    timerPause: function() {
      clearInterval(vm.timer);
      vm.timerPaused = true;
    },
    timerReset: function() {
      // reset back to timerSelected;
      clearInterval(vm.timer);
      vm.timerElapsed = vm.isTimerSelected;
      vm.timerPaused = true;
    },
    countdown: function() {
      if (vm.timerElapsed !== 0) {
        vm.timerElapsed = vm.timerElapsed - 1000;
        vm.beep('beep');
      } else {
        vm.beep('prrrt');
        vm.timerReset();
      }
    },
    beep: function(soundId) {
      const audioEl = document.getElementById(soundId);
      audioEl.currentTime = 0;
      audioEl.play();
    },
    workoutClear: function() {
      vm.workoutSelectedData = [];
      vm.isTimerSelected = '';
      vm.timerElapsed = null;
      vm.currWorkout = null;
      vm.currWorkoutImg = null;
      vm.currWorkoutNum = 0;
    },
    workoutFetch: function(workout) {
      fetch('assets/src/' + workout)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          for (let i = 0; i < data.workouts.length; i++) {
            vm.workoutSelectedData.push(data.workouts[i]);
          }
          vm.workoutLoad(0);
        });
    },
    workoutLoad: function(workoutnum) {
      vm.currWorkout = vm.workoutSelectedData[workoutnum].name;
      vm.currWorkoutImg = vm.workoutSelectedData[workoutnum].img;
      console.log('loading... ', vm.currWorkout);

      let limit = vm.workoutSelectedData.length - 1;

      if (workoutnum === limit) {
        vm.disableNext = true;
      } else {
        vm.disableNext = false;
      }

      if (workoutnum === 0) {
        vm.disablePrev = true;
      } else {
        vm.disablePrev = false;
      }
    },
    autoPlay: function() {

    },
    skipNext: function() {     
      let limit = vm.workoutSelectedData.length - 1;
      
      if (vm.currWorkoutNum <= limit) {
        vm.currWorkoutNum++;
        vm.workoutLoad(vm.currWorkoutNum);
      } 

      vm.timerReset();
    },
    skipPrev: function() {
      if (vm.currWorkoutNum >= 1) {
        vm.currWorkoutNum--;
        vm.workoutLoad(vm.currWorkoutNum);
      } 

      vm.timerReset();
    },
    workoutSelected: function(workout) {
      vm.workoutFetch(workout);
    }
  },
  mounted() {
    // load workouts list from file
    fetch('assets/src/workouts.json')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        vm.workoutList = data;
      });
  },
  computed: {
    greet: function() {
      const today = new Date().getHours();
      let greet;

      if (today < 12) {
        greet = 'morning';
      } else if (today < 18) {
        greet = 'afternoon';
      } else {
        greet = 'evening';
      }

      return 'Good ' + greet + '!';
    },
    timerDisplay: function() {
      // display timeElapsed in 00:00 format
      let ms = vm.timerElapsed;

      // https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
      let minutes = Math.floor( ms / 60000);
      let seconds = ((ms % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
  }
});