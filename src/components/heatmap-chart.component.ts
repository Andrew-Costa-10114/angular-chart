import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface HeatmapData {
  day: string;
  values: number[];
}

export type ColorTheme =
  | "default"
  | "teal"
  | "purple"
  | "diverging"
  | "connectivity";
export type LegendPosition = "bottom" | "side";

interface LegendItem {
  value: number | string;
  color: string;
}

interface CellTooltipContent {
  day: string;
  time: string;
  value: number;
}

interface LegendTooltipContent {
  value: number | string;
  color: string;
}

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  content: CellTooltipContent | LegendTooltipContent | null;
  type: "cell" | "legend";
}

@Component({
  selector: "app-heatmap-chart",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="heatmap-container"
      [class.side-legend]="legendPosition === 'side'"
    >
      <div class="chart-section">
        <div class="header">
          <h2>{{ title }}</h2>
          <div class="header-actions">
            <button class="icon-btn">📊</button>
            <button class="icon-btn">⭐</button>
          </div>
        </div>

        <div class="heatmap-grid">
          <!-- Time headers -->
          <div class="time-header"></div>
          <div class="time-header" *ngFor="let time of timeLabels">
            {{ time }}
          </div>

          <!-- Data rows -->
          <ng-container *ngFor="let row of data; let i = index">
            <div class="day-label">{{ row.day }}</div>
            <div
              class="cell"
              *ngFor="let value of row.values; let j = index"
              [style.background-color]="getColor(value)"
              (mouseenter)="
                showCellTooltip($event, row.day, timeLabels[j], value)
              "
              (mouseleave)="hideTooltip()"
            >
              {{ value }}
            </div>
          </ng-container>
        </div>
      </div>

      <div class="legend" [class.legend-side]="legendPosition === 'side'">
        <div
          class="legend-scale"
          [class.legend-scale-vertical]="legendPosition === 'side'"
        >
          <div
            class="legend-item"
            *ngFor="let item of getCurrentLegendItems()"
            [style.background-color]="item.color"
            [class.legend-item-vertical]="legendPosition === 'side'"
            (mouseenter)="showLegendTooltip($event, item)"
            (mouseleave)="hideTooltip()"
          >
            <span *ngIf="legendPosition === 'side'">{{ item.value }}</span>
          </div>
        </div>
        <div class="legend-label">{{ getLegendLabel() }}</div>
      </div>

      <!-- Tooltip -->
      <div
        class="tooltip"
        [class.tooltip-visible]="tooltip.visible"
        [style.left.px]="tooltip.x"
        [style.top.px]="tooltip.y"
      >
        <!-- Cell Tooltip -->
        <div
          *ngIf="
            tooltip.type === 'cell' &&
            tooltip.content &&
            isCellTooltipContent(tooltip.content)
          "
          class="tooltip-content"
        >
          <div class="tooltip-header">Title</div>
          <div class="tooltip-item">
            <div
              class="tooltip-color"
              [style.background-color]="getColorSafe(tooltip.content)"
            ></div>
            <span class="tooltip-day"
              >{{ tooltip.content.day }} - {{ tooltip.content.time }}</span
            >
            <span class="tooltip-value">{{ tooltip.content.value }}</span>
          </div>
        </div>

        <!-- Legend Tooltip -->
        <div
          *ngIf="
            tooltip.type === 'legend' &&
            tooltip.content &&
            isLegendTooltipContent(tooltip.content)
          "
          class="tooltip-content legend-tooltip"
        >
          <div class="tooltip-header">Title</div>
          <div
            class="legend-tooltip-items"
            *ngIf="isNumberValue(tooltip.content)"
          >
            <div
              class="tooltip-item"
              *ngFor="let item of getLegendTooltipDataSafe(tooltip.content)"
            >
              <div
                class="tooltip-color"
                [style.background-color]="getColor(item.value)"
              ></div>
              <span class="tooltip-day">{{ item.day }}</span>
              <span class="tooltip-time">{{ item.time }}</span>
              <span class="tooltip-value">{{ item.value }}</span>
            </div>
            <div class="view-all">View all</div>
          </div>
          <div
            class="legend-tooltip-items"
            *ngIf="isStringValue(tooltip.content)"
          >
            <div class="tooltip-item">
              <div
                class="tooltip-color"
                [style.background-color]="tooltip.content.color"
              ></div>
              <span class="tooltip-day">{{ tooltip.content.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .heatmap-container {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .heatmap-container.side-legend {
        flex-direction: row;
        gap: 32px;
        align-items: flex-start;
      }

      .chart-section {
        flex: 1;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .icon-btn {
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 6px 8px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .icon-btn:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      .heatmap-grid {
        display: grid;
        grid-template-columns: 80px repeat(10, 1fr);
        gap: 2px;
        margin-bottom: 24px;
      }

      .side-legend .heatmap-grid {
        margin-bottom: 0;
      }

      .time-header {
        background: #f8fafc;
        padding: 8px 4px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
        border-radius: 4px;
      }

      .day-label {
        background: #f8fafc;
        padding: 8px 12px;
        text-align: right;
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .cell {
        background: #e5e7eb;
        padding: 8px 4px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cell:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 10;
        position: relative;
      }

      .legend {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .legend-side {
        align-items: flex-start;
        min-width: 60px;
        padding-top: 60px;
      }

      .legend-scale {
        display: flex;
        gap: 1px;
        border-radius: 4px;
        overflow: hidden;
      }

      .legend-scale-vertical {
        flex-direction: column-reverse;
        height: auto;
        max-height: 300px;
      }

      .legend-item {
        width: 40px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .legend-item:hover {
        transform: scale(1.05);
        z-index: 10;
        position: relative;
      }

      .legend-item-vertical {
        width: 30px;
        height: auto;
        min-height: 27px;
        padding: 4px 8px;
        font-size: 11px;
        color: #6b7280;
        background: transparent !important;
        border-left: 20px solid;
        justify-content: flex-start;
      }

      .legend-label {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
        text-align: center;
      }

      .legend-side .legend-label {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        margin-top: 16px;
      }

      /* Tooltip Styles */
      .tooltip {
        position: absolute;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 12px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        pointer-events: none;
        min-width: 200px;
      }

      .tooltip-visible {
        opacity: 1;
        visibility: visible;
      }

      .tooltip-content {
        font-size: 14px;
      }

      .tooltip-header {
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .tooltip-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }

      .tooltip-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        flex-shrink: 0;
      }

      .tooltip-day {
        color: #374151;
        font-weight: 500;
        flex: 1;
      }

      .tooltip-time {
        color: #6b7280;
        font-size: 13px;
        min-width: 50px;
      }

      .tooltip-value {
        color: #1f2937;
        font-weight: 600;
        min-width: 30px;
        text-align: right;
      }

      .legend-tooltip {
        min-width: 250px;
      }

      .legend-tooltip-items {
        max-height: 200px;
        overflow-y: auto;
      }

      .view-all {
        color: #3b82f6;
        font-weight: 500;
        cursor: pointer;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #f3f4f6;
        text-align: center;
      }

      .view-all:hover {
        color: #2563eb;
      }
    `,
  ],
})
export class HeatmapChartComponent {
  @Input() title: string = "Header";
  @Input() data: HeatmapData[] = [];
  @Input() legendLabel: string = "Default";
  @Input() colorTheme: ColorTheme = "default";
  @Input() legendPosition: LegendPosition = "bottom";

  timeLabels = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
  ];

  tooltip: TooltipData = {
    visible: false,
    x: 0,
    y: 0,
    content: null,
    type: "cell",
  };

  private colorThemes = {
    default: {
      colors: [
        "#f8fafc",
        "#e2e8f0",
        "#cbd5e1",
        "#94a3b8",
        "#64748b",
        "#475569",
        "#334155",
        "#1e293b",
        "#0f172a",
        "#020617",
      ],
      legend: [
        { value: 0, color: "#f8fafc" },
        { value: 10, color: "#e2e8f0" },
        { value: 20, color: "#cbd5e1" },
        { value: 30, color: "#94a3b8" },
        { value: 40, color: "#64748b" },
        { value: 50, color: "#475569" },
        { value: 60, color: "#334155" },
        { value: 70, color: "#1e293b" },
        { value: 80, color: "#0f172a" },
        { value: 90, color: "#020617" },
        { value: 100, color: "#000000" },
      ] as LegendItem[],
    },
    teal: {
      colors: [
        "#f0fdfa",
        "#ccfbf1",
        "#99f6e4",
        "#5eead4",
        "#2dd4bf",
        "#14b8a6",
        "#0d9488",
        "#0f766e",
        "#115e59",
        "#134e4a",
      ],
      legend: [
        { value: 0, color: "#f0fdfa" },
        { value: 10, color: "#ccfbf1" },
        { value: 20, color: "#99f6e4" },
        { value: 30, color: "#5eead4" },
        { value: 40, color: "#2dd4bf" },
        { value: 50, color: "#14b8a6" },
        { value: 60, color: "#0d9488" },
        { value: 70, color: "#0f766e" },
        { value: 80, color: "#115e59" },
        { value: 90, color: "#134e4a" },
        { value: 100, color: "#042f2e" },
      ] as LegendItem[],
    },
    purple: {
      colors: [
        "#faf5ff",
        "#f3e8ff",
        "#e9d5ff",
        "#d8b4fe",
        "#c084fc",
        "#a855f7",
        "#9333ea",
        "#7c3aed",
        "#6d28d9",
        "#5b21b6",
      ],
      legend: [
        { value: 0, color: "#faf5ff" },
        { value: 10, color: "#f3e8ff" },
        { value: 20, color: "#e9d5ff" },
        { value: 30, color: "#d8b4fe" },
        { value: 40, color: "#c084fc" },
        { value: 50, color: "#a855f7" },
        { value: 60, color: "#9333ea" },
        { value: 70, color: "#7c3aed" },
        { value: 80, color: "#6d28d9" },
        { value: 90, color: "#5b21b6" },
        { value: 100, color: "#4c1d95" },
      ] as LegendItem[],
    },
    diverging: {
      colors: [
        "#dc2626",
        "#ef4444",
        "#f87171",
        "#fca5a5",
        "#fecaca",
        "#f1f5f9",
        "#bfdbfe",
        "#93c5fd",
        "#60a5fa",
        "#3b82f6",
        "#1d4ed8",
      ],
      legend: [
        { value: -100, color: "#dc2626" },
        { value: -80, color: "#ef4444" },
        { value: -60, color: "#f87171" },
        { value: -40, color: "#fca5a5" },
        { value: -20, color: "#fecaca" },
        { value: 0, color: "#f1f5f9" },
        { value: 20, color: "#bfdbfe" },
        { value: 40, color: "#93c5fd" },
        { value: 60, color: "#60a5fa" },
        { value: 80, color: "#3b82f6" },
        { value: 100, color: "#1d4ed8" },
      ] as LegendItem[],
    },
    connectivity: {
      colors: [
        "#1d4ed8",
        "#3b82f6",
        "#f59e0b",
        "#f97316",
        "#dc2626",
        "#e5e7eb",
      ],
      legend: [
        { value: "Excellent", color: "#1d4ed8" },
        { value: "Good", color: "#3b82f6" },
        { value: "Fair", color: "#f59e0b" },
        { value: "Poor", color: "#f97316" },
        { value: "Inadequate", color: "#dc2626" },
        { value: "No connectivity", color: "#e5e7eb" },
      ] as LegendItem[],
    },
  };

  getColor(value: number): string {
    const theme = this.colorThemes[this.colorTheme];

    if (this.colorTheme === "diverging") {
      const colors = theme.colors;
      if (value <= -80) return colors[0];
      if (value <= -60) return colors[1];
      if (value <= -40) return colors[2];
      if (value <= -20) return colors[3];
      if (value <= 0) return colors[4];
      if (value <= 20) return colors[5];
      if (value <= 40) return colors[6];
      if (value <= 60) return colors[7];
      if (value <= 80) return colors[8];
      if (value <= 100) return colors[9];
      return colors[10];
    }

    if (this.colorTheme === "connectivity") {
      const colors = theme.colors;
      // Map numeric values to connectivity status
      if (value >= 90) return colors[0]; // Excellent
      if (value >= 70) return colors[1]; // Good
      if (value >= 50) return colors[2]; // Fair
      if (value >= 30) return colors[3]; // Poor
      if (value >= 10) return colors[4]; // Inadequate
      return colors[5]; // No connectivity
    }

    // Default behavior for other themes
    const colors = theme.colors;
    if (value <= 10) return colors[0];
    if (value <= 20) return colors[1];
    if (value <= 30) return colors[2];
    if (value <= 40) return colors[3];
    if (value <= 50) return colors[4];
    if (value <= 60) return colors[5];
    if (value <= 70) return colors[6];
    if (value <= 80) return colors[7];
    if (value <= 90) return colors[8];
    return colors[9];
  }

  getCurrentLegendItems(): LegendItem[] {
    return this.colorThemes[this.colorTheme].legend;
  }

  getLegendLabel(): string {
    const themeLabels = {
      default: "Default",
      teal: "Color variation - Teal",
      purple: "Color variation - Purple",
      diverging: "Diverging Scale (-100 to 100)",
      connectivity: "Connectivity Status",
    };

    if (this.legendPosition === "side") {
      return "Side color scale";
    }

    return this.legendLabel || themeLabels[this.colorTheme];
  }

  showCellTooltip(event: MouseEvent, day: string, time: string, value: number) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = (event.target as HTMLElement)
      .closest(".heatmap-container")
      ?.getBoundingClientRect();

    if (containerRect) {
      this.tooltip = {
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2 - 100,
        y: rect.top - containerRect.top - 80,
        content: { day, time, value } as CellTooltipContent,
        type: "cell",
      };
    }
  }

  showLegendTooltip(event: MouseEvent, item: LegendItem) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const containerRect = (event.target as HTMLElement)
      .closest(".heatmap-container")
      ?.getBoundingClientRect();

    if (containerRect) {
      this.tooltip = {
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2 - 125,
        y: rect.top - containerRect.top - 250,
        content: {
          value: item.value,
          color: item.color,
        } as LegendTooltipContent,
        type: "legend",
      };
    }
  }

  hideTooltip() {
    this.tooltip.visible = false;
  }

  getLegendTooltipData(targetValue: number) {
    // Find all cells that match or are close to the target value range
    const matchingCells: Array<{ day: string; time: string; value: number }> =
      [];

    this.data.forEach((row) => {
      row.values.forEach((value, timeIndex) => {
        // Show values within ±10 of the target value
        if (
          typeof targetValue === "number" &&
          Math.abs(value - targetValue) <= 10
        ) {
          matchingCells.push({
            day: row.day,
            time: this.timeLabels[timeIndex],
            value: value,
          });
        }
      });
    });

    // Sort by value descending and take top 5
    return matchingCells.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  isCellTooltipContent(
    content: CellTooltipContent | LegendTooltipContent
  ): content is CellTooltipContent {
    return "day" in content && "time" in content;
  }

  isLegendTooltipContent(
    content: CellTooltipContent | LegendTooltipContent
  ): content is LegendTooltipContent {
    return "color" in content;
  }

  isNumberValue(content: LegendTooltipContent): boolean {
    return typeof content.value === "number";
  }

  isStringValue(content: LegendTooltipContent): boolean {
    return typeof content.value === "string";
  }

  getColorSafe(content: CellTooltipContent | LegendTooltipContent): string {
    if (this.isCellTooltipContent(content)) {
      return this.getColor(content.value);
    }
    return "";
  }

  getLegendTooltipDataSafe(content: LegendTooltipContent) {
    if (typeof content.value === "number") {
      return this.getLegendTooltipData(content.value);
    }
    return [];
  }
}
