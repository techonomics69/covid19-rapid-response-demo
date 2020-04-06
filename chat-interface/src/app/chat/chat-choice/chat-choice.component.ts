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
import { ChatService, Message } from '../chat.service';

@Component({
  selector: 'app-chat-choice',
  templateUrl: './chat-choice.component.html',
  styleUrls: ['./chat-choice.component.scss']
})
export class ChatChoiceComponent implements OnInit {
  @Input() quick_replies:string[];
  constructor(public chat: ChatService) { }

  ngOnInit(): void {
  }

  sendQuick(e){
    let el = e.target;
    

    let container = el.parentElement;  
    if (el.classList.contains("text-holder")){
      container = el.parentElement.parentElement;
    }

    let text = el.innerText;
    if (el.innerText == "Try Again"){
      text = "default hello";
    }

    container.style.display = "none";
    this.chat.converseText(text);
  }

  
  

}
