import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppShell } from '../../layout/app-shell/app-shell';
import { InterviewApiService } from '../../api/interview-api.service';
import { InterviewSessionResponse } from '../../models/interview/interview-session-response.model';
import { SessionStatus } from '../../models/interview/session-status.enum';
import { DIFFICULTY_LABELS, STATUS_LABELS, TOPIC_LABELS } from '../../models/interview/interview-labels';

type Filter = 'all' | SessionStatus;

@Component({
  selector: 'app-my-interviews',
  standalone: true,
  imports: [DatePipe, RouterLink, MatIconModule, MatButtonModule, AppShell],
  template: `
    <app-shell pageTitle="My interviews">

      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="font-heading text-2xl font-semibold text-[var(--pm-ink)]">
            Your interview history
          </h2>
          <p class="mt-1 text-[15px] text-[var(--pm-slate)]">
            Every session you've run, with the score and what you covered.
          </p>
        </div>

        <a routerLink="/interview-setup" mat-flat-button class="pm-button-primary !px-5 !py-1">
          <mat-icon class="!mr-1 !text-[18px]">add</mat-icon>
          Start new interview
        </a>
      </div>

      <!-- Filters -->
      <div class="filters" role="tablist" aria-label="Filter interviews">
        @for (tab of filters; track tab.value) {
          <button
            type="button"
            class="filter"
            [class.filter--active]="filter() === tab.value"
            [attr.aria-selected]="filter() === tab.value"
            (click)="filter.set(tab.value)"
          >
            {{ tab.label }}
            <span class="filter__count">{{ countFor(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- List -->
      @if (loading()) {
        <div class="interview-list">
          @for (row of [1, 2, 3]; track row) {
            <div class="interview-row interview-row--skeleton" aria-hidden="true"></div>
          }
        </div>
      } @else if (visible().length === 0) {
        <div class="empty">
          <div class="empty__icon"><mat-icon>forum</mat-icon></div>
          <h3 class="mt-4 font-heading text-lg font-semibold text-[var(--pm-ink)]">
            {{ filter() === 'all' ? 'No interviews yet' : 'Nothing here' }}
          </h3>
          <p class="mt-2 max-w-sm text-[15px] leading-relaxed text-[var(--pm-slate)]">
            {{
              filter() === 'all'
                ? 'Pick a topic and run your first session — it takes about fifteen minutes.'
                : 'Try another filter, or start a session to fill this list.'
            }}
          </p>
          <a routerLink="/interview-setup" mat-flat-button class="pm-button-primary mt-6 !px-5 !py-1">
            Start new interview
          </a>
        </div>
      } @else {
        <div class="interview-list">
          @for (item of visible(); track item.id) {
            <article class="interview-row">

              <div class="interview-row__main">
                <div class="interview-row__topics">
                  <span class="topic-tag">{{ topicLabel(item) }}</span>
                  <span class="difficulty-tag">{{ difficultyLabel(item) }}</span>
                </div>

                <p class="interview-row__meta">
                  {{ item.startedAt | date: 'MMM d, y · HH:mm' }}
                  &middot; {{ totalQuestions(item) }} questions
                  @if (durationMinutes(item); as minutes) {
                    &middot; {{ minutes }} min
                  }
                </p>
              </div>

              <div class="interview-row__end">
                @if (item.status === Status.COMPLETED) {
                  <div class="result" [class]="'result--' + band(item.finalScore)">
                    <strong>{{ item.finalScore }}%</strong>
                    <span>score</span>
                  </div>

                  <a [routerLink]="['/results', item.id]" mat-stroked-button class="pm-button-secondary !py-1">
                    View results
                  </a>
                } @else if (item.status === Status.IN_PROGRESS) {
                  <div class="progress">
                    <span class="progress__label">
                      {{ answeredCount(item) }} of {{ totalQuestions(item) }} answered
                    </span>
                    <span class="progress__track">
                      <span [style.width.%]="(answeredCount(item) / totalQuestions(item)) * 100"></span>
                    </span>
                  </div>

                  <a [routerLink]="['/interview', item.id]" mat-flat-button class="pm-button-primary !py-1">
                    Resume
                  </a>
                }
              </div>

            </article>
          }
        </div>
      }

    </app-shell>
  `,
  styleUrl: './my-interviews.scss',
})
export class MyInterviews implements OnInit {
  private readonly interviews = inject(InterviewApiService);

  protected readonly Status = SessionStatus;

  protected readonly loading = signal(true);
  protected readonly items = signal<InterviewSessionResponse[]>([]);
  protected readonly filter = signal<Filter>('all');

  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: SessionStatus.COMPLETED, label: 'Completed' },
    { value: SessionStatus.IN_PROGRESS, label: 'In progress' },
  ];

  protected readonly visible = computed(() => {
    const current = this.filter();
    const list = this.items();
    return current === 'all' ? list : list.filter((i) => i.status === current);
  });

  ngOnInit(): void {
    this.interviews.getMyInterviews().subscribe((list) => {
      this.items.set(
        [...list].sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
      );
      this.loading.set(false);
    });
  }

  protected countFor(value: Filter): number {
    const list = this.items();
    return value === 'all'
      ? list.length
      : list.filter((i) => i.status === value).length;
  }

  protected topicLabel(item: InterviewSessionResponse): string {
    return TOPIC_LABELS[item.topic];
  }

  protected difficultyLabel(item: InterviewSessionResponse): string {
    return DIFFICULTY_LABELS[item.difficulty];
  }

  protected statusLabel(item: InterviewSessionResponse): string {
    return STATUS_LABELS[item.status];
  }

  protected totalQuestions(item: InterviewSessionResponse): number {
    return item.questionCount ?? item.questions?.length ?? 0;
  }

  protected answeredCount(item: InterviewSessionResponse): number {
    return item.questions?.filter((q) => q.answer != null).length ?? 0;
  }

  /** Minutes between start and completion; null while the session is still open. */
  protected durationMinutes(item: InterviewSessionResponse): number | null {
    if (!item.completedAt) return null;
    const ms = new Date(item.completedAt).getTime() - new Date(item.startedAt).getTime();
    return Math.max(1, Math.round(ms / 60000));
  }

  /** Drives the score colour: strong / fair / weak. */
  protected band(score: number | null): 'strong' | 'fair' | 'weak' {
    if (score === null) return 'fair';
    if (score >= 80) return 'strong';
    if (score >= 60) return 'fair';
    return 'weak';
  }
}