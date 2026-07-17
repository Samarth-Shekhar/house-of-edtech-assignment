import Link from "next/link";
import { Brain, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] py-10 bg-white">
      <div className="page-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-accent-mustard)" }}
            >
              <Brain className="text-white" size={14} />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">
              Vetted<span className="font-semibold text-[var(--color-text-primary)]">.ai</span>{" "}
              — AI-Powered Hiring Intelligence
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              Built with{" "}
              <Heart className="text-red-500" size={13} fill="currentColor" />{" "}
              by{" "}
              <span className="font-semibold text-[var(--color-text-primary)]">
                Samarth Shekhar
              </span>
            </span>
            <span className="text-[var(--color-border-subtle)]">|</span>
            <Link
              href="https://github.com/samarth-shekhar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors no-underline"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/samarth-shekhar-185ba311a"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors no-underline"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              LinkedIn
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Vetted. Built as a Full-Stack
            Assignment for House of EdTech.
          </p>
        </div>
      </div>
    </footer>
  );
}
