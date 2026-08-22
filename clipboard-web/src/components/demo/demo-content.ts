export interface ArticleExcerpt {
  byline: string;
  paragraphs: string[];
}

export interface PresetChip {
  id: "summarize" | "translate" | "explain";
  label: string;
}

export interface PopoverAction {
  id: "summarize" | "explain" | "actions" | "copy";
  label: string;
}

export const PROMPT_SENTENCE = "Try selecting this sentence right now.";

export const ARTICLE_EXCERPT: ArticleExcerpt = {
  byline: "arXiv preprint · 12 min read",
  paragraphs: [
    "Dominant sequence transduction models rely on complex recurrent or convolutional neural networks arranged within an encoder-decoder architecture. While effective on short inputs, recurrent models generate hidden states sequentially, which prohibits parallelization within training examples and forces strictly ordered computation. This fundamental bottleneck becomes critical at longer sequence lengths, where memory constraints sharply limit batch processing and prevent efficient scaling across modern distributed compute clusters.",
    "The Transformer architecture eschews recurrence entirely and relies solely on an attention mechanism to draw global dependencies between input and output representations. By computing multi-head attention in parallel across all token positions, the network achieves strong translation quality while requiring substantially less training time than its recurrent predecessors. Each head independently learns a distinct relational subspace, capturing syntax, coreference, and long-range structure without sequential state propagation. Try selecting this sentence right now.",
    "In practice, computing full attention matrices across thousands of context tokens introduces quadratic computational complexity relative to sequence length, which dominates cost at scale. Researchers mitigate this overhead through structured sparse attention patterns, low-rank key-value approximations, and 8-bit quantization applied during inference passes. These techniques preserve semantic precision while sharply reducing memory bandwidth, enabling deployment of large models on commodity hardware.",
  ],
};

export const PRESET_CHIPS: PresetChip[] = [
  { id: "summarize", label: "Summarize this paragraph" },
  { id: "translate", label: "Translate to Thai" },
  { id: "explain", label: "Explain term" },
];

export const POPOVER_ACTIONS: PopoverAction[] = [
  { id: "summarize", label: "Summarize" },
  { id: "explain", label: "Explain" },
  { id: "actions", label: "Action Items" },
  { id: "copy", label: "Copy" },
];

export const RESPONSES: Record<"summarize" | "explain" | "translate" | "actions", string> = {
  summarize:
    "**Summary: Transformer Architecture**\n\n- Replaces recurrent loops entirely with parallelized self-attention across every token position.\n- Removes the sequential processing bottleneck that limited training across compute clusters.\n- Maintains global token dependencies over long context windows without state propagation.\n- Mitigates quadratic attention cost through sparse patterns and 8-bit quantization.",
  explain:
    "**Term Breakdown: Multi-Head Attention**\n\nInstead of computing one single contextual relationship between words, the model splits each token's representation into several independent subspaces, called heads, and runs attention in parallel inside each one.\n\n**Analogy**: Imagine a team reading the same research paper together — one specialist tracks grammatical structure, another tracks emotional tone, a third tracks factual entities — then they pool their combined notes into a single shared understanding.",
  translate:
    "สถาปัตยกรรมทรานส์ฟอร์เมอร์ละทิ้งกลไกการทำงานแบบวนซ้ำทั้งหมด และพึ่งพากลไกความสนใจแต่เพียงผู้เดียวในการสร้างความสัมพันธ์ระดับโครงสร้างระหว่างอินพุตและเอาต์พุต โดยคำนวณความสนใจแบบมัลติเฮดแบบขนานครอบคลุมทุกตำแหน่งโทเค็นพร้อมกัน\n\n*(translated to Thai)*",
  actions:
    "**Key Action Items for Readers**\n\n- **Benchmark Attention Overhead**: Profile sparse versus dense self-attention kernels directly on your target GPU before committing.\n- **Verify Quantization Drift**: Test 8-bit matrix weights against full-precision perplexity baselines to confirm no semantic loss.\n- **Isolate Context Bottlenecks**: Measure memory consumption across varying batch sizes and sequence lengths to find the true limit.",
};

export const QUOTA_MESSAGE =
  "You've unlocked 3 demo actions. Get unlimited instant popovers in any Chrome tab.";

export const CHROME_CTA = "Add to Chrome";
