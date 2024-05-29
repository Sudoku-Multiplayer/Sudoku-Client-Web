import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameScreenSettingsComponent } from './game-screen-settings.component';

describe('GameScreenSettingsComponent', () => {
  let component: GameScreenSettingsComponent;
  let fixture: ComponentFixture<GameScreenSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameScreenSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameScreenSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
