const vm = new Vue({
  el: "#app",
  data: {
    timer: null,
    timerPaused: true,
    timerSelected: '',
    timerElapsed: null,
    timerlength: [
      { 'length': '3 minutes', 'ms': 180000 },
      { 'length': '2 minutes', 'ms': 120000 },
      { 'length': '1 minute', 'ms': 60000 },
      { 'length': '5 seconds', 'ms': 5000 } // testing
    ],
    workoutList: [],
    workoutSelectedData: [],
    workoutopen: false,
    currentWorkout: '',
    currentWorkoutImg: '',
    currentWorkoutNum: null,
    disableNext: false,
    disablePrev: false,
  },
  methods: {
    initList: function() {
      const list = vm.workoutList;
    },
    selectChange: function() {
      // assign to variable for countdown
      vm.timerElapsed = vm.timerSelected;
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
      vm.timerElapsed = vm.timerSelected;
      vm.timerPaused = true;
    },
    timerDisplay: function() {
      // display timeElapsed in 00:00 format
      const vm = this;
      let ms = vm.timerElapsed;

      // https://stackoverflow.com/questions/21294302/converting-milliseconds-to-minutes-and-seconds-with-javascript
      let minutes = Math.floor( ms / 60000);
      let seconds = ((ms % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    },
    countdown: function() {
      if (vm.timerElapsed !== 0) {
        vm.timerElapsed = vm.timerElapsed - 1000;
        vm.timerDisplay(vm.timerElapsed);
        vm.beep();
      } else {
        vm.beepEnd();
        setTimeout(()=>{
          vm.timerReset();
        }, 1500);
      }
    },
    beep: function() {
      const audioEl = document.getElementById('fx');
      audioEl.currentTime = 0;
      audioEl.play();
    },
    beepEnd: function() {
      const audioEl = document.getElementById('fxEnd');
      audioEl.currentTime = 0;
      audioEl.play();
      setTimeout(() => {
        audioEl.pause();
      },1060);
    },
    greeting: function() {
      const today = new Date().getHours();
      let greet;

      if (today < 12) {
        greet = 'morning';
      } else if (today < 18) {
        greet = 'afternoon';
      } else {
        greet = 'evening';
      }

      return 'Hello and good ' + greet + '!';
    },
    workoutClose: function() {
      vm.workoutopen = false;
    },
    workoutFetch: function(workout) {
      // console.log(workout);
      fetch('assets/src/' + workout)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          for (let i = 0; i < data.workouts.length; i++) {
            vm.workoutSelectedData.push(data.workouts[i]);
          }
          console.log('done: ', data.workouts);
        });
    },
    workoutLoad: function(workoutnum) {     
        vm.currentWorkout = vm.workoutSelectedData[workoutnum].name;
        vm.currentWorkoutImg = vm.workoutSelectedData[workoutnum].img;
    },
    workoutNext: function() {     
      if (vm.currentWorkoutNum <= (vm.workoutSelectedData.length - 1)) {
        vm.currentWorkoutNum++;
        vm.currentWorkout = vm.workoutSelectedData[vm.currentWorkoutNum].name;
        vm.currentWorkoutImg = vm.workoutSelectedData[vm.currentWorkoutNum].img;
      } else {
        vm.disableNext = true;
      }
    },
    workoutSelected: function(workout) {
      vm.workoutFetch(workout);

      setTimeout(() => {
        vm.workoutLoad(0);
      }, 250);
      
      vm.workoutopen = true;
    }
  },
  mounted() {
    fetch('/assets/src/workouts.json')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        vm.workoutList = data;
        console.log("kk", vm.workoutList);
        vm.initList();
      });
  }
});