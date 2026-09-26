import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { Navbar } from '../../layout/navbar/navbar';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, Navbar, MatButton],
  template: `
    <div id="top">
      <app-navbar/>

      <main>

        <!-- HERO -->
        <section class="hero">
          <div class="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">

            <div class="hero-copy">

              <div class="hero-badge">
                <span></span>
                AI-powered interview preparation
              </div>

              <h1 class="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--pm-ink)] sm:text-6xl">
                Practice technical interviews
                <span>with confidence.</span>
              </h1>

              <p class="mt-6 max-w-xl text-lg leading-relaxed text-[var(--pm-slate)]">
                Practice realistic technical interviews with AI-generated questions,
                instant feedback, and progress tracking.
              </p>

              <p class="hero-supporting-text">
                Choose your stack. Answer real questions. Learn from every session.
              </p>

              <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  mat-flat-button
                  class="pm-button-primary !px-6 !py-1 text-base"
                  (click)="startPracticing()"
                >
                  Start practicing free
                </button>

                <a
                  href="#how-it-works"
                  mat-stroked-button
                  class="pm-button-secondary !px-6 !py-1 text-base"
                >
                  See how it works
                </a>
              </div>

              <div class="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                @for (point of valueProps; track point) {
                  <div class="flex items-center gap-2 text-sm text-[var(--pm-slate)]">
                    <mat-icon class="!h-4 !w-4 !text-[16px] text-[var(--pm-emerald)]">
                      check_circle
                    </mat-icon>
                    {{ point }}
                  </div>
                }
              </div>

            </div>

            <!-- PRODUCT PREVIEW -->
            <div class="hero-panel">

              <div class="hero-panel__header">
                <span class="hero-panel__label">INTERVIEW PREVIEW</span>
                <span class="hero-panel__progress">04 / 10</span>
              </div>

              <div class="hero-panel__body">

                <div class="question-meta">
                  <span>SPRING BOOT</span>
                  <strong>Intermediate</strong>
                </div>

                <h2>
                  How does dependency injection work
                  in Spring, and why is it useful?
                </h2>

                <div class="answer-box">
                  <span class="answer-label">YOUR ANSWER</span>

                  <p>
                    Dependency injection is a design pattern where Spring
                    provides the dependencies a class needs instead of the
                    class creating them itself. This reduces coupling and
                    makes the application easier to test and maintain.
                  </p>
                </div>

                <div class="ai-feedback">

                  <div class="feedback-icon">
                    <mat-icon>auto_awesome</mat-icon>
                  </div>

                  <div class="feedback-content">
                    <strong>AI feedback</strong>
                    <p>Clear explanation of the main concept and its purpose.</p>
                    <p>Good connection between dependency injection and loose coupling.</p>
                  </div>

                </div>

                <div class="score">
                  <strong>8.5</strong>
                  <span>/ 10</span>
                </div>

              </div>
            </div>

          </div>
        </section>

        <!-- FEATURES -->
        <section id="features" class="section">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div class="max-w-2xl">
              <span class="section-label">THE PREPMATE APPROACH</span>

              <h2 class="mt-3 font-heading text-3xl font-semibold tracking-tight text-[var(--pm-ink)] sm:text-4xl">
                Practice with
                <span>purpose.</span>
              </h2>

              <p class="mt-4 text-lg leading-relaxed text-[var(--pm-slate)]">
                Prepare by answering questions, understanding your mistakes,
                and seeing how your performance changes over time.
              </p>
            </div>

            <div class="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              @for (feature of features; track feature.title) {
                <article class="feature-card">
                  <div class="feature-card__icon">
                    <mat-icon>{{ feature.icon }}</mat-icon>
                  </div>

                  <h3 class="mt-5 font-heading text-lg font-semibold text-[var(--pm-ink)]">
                    {{ feature.title }}
                  </h3>

                  <p class="mt-2 text-[15px] leading-relaxed text-[var(--pm-slate)]">
                    {{ feature.description }}
                  </p>
                </article>
              }
            </div>

          </div>
        </section>

        <!-- HOW IT WORKS -->
        <section id="how-it-works" class="section section--tinted">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div class="max-w-2xl">
              <span class="section-label">HOW PREPMATE WORKS</span>

              <h2 class="mt-3 font-heading text-3xl font-semibold tracking-tight text-[var(--pm-ink)] sm:text-4xl">
                Practice the way
                <span>you'll be interviewed.</span>
              </h2>

              <p class="mt-4 text-lg leading-relaxed text-[var(--pm-slate)]">
                Focus on the technologies you want to improve,
                answer realistic questions, and learn from every session.
              </p>
            </div>

            <ol class="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
              @for (step of steps; track step.number) {
                <li class="step">
                  <span class="step__number">{{ step.number }}</span>

                  <h3 class="mt-4 font-heading text-lg font-semibold text-[var(--pm-ink)]">
                    {{ step.title }}
                  </h3>

                  <p class="mt-2 text-[15px] leading-relaxed text-[var(--pm-slate)]">
                    {{ step.description }}
                  </p>
                </li>
              }
            </ol>

          </div>
        </section>

        <!-- CTA -->
        <section id="cta" class="cta">
          <div class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">

            <span class="section-label section-label--light">
              YOUR NEXT INTERVIEW STARTS HERE
            </span>

            <h2 class="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Don't just know the answer.
              <span>Practice saying it.</span>
            </h2>

            <p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
              Build confidence by practicing the way you'll actually be interviewed.
            </p>

            <button
              type="button"
              mat-flat-button
              class="pm-button-cta mt-8 !px-7 !py-1 text-base"
              (click)="startPracticing()"
            >
              Start practicing free
            </button>

          </div>
        </section>

      </main>

      <footer class="footer">
        <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div class="flex flex-col items-center justify-between gap-5 sm:flex-row">

            <div class="flex items-center gap-2">
              <span class="logo-mark" aria-hidden="true">&lt;/&gt;</span>

              <span class="font-heading text-lg font-semibold text-[var(--pm-ink)]">
                PrepMate
              </span>
            </div>

            <p class="text-sm text-[var(--pm-slate)]">
              AI-powered practice for technical interviews.
            </p>

            <p class="text-sm text-[var(--pm-slate)]">
              © {{ currentYear }} PrepMate. All rights reserved.
            </p>

          </div>
        </div>
      </footer>

    </div>

    <button
                  type="button"
                  matButton="filled"
                  mat-button
                >
                  Start practicing free
                </button>

                <button
                  type="button"
                  
                  mat-flat-button
                >
                  Start practicing free
                </button>
  `,
  styleUrl: './landing.scss',
})
export class Landing {
  protected readonly currentYear = new Date().getFullYear();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected startPracticing(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.authService.login('/dashboard');
    }
  }

  protected readonly valueProps = [
    'AI-generated questions',
    'Feedback after every session',
    'Track your progress',
  ];

  protected readonly features: Feature[] = [
    {
      icon: 'auto_awesome',
      title: 'AI-generated questions',
      description:
        'Practice with questions generated around the technologies and difficulty level you choose.',
    },
    {
      icon: 'analytics',
      title: 'Actionable feedback',
      description:
        'Understand what you did well, where your answer can improve, and what to focus on next.',
    },
    {
      icon: 'tune',
      title: 'Practice your stack',
      description:
        'Choose from Java, Spring Boot, Angular, SQL, REST APIs, Docker, and more.',
    },
    {
      icon: 'trending_up',
      title: 'Track your progress',
      description:
        'Keep your interview history and see how your performance develops across sessions.',
    },
  ];

  protected readonly steps: Step[] = [
    {
      number: '01',
      title: 'Choose your focus',
      description:
        'Select your topics, difficulty, and number of questions before starting your interview.',
    },
    {
      number: '02',
      title: 'Answer the questions',
      description:
        'Work through AI-generated technical questions as if you were in a real interview.',
    },
    {
      number: '03',
      title: 'Learn from your performance',
      description:
        'Review your feedback, understand where you can improve, and prepare for your next session.',
    },
  ];
}
