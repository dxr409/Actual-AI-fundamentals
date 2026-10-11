export const ch13 = {
  id: 13,
  sections: [
    {
        "title": "Sampling",
        "body": "<p>Sampling is where you try the base model you trained. Enter a prompt and watch the model extend it one token at a time. Your text stays gray, while its continuation appears in blue. Temperature, top-k, top-p, min-p, and the seed determine how it chooses what comes next. <strong class=\"text-white font-semibold\">Top-k</strong> keeps only the <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">k</code> likeliest tokens in the running. <strong class=\"text-white font-semibold\">Top-p</strong> keeps the smallest set of likeliest tokens whose combined probability reaches <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">p</code>. Notably, none of this changes the checkpoint or the weights; these controls just instruct the model to use the weights in slightly different ways.</p>\n\n<p>Of those controls, this app keeps <strong class=\"text-white font-semibold\">min-p</strong> on by default. The name is a little opaque, but the rule is simple: find the most likely token, take a fraction of its probability, and discard anything below that moving cutoff. When one token sits far ahead of the rest, min-p clears away more of the unlikely alternatives; when the probabilities are closer together, it leaves more of them in the running. That makes it a sensible choice for our small model, although it is not <em class=\"text-[#f1f5f9]\">the</em> standard choice for small models, and another filter may work better with another model or another set of sampling controls.</p>"
    }
]
}
