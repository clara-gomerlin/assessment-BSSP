import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { calculateScores, getWinnerArchetype } from "@/lib/scoring";
import { Question, SubmitPayload, QuizSettings, Dimension } from "@/lib/types";

// Server-side Supabase client with service role for inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body: SubmitPayload = await request.json();
    const { quiz_id, respondent_name, respondent_email, respondent_phone, answers } = body;

    // Fetch quiz
    const { data: quiz, error: quizError } = await supabase
      .from("assessment_quizzes")
      .select("*")
      .eq("id", quiz_id)
      .single();

    if (quizError || !quiz) {
      return Response.json({ error: "Quiz não encontrado" }, { status: 404 });
    }

    // Fetch questions
    const { data: questions, error: qError } = await supabase
      .from("assessment_questions")
      .select("*")
      .eq("quiz_id", quiz_id)
      .order("order_index");

    if (qError || !questions?.length) {
      return Response.json({ error: "Perguntas não encontradas" }, { status: 404 });
    }

    // Calculate scores
    const scores = calculateScores(questions as Question[], answers);

    // Determine winner archetype
    const { primary, secondary } = getWinnerArchetype(
      scores,
      answers,
      quiz.dimensions as Dimension[],
      quiz.settings as QuizSettings
    );

    // Save response to database (without AI result yet)
    const { data: savedResponse, error: saveError } = await supabase
      .from("assessment_responses")
      .insert({
        quiz_id,
        respondent_name,
        respondent_email,
        respondent_phone: respondent_phone || null,
        answers: Object.entries(answers).map(([question_id, selected_option_id]) => ({
          question_id,
          selected_option_id,
        })),
        computed_scores: scores,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return Response.json({ error: "Erro ao salvar respostas" }, { status: 500 });
    }

    // Build prompt from template
    const prompt = (quiz.prompt_template || "")
      .replace("{{respondent}}", `${respondent_name} (${respondent_email})`)
      .replace("{{scores}}", JSON.stringify(scores))
      .replace("{{answers}}", JSON.stringify(answers))
      .replace("{{dimensions}}", JSON.stringify(quiz.dimensions));

    // Stream response using SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send meta data first
        const meta = JSON.stringify({
          type: "meta",
          archetype: primary,
          secondary,
          scores,
        });
        controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

        // Stream AI response
        let fullText = "";
        try {
          const aiStream = anthropic.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
          });

          for await (const event of aiStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullText += text;
              const chunk = JSON.stringify({ type: "text", content: text });
              controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            }
          }
        } catch (aiError) {
          console.error("AI error:", aiError);
          const errorChunk = JSON.stringify({
            type: "text",
            content: "\n\n[Erro ao gerar análise personalizada. Tente novamente.]",
          });
          controller.enqueue(encoder.encode(`data: ${errorChunk}\n\n`));
        }

        // Update response with AI result
        await supabase
          .from("assessment_responses")
          .update({
            ai_result: { archetype: primary.code, secondary: secondary.code },
            result_markdown: fullText,
          })
          .eq("id", savedResponse.id);

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Submit error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
