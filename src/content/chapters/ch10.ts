export const ch10 = {
  id: 10,
  sections: [
    {
        "title": "Base models",
        "body": "<p>Instead of designing the model layout yourself and pre-training a base model from scratch, you could also save yourself some time and import an open-source base model somebody else trained.</p>\n\n<p>On the one hand, if you're in this app to build your own model from scratch, starting with somebody else's work is a little bit like cheating. On the other hand, it's how most fine-tuning happens in the real world. Very few teams pre-train their own models; they take an open <strong class=\"text-white font-semibold\">base model</strong> (one that has already read enough text to write coherent English) and teach it the behavior they want. Importing one here lets you do the same thing: skip the pre-training runs entirely and go straight to fine-tuning on data you actually care about. Pick a model from the catalog to see what it writes on its own, before any fine-tuning. Every entry in this catalog was pre-trained on billions or trillions of tokens, vastly more text than we could ever stream through one Mac.</p>\n\n<p>It's mentioned in the warning dialog above the models, too, but to reiterate: If you import a base model, you are locked out of configuring the model design or running pre-training. Supervised fine-tuning, direct preference optimization, and all the other tools downstream of pre-training still work.</p>"
    },
    {
        "title": "Which one to pick",
        "body": "<p>SmolLM2 135M is the recommended place to start. It already writes fluent English, and keeps every later chapter reasonably fast. Supra 50M is smaller still, with a shorter context that uses much less memory during fine-tuning, though its writing and world knowledge are noticeably weaker. Pick Supra when memory is the hard limit, or when you care more about completing the pipeline than the quality of the final chat. The bigger models write better prose and know more about the world, but every fine-tuning step costs more time and memory. The Qwen2.5 models carry a much larger vocabulary with dedicated tokens for dozens of languages, so pick one of them if your fine-tuning data isn't mostly English. A good rule is to prove your fine-tuning data works on a small model first, then spend the training time on a bigger one.</p>"
    }
]
}
