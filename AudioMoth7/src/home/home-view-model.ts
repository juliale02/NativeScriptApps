import { Observable } from '@nativescript/core'
import { SelectedPageService } from '../shared/selected-page-service'
import { MediaRecorder } from 'extendable-media-recorder';
import {
  Application,
  Dialogs,
  File,
  isAndroid,
  knownFolders,
  Page,
  Slider,
  Utils
} from '@nativescript/core';

import { Task, SimpleTask } from "nativescript-task-dispatcher/tasks";
import { DemoTaskGraph } from "../tasks/graph";
import { taskDispatcher } from "nativescript-task-dispatcher";
import {
  AudioRecorderOptions,
  TNSRecorder
} from 'nativescript-audio';

export class HomeViewModel extends Observable {
  constructor() {
    super()

    SelectedPageService.getInstance().updateSelectedPage('Home')
  }
  private _durMin: string
  private _durSec: string
  private _freqMin: string
  private _freqSec: string
  private durMinInt: number
  private durSecInt: number
  private freqMinInt: number
  private freqSecInt: number
  private _recorder: TNSRecorder;

  private dur: number
  private freq: number 

  private appTasks: Array<Task>

  get durMin(): string {
    return this._durMin
  }
  get durSec(): string {
    return this._durSec
  }
  get freqMin(): string {
    return this._freqMin
  }
  get freqSec(): string {
    return this._freqSec
  }

  set durMin(value: string) {
    if (this._durMin !== value) {
      this._durMin = value
      this.notifyPropertyChange('durMin', value)
    }
  }
  set durSec(value: string) {
    if (this._durSec !== value) {
      this._durSec = value
      this.notifyPropertyChange('durSec', value)
    }
  }
  set freqMin(value: string) {
    if (this._freqMin !== value) {
      this._freqMin = value
      this.notifyPropertyChange('freqMin', value)
    }
  }
  set freqSec(value: string) {
    if (this._freqSec !== value) {
      this._freqSec = value
      this.notifyPropertyChange('freqSec', value)
    }
  }
  onTap() {
    //TODO:disable button, enable stop butt
    //var startbtn = document.getElementById("startbtn")
    //convert from string to int 
    this.durMinInt = +this.durMin
    this.durSecInt = +this.durSec
    this.freqMinInt = +this.freqMin
    this.freqSecInt = +this.freqSec
    console.info("durMinInt: " + this.durMinInt)
    console.info("durSecInt: " + this.durSecInt)
    console.info("freqMinInt: " + this.freqMinInt)
    console.info("freqSecInt: " + this.freqSecInt)
    //convert dur to milliseconds, freq to seconds
    this.dur = this.durMinInt*60*1000;
    this.dur = this.dur + this.durSecInt*1000;
    this.freq = this.freqMinInt*60;
    this.freq = this.freq + this.freqSecInt;
    console.info("dur (ms): " + this.dur)
    console.info("freq(s): " + this.freq)

    //initialize appTask
    this.initializeAppTasks();

    //initialise demoTaskGraph
    var demoTaskGraph = new DemoTaskGraph(100);//change to freq

    //load taskgraph
    taskDispatcher.init(this.appTasks, demoTaskGraph, {
      enableLogging: true,
    });
    //trigger the task dispatcher
    console.info("startEvent emitted!!")
    this.emitStartEvent();

  }
  private platformExtension() {
    // 'mp3'
    return `${Application.android ? 'm4a' : 'caf'}`;
  }
   initializeAppTasks(){
    this.appTasks =  [
      new SimpleTask("record", ({ log, onCancel, remainingTime}) => new Promise(async (resolve) => {
                  log(`Available time: ${remainingTime()}`);
                  this._recorder = new TNSRecorder();
                  this._recorder.debug = true; 
                  const audioFolder = knownFolders.currentApp().getFolder('audio');
                  let androidFormat = 2;//android.media.MediaRecorder.OutputFormat.MPEG_4;
                  let androidEncoder = 3;//android.media.MediaRecorder.AudioEncoder.AAC;
                  const recordingPath = `${
                    audioFolder.path
                  }/recording.${this.platformExtension()}`;

                  const recorderOptions: AudioRecorderOptions = {
                    filename: recordingPath,
            
                    format: androidFormat,
            
                    encoder: androidEncoder,
            
                    metering: true,
            
                    infoCallback: infoObject => {
                      console.log(JSON.stringify(infoObject));
                    },
            
                    errorCallback: errorObject => {
                      console.log(JSON.stringify(errorObject));
                    }
                  };

                  log("Recording start!");
                  this._recorder.start(recorderOptions);
                  const timeoutId = setTimeout(() => {
                      log("Recording stop!");
                      this._recorder.stop();
                      
                      resolve();
                  }, 2000); //change to this.dur
                  
                  onCancel(() => {
                      clearTimeout(timeoutId);
                      resolve();
                  });
  
              })
      ),
    ];
  }

  stop() {
    //TODO:disable button, enable start button 
    console.info("stopEvent emitted!!")
    taskDispatcher.emitEvent("stopEvent");
  }
  
  async emitStartEvent() {
    const isReady = await taskDispatcher.isReady();
    //COMMENT OUT IF STATEMENT
    if (!isReady) {
      const tasksNotReady = await taskDispatcher.tasksNotReady;
      console.log(`The following tasks are not ready!: ${tasksNotReady}`);
      await taskDispatcher.prepare();
    }
    taskDispatcher.emitEvent("startEvent");
  }
}
