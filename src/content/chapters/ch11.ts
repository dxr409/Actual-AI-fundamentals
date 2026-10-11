export const ch11 = {
  id: 11,
  sections: [
    {
        "title": "Pre-training data",
        "body": "<p>Time to pick the dataset your model will train on.</p>\n\n<p>The data you choose here is for <strong class=\"text-white font-semibold\">pre-training</strong>: we're creating a <strong class=\"text-white font-semibold\">base model</strong>, one that has learned the general shape of language but hasn't yet been taught to follow instructions, play a specific character, or imitate one person's voice. <span class=\"text-[#38bdf8] font-medium\">The training data chapter</span> explains why the source matters so much; the short version is that pre-training wants enough clean, general text for the model to learn how language works at all.</p>\n\n<p>Pick the data you want to train on. Preview what your model will read, then download the corpus you want — or add your own folder or text file. Once a source is selected, we can begin pre-training.</p>\n\n<p><strong class=\"text-white font-semibold\">TinyStories 2</strong> is already a substantial, coherent corpus for a first run. If you plan to train longer, make sure the model has enough varied text that it is not only cycling through the same small sample. <strong class=\"text-white font-semibold\">Cosmopedia-100k</strong> offers broader subjects and writing styles, but it is not a bigger download than TinyStories 2. More data helps only when it is clean and relevant to what you want the model to learn.</p>"
    },
    {
        "title": "Where these datasets come from",
        "body": "<p>Most of the prepared datasets in this catalog are hosted on <a href=\"#/acknowledgements#hugging-face-datasets-citation\" class=\"text-[#38bdf8] hover:underline\" target=\"_blank\" rel=\"noreferrer\">Hugging Face</a>, a large collection of datasets with source information, licenses, and file previews.</p>\n\n<p>If you find another dataset, you can bring it into the app as a plain-text file or a folder of <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">.txt</code> and <code class=\"px-1.5 py-0.5 rounded bg-[#202026] text-[#38bdf8] font-mono text-[11px] border border-[rgba(255,255,255,0.06)]\">.md</code> files. A word of caution: \"available online\" is not the same as \"good training data.\" Before using a dataset, check the license, provenance, update history, known filters, and whether it contains personal or sensitive material. For this app, I picked a few datasets for you.</p>"
    }
]
}
