import logo from './logo.svg';
import './App.css';
import React from 'react';

function App() {
  return (
    <div className="App">
      <Timer />
    </div>
  );
}

class Timer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { breakLength: 5, sessionLength: 25, minute: 25, second: 0, mode: "session", intervalId: null, isRunning: false, waitTick: false };
    this.manageTime = this.manageTime.bind(this);
    this.countdown = this.countdown.bind(this);
    this.reset = this.reset.bind(this);
  }

  countdown() {
    // This will pause the interval, checking if its runnning, and resetting intervalId
    if (this.state.isRunning) {
      clearInterval(this.state.intervalId);
      this.setState({ isRunning: false, intervalId: null });
      return;
    }
    // Double checking the interval isnt already running, so it doesnt run again
    if (this.state.intervalId) return;

    // If the interval is running, then set the running flag to true
    if (!this.state.isRunning) {
      this.setState({ isRunning: true });
    }


    const intervalId = setInterval(() => {
      this.setState(prev => {
        let { minute, second, mode, sessionLength, breakLength, waitTick } = prev;
        // Switching 'modes' whenever the minute and second both are 0, either between the session or the break.
        if (minute === 0 && second === 0) {
          if (!waitTick) {
            return {
              ...prev,
              minute: 0,
              second: 0,
              waitTick: true
            };
          }
          // Play alarm once the break or session time reaches zero
          this.playAlarm();
          // Switch to break
          if (mode === "session") {
            return {
              ...prev,
              mode: 'break',
              minute: breakLength,
              second: 0,
              waitTick: false
            };
          } else {
            // Switch to session
            return {
              ...prev,
              mode: 'session',
              minute: sessionLength,
              second: 0,
              waitTick: false
            };
          }
        }
        // Subtract 1 from the minute once second reaches 0, and set the second back to 59
        if (second === 0 && minute > 0) {
          return {
            ...prev,
            minute: minute - 1,
            second: 59,
            waitTick: false
          };
        }
        // If nothing interesting is happening then subtract 1 from second, continuing the current countdown session
        return {
          ...prev,
          second: second - 1,
          waitTick: false
        };

      });
    }, 1000);

    // Set the intervalId to the function currently running, set isRunning to true to keep track
    this.setState({ intervalId, isRunning: true });
  }

  reset() {
    // Stops interval from going forward
    clearInterval(this.state.intervalId);
    // Reset the audio element
    const audio = document.getElementById('beep');
    audio.pause();
    audio.currentTime = 0;
    // Reset the state back to default
    this.setState({
      breakLength: 5,
      sessionLength: 25,
      minute: 25,
      second: 0,
      mode: 'session',
      intervalId: null,
      isRunning: false,
      waitTick: false
    });
  }
  /* Add or subtract time from session length or break length, prevent the session timer
  from incrementing or decrementing if the timer is currently running, also makes sure
  the length is 1 minute or greater and 60 minutes or less*/
  manageTime(event) {
    event.persist();
    switch (event.target.id) {
      case "break-decrement":
        if (this.state.breakLength > 1) {
          this.setState(prev => ({ breakLength: prev.breakLength - 1 }));
        }
        // Set the second to zero if its paused and the seconds is some other number
        if (!this.state.isRunning) {
          this.setState(prev => ({
            second: 0
          }))
        }
        break;
      case "break-increment":
        if (this.state.breakLength < 60) {
          this.setState(prev => ({
            breakLength: prev.breakLength + 1
          }));
          // Set the second to zero if its paused and the seconds is some other number
          if (!this.state.isRunning) {
            this.setState(prev => ({
              second: 0
            }));
          }
        }
        break;
      case "session-decrement":
        if (this.state.sessionLength > 1 && !this.state.isRunning) {
          this.setState(prev => ({
            sessionLength: prev.sessionLength - 1,
            // Prevent the minute from going below 1, forcing it, cause somehow it was
            minute: Math.max(prev.sessionLength - 1, 1),
            second: 0
          }));
        } else if (this.state.sessionLength > 1) {
          this.setState(prev => ({
            sessionLength: prev.sessionLength - 1,
            minute: prev.sessionLength + 1,
            second: 0
          }))
        }
        break;
      case "session-increment":
        if (!this.state.isRunning && this.state.sessionLength < 60) {
          this.setState(prev => ({
            sessionLength: prev.sessionLength + 1,
            minute: prev.sessionLength + 1,
            second: 0
          }));
        } else if (this.state.sessionLength < 60) {
          this.setState(prev => ({
            sessionLength: prev.sessionLength + 1
          }));
        }
        break;

    }
  }

  playAlarm() {
    const audio = document.getElementById('beep');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      // Needed the promise to stop errors from occuring between audio.play and audio.pause
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
      // Audio goes for two seconds then pauses and resets to time zero
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 2000);
    }
  }

  render() {
    // Deconstruct this.state object for ease of use
    const { minute, second, mode, breakLength, sessionLength } = this.state;
    return (
      <div className="d-flex flex-column align-items-center bg-dark" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
        <TimeSet updateTime={this.manageTime} breakLength={breakLength} sessionLength={sessionLength} />
        <TimerClock
          isRunning={this.state.isRunning}
          resumeCountdown={this.countdown}
          reset={this.reset}
          mode={mode}
          minuteTime={String(minute).padStart(2, '0')}
          secondTime={String(second).padStart(2, '0')} />
      </div>
    )
  }
}

class TimeSet extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="d-flex mx-auto text-white" style={{ marginTop: '90px' }}>
        <div className="d-flex flex-column align-items-center justify-content-center mx-3" style={{ width: "200px", height: "100px" }}>
          <p id="break-label" className="d-block fs-3">Break Length</p>
          <div className="d-flex well bg-well">
            <i id="break-decrement" class="fa-solid fa-circle-minus mx-2 fs-2" type="button" onClick={this.props.updateTime}></i>
            <p id="break-length" className="mx-2 fs-2">{this.props.breakLength}</p>
            <i id="break-increment" class="fa-solid fa-circle-plus mx-2 fs-2" type="button" onClick={this.props.updateTime}></i>
          </div>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center mx-3" style={{ width: "200px", height: "100px" }}>
          <p id="session-label" className="d-block fs-3">Session Length</p>
          <div className='d-flex'>
            <i id="session-decrement" class="fa-solid fa-circle-minus mx-2 fs-2" type="button" onClick={this.props.updateTime}></i>
            <p id="session-length" className="mx-2 fs-2">{this.props.sessionLength}</p>
            <i id="session-increment" class="fa-solid fa-circle-plus mx-2 fs-2" type="button" onClick={this.props.updateTime}></i>
          </div>
        </div>
      </div>
    )
  }
}

class TimerClock extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="bg-secondary px-4 pb-2 text-white border border-3 mt-3">
        <p id="timer-label" class="fs-1">{this.props.mode === 'session' ? 'Session' : 'Break'}</p>
        <p id="time-left" className="fs-1">{`${this.props.minuteTime}:${this.props.secondTime}`}</p>
        <i id="start_stop" className={`fs-2 mx-2 fa-solid ${this.props.isRunning ? "fa-circle-pause" : "fa-circle-play"}`} onClick={this.props.resumeCountdown}></i>
        <i id="reset" class=" fs-2 mx-2 fa-solid fa-repeat" onClick={this.props.reset}></i>
        <audio id="beep" src="./mixkit-alarm-clock-beep-988.wav"></audio>
      </div>
    )
  }
}

export default App;
