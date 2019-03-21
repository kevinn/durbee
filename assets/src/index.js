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
    currWorkoutLimit: null,
    currWorkoutDone: false,
    disableNext: false,
    disablePrev: true,
    modalOpen: false,
    isAutoplay: false,
    btnDisabled: false
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
      vm.btnDisabled = true;
      vm.beep('ready');

      setTimeout(()=>{
        vm.timerPaused = false;
        vm.timer = setInterval(()=>{
          vm.countdown();
        }, 1000);
      }, 2000);
    },
    timerPause: function() {
      clearInterval(vm.timer);
      vm.timerPaused = true;
      vm.btnDisabled = false;
    },
    timerReset: function() {
      // reset back to timerSelected;
      clearInterval(vm.timer);
      vm.timerPaused = true;
      vm.timerElapsed = vm.isTimerSelected;
      vm.btnDisabled = false;
    },
    countdown: function() {
      vm.currWorkoutDone = false;

      if (vm.timerElapsed !== 0) {
        vm.timerElapsed = vm.timerElapsed - 1000;
        vm.beep('beep');
      } else {
        vm.beep('prrrt');
        vm.timerReset();
        vm.currWorkoutDone = true;
        vm.buttonDisabled = false;
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
      vm.currWorkoutLimit = null,
      vm.currWorkoutNum = 0;
      vm.buttonDisabled = false;
      vm.timerPause();

      const audioEl = document.querySelectorAll('audio');
      for (let i = 0; i < audioEl.length; i++){
        audioEl[i].currentTime = 0;
        audioEl[i].pause();        
      };
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

          vm.currWorkoutLimit = vm.workoutSelectedData.length - 1;
          vm.workoutLoad(0);
        });
    },
    workoutLoad: function(workoutnum) {
      // load name and image

      if (vm.currWorkoutNum <= vm.currWorkoutLimit) {
        vm.currWorkout = vm.workoutSelectedData[workoutnum].name;
        vm.currWorkoutImg = vm.workoutSelectedData[workoutnum].img;
        console.log('loading... ', vm.currWorkout);
      } else {
        console.log('nothing to load...');
      }

      if (workoutnum === vm.currWorkoutLimit) {
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
    skipNext: function() {         
      if (vm.currWorkoutNum <= vm.currWorkoutLimit) {
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
    },
    back: function() {
      vm.workoutClear(); 
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
  },
  watch: {
    currWorkoutDone: function() {
      if (vm.isAutoplay && vm.currWorkoutDone === true && vm.currWorkoutNum < vm.currWorkoutLimit) {
        vm.skipNext();
        setTimeout(()=>{
          vm.timerStart();
        }, 2000);
      } else {
        console.log('Love is over...');
      }
    }
  }
});