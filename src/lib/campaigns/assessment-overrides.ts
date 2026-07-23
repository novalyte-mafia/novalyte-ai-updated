import type { AssessmentConfig, Question, QuestionType } from "@/lib/assessment-config";

export type DeclarativeShowIf = {
  questionId: string;
  op: "eq" | "neq" | "includes" | "truthy";
  value?: string | string[] | boolean;
};

export type DeclarativeQuestion = {
  id: string;
  type: QuestionType | string;
  title: string;
  desc?: string;
  required?: boolean;
  options?: { value: string; label: string; desc?: string }[];
  placeholder?: string;
  stage?: string;
  whyWeAsk?: string;
  signal?: Question["signal"];
  showIf?: DeclarativeShowIf;
};

function compileShowIf(
  rule: DeclarativeShowIf | undefined,
): Question["showIf"] {
  if (!rule?.questionId) return undefined;
  return (answers) => {
    const raw = answers[rule.questionId];
    const value = rule.value;
    if (rule.op === "truthy") {
      if (Array.isArray(raw)) return raw.length > 0;
      if (raw && typeof raw === "object") return Object.keys(raw).length > 0;
      return Boolean(raw);
    }
    if (rule.op === "includes") {
      if (Array.isArray(raw)) {
        if (Array.isArray(value)) return value.some((v) => raw.includes(String(v)));
        return raw.includes(String(value ?? ""));
      }
      return String(raw ?? "").includes(String(value ?? ""));
    }
    const left = Array.isArray(raw) ? raw.join(",") : typeof raw === "object" ? JSON.stringify(raw) : String(raw ?? "");
    const right = Array.isArray(value) ? value.join(",") : String(value ?? "");
    if (rule.op === "neq") return left !== right;
    return left === right;
  };
}

export function applyDeclarativeQuestions(
  base: AssessmentConfig,
  declarative: DeclarativeQuestion[] | null | undefined,
): AssessmentConfig {
  if (!declarative?.length) return base;

  const questions: Question[] = declarative.map((q) => ({
    id: q.id,
    type: q.type as QuestionType,
    title: q.title,
    desc: q.desc,
    required: q.required,
    options: q.options,
    placeholder: q.placeholder,
    stage: q.stage,
    whyWeAsk: q.whyWeAsk,
    signal: q.signal,
    showIf: compileShowIf(q.showIf),
  }));

  return { ...base, questions };
}
