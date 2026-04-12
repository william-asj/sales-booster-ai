"use client";

import { useState } from "react";
import { RECOMMEND_FLOW, RecommendAnswers } from "@/lib/prompts";
import { ChatMessage } from "@/components/chatbot/ChatBubble";

export type FlowState = {
  command: "recommend";
  step: 1 | 2 | 3 | 4 | 5;
  answers: Partial<RecommendAnswers>;
};

export type QuestionnaireMessage = ChatMessage & { role: "assistant" };

const STEP_TO_KEY: Record<number, keyof RecommendAnswers> = {
  1: "familySituation",
  2: "currentPriority",
  3: "existingCoverage",
  4: "healthConcern",
  5: "monthlyBudget"
};

function nowTime(): string {
  return new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function useChatFlow() {
  const [flowState, setFlowState] = useState<FlowState | null>(null);

  const resetFlow = () => setFlowState(null);

  const createQuestionMessage = (stepIndex: number): QuestionnaireMessage => {
    const q = RECOMMEND_FLOW[stepIndex];
    return {
      role: "assistant",
      text: JSON.stringify({
        type: "questionnaire",
        label: q.label,
        question: q.question,
        inputType: "single",
        options: q.options
      }),
      time: nowTime()
    };
  };

  const startFlow = (): QuestionnaireMessage => {
    setFlowState({
      command: "recommend",
      step: 1,
      answers: {}
    });

    return createQuestionMessage(0);
  };

  const submitAnswer = (answer: string): { 
    nextQuestion: QuestionnaireMessage | null; 
    finalAnswers: RecommendAnswers | null 
  } => {
    if (!flowState) return { nextQuestion: null, finalAnswers: null };

    const currentStep = flowState.step;
    const answerKey = STEP_TO_KEY[currentStep];
    
    const updatedAnswers = {
      ...flowState.answers,
      [answerKey]: answer
    };

    if (currentStep < 5) {
      const nextStep = (currentStep + 1) as FlowState["step"];
      setFlowState({
        ...flowState,
        step: nextStep,
        answers: updatedAnswers
      });

      return {
        nextQuestion: createQuestionMessage(nextStep - 1),
        finalAnswers: null
      };
    } else {
      // Step 5 completed
      resetFlow();
      return {
        nextQuestion: null,
        finalAnswers: updatedAnswers as RecommendAnswers
      };
    }
  };

  return {
    flowState,
    startFlow,
    submitAnswer,
    resetFlow
  };
}
