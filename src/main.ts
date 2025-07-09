import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HeatmapChartComponent, HeatmapData, ColorTheme, LegendPosition } from './components/heatmap-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeatmapChartComponent, FormsModule],
  template: `
    <div class="app-container">
      <h1>Angular Heatmap Chart</h1>
      
      <div class="controls">
        <div class="control-group">
          <label>Color Theme:</label>
          <select [(ngModel)]="selectedTheme" (change)="onThemeChange()">
            <option value="default">Default (Gray)</option>
            <option value="teal">Teal</option>
            <option value="purple">Purple</option>
            <option value="diverging">Diverging (Red-Blue)</option>
            <option value="connectivity">Connectivity Status</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Legend Position:</label>
          <select [(ngModel)]="selectedPosition" (change)="onPositionChange()">
            <option value="bottom">Bottom</option>
            <option value="side">Side</option>
          </select>
        </div>
      </div>
      
      <app-heatmap-chart 
        [title]="chartTitle"
        [data]="chartData"
        [legendLabel]="legendLabel"
        [colorTheme]="selectedTheme"
        [legendPosition]="selectedPosition">
      </app-heatmap-chart>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f8fafc;
      padding: 40px 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 40px;
      color: #1f2937;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .control-group label {
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .control-group select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .control-group select:hover {
      border-color: #9ca3af;
    }

    .control-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `]
})
export class App {
  chartTitle = 'Weekly Activity Heatmap';
  legendLabel = 'Activity Level';
  selectedTheme: ColorTheme = 'default';
  selectedPosition: LegendPosition = 'bottom';

  chartData: HeatmapData[] = [
    { day: 'Sun 10', values: [99, 99, 7, 99, 36, 99, 96, 63, 6, 1] },
    { day: 'Sat 9', values: [9, 16, 6, 65, 99, 99, 29, 77, 55, 45] },
    { day: 'Fri 8', values: [71, 8, 20, 4, 99, 42, 6, 99, 15, 4] },
    { day: 'Thu 7', values: [99, 30, 2, 40, 24, 61, 54, 23, 8, 47] },
    { day: 'Wed 6', values: [99, 70, 99, 8, 51, 8, 14, 99, 26, 73] },
    { day: 'Tue 5', values: [2, 8, 15, 99, 32, 47, 35, 7, 38, 8] },
    { day: 'Mon 4', values: [99, 99, 11, 99, 33, 41, 32, 58, 30, 52] }
  ];

  onThemeChange() {
    // Theme change is handled automatically by Angular's change detection
  }

  onPositionChange() {
    // Position change is handled automatically by Angular's change detection
  }
}

bootstrapApplication(App);