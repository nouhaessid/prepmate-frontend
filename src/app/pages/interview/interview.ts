import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AppShell } from '../../layout/app-shell/app-shell';
import { InterviewApiService } from '../../api/interview-api.service';
import { QuestionResponse } from '../../models/interview/question-response.model';
import { AnswerResponse } from '../../models/interview/answer-response.model';
import { DIFFICULTY_LABELS, TOPIC_LABELS } from '../../models/interview/interview-labels';
import { SessionStatus } from '../../models/interview/session-status.enum';
import { MarkdownPipe } from '../../pipes/markdown-pipe';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, AppShell, MarkdownPipe],
  template: `
    <app-shell pageTitle="Interview">

      @if (loading()) {
        <div class="state-card">
          <p>Loading your interview…</p>
        </div>
      } @else if (loadError()) {
        <div class="state-card">
          <p>Couldn't load this interview.</p>
          <a routerLink="/my-interviews" mat-stroked-button class="pm-button-secondary mt-4 !py-1">
            Back to my interviews
          </a>
        </div>
      } @else {

        <!-- Header -->
        <div class="interview-head">
          <div class="interview-head__tags">
            <span class="topic-tag">{{ topicLabel() }}</span>
            <span class="difficulty-tag">{{ difficultyLabel() }}</span>
          </div>
          <a routerLink="/my-interviews" class="exit-link">
            <mat-icon class="!text-[16px]">close</mat-icon>
            Leave interview
          </a>
        </div>

        <!-- Question -->
        @if (currentQuestion(); as question) {
          <section class="q-card">
            <span class="q-card__number">
              Question {{ totalQuestions() ? question.orderNumber + '/' + totalQuestions() : question.orderNumber }}
            </span>
            <div class="q-card__content" [innerHTML]="question.content | markdown"></div>

            @if (!evaluation()) {
              <textarea
                class="q-card__textarea"
                rows="7"
                placeholder="Type your answer here…"
                [value]="answerContent()"
                (input)="answerContent.set($any($event.target).value)"
                [disabled]="submitting()"
              ></textarea>

              <div class="q-card__actions">
                <button
                  type="button"
                  mat-flat-button
                  class="pm-button-primary !py-1"
                  [disabled]="!answerContent().trim() || submitting()"
                  (click)="submit()"
                >
                  {{ submitting() ? 'Evaluating…' : 'Submit answer' }}
                </button>
              </div>
            }
          </section>
        }

        <!-- Evaluation -->
        @if (evaluation(); as evalResult) {
          <section class="eval-card">
            <div class="eval-card__head">
              <span class="eval-card__score" [class]="'eval-card__score--' + band(evalResult.score)">
                {{ evalResult.score }}%
              </span>
              <span class="eval-card__label">for that answer</span>
            </div>

            <div class="eval-card__feedback" [innerHTML]="evalResult.feedback | markdown"></div>

            @if (evalResult.strengths?.length) {
              <div class="eval-card__group">
                <h4>Strengths</h4>
                <ul>
                  @for (point of evalResult.strengths; track point) {
                    <li [innerHTML]="point | markdown:'inline'"></li>
                  }
                </ul>
              </div>
            }

            @if (evalResult.weaknesses?.length) {
              <div class="eval-card__group">
                <h4>Could be better</h4>
                <ul>
                  @for (point of evalResult.weaknesses; track point) {
                    <li [innerHTML]="point | markdown:'inline'"></li>
                  }
                </ul>
              </div>
            }

            @if (evalResult.suggestedAnswer) {
              <div class="eval-card__group">
                <h4>A stronger answer</h4>
                <div [innerHTML]="evalResult.suggestedAnswer | markdown"></div>
              </div>
            }

            <div class="q-card__actions">
              @if (completed()) {
                <button
                  type="button"
                  mat-flat-button
                  class="pm-button-primary !py-1"
                  (click)="goToResults()"
                >
                  See results
                </button>
              } @else {
                <button
                  type="button"
                  mat-flat-button
                  class="pm-button-primary !py-1"
                  (click)="continueToNext()"
                >
                  Next question
                </button>
              }
            </div>
          </section>
        }

      }

    </app-shell>
  `,
  styleUrl: './interview.scss',
})
export class Interview implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interviews = inject(InterviewApiService);

  private interviewId!: number;

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly topic = signal<string>('');
  protected readonly difficulty = signal<string>('');
  protected readonly totalQuestions = signal<number>(0);

  protected readonly currentQuestion = signal<QuestionResponse | null>(null);
  protected readonly answerContent = signal('');
  protected readonly submitting = signal(false);

  protected readonly evaluation = signal<AnswerResponse | null>(null);
  protected readonly completed = signal(false);

  private pendingNextQuestion: QuestionResponse | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.interviewId = Number(idParam);

    this.interviews.getInterviewById(this.interviewId).subscribe({
      next: (interview) => {
        if (interview.status === SessionStatus.COMPLETED) {
          this.router.navigate(['/results', this.interviewId]);
          return;
        }

        this.topic.set(TOPIC_LABELS[interview.topic]);
        this.difficulty.set(DIFFICULTY_LABELS[interview.difficulty]);
        this.totalQuestions.set(interview.questionCount ?? 0);

        const sorted = [...interview.questions].sort((a, b) => a.orderNumber - b.orderNumber);
        const unanswered = sorted.find((q) => q.answer == null) ?? sorted[sorted.length - 1] ?? null;

        this.currentQuestion.set(unanswered);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  protected topicLabel(): string {
    return this.topic();
  }

  protected difficultyLabel(): string {
    return this.difficulty();
  }

  protected submit(): void {
    const question = this.currentQuestion();
    const content = this.answerContent().trim();
    if (!question || !content || this.submitting()) return;

    this.submitting.set(true);
    this.interviews.submitAnswer(this.interviewId, question.id, { content }).subscribe({
      next: (result) => {
        this.evaluation.set(result.evaluation);
        this.pendingNextQuestion = result.nextQuestion;
        this.completed.set(result.interviewCompleted);
        this.submitting.set(false);
      },
      error: () => this.submitting.set(false),
    });
  }

  protected continueToNext(): void {
    this.currentQuestion.set(this.pendingNextQuestion);
    this.pendingNextQuestion = null;
    this.evaluation.set(null);
    this.answerContent.set('');
  }

  protected goToResults(): void {
    this.router.navigate(['/results', this.interviewId]);
  }

  protected band(score: number): 'strong' | 'fair' | 'weak' {
    if (score >= 80) return 'strong';
    if (score >= 60) return 'fair';
    return 'weak';
  }

  public shouldConfirmExit(): boolean {
    return this.currentQuestion() !== null && !this.completed();
  }
}