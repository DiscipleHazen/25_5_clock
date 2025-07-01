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

    this.state = {breakLength: 5, sessionLength: 25, minute: '00', sessionTimer: 25};
    this.manageTime = this.manageTime.bind(this);
    this.countdown = this.countdown.bind(this);
  }

  async countdown(event) {
    setInterval(() => {
      if(this.state.minute === '00' || this.state.minute === 0) {
        this.setState({minute: 59});
      } else {
        this.setState({minute: this.state.minute - 1});
      }
      
    }, 1000)
    setInterval(() => {
      this.setState({sessionTimer: this.sessionTimer - 1})
    }, 60000)

  }

  manageTime(event) {
    event.persist();
    switch(event.target.id) {
      case "break-decrement":
        if(this.state.breakLength > 0) {
          this.setState({breakLength: this.state.breakLength - 1});
        }
        break;
      case "break-increment":
        this.setState({breakLength: this.state.breakLength + 1});
        break;
      case "session-decrement":
        if(this.state.sessionLength > 0) {
          this.setState({sessionLength: this.state.sessionLength - 1});
        }
        break;
      case "session-increment":
        this.setState({sessionLength: this.state.sessionLength + 1});
        break;
      
    }
  }

  render() {
    return(
      <div className="d-flex flex-column align-items-center justify-content-center">
        <TimeSet updateTime={this.manageTime} breakLength={this.state.breakLength} sessionLength={this.state.sessionLength}/>
        <TimerClock resumeCountdown={this.countdown} sessionTime={this.state.sessionTimer} minuteTime={this.state.minute} breakLength={this.state.breakLength} sessionLength={this.state.sessionLength}/>
      </div>
    )
  }
}

class TimeSet extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return(
      <div className="d-flex mx-auto" style={{width: "40%", height: "100px", marginTop: "100px"}}>
        <div className="d-flex flex-column align-items-center justify-content-center" style={{width: "100px", height: "100px"}}>
          <p id="break-label" className="d-block">Break Length</p>
          <div className="d-flex well bg-well">
            <i id="break-decrement"  class="fa-solid fa-minus mx-2" type="button" onClick={this.props.updateTime}></i>
            <p id="break-length" className="mx-2">{this.props.breakLength}</p>
            <i id="break-increment"  class="fa-solid fa-plus mx-2" type="button" onClick={this.props.updateTime}></i>
          </div>
        </div>
        <div className="d-flex flex-column align-items-center justify-content-center" style={{width: "150px", height: "100px"}}>
          <p id="session-label" className="d-block">Session Length</p>
          <div className='d-flex'>
            <i id="session-decrement"  class="fa-solid fa-minus mx-2" type="button" onClick={this.props.updateTime}></i>
            <p id="session-length" className="mx-2">{this.props.sessionLength}</p>
            <i id="session-increment"  class="fa-solid fa-plus mx-2" type="button" onClick={this.props.updateTime}></i>
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
      <div>
        <p id="timer-label">Session</p>
        <p id="time-left">{`${this.props.sessionTime}:${this.props.minuteTime}`}</p>
        <i id="start" class="fa-solid fa-play" onClick={this.props.resumeCountdown}></i>
        <i id="start" class="fa-solid fa-pause"></i>
        <i id="start" class="fa-solid fa-"></i>
      </div>
    )
  }
}

export default App;
