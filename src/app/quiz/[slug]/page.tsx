import { getSupabase } from "@/lib/supabase";
import { Quiz, Question } from "@/lib/types";
import QuizPlayer from "@/components/QuizPlayer";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  // Fetch quiz
  const { data: quiz, error: quizError } = await supabase
    .from("assessment_quizzes")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (quizError || !quiz) {
    notFound();
  }

  // Fetch questions ordered
  const { data: questions, error: qError } = await supabase
    .from("assessment_questions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("order_index", { ascending: true });

  if (qError || !questions?.length) {
    notFound();
  }

  return (
    <QuizPlayer
      quiz={quiz as Quiz}
      questions={questions as Question[]}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: quiz } = await supabase
    .from("assessment_quizzes")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!quiz) return { title: "Quiz não encontrado" };

  return {
    title: quiz.title,
    description: quiz.description,
    openGraph: {
      title: quiz.title,
      description: quiz.description,
    },
  };
}
