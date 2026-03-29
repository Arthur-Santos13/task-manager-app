import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppLogoComponent } from './app-logo.component';

describe('AppLogoComponent', () => {
  let component: AppLogoComponent;
  let fixture: ComponentFixture<AppLogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLogoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default compact to false', () => {
    expect(component.compact).toBe(false);
  });

  it('should apply compact class when compact is true', () => {
    component.compact = true;
    fixture.detectChanges();

    const wrap = fixture.nativeElement.querySelector('.logo-wrap');
    expect(wrap.classList.contains('compact')).toBe(true);
  });

  it('should NOT have compact class by default', () => {
    const wrap = fixture.nativeElement.querySelector('.logo-wrap');
    expect(wrap.classList.contains('compact')).toBe(false);
  });

  it('should render the SVG logo', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});

