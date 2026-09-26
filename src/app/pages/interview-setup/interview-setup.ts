import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppShell } from '../../layout/app-shell/app-shell';

import { InterviewApiService } from '../../api/interview-api.service';
import { InterviewTopic } from '../../models/interview/interview-topic.enum';
import { Difficulty } from '../../models/interview/difficulty.enum';

interface TopicOption {
  value: InterviewTopic;
  label: string;
  icon: string;
}

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
}

@Component({
  selector: 'app-interview-setup',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, AppShell],
  template: `
    <app-shell pageTitle="New interview">

      <div class="config">

        <!-- Left: the choices -->
        <div class="config__main">

          <div>
            <h2 class="font-heading text-2xl font-semibold text-[var(--pm-ink)]">
              Set up your interview
            </h2>
            <p class="mt-1 text-[15px] text-[var(--pm-slate)]">
              Three choices and you're in. You can change them next time.
            </p>
          </div>

          <!-- Topic -->
          <section class="step">
            <div class="step__head">
              <div>
                <h3 class="step__title">What should we ask about?</h3>
                <p class="step__hint">Pick a topic for this session.</p>
              </div>
            </div>

            @for (group of groupedTopics; track group.name) {
              <p class="topic-group">{{ group.name }}</p>
              <div class="topic-grid">
                @for (topic of group.items; track topic.value) {
                  <button
                    type="button"
                    class="topic"
                    [class.topic--on]="selectedTopic() === topic.value"
                    [attr.aria-pressed]="selectedTopic() === topic.value"
                    (click)="selectedTopic.set(topic.value)"
                  >
                    <mat-icon>{{ topic.icon }}</mat-icon>
                    {{ topic.label }}
                  </button>
                }
              </div>
            }
          </section>

          <!-- Difficulty -->
          <section class="step">
            <div class="step__head">
              <div>
                <h3 class="step__title">How hard should it get?</h3>
                <p class="step__hint">This sets the depth of the follow-ups.</p>
              </div>
            </div>

            <div class="difficulty-grid">
              @for (option of difficulties; track option.value) {
                <button
                  type="button"
                  class="difficulty"
                  [class.difficulty--on]="difficulty() === option.value"
                  [attr.aria-pressed]="difficulty() === option.value"
                  (click)="difficulty.set(option.value)"
                >
                  <span class="difficulty__bars" [attr.data-level]="option.value" aria-hidden="true">
                    <i></i><i></i><i></i>
                  </span>
                  <strong>{{ option.label }}</strong>
                  <span class="difficulty__text">{{ option.description }}</span>
                </button>
              }
            </div>
          </section>

          <!-- Question count -->
          <section class="step">
            <div class="step__head">
              <div>
                <h3 class="step__title">How many questions?</h3>
                <p class="step__hint">Roughly {{ estimatedMinutes() }} minutes.</p>
              </div>
            </div>

            <div class="count-row">
              @for (count of questionCounts; track count) {
                <button
                  type="button"
                  class="count"
                  [class.count--on]="questionCount() === count"
                  [attr.aria-pressed]="questionCount() === count"
                  (click)="questionCount.set(count)"
                >
                  {{ count }}
                </button>
              }
            </div>
          </section>

        </div>

        <!-- Right: summary -->
        <aside class="summary">
          <span class="summary__label">Your session</span>

          <dl class="summary__list">
            <div>
              <dt>Topic</dt>
              <dd>{{ selectedTopicLabel() || 'Not chosen yet' }}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{{ difficultyLabel() }}</dd>
            </div>
            <div>
              <dt>Questions</dt>
              <dd>{{ questionCount() }}</dd>
            </div>
            <div>
              <dt>Estimated time</dt>
              <dd>{{ estimatedMinutes() }} minutes</dd>
            </div>
          </dl>

          <button
            type="button"
            mat-flat-button
            class="pm-button-primary summary__start !py-1"
            [disabled]="!canStart() || starting()"
            (click)="start()"
          >
            {{ starting() ? 'Preparing questions…' : 'Start interview' }}
          </button>

          @if (!selectedTopic()) {
            <p class="summary__note">Choose a topic to begin.</p>
          } @else {
            <p class="summary__note">
              Answers are saved as you go, so you can stop and resume later.
            </p>
          }
        </aside>

      </div>

    </app-shell>
  `,
  styleUrl: './interview-setup.scss',
})
export class InterviewSetup {
  private readonly interviews = inject(InterviewApiService);
  private readonly router = inject(Router);

  protected readonly selectedTopic = signal<InterviewTopic | null>(null);
  protected readonly difficulty = signal<Difficulty>(Difficulty.INTERMEDIATE);
  protected readonly questionCount = signal(8);
  protected readonly starting = signal(false);

  protected readonly questionCounts = [5, 8, 10, 15];

  protected readonly difficulties: DifficultyOption[] = [
    {
      value: Difficulty.BEGINNER,
      label: 'Beginner',
      description: 'Core concepts and definitions.',
    },
    {
      value: Difficulty.INTERMEDIATE,
      label: 'Intermediate',
      description: 'Real scenarios and trade-offs.',
    },
    {
      value: Difficulty.ADVANCED,
      label: 'Advanced',
      description: 'Design decisions under constraints.',
    },
  ];

  protected readonly groupedTopics: { name: string; items: TopicOption[] }[] = [
    {
      name: 'Languages & frameworks',
      items: [
        { value: InterviewTopic.JAVA, label: 'Java', icon: 'coffee' },
        { value: InterviewTopic.SPRING_BOOT, label: 'Spring Boot', icon: 'eco' },
        { value: InterviewTopic.ANGULAR, label: 'Angular', icon: 'web' },
        { value: InterviewTopic.SQL, label: 'SQL', icon: 'storage' },
        { value: InterviewTopic.REST_API, label: 'REST APIs', icon: 'api' },
      ],
    },
    {
      name: 'Infrastructure',
      items: [
        { value: InterviewTopic.DOCKER, label: 'Docker', icon: 'inventory_2' },
        { value: InterviewTopic.KUBERNETES, label: 'Kubernetes', icon: 'hub' },
      ],
    },
    {
      name: 'General',
      items: [
        { value: InterviewTopic.GENERAL_SOFTWARE_ENGINEERING, label: 'Software engineering', icon: 'engineering' },
        { value: InterviewTopic.BEHAVIORAL, label: 'Behavioral', icon: 'forum' },
      ],
    },
  ];

  protected readonly selectedTopicLabel = computed(() => {
    const value = this.selectedTopic();
    if (!value) return '';
    for (const group of this.groupedTopics) {
      const match = group.items.find((t) => t.value === value);
      if (match) return match.label;
    }
    return '';
  });

  protected readonly canStart = computed(() => this.selectedTopic() !== null);

  protected readonly estimatedMinutes = computed(() => {
    const perQuestion = {
      [Difficulty.BEGINNER]: 2,
      [Difficulty.INTERMEDIATE]: 3,
      [Difficulty.ADVANCED]: 4,
    }[this.difficulty()];
    return this.questionCount() * perQuestion;
  });

  protected difficultyLabel(): string {
    return this.difficulties.find((d) => d.value === this.difficulty())?.label ?? '';
  }

  protected start(): void {
    const topic = this.selectedTopic();
    if (!topic || this.starting()) return;

    this.starting.set(true);
    this.interviews
      .createInterview({
        topic,
        difficulty: this.difficulty(),
        questionCount: this.questionCount(),
      })
      .subscribe({
        next: (interview) => this.router.navigate(['/interview', interview.id]),
        error: () => this.starting.set(false),
      });
  }
}