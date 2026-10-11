export const ch8 = {
  id: 8,
  sections: [
    {
        "title": "Supervised fine-tuning",
        "body": "<p><span class=\"text-[#38bdf8] font-medium\">Supervised fine-tuning</span> explains why training on demonstrations changes how a model responds. Here, we'll run that training pass and watch the change happen.</p>\n\n<p>Fine-tuning starts from your pre-trained checkpoint and saves its work as a separate SFT checkpoint. The base model stays untouched, so you can compare the two afterward. Just like with pre-training, you can pause and resume the run at any time.</p>"
    },
    {
        "title": "Reading the run",
        "body": "<p>Just like in pre-training, the blue curve is training loss. The orange points are validation loss, measured on conversations held back from training. Both ask the same narrow question: how hard is it for the model to predict the assistant's replies? Falling losses mean those replies are becoming less surprising. If training loss keeps falling while validation loss trends upward across several measurements, the model is fitting the training examples more closely without improving on the held-out ones.</p>\n\n<p>The sample rail shows replies saved along the way. Read it for visible changes in behavior: does the model answer in the assistant turn, stay with the prompt, and stop cleanly? The samples will still be uneven, especially early in the run, but they make the transition easier to see than the loss alone.</p>"
    },
    {
        "title": "Before and after",
        "body": "<p>When the run pauses, <strong class=\"text-white font-semibold\">Before & after</strong> gives the base model and the SFT checkpoint the same prompt with the same sampling settings. That is the cleanest comparison on the page: any difference between the two answers came from fine-tuning.</p>\n\n<p>Look for the behavior you trained, not just smoother prose. The SFT checkpoint should be more likely to answer as an assistant instead of continuing the prompt as ordinary text. It may also improve on tasks represented in the examples, but one good reply is not a broad test of what the model knows.</p>"
    },
    {
        "title": "Direct preference optimization",
        "body": "<p>On this page, we'd like to make use of your unique human taste to improve the model. <span class=\"text-[#38bdf8] font-medium\">Direct preference optimization</span> explains how learning from a chosen and rejected answer works. Here, we'll collect those comparisons, run the training pass, and inspect the result.</p>\n\n<p>DPO starts from your supervised fine-tuning checkpoint and saves a separate DPO checkpoint. The SFT model stays untouched, so you can compare the two afterward. You can pause and resume the run at any time.</p>"
    },
    {
        "title": "Building preference data",
        "body": "<p>The preference ballot asks your SFT checkpoint the same question twice. Sampling includes randomness, so the two attempts can produce different answers. Click the answer you would rather receive, and the app saves one preference pair: the prompt, your chosen answer, and the rejected answer.</p>\n\n<p>If both answers are identical, there is nothing to learn from that comparison, so the pair is not saved. Sample again instead. After each choice, the ballot moves to another prompt.</p>\n\n<p>Four saved pairs are enough to unlock DPO, but that is a minimum for seeing the machinery work, not a substantial preference dataset. More varied judgments give the trainer a clearer signal than repeatedly choosing between nearly identical answers. You do not need to write down a rule for every choice; just apply your judgment as consistently as you can.</p>\n\n<p>This app includes DPO because its goal is to show how language models are built all the way through post-training, not because every small model needs a long preference-tuning campaign. For a model this size, you may not want to spend more than half an hour choosing answers. That is enough time to see the technique work; improving the pre-training or supervised fine-tuning data is usually a better place to spend the next hour.</p>"
    },
    {
        "title": "Reading the run",
        "body": "<p>For the logistic DPO loss used here, the model being trained and its frozen SFT reference start with identical weights. Their chosen-versus-rejected gap is therefore zero, so the loss begins at <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">ln(2)</code>, about <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">0.693</code>. As the loss moves below that line, the trained model is learning to favor your chosen answers over the rejected ones, relative to where the reference started.</p>\n\n<p><strong class=\"text-white font-semibold\">Accuracy</strong> asks how often the model ranks your chosen answer first on preference pairs held back from training; random guessing would average 50%. <strong class=\"text-white font-semibold\">Margin</strong> shows how much farther the trained model has moved toward the chosen answers than the frozen reference. With only a few saved pairs, the held-out set is tiny and these numbers can jump sharply. Read them as evidence that the training step is working, not as a stable measure of answer quality.</p>\n\n<p>Training steps do not ask you for more judgments. Each step reuses a batch of the preference pairs you already saved, so a small set is seen many times. More steps can fit those pairs more closely, but they cannot make four judgments as informative as forty. You can add more preferences after the run and train again; new pairs join the next pass.</p>"
    },
    {
        "title": "Taste test",
        "body": "<p>When the run pauses, <strong class=\"text-white font-semibold\">Taste test</strong> gives the SFT and DPO checkpoints the same prompt with the same sampling settings. Look for the preference you were trying to teach: does the DPO answer resemble the kinds of answers you chose more often than the SFT answer does?</p>\n\n<p>Expect a small and uneven change from a handful of comparisons. A few preferences can move the model, but they do not specify a broad, consistent behavior. You can also continue in <span class=\"text-[#38bdf8] font-medium\">Chat with your model</span>, where you can switch among the base, SFT, and DPO checkpoints you've trained.</p>"
    }
]
}
