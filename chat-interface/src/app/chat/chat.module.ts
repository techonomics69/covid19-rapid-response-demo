// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatDialogComponent } from './chat-dialog/chat-dialog.component';
import { ChatService } from './chat.service';

import { FormsModule } from '@angular/forms';
import { AudioService } from './audio.service';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatChoiceComponent } from './chat-choice/chat-choice.component';
import { ChatAccordianComponent } from './chat-accordian/chat-accordian.component';
import { DeclorateLinksPipe } from './declorate-links.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    ChatDialogComponent,
    ChatInputComponent,
    ChatMessageComponent, 
    ChatChoiceComponent, ChatAccordianComponent, DeclorateLinksPipe

  ],
  exports: [ ChatDialogComponent ],
  providers: [ChatService,AudioService]
})
export class ChatModule { }
