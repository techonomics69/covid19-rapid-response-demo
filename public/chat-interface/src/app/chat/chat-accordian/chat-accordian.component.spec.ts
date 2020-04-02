import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAccordianComponent } from './chat-accordian.component';

describe('ChatAccordianComponent', () => {
  let component: ChatAccordianComponent;
  let fixture: ComponentFixture<ChatAccordianComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatAccordianComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatAccordianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
