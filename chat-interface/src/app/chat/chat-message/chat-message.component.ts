/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, Input } from '@angular/core';
import { ChatService, Message, DFEvent } from '../chat.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit {
  @Input()  messages: Observable<Message[]>;

  audio_playing:boolean = false;
  current_audio:any;
  watched:Node;
  observer:any;


  constructor(public chat: ChatService) { }

  ngOnInit(): void {
    


  }
  ngAfterViewInit() {
    this.watched = document.querySelector('.chat-area') as Node;
    let self = this;

    // This is all here to provide chat window down scrolling action. 
    // It has to be done when messages are added to chat, but not 
    // just when the component changes, due to the accordian interface.
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(function(mutation) {
        let target:HTMLElement = mutation.target as HTMLElement; 
        if (target.localName == "app-chat-message"){
          let addedNode:HTMLElement = mutation.addedNodes[0] as HTMLElement;
          
          if (!addedNode.classList){
            return;
          }

          if (addedNode.classList.contains("message")){
            self.scrollDownWindow();
          }
          if (addedNode.localName == "app-chat-accordian"){
            self.scrollDownWindow();
          }
        }
      });
    });

    this.observer.observe(this.watched, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    });

   
  }  

  ngAfterViewChecked(){
    
  }

  scrollDownWindow(){
    let d = document.querySelector('.chat-area');
    if (d) {
      d.scrollTop = d.scrollHeight;
    }
  }




  endSpeech(e){
    let id = e.target.dataset.responseid;
    let icon:HTMLImageElement = document.querySelector(`img[data-responseid='${id}']`) as HTMLImageElement;
    icon.src = "assets/speaker.svg";
    this.audio_playing = false;
    this.current_audio = ""; 
  }

  startSpeech(e){
    let id = e.target.dataset.responseid;
    let icon:HTMLImageElement = document.querySelector(`img[data-responseid='${id}']`) as HTMLImageElement;
    
    icon.src = "assets/speaker-pulse.svg";
    this.audio_playing = true;
    this.current_audio = e.target; 
  }

  toggleSpeech(e) {
    let icon = e.target;
    let id = e.target.dataset.responseid;
    let audio:HTMLAudioElement = document.querySelector(`audio[data-responseid='${id}']`) as HTMLAudioElement;
    if (audio.paused){
      if (this.audio_playing){
        this.current_audio.click();
      }
      audio.play();
      icon.src = "assets/speaker-pulse.svg";
      this.audio_playing = true;
      this.current_audio = icon; 
    } else {
      audio.pause();
      icon.src = "assets/speaker.svg";
      this.audio_playing = false;
      this.current_audio = ""; 
    }
  }

  handlePlaying(e){
    var temps = document.querySelectorAll(".message.temp");

    temps.forEach(function(temp:HTMLElement) {
      temp.style.display = "none";
    });
  }


  isString(input){
    return (typeof input == "string")
  }

  fireDFEvent(input:DFEvent){
    this.chat.converseEvent(input);
  }

}
