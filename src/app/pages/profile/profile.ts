import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../auth/auth.service';

import { AppShell } from '../../layout/app-shell/app-shell';
import { InterviewApiService } from '../../api/interview-api.service';
import { InterviewSessionResponse } from '../../models/interview/interview-session-response.model';
import { SessionStatus } from '../../models/interview/session-status.enum';
import { TOPIC_LABELS } from '../../models/interview/interview-labels';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIconModule, AppShell],
  template: `
    <app-shell pageTitle="Profile">

      @if (loading()) {
        <div class="state-card">
          <p>Loading your profile…</p>
        </div>
      } @else {

        <!-- Identity -->
        <div class="identity">
          <div class="identity__avatar">{{ initials() }}</div>
          <div>
            <h2 class="font-heading text-xl font-semibold text-[var(--pm-ink)]">
              {{ displayName() }}
            </h2>
            @if (email()) {
              <p class="identity__email">{{ email() }}</p>
            }
          </div>
        </div>

        <!-- Stats -->
        <div class="stat-grid">
          <div class="stat-card">
            <span class="stat-card__value">{{ totalInterviews() }}</span>
            <span class="stat-card__label">Interviews run</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ completedCount() }}</span>
            <span class="stat-card__label">Completed</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">
              {{ averageScore() !== null ? averageScore() + '%' : '—' }}
            </span>
            <span class="stat-card__label">Average score</span>
          </div>
        </div>

        <!-- Topics practiced -->
        @if (topicBreakdown().length) {
          <section class="topics-section">
            <h3 class="topics-section__title">Topics practiced</h3>
            <div class="topic-bars">
              @for (row of topicBreakdown(); track row.label) {
                <div class="topic-bar">
                  <span class="topic-bar__label">{{ row.label }}</span>
                  <span class="topic-bar__track">
                    <span
                      class="topic-bar__fill"
                      [style.width.%]="(row.count / topicBreakdown()[0].count) * 100"
                    ></span>
                  </span>
                  <span class="topic-bar__count">{{ row.count }}</span>
                </div>
              }
            </div>
          </section>
        } @else {
          <div class="state-card">
            <p>Run your first interview to start building stats here.</p>
          </div>
        }

      }

    </app-shell>
  `,
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly interviews = inject(InterviewApiService);

  protected readonly loading = signal(true);
  protected readonly displayName = signal('');
  protected readonly email = signal<string | null>(null);
  protected readonly sessions = signal<InterviewSessionResponse[]>([]);

  protected readonly totalInterviews = computed(() => this.sessions().length);

  protected readonly completedCount = computed(
    () => this.sessions().filter((s) => s.status === SessionStatus.COMPLETED).length,
  );

  protected readonly averageScore = computed(() => {
    const completed = this.sessions().filter((s) => s.status === SessionStatus.COMPLETED);
    if (!completed.length) return null;
    const sum = completed.reduce((acc, s) => acc + s.finalScore, 0);
    return Math.round(sum / completed.length);
  });

  protected readonly topicBreakdown = computed(() => {
    const counts = new Map<string, number>();
    for (const session of this.sessions()) {
      const label = TOPIC_LABELS[session.topic];
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  });

  protected initials(): string {
    const name = this.displayName().trim();
    if (!name) return '?';
    const parts = name.split(/\s+/);
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }

  ngOnInit(): void {
    this.displayName.set(this.auth.getUserName() || 'You');
    this.email.set(this.auth.getUserEmail() || null);
    
    this.interviews.getMyInterviews().subscribe({
      next: (list) => {
        this.sessions.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}