export const ch9 = {
  id: 9,
  sections: [
    {
        "title": "Project setup",
        "body": "<p>Before we can start training, your model needs a starting shape: the tokenizer, context length, width, depth, and attention layout that decide what the checkpoint will contain.</p>\n\n<p>These choices are different from how long training runs for. You can pause and resume training whenever you like, but once a checkpoint exists, the model shape has to stay the same for that run. If you change the tokenizer or the number of transformer blocks, the saved weights no longer fit.</p>\n\n<p>The tokenizer also reserves a handful of special chat tokens — <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#f6e9c7] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">&lt;|system|&gt;</code>, <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#f6e9c7] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">&lt;|user|&gt;</code>, <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#f6e9c7] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">&lt;|assistant|&gt;</code>, and <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#f6e9c7] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">&lt;|end|&gt;</code>, each with a dedicated ID that ordinary text can never produce. They're necessary later, when we'll use them to frame every conversation in supervised fine-tuning and in the chat view.</p>"
    }
]
}
