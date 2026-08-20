import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is AI Clipboard free to use?",
    answer:
      "Yes. You get 10 free AI requests every 2 hours out of the box. If you need unlimited queries, paste your own API key in settings.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Google Chrome, Brave, Arc, Microsoft Edge, and any Chromium-based browser supporting Manifest V3.",
  },
  {
    question: "Does the extension read everything I copy?",
    answer:
      "No. It only processes clips when you click an action on the copy toast or select text to trigger an inline explanation. Nothing leaves your browser without user action.",
  },
  {
    question: "Which AI model powers the explanations?",
    answer:
      "The free tier runs Meta Llama 3.3 70B via Cloudflare Workers AI for rapid responses. BYO key supports OpenAI GPT-4o models.",
  },
  {
    question: "Can I bring my own API key?",
    answer:
      "Yes. Open settings and paste your API key for unlimited requests. Your key is stored locally on your machine and communicates directly with the provider.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28 max-w-3xl mx-auto px-4 sm:px-6">
      <h2 className="text-3xl font-semibold text-ink-primary tracking-tight text-center">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-ink-tertiary text-center mt-2 mb-10">
        Everything you need to know about keys, models, and limits.
      </p>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}