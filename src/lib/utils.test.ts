import { describe, it, expect } from "vitest";
import {
  calculateWeightedScore,
  formatEnumLabel,
  getInitials,
  truncate,
} from "./utils";

describe("Utility Functions", () => {
  describe("calculateWeightedScore", () => {
    it("should correctly compute weighted score based on skills, experience, and education", () => {
      const scores = {
        skillScore: 90,
        experienceScore: 80,
        educationScore: 70,
      };
      // 90 * 0.5 + 80 * 0.35 + 70 * 0.15 = 45 + 28 + 10.5 = 83.5 -> Math.round -> 84
      expect(calculateWeightedScore(scores)).toBe(84);
    });
  });

  describe("formatEnumLabel", () => {
    it("should format enum string to readable label", () => {
      expect(formatEnumLabel("HIRING_MANAGER")).toBe("Hiring Manager");
      expect(formatEnumLabel("APPLIED")).toBe("Applied");
    });
  });

  describe("getInitials", () => {
    it("should extract initials from name", () => {
      expect(getInitials("Samarth Shekhar")).toBe("SS");
      expect(getInitials("John")).toBe("J");
    });
  });

  describe("truncate", () => {
    it("should truncate string to specified length", () => {
      expect(truncate("Hello World", 5)).toBe("Hello…");
      expect(truncate("Short", 10)).toBe("Short");
    });
  });
});
