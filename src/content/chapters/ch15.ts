export const ch15 = {
  id: 15,
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
    }
]
}
