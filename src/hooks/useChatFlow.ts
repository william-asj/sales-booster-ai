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

  const goBack = () => {
    if (!flowState || flowState.step === 1) return;
    
    const prevStep = (flowState.step - 1) as FlowState["step"];
    // Wait, the prompt says "removes the last answer".
    const lastKey = STEP_TO_KEY[prevStep];
    
    const updatedAnswers = { ...flowState.answers };
    delete updatedAnswers[lastKey];

    setFlowState({
      ...flowState,
      step: prevStep,
      answers: updatedAnswers
    });
  };

  const startFlow = (): QuestionnaireMessage => {
    setFlowState({
      command: "recommend",
      step: 1,
      answers: {}
    });

    return {
      role: "assistant",
      text: JSON.stringify({
        type: "questionnaire",
        steps: RECOMMEND_FLOW.map(q => ({
          label: q.label,
          question: q.question,
          options: q.options
        }))
      }),
      time: nowTime()
    };
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

      // Note: This might not be used if the card handles internal steps
      return {
        nextQuestion: null,
        finalAnswers: null
      };
    } else {
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
    resetFlow,
    goBack
  };
}
