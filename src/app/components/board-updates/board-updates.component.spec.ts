import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardUpdatesComponent } from './board-updates.component';

describe('BoardUpdatesComponent', () => {
  let component: BoardUpdatesComponent;
  let fixture: ComponentFixture<BoardUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardUpdatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
