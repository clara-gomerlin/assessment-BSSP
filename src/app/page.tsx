import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home() {
  const slug = process.env.BRAND_QUIZ_SLUG || "revenue-efficiency-index";
  redirect(`/quiz/${slug}`);
}
