export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too weak" | "Weak" | "Fair" | "Good" | "Strong";
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Too weak" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const normalized = Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4;

  if (password.length < 8) {
    return { score: 0, label: "Too weak" };
  }

  const labels: Record<1 | 2 | 3 | 4, PasswordStrength["label"]> = {
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return { score: normalized, label: labels[normalized] };
}
