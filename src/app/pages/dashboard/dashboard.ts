import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppShell } from '../../layout/app-shell/app-shell';
import { InterviewApiService } from '../../api/interview-api.service';
import { AuthService } from '../../auth/auth.service';

import { InterviewSessionResponse } from '../../models/interview/interview-session-response.model';
import { InterviewTopic } from '../../models/interview/interview-topic.enum';
import { SessionStatus } from '../../models/interview/session-status.enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    AppShell
  ],
  template: `
    <app-shell pageTitle="Dashboard">

      <!-- Header -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="font-heading text-2xl font-semibold text-[var(--pm-ink)]">
            Welcome back, {{ userName() }}
          </h2>

          <p class="mt-1 text-[15px] text-[var(--pm-slate)]">
            Here's how your interview preparation is going.
          </p>
        </div>

        <a
          routerLink="/interview-setup"
          mat-flat-button
          class="pm-button-primary !px-5 !py-1"
        >
          <mat-icon class="!mr-1 !text-[18px]">add</mat-icon>
          Start new interview
        </a>
      </div>

      <!-- Analytics grid -->
      <div class="dashboard-grid">

        <!-- Performance -->
        <div class="dashboard-card performance-card">

          <div class="card-header">
            <div>
              <span class="card-label">PERFORMANCE</span>
              <h3 class="card-title">Interview score</h3>
            </div>
          </div>

          <div class="performance-summary">
            <div>
              <span class="performance-score">
                {{ averageScore() }}
              </span>

              <span class="performance-max">/100</span>
            </div>

            <p>Average score across your interviews</p>
          </div>

          <div class="chart">
            <div class="chart-grid">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            @if (scoreHistory().length > 1) {

              <svg
                class="chart-line"
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                aria-label="Interview score trend"
              >
                <defs>
                  <linearGradient
                    id="scoreFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stop-color="#16825d"
                      stop-opacity=".22"
                    />

                    <stop
                      offset="100%"
                      stop-color="#16825d"
                      stop-opacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  class="chart-area"
                  [attr.d]="chartAreaPath()"
                />

                <path
                  class="chart-path"
                  [attr.d]="chartPath()"
                />

                <circle
                  class="chart-dot"
                  [attr.cx]="chartLastPoint().x"
                  [attr.cy]="chartLastPoint().y"
                  r="5"
                />
              </svg>

              <div class="chart-labels">
                @for (item of chartLabels(); track $index) {
                  <span>{{ item }}</span>
                }
              </div>

            } @else {

              <div class="flex h-full items-center justify-center">
                <p class="text-sm text-[var(--pm-slate)]">
                  Complete more interviews to see your score trend.
                </p>
              </div>

            }
          </div>

        </div>

        <!-- Average score -->
        <div class="dashboard-card score-card">

          <div class="card-header">
            <span class="card-label">AVERAGE SCORE</span>

            <div class="metric-icon">
              <mat-icon>insights</mat-icon>
            </div>
          </div>

          <div class="metric-value">
            {{ averageScore() }}<span>%</span>
          </div>

          <p class="metric-description">
            Across {{ completedInterviews() }} completed interviews
          </p>

          <div class="mini-progress">
            <span [style.width.%]="averageScore()"></span>
          </div>

        </div>

        <!-- Current streak -->
        <div class="dashboard-card streak-card">

          <div class="card-header">
            <span class="card-label">CURRENT STREAK</span>

            <div class="metric-icon">
              <mat-icon>local_fire_department</mat-icon>
            </div>
          </div>

          <div class="metric-value">
            {{ currentStreak() }}
            <span class="metric-unit"> days</span>
          </div>

          <p class="metric-description">
            Keep practicing to extend your streak.
          </p>

          <div class="streak-days">

            @for (day of streakDays(); track $index) {
              <span
                class="streak-day"
                [class.streak-day--active]="day.active"
                [class.streak-day--today]="day.today"
              >
                {{ day.label }}
              </span>
            }

          </div>

        </div>

        <!-- Interviews completed -->
        <div class="dashboard-card interviews-card">

          <div class="card-header">
            <div>
              <span class="card-label">INTERVIEWS</span>
              <h3 class="card-title">Completed</h3>
            </div>

            <div class="metric-icon">
              <mat-icon>forum</mat-icon>
            </div>
          </div>

          <div class="metric-value">
            {{ completedInterviews() }}
          </div>

          <p class="metric-description">
            Interviews completed so far
          </p>

        </div>

        <!-- Strongest track -->
        <div class="dashboard-card track-card">

          @if (strongestTopic(); as topic) {

            <div class="track-content">

              <div>
                <span class="card-label">STRONGEST TRACK</span>

                <h3 class="track-name">
                  {{ formatTopic(topic.topic) }}
                </h3>

                <p class="metric-description">
                  Your strongest performing topic
                </p>
              </div>

              <div class="track-score">
                <strong>{{ topic.score }}%</strong>
                <span>average</span>
              </div>

            </div>

            <div class="track-bar">
              <span [style.width.%]="topic.score"></span>
            </div>

          } @else {

            <span class="card-label">STRONGEST TRACK</span>

            <h3 class="track-name">
              No data yet
            </h3>

            <p class="metric-description">
              Complete an interview to see your strongest topic.
            </p>

          }

        </div>

      </div>

      <!-- Recent interviews -->
      <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div class="panel lg:col-span-2">

          <div class="flex items-center justify-between">

            <h3 class="font-heading text-lg font-semibold text-[var(--pm-ink)]">
              Recent interviews
            </h3>

            <a
              routerLink="/my-interviews"
              class="text-sm font-medium text-[var(--pm-emerald)] hover:underline"
            >
              View all
            </a>

          </div>

          <div class="mt-4 divide-y divide-[var(--pm-border)]">

            @if (recentInterviews().length) {

              @for (
                item of recentInterviews();
                track item.id
              ) {

                <div class="flex items-center justify-between gap-3 py-3">

                  <div>
                    <p class="text-sm font-medium text-[var(--pm-ink)]">
                      {{ formatTopic(item.topic) }}
                    </p>

                    <p class="text-xs text-[var(--pm-slate)]">
                      {{ formatDifficulty(item.difficulty) }}
                      &middot;
                      {{ formatDate(item.startedAt) }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">

                    <span class="score-pill">
                      {{ item.finalScore }}%
                    </span>

                    <a
                      [routerLink]="['/results', item.id]"
                      class="text-sm font-medium text-[var(--pm-emerald)] hover:underline"
                    >
                      View
                    </a>

                  </div>

                </div>

              }

            } @else {

              <p class="py-6 text-sm text-[var(--pm-slate)]">
                You haven't completed any interviews yet.
              </p>

            }

          </div>

        </div>

        <!-- Suggested practice -->
        <div class="panel panel--accent">

          <mat-icon class="!text-[28px] text-[var(--pm-emerald)]">
            lightbulb
          </mat-icon>

          <h3 class="mt-4 font-heading text-lg font-semibold text-[var(--pm-ink)]">
            Suggested next practice
          </h3>

          <p class="mt-2 text-[15px] leading-relaxed text-[var(--pm-slate)]">
            Your dashboard will help you identify the topics where
            additional practice could be useful.
          </p>

          <a
            routerLink="/interview-setup"
            mat-stroked-button
            class="pm-button-secondary mt-5 w-full !py-1"
          >
            Start an interview
          </a>

        </div>

      </div>

    </app-shell>
  `,
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  private readonly interviewApi = inject(InterviewApiService);
  private readonly auth = inject(AuthService);

  // -------------------------
  // Source signals
  // -------------------------

  protected readonly interviews = signal<InterviewSessionResponse[]>([]);

  protected readonly userName = signal(this.auth.getUserName());

  // -------------------------
  // Computed dashboard data
  // -------------------------

  protected readonly completedInterviewList = computed(() =>
    this.interviews()
      .filter(
        interview =>
          interview.status === SessionStatus.COMPLETED
      )
      .filter(
        interview =>
          interview.finalScore !== null &&
          interview.finalScore !== undefined
      )
  );

  protected readonly completedInterviews = computed(() =>
    this.completedInterviewList().length
  );

  protected readonly averageScore = computed(() => {

    const interviews = this.completedInterviewList();

    if (!interviews.length) {
      return 0;
    }

    const total = interviews.reduce(
      (sum, interview) =>
        sum + interview.finalScore,
      0
    );

    return Math.round(total / interviews.length);
  });

  protected readonly recentInterviews = computed(() =>
    [...this.completedInterviewList()]
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() -
          new Date(a.startedAt).getTime()
      )
      .slice(0, 4)
  );

  protected readonly strongestTopic = computed(() => {

    const interviews = this.completedInterviewList();

    if (!interviews.length) {
      return null;
    }

    const grouped = new Map<
      InterviewTopic,
      { total: number; count: number }
    >();

    for (const interview of interviews) {

      const current = grouped.get(interview.topic) ?? {
        total: 0,
        count: 0
      };

      grouped.set(interview.topic, {
        total: current.total + interview.finalScore,
        count: current.count + 1
      });
    }

    let strongest: {
      topic: InterviewTopic;
      score: number;
    } | null = null;

    for (const [topic, data] of grouped) {

      const score = Math.round(
        data.total / data.count
      );

      if (!strongest || score > strongest.score) {
        strongest = {
          topic,
          score
        };
      }
    }

    return strongest;
  });

  // -------------------------
  // Score chart
  // -------------------------

  protected readonly scoreHistory = computed(() =>
    [...this.completedInterviewList()]
      .sort(
        (a, b) =>
          new Date(a.startedAt).getTime() -
          new Date(b.startedAt).getTime()
      )
  );

  protected readonly chartPoints = computed(() => {

    const interviews = this.scoreHistory();

    if (!interviews.length) {
      return [];
    }

    const width = 600;
    const height = 180;

    const padding = 10;

    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    return interviews.map((interview, index) => {

      const x =
        interviews.length === 1
          ? width / 2
          : padding +
            (index / (interviews.length - 1)) *
              usableWidth;

      const y =
        padding +
        ((100 - interview.finalScore) / 100) *
          usableHeight;

      return {
        x,
        y
      };
    });
  });

  protected readonly chartPath = computed(() => {

    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    return points
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
      )
      .join(' ');
  });

  protected readonly chartAreaPath = computed(() => {

    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    const first = points[0];
    const last = points[points.length - 1];

    return `
      ${this.chartPath()}
      L${last.x},180
      L${first.x},180
      Z
    `;
  });

  protected readonly chartLastPoint = computed(() => {

    const points = this.chartPoints();

    return points[points.length - 1] ?? {
      x: 0,
      y: 0
    };
  });

  protected readonly chartLabels = computed(() =>
    this.scoreHistory()
      .slice(-4)
      .map(interview =>
        this.formatDate(interview.startedAt)
      )
  );

  // -------------------------
  // Streak
  // -------------------------

  protected readonly currentStreak = computed(() => {

    const interviews = this.completedInterviewList();

    if (!interviews.length) {
      return 0;
    }

    const days = new Set(
      interviews.map(interview =>
        new Date(interview.startedAt)
          .toDateString()
      )
    );

    let streak = 0;

    const currentDate = new Date();

    if (!days.has(currentDate.toDateString())) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {

      const date = currentDate.toDateString();

      if (!days.has(date)) {
        break;
      }

      streak++;

      currentDate.setDate(
        currentDate.getDate() - 1
      );
    }

    return streak;
  });

  protected readonly streakDays = computed(() => {

    const today = new Date();
    const currentStreak = this.currentStreak();

    // Mirrors the rule in currentStreak(): if today has no logged
    // interview yet, the streak's most recent day is yesterday, not
    // today. The highlighted window has to be anchored the same way
    // currentStreak() counts, or the two fall out of sync.
    const hasToday = this.interviews().some(interview =>
      new Date(interview.startedAt).toDateString() ===
      today.toDateString()
    );

    // Index (within the 7-cell array below, oldest=0..newest=6) of the
    // streak's most recent day.
    const streakEndIndex = hasToday ? 6 : 5;
    const streakStartIndex = streakEndIndex - currentStreak + 1;

    return Array.from(
      { length: 7 },
      (_, index) => {

        const date = new Date(today);

        date.setDate(
          today.getDate() - (6 - index)
        );

        const label = date
          .toLocaleDateString(
            'en-US',
            { weekday: 'short' }
          )
          .charAt(0);

        const isToday =
          date.toDateString() === today.toDateString();

        return {
          label,
          today: isToday,
          active:
            currentStreak > 0 &&
            index >= streakStartIndex &&
            index <= streakEndIndex
        };
      }
    );
  });

  // -------------------------
  // API
  // -------------------------

  ngOnInit(): void {

    this.interviewApi
      .getMyInterviews()
      .subscribe({
        next: interviews =>
          this.interviews.set(interviews),

        error: error =>
          console.error(
            'Failed to load interviews',
            error
          )
      });
  }

  // -------------------------
  // Formatting
  // -------------------------

  protected formatTopic(topic: InterviewTopic): string {

    return topic
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );
  }

  protected formatDifficulty(
    difficulty: string
  ): string {

    return difficulty
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, letter =>
        letter.toUpperCase()
      );
  }

  protected formatDate(date: string): string {

    return new Date(date).toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric'
      }
    );
  }
}