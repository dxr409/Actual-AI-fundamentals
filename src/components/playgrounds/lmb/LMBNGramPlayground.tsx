import React, { useState, useMemo, useEffect } from 'react'
import {
  RotateCcw,
  Sparkles,
  Dices,
  Code2,
  Copy,
  Check,
  Save,
  Eye,
  Pencil,
  Database,
  BarChart3,
  Grid,
  Shuffle,
} from 'lucide-react'
import { ENABLE_EDITING } from '@/lib/editMode'

// Common existing Kazakh names that form the default training corpus
const COMMON_KAZAKH_NAMES: string[] = [
  'мұрат', 'қаным', 'ақжол', 'тайдар', 'есен', 'бекжан', 'гүлнар', 'имат',
  'құралай', 'айсұлтан', 'дәурен', 'әлі', 'бақыт', 'өмір', 'жансая', 'ерболат',
  'нұрғиса', 'шәмші', 'келді', 'қалдыбай', 'мейіржан', 'төлеген', 'асыл',
  'әлімдар', 'бексұлтан', 'шарафат', 'толғанай', 'болат', 'қазы', 'серікбол',
  'амангелді', 'сағидолла', 'жарасбек', 'еркін', 'ғали', 'бауыржан', 'нұрлан',
  'мақсат', 'әділхан', 'күләш', 'рақымжан', 'темір', 'сәрсен', 'қалиман',
  'мұхтар', 'алмасбек', 'ораз', 'кәмшат', 'бердібек', 'шұғыла', 'зейнеп',
  'жұма', 'жақсылық', 'дархан', 'анарбек', 'келдібек', 'жұлдыз', 'нартай', 'қанатбек',
]

// Exact 50 generated Kazakh bi-gram names from the model
const GENERATED_KAZAKH_BIGRAM_NAMES: string[] = [
  'мұратқаным.',
  'ақжолтайдар.',
  'есенбекжан.',
  'гүлнаримат.',
  'құралайбек.',
  'айсұлтанғай.',
  'дәуренәлі.',
  'бақытөмір.',
  'жансаягүл.',
  'ерболатхан.',
  'нұрғисамат.',
  'шәмшікелді.',
  'қалдыбай.',
  'мейіржанұл.',
  'төлегенбай.',
  'асылмұрат.',
  'әлімдархан.',
  'бексұлтанәлі.',
  'шарафатдин.',
  'толғанайша.',
  'болатқазы.',
  'серікболсын.',
  'амангелдік.',
  'сағидолла.',
  'жарасбекхан.',
  'еркінғали.',
  'бауыржанды.',
  'нұрланбек.',
  'мақсатқали.',
  'әділханбай.',
  'күләшәтім.',
  'рақымжанай.',
  'темірболат.',
  'сәрсенғали.',
  'қалиманай.',
  'мұхтархан.',
  'алмасбекұл.',
  'оразғали.',
  'кәмшаткүл.',
  'бердібекжан.',
  'шұғыламан.',
  'зейнепгүл.',
  'жұмағали.',
  'жақсылықбай.',
  'дарханәлі.',
  'анарбекзат.',
  'келдібекхан.',
  'жұлдызайдар.',
  'нартайғали.',
  'қанатбекұл.',
]

// 42 Kazakh Cyrillic alphabet letters
const KAZAKH_42_LETTERS: string[] = [
  'а', 'ә', 'б', 'в', 'г', 'ғ', 'д', 'е', 'ё', 'ж',
  'з', 'и', 'й', 'к', 'қ', 'л', 'м', 'н', 'ң', 'о',
  'ө', 'п', 'р', 'с', 'т', 'у', 'ұ', 'ү', 'ф', 'х',
  'һ', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'і', 'ь', 'э',
  'ю', 'я',
]

interface StepBuilderData {
  step1Text: string
  step1Code: string
  step1DatasetRaw: string
  step2Text: string
  step2Code: string
  step3Text: string
  step3Code: string
  step4Text: string
  step4Code: string
  step4GeneratedRaw: string
}

const STORAGE_KEY = 'qairu-mlp-steps-v2'

export const SAVED_MLP_STEP_DATA: StepBuilderData = {
  "step1Text": "Step 1: Load the Kazakh names dataset and inspect the raw list of names, total count, and shortest/longest lengths.",
  "step1Code": "import math\nimport numpy as np\nimport torch\n\nDATASET_PATH = \"/kazakh_names.txt\"\n\ndef get_dataset():\n  with open(DATASET_PATH, 'r') as f:\n      rows = [row.strip() for row in f.readlines()]\n  return rows\n\nwords = get_dataset()\nwords[1:50]",
  "step1DatasetRaw": "абай\nабайділдан\nабақан\nаббас\nабдан\nабдол\nабдолла\nабзал\nабира\nаблақ\nабыз\nабылай\nабылғазы\nағабек\nағайша\nағамалы\nағәділ\nағеділ\nағзам\nағила\nағипа\nағлия\nағыбай\nағыман\nағын\nада\nадай\nадайхан\nадам\nадамбай\nадамбек\nадлия\nадырбай\nажар\nажарбек\nажаргүл\nажархан\nаза\nазалия\nазамат\nазаматша\nазат\nазатгүл\nазатия\nазимат\nазиха\nазия\nаида\nайәділ\nайәділ\nайәсем\nайбақан\nайбала\nайбанат\nайбану\nайбар\nайбарша\nайбаршын\nайбас\nайбат\nайбәдер\nайбәтес\nайбейнеш\nайбек\nайберген\nайберді\nайбибі\nайбике\nайбол\nайболат\nайбын\nайгенже\nайголқын\nайгүл\nайғабыл\nайғайша\nайғали\nайғанша\nайғаным\nайғаныс\nайғыз\nайдай\nайдан\nайдана\nайдар\nайдара\nайдаралы\nайдарбек\nайдарғали\nайдария\nайдархан\nайдәния\nайдос\nайдын\nайдынбек\nайжайна\nайжақсым\nайжамал\nайжан\nайжанар\nайжания\nайжарқын\nайжарық\nайжас\nайжігіт\nайжүніс\nайжұлдыз\nайза\nайзада\nайзар\nайзара\nайзат\nайзейне\nайзере\nайзиба\nайзия\nайкелбет\nайкен\nайкүміс\nайкүн\nайқын\nаймағамбет\nаймаған\nаймақ\nайман\nайманай\nаймангүл\nайманкүл\nаймат\nаймауыт\nаймаш\nаймәрия\nаймира\nаймұқамбет\nаймұрат\nаймырза\nайна\nайнабек\nайнагүл\nайназия\nайнакүл\nайнақан\nайнаш\nайнаша\nайнет\nайниса\nайнұр\nайнұра\nайнұрия\nайпар\nайпара\nайрат\nайрықша\nайса\nайсара\nайсары\nайсауыт\nайсауыт\nайсәуле\nайсипат\nайсүгір\nайсүгір\nайсұлу\nайт\nайтаза\nайтақ\nайтақын\nайтан\nайтания\nайтас\nайтәлі\nайтбай\nайтбала\nайтдана\nайтемір\nайтжамал\nайтжан\nайтілеу\nайтқали\nайтқожа\nайтқожан\nайтқұл\nайтмағамбет\nайтмұкамбет\nайтмұқамбет\nайтолды\nайтолыс\nайту\nайтуар\nайтуған\nайтық\nайтым\nайша\nайшагүл\nайшайым\nайшахан\nайшолпан\nайшуақ\nайшық\nайшым\nайшынбай\nайым\nайымбет\nайымбибі\nайымбике\nайымгүл\nайымжан\nайымша\nакұштап\nакылбек\nақабай\nақай\nақайша\nақалтын\nақан\nақару\nақбай\nақбала\nақбау\nақбаян\nақбәтес\nақбәтима\nақберген\nақберді\nақбет\nақбибі\nақбике\nақбілек\nақболат\nақбота\nақбөкен\nақгүл\nақділда\nақеділ\nақерке\nақжамал\nақжан\nақжарқын\nақжелек\nақжеміс\nақжібек\nақжігіт\nақжол\nақжүніс\nақжүрек\nақжұпар\nақзейнеп\nақзейнет\nақзер\nақзиба\nақзила\nақзия\nақкенже\nақкүміс\nаққағаз\nаққал\nаққатша\nаққожа\nаққозы\nаққошқар\nаққу\nаққұба\nаққыз\nақлима\nақмағамбет\nақмамбет\nақмарал\nақмаржан\nақмарқа\nақмұқамбет\nақнәзия\nақнәзік\nақниет\nақния\nақпанбет\nақсазан\nақсана\nақсаң\nақселеу\nақсұлтан\nақсұлу\nақсыйық\nақтай\nақтайлақ\nақтал\nақтамақ\nақтан\nақтаң\nақтілек\nақтілек\nақтоқты\nақтолқын\nақтолық\nақтолыс\nақша\nақшабақ\nақшолас\nақшолпан\nақшора\nақшыбық\nақық\nақылбай\nақылбек\nақылима\nақын\nақынәлі\nақынжан\nақырап\nақыш\nалай\nалапа\nалатау\nалау\nалбан\nалбат\nалға\nалғазы\nалғатай\nалғыр\nалғыр\nалдаберген\nалдадос\nалдамжар\nалдамұрат\nалдан\nалдар\nалдаш\nалжанбай\nалина\nалқа\nалқагүл\nалла\nалма\nалмабай\nалмабек\nалмабике\nалмагүл\nалмажан\nалмазия\nалманияз\nалмас\nалмасбай\nалмасбек\nалмаскүл\nалмасқан\nалмаша\nалмұрт\nалпамыс\nалпан\nалпар\nалпыс\nалпысбай\nалтай\nалтайбай\nалтайбек\nалтыбай\nалтын\nалтынай\nалтынбай\nалтынбек\nалтынбике\nалтынгүл\nалтынзер\nалтынсары\nалтыншаш\nалуа\nалша\nалшағыр\nалшан\nалшынбай\nалыбай\nальбина\nаман\nаманай\nаманат\nаманәлі\nаманбай\nаманбала\nаманбек\nаманболат\nамангелді\nамангүл\nаманғали\nамандос\nамандық\nаманжан\nаманжол\nамания\nаманкеш\nаманқос\nамантай\nамантұр\nаманша\nаманшы\nамрэта\nанай\nанар\nанара\nанарбай\nанарбек\nанаргүл\nанаржан\nанархан\nанас\nанасбек\nанасия\nандас\nанжела\nаниса\nанна\nануза\nанфиса\nаңдамас\nаңсаған\nаңсар\nаппақ\nарабай\nарагония\nарай\nарайша\nаралбай\nарбек\nарбол\nарғын\nарғынбай\nарда\nардақ\nардан\nардат\nарзада\nарзейне\nарзиба\nарзия\nарзу\nарзымбет\nарина\nарқабай\nарқалық\nарқат\nарман\nарман\nармат\nарна\nарнагүл\nартық\nару\nарубике\nаруша\nаршагүл\nаршат\nарық\nарықбай\nарықтай\nарын\nарынгүл\nарындық\nарыс\nарысбай\nарыстан\nарыстанбай\nарыстанбек\nарыстанғали\nасабай\nасайын\nасан\nасаналы\nасанәлі\nасанбай\nасанбек\nасанғали\nасанхан\nасия\nасқар\nасқарбай\nасқарбек\nасли\nаслима\nаслия\nаспазия\nаспара\nастам\nастасия\nасфандияр\nасхат\nасықбай\nасыл\nасылай\nасылбай\nасылбек\nасылбике\nасылгүл\nасылғожа\nасылжан\nасылзада\nасылима\nасылмұрат\nасылтаң\nасылтас\nасылхан\nасылша\nатабай\nатабек\nатай\nатақан\nаталық\nатамбек\nатамқұл\nатамұрат\nатанбай\nатанияз\nатантай\nатас\nатшабар\nатығай\nатым\nатымтай\nауғанбай\nаухади\nахат\nахим\nахмеди\nахмет\nахметәлі\nахметбай\nахметбек\nахметжан\nахметияр\nахметқали\nахметолла\nахметсапа\nахметхан\nахметші\nахтамберді\nашай\nашамбай\nаэлита",
  "step2Text": "Step 2: Count adjacent character pairs (bigrams) across all names and normalize each row into a probability distribution.",
  "step2Code": "SPECIAL_TOKEN = \".\"\nb = {}\nfor w in words[1:]:\n  all_chars = SPECIAL_TOKEN + w + SPECIAL_TOKEN\n  for c1, c2 in zip(all_chars, all_chars[1:]):\n    current_bigram = (c1, c2)\n    b[current_bigram] = b.get(current_bigram, 0) + 1\nb[('а','й')]\nb[('а','н')]\nb[('а','қ')]\nb[('а','р')]\nb[('а','л')]\nb[('а','.')]",
  "step3Text": "Step 3: Build the lookup tables stoi (string-to-integer) and itos (integer-to-string) for the 42 Kazakh letters (plus \".\" boundary token at index 0).",
  "step3Code": "stoi = {s: i for i, s in enumerate(all_characters)}\nitos = {i: s for s, i in stoi.items()}\n\nprint(f\"{stoi=}\")\nprint(f\"{itos=}\")",
  "step4Text": "Step 4: Use a seeded random generator to sample character-by-character from the probability distribution until hitting the \".\" end token.",
  "step4Code": "def generate_names(count_probs, g):\n    curr_idx = 0 #set initial index at zero\n    name = [] #create an empty list for names\n    while True:\n        next_charac_ix = torch.multinomial(count_probs[curr_idx], num_samples=1, replacement=True, generator=g).item() #to find next character after the first one,\n        name.append(itos[next_charac_ix])\n        if next_charac_ix == 0: # if the index sampled is the end token, we are done with the name generation\n            break\n        # set current idx to this new one\n        curr_idx = next_charac_ix\n\n    return ''.join(name)\n\n\ng = torch.Generator().manual_seed(3247483648)\n\nfor i in range(50):\n    name = generate_names(count_probs, g)\n    print(name)",
  "step4GeneratedRaw": "қықымәшегүлелғат.\nалтайызәлдамателадырбай.\nен.\nөрайбелкиен.\nсбалия.\nмбекүлиатор.\nмафай.\nбекүнбакүнайдәк.\nбер.\nтананай.\nбаныс.\nдихам.\nелтөрзасмұманбелл.\nипанұлик.\nба.\nматболірхараметарсәуы.\nдия.\nибекнт.\nгүлсбал.\nанам.\nекениде.\nшам.\nмекөлдәдырғарасұраз.\nшемба.\nгүлайжатұр.\nтарбосқта.\nна.\nқилия.\nәшәс.\nәт.\nнбожұрын.\nәуі.\nнасенұлғанғайсти.\nзақаға.\nнүләлдышайрки."
}

const DEFAULT_STEP_DATA: StepBuilderData = SAVED_MLP_STEP_DATA

export function KazakhMLPGeneratorSteps() {
  const [data, setData] = useState<StepBuilderData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...DEFAULT_STEP_DATA, ...JSON.parse(saved) }
      }
    } catch {}
    return DEFAULT_STEP_DATA
  })

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [savedBadge, setSavedBadge] = useState<boolean>(false)
  const [copiedType, setCopiedType] = useState<'json' | 'chapter' | null>(null)
  const [selectedCharForBigram, setSelectedCharForBigram] = useState<string>('а')
  const [selectedLetterIdx, setSelectedLetterIdx] = useState<number>(1)
  // Step 4 output is EMPTY by default until user presses Generate!
  const [step4RevealedCount, setStep4RevealedCount] = useState<number>(0)

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data])

  const updateField = <K extends keyof StepBuilderData>(key: K, val: StepBuilderData[K]) => {
    setData((prev) => ({ ...prev, [key]: val }))
  }

  const handleSaveExplicit = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSavedBadge(true)
      setTimeout(() => setSavedBadge(false), 2000)
    } catch {}
  }

  const handleCopyForChapterFile = () => {
    const exportSnippet = `// Copy-paste into src/components/playgrounds/lmb/LMBNGramPlayground.tsx (DEFAULT_STEP_DATA) or chapter file:
export const SAVED_MLP_STEP_DATA = ${JSON.stringify(data, null, 2)};`
    navigator.clipboard.writeText(exportSnippet)
    setCopiedType('chapter')
    setTimeout(() => setCopiedType(null), 2500)
  }

  // Parse Step 1 dataset names
  const datasetNames = useMemo(() => {
    return data.step1DatasetRaw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [data.step1DatasetRaw])

  // Parse Step 4 generated names
  const step4Names = useMemo(() => {
    return data.step4GeneratedRaw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
  }, [data.step4GeneratedRaw])

  // Compute Step 2 bigram probabilities from Step 1 dataset
  const step2BigramStats = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    const pairCounts: { pair: string; c1: string; c2: string; count: number }[] = []
    const flatMap: Record<string, number> = {}

    for (const w of datasetNames) {
      const chs = ['.', ...Array.from(w.replace(/\.$/, '')), '.']
      for (let i = 0; i < chs.length - 1; i++) {
        const c1 = chs[i]
        const c2 = chs[i + 1]
        if (!map[c1]) map[c1] = {}
        map[c1][c2] = (map[c1][c2] || 0) + 1
        const key = `${c1} → ${c2}`
        flatMap[key] = (flatMap[key] || 0) + 1
      }
    }

    Object.entries(flatMap).forEach(([pair, count]) => {
      const [c1, c2] = pair.split(' → ')
      pairCounts.push({ pair, c1, c2, count })
    })
    pairCounts.sort((a, b) => b.count - a.count)

    return { map, topPairs: pairCounts.slice(0, 14) }
  }, [datasetNames])

  const rowDist = useMemo(() => {
    const row = step2BigramStats.map[selectedCharForBigram] || {}
    const total = Object.values(row).reduce((a, b) => a + b, 0)
    return Object.entries(row)
      .map(([nextCh, count]) => ({
        nextCh,
        count,
        prob: total > 0 ? count / total : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [step2BigramStats, selectedCharForBigram])

  // 42 Kazakh letters + '.' at index 0
  const stoiList = useMemo(() => {
    return [
      { idx: 0, ch: '.' },
      ...KAZAKH_42_LETTERS.map((ch, i) => ({ idx: i + 1, ch })),
    ]
  }, [])

  const activeMapping = stoiList[selectedLetterIdx] || stoiList[1]

  return (
    <div className="my-8 rounded-2xl border border-[#f6e9c7]/30 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-2xl">
      {/* Top Builder Header with Edit / Save / Copy-for-Chapter Controls */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Start-to-End Kazakh Name Generator Pipeline (Steps 1 – 4)
          </span>
        </div>

        {ENABLE_EDITING && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isEditing
                  ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7]'
                  : 'bg-[#22211d] text-[#f6e9c7] border-[#f6e9c7]/35 hover:bg-[#f6e9c7]/15'
              }`}
            >
              {isEditing ? <Eye size={13} /> : <Pencil size={13} />}
              <span>{isEditing ? 'Preview Mode' : 'Edit Texts, Code & Lists'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveExplicit}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22211d] text-[#fdfbf7] border border-white/10 hover:border-[#f6e9c7]/50 flex items-center gap-1.5 cursor-pointer"
            >
              {savedBadge ? <Check size={13} className="text-[#10b981]" /> : <Save size={13} />}
              <span>{savedBadge ? 'Saved!' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyForChapterFile}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 hover:bg-[#10b981]/25 flex items-center gap-1.5 cursor-pointer"
              title="Copy TypeScript data block to paste into lmbPart1Foundations.ts or LMBNGramPlayground.tsx"
            >
              {copiedType === 'chapter' ? <Check size={13} /> : <Copy size={13} />}
              <span>
                {copiedType === 'chapter' ? 'Copied for ch... file!' : 'Copy for ch... File'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* ── STEP 1: LOADING OF DATASET CODE + SMALL SLIDABLE WINDOW OF NAMES ── */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#f6e9c7] text-[#1a1813] font-mono text-[11px] font-bold">
                STEP 1
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Database size={14} className="text-[#f6e9c7]" />
                <span>Loading the Dataset</span>
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#a8a29e]">
              {datasetNames.length} names loaded
            </span>
          </div>

          {/* Step 1 Text Explanation */}
          {isEditing ? (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#f6e9c7] block mb-1">
                Step 1 Text / Explanation:
              </label>
              <textarea
                value={data.step1Text}
                onChange={(e) => updateField('step1Text', e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7] focus:outline-none"
              />
            </div>
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step1Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Step 1 Code Cell */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#a8a29e]">
                <span className="flex items-center gap-1.5 text-[#f6e9c7]">
                  <Code2 size={12} /> Python · Dataset Loader Cell
                </span>
                {ENABLE_EDITING && <span>{isEditing ? 'Editable' : 'Read-only'}</span>}
              </div>
              <textarea
                value={data.step1Code}
                onChange={(e) => updateField('step1Code', e.target.value)}
                readOnly={!isEditing}
                rows={5}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none focus:border-[#f6e9c7]/50 resize-y"
              />
            </div>

            {/* Step 1 Visualization: Small Slidable Window of Names */}
            <div className="lg:col-span-5 p-3 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                  Slidable Dataset Window
                </span>
                <span className="text-[10px] font-mono text-[#a8a29e]">
                  min:{' '}
                  {datasetNames.length
                    ? Math.min(...datasetNames.map((n) => Array.from(n).length))
                    : 0}{' '}
                  · max:{' '}
                  {datasetNames.length
                    ? Math.max(...datasetNames.map((n) => Array.from(n).length))
                    : 0}{' '}
                  chars
                </span>
              </div>

              {isEditing ? (
                <div>
                  <label className="text-[10px] font-mono text-[#10b981] block mb-1">
                    Paste / edit your dataset names (one per line or comma-separated):
                  </label>
                  <textarea
                    value={data.step1DatasetRaw}
                    onChange={(e) => updateField('step1DatasetRaw', e.target.value)}
                    rows={5}
                    className="w-full rounded-lg bg-[#18181c] border border-[#10b981]/40 p-2 font-mono text-xs text-white focus:outline-none"
                  />
                </div>
              ) : (
                <div className="h-32 overflow-y-auto pr-1 space-y-1 rounded-lg bg-[#0b0b0d] p-2 border border-white/5 font-mono text-xs">
                  {datasetNames.map((name, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1 rounded bg-[#16161a] border border-white/5 text-[#fdfbf7]"
                    >
                      <span>{name}</span>
                      <span className="text-[10px] text-[#71717a]">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STEP 2: PROBABILITY DISTRIBUTION OF BIGRAMS ── */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#f6e9c7] text-[#1a1813] font-mono text-[11px] font-bold">
                STEP 2
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart3 size={14} className="text-[#f6e9c7]" />
                <span>Probability Distribution of Bigrams</span>
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#a8a29e]">
              P(next | current)
            </span>
          </div>

          {isEditing ? (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#f6e9c7] block mb-1">
                Step 2 Text / Explanation:
              </label>
              <textarea
                value={data.step2Text}
                onChange={(e) => updateField('step2Text', e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7] focus:outline-none"
              />
            </div>
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step2Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Step 2 Code Cell */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#a8a29e]">
                <span className="flex items-center gap-1.5 text-[#f6e9c7]">
                  <Code2 size={12} /> Python · Bigram Probability Distribution Cell
                </span>
                {ENABLE_EDITING && <span>{isEditing ? 'Editable' : 'Read-only'}</span>}
              </div>
              <textarea
                value={data.step2Code}
                onChange={(e) => updateField('step2Code', e.target.value)}
                readOnly={!isEditing}
                rows={6}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none focus:border-[#f6e9c7]/50 resize-y"
              />
            </div>

            {/* Step 2 Visualization: Top Bigrams & Conditional Probability Bars */}
            <div className="lg:col-span-6 p-3 rounded-xl bg-[#111113] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                  Top Bigrams (Click to inspect row distribution)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {step2BigramStats.topPairs.map((item) => (
                  <button
                    key={item.pair}
                    type="button"
                    onClick={() => setSelectedCharForBigram(item.c1)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer transition-all ${
                      selectedCharForBigram === item.c1
                        ? 'bg-[#f6e9c7] text-[#1a1813] border-[#f6e9c7] font-bold'
                        : 'bg-[#18181c] text-[#d6d3d1] border-white/10 hover:border-white/30'
                    }`}
                  >
                    ({item.pair}) : {item.count}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="text-[10px] font-mono text-[#a8a29e] flex justify-between">
                  <span>Row Probability Distribution for "{selectedCharForBigram}"</span>
                  <span className="text-[#10b981]">Normalized (%)</span>
                </div>
                {rowDist.map((r, i) => (
                  <div key={r.nextCh} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-16 text-[#f6e9c7]">
                      "{selectedCharForBigram}"→"{r.nextCh}"
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[#1a1a20] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(4, r.prob * 100)}%`,
                          backgroundColor: i === 0 ? '#10b981' : '#f6e9c7',
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-[#fdfbf7]">
                      {Math.round(r.prob * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 3: I-TO-S & S-TO-I REPRESENTATION OF 42 LETTERS ── */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#f6e9c7] text-[#1a1813] font-mono text-[11px] font-bold">
                STEP 3
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Grid size={14} className="text-[#f6e9c7]" />
                <span>itos & stoi Representation of 42 Kazakh Letters</span>
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#f6e9c7]">
              stoi['{activeMapping.ch}'] = {activeMapping.idx} ↔ itos[{activeMapping.idx}] = '
              {activeMapping.ch}'
            </span>
          </div>

          {isEditing ? (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#f6e9c7] block mb-1">
                Step 3 Text / Explanation:
              </label>
              <textarea
                value={data.step3Text}
                onChange={(e) => updateField('step3Text', e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7] focus:outline-none"
              />
            </div>
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step3Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Step 3 Code Cell */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#a8a29e]">
                <span className="flex items-center gap-1.5 text-[#f6e9c7]">
                  <Code2 size={12} /> Python · stoi & itos Mapping Cell
                </span>
                {ENABLE_EDITING && <span>{isEditing ? 'Editable' : 'Read-only'}</span>}
              </div>
              <textarea
                value={data.step3Code}
                onChange={(e) => updateField('step3Code', e.target.value)}
                readOnly={!isEditing}
                rows={6}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none focus:border-[#f6e9c7]/50 resize-y"
              />
            </div>

            {/* Step 3 Visualization: 42 Kazakh Letters + '.' Lookup Grid */}
            <div className="lg:col-span-7 p-3 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                  42 Kazakh Letters + "." Boundary (Click any cell)
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30">
                  stoi['{activeMapping.ch}'] → {activeMapping.idx} | itos[{activeMapping.idx}] → '
                  {activeMapping.ch}'
                </span>
              </div>

              <div className="grid grid-cols-9 sm:grid-cols-11 gap-1 font-mono">
                {stoiList.map((item) => {
                  const active = item.idx === selectedLetterIdx
                  return (
                    <button
                      key={item.idx}
                      type="button"
                      onClick={() => setSelectedLetterIdx(item.idx)}
                      className={`p-1 rounded border text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#f6e9c7] text-[#1a1813] border-white font-bold scale-105'
                          : item.idx === 0
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                          : 'bg-[#18181c] text-[#e5e5ea] border-white/5 hover:border-[#f6e9c7]/40'
                      }`}
                    >
                      <div className="text-xs font-bold leading-none">{item.ch}</div>
                      <div
                        className={`text-[9px] mt-0.5 ${
                          active ? 'text-[#1a1813]' : 'text-[#8e8e93]'
                        }`}
                      >
                        {item.idx}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 4: RANDOMIZER TO GENERATE RANDOM LIST OF NAMES (EMPTY BY DEFAULT UNTIL BUTTON PRESSED) ── */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#f6e9c7] text-[#1a1813] font-mono text-[11px] font-bold">
                STEP 4
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shuffle size={14} className="text-[#f6e9c7]" />
                <span>Randomizer & Name Generation Loop</span>
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#a8a29e]">
              torch.Generator().manual_seed(...)
            </span>
          </div>

          {isEditing ? (
            <div>
              <label className="text-[10px] font-mono uppercase text-[#f6e9c7] block mb-1">
                Step 4 Text / Explanation:
              </label>
              <textarea
                value={data.step4Text}
                onChange={(e) => updateField('step4Text', e.target.value)}
                rows={2}
                className="w-full rounded-lg bg-[#111113] border border-[#f6e9c7]/30 p-2.5 text-xs text-[#fdfbf7] focus:outline-none"
              />
            </div>
          ) : (
            <p className="text-xs text-[#d6d3d1] leading-relaxed">{data.step4Text}</p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Step 4 Code Cell */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-[#111113] border border-b-0 border-white/10 text-[10px] font-mono text-[#a8a29e]">
                <span className="flex items-center gap-1.5 text-[#f6e9c7]">
                  <Code2 size={12} /> Python · Randomizer Sampling Cell
                </span>
                {ENABLE_EDITING && <span>{isEditing ? 'Editable' : 'Read-only'}</span>}
              </div>
              <textarea
                value={data.step4Code}
                onChange={(e) => updateField('step4Code', e.target.value)}
                readOnly={!isEditing}
                rows={8}
                spellCheck={false}
                className="w-full flex-1 rounded-b-lg bg-[#0c0c0e] border border-white/10 p-3 font-mono text-xs text-[#f6e9c7] focus:outline-none focus:border-[#f6e9c7]/50 resize-y"
              />
            </div>

            {/* Step 4 Visualization: Empty by default, generates on button click! */}
            <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111113] border border-white/10 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7]">
                  Generated Output ({step4RevealedCount} / {step4Names.length})
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStep4RevealedCount(step4Names.length)}
                    className="px-3 py-1.5 rounded-lg bg-[#f6e9c7] text-[#1a1813] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdfbf7] transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Generate Names</span>
                  </button>
                  {step4RevealedCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep4RevealedCount(0)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1c1c20] text-[#a8a29e] hover:text-white text-xs border border-white/10 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div>
                  <label className="text-[10px] font-mono text-[#10b981] block mb-1">
                    Paste / edit your custom generated names list (one per line):
                  </label>
                  <textarea
                    value={data.step4GeneratedRaw}
                    onChange={(e) => updateField('step4GeneratedRaw', e.target.value)}
                    rows={7}
                    className="w-full rounded-lg bg-[#18181c] border border-[#10b981]/40 p-2 font-mono text-xs text-white focus:outline-none"
                  />
                </div>
              ) : step4RevealedCount === 0 ? (
                <div className="h-44 rounded-lg bg-[#0b0b0d] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-[#8e8e93] font-mono mb-2">
                    Output is empty. Press &ldquo;Generate Names&rdquo; above to run the randomizer!
                  </p>
                </div>
              ) : (
                <div className="h-44 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5 rounded-lg bg-[#0b0b0d] p-2.5 border border-white/5 font-mono text-xs">
                  {step4Names.slice(0, step4RevealedCount).map((name, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded bg-[#16161a] border border-white/5 text-[#10b981] flex items-center justify-between"
                    >
                      <span className="truncate">{name}</span>
                      <span className="text-[9px] text-[#71717a] ml-1">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NGramCountTrainer() {
  const [selectedChar, setSelectedChar] = useState<string>('а')
  // Empty by default! Generates for the first time when the user presses the button.
  const [generatedCount, setGeneratedCount] = useState<number>(0)
  const [inspectedGenerated, setInspectedGenerated] = useState<string>(
    GENERATED_KAZAKH_BIGRAM_NAMES[0]
  )

  // Build character bi-gram lookup table over the training names + generated list
  const bigramStats = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    const allWords = [
      ...COMMON_KAZAKH_NAMES.map((w) => `${w}.`),
      ...GENERATED_KAZAKH_BIGRAM_NAMES,
    ]
    for (const word of allWords) {
      const chars = Array.from(word)
      for (let i = 0; i < chars.length - 1; i++) {
        const curr = chars[i]
        const next = chars[i + 1]
        if (!map[curr]) map[curr] = {}
        map[curr][next] = (map[curr][next] || 0) + 1
      }
    }
    return map
  }, [])

  const availableChars = useMemo(() => {
    return Object.entries(bigramStats)
      .map(([ch, nexts]) => ({
        ch,
        total: Object.values(nexts).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total)
  }, [bigramStats])

  const activeChar = bigramStats[selectedChar]
    ? selectedChar
    : availableChars[0]?.ch || 'а'
  const activeCounts = bigramStats[activeChar] || {}
  const totalOccurrences = Object.values(activeCounts).reduce((a, b) => a + b, 0)

  const sortedPredictions = useMemo(() => {
    return Object.entries(activeCounts)
      .map(([nextCh, count]) => ({
        nextCh,
        count,
        prob: totalOccurrences > 0 ? count / totalOccurrences : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7)
  }, [activeCounts, totalOccurrences])

  const inspectedChars = Array.from(inspectedGenerated)

  return (
    <div className="space-y-8">
      <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
              Interactive · Kazakh Bi-Gram Names Generator (2-Gram Lookup)
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#f6e9c7] text-[#1a1813] font-bold">
            Kazakh Names Corpus
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* 1. Common Existing Kazakh Names (Training Corpus) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a29e]">
                1. Training Corpus (Common Existing Kazakh Names) — Click any name to inspect its bi-grams
              </label>
              <span className="text-[11px] font-mono text-[#a8a29e]">
                {COMMON_KAZAKH_NAMES.length} base names · {availableChars.length} unique characters
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0f0f11] border border-white/5 flex flex-wrap gap-1.5 items-center max-h-32 overflow-y-auto">
              {COMMON_KAZAKH_NAMES.map((name, i) => {
                const containsActive = name.includes(activeChar)
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const firstCh = Array.from(name)[0]
                      if (firstCh) setSelectedChar(firstCh)
                    }}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      containsActive
                        ? 'bg-[#f6e9c7]/20 text-[#f6e9c7] border border-[#f6e9c7]/40 font-semibold'
                        : 'bg-[#1c1b18] text-[#a8a29e] hover:text-white border border-transparent'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Bi-Gram Lookup Inspector + 3. Generated 50 Kazakh Bi-Gram Names */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 5 Cols: Character Bi-Gram Transition Probabilities */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[#1b1a17] border border-white/10 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a29e] mb-2">
                  2. Pick Current Letter (1-Char Context)
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {availableChars.slice(0, 18).map(({ ch, total }) => {
                    const active = ch === activeChar
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setSelectedChar(ch)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f6e9c7] text-[#1a1813] font-bold shadow-xs'
                            : 'bg-[#141416] text-[#d6d3d1] hover:bg-[#262420] border border-white/10'
                        }`}
                      >
                        <span>"{ch}"</span>
                        <span
                          className={`text-[9px] px-1 rounded ${
                            active ? 'bg-[#1a1813]/20 text-[#1a1813]' : 'bg-white/5 text-[#a8a29e]'
                          }`}
                        >
                          ×{total}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a8a29e]">
                    Next Letter Odds P(next | "{activeChar}")
                  </span>
                  <span className="text-[11px] font-mono text-[#f6e9c7]">
                    {totalOccurrences} transitions
                  </span>
                </div>

                <div className="space-y-2">
                  {sortedPredictions.map((item, idx) => (
                    <div key={item.nextCh} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-bold">
                            "{activeChar}" → "{item.nextCh}"
                          </span>
                        </span>
                        <span className="text-[#fdfbf7]">
                          {item.count}/{totalOccurrences} (
                          <strong className="text-[#f6e9c7]">{Math.round(item.prob * 100)}%</strong>)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#121214] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(5, item.prob * 100)}%`,
                            backgroundColor: idx === 0 ? '#10b981' : '#f6e9c7',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Generated Name Bi-Gram Chain Breakdown */}
              <div className="p-3 rounded-xl bg-[#141416] border border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#a8a29e] mb-1.5">
                  Bi-Gram Chain for "{inspectedGenerated}"
                </div>
                <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                  {inspectedChars.slice(0, -1).map((ch, idx) => (
                    <span
                      key={idx}
                      onClick={() => setSelectedChar(ch)}
                      className="px-1.5 py-0.5 rounded bg-[#22211d] text-[#f6e9c7] border border-[#f6e9c7]/25 cursor-pointer hover:border-[#f6e9c7]"
                      title="Click to inspect transition"
                    >
                      {ch}→{inspectedChars[idx + 1]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Generated Kazakh Bi-Gram Names Output List (EMPTY BY DEFAULT) */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-[#1b1a17] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#f6e9c7] block">
                      3. Generated Kazakh Bi-Gram Names ({generatedCount} / 50)
                    </span>
                    <span className="text-[11px] text-[#a8a29e]">
                      Press the button to generate new Kazakh names from the bi-gram table
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setGeneratedCount((c) =>
                          c === 0
                            ? GENERATED_KAZAKH_BIGRAM_NAMES.length
                            : c >= GENERATED_KAZAKH_BIGRAM_NAMES.length
                            ? 10
                            : Math.min(GENERATED_KAZAKH_BIGRAM_NAMES.length, c + 10)
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-[#f6e9c7] text-[#1a1813] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdfbf7] transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} />
                      <span>
                        {generatedCount === 0
                          ? 'Generate Kazakh Names'
                          : generatedCount >= GENERATED_KAZAKH_BIGRAM_NAMES.length
                          ? 'Generate 10'
                          : '+10 Names'}
                      </span>
                    </button>
                    {generatedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setGeneratedCount(0)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#25231e] text-[#a8a29e] hover:text-white border border-white/10 text-xs font-mono cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Output Box: Empty until user clicks "Generate Kazakh Names" */}
                {generatedCount === 0 ? (
                  <div className="p-8 rounded-xl bg-[#0f0f11] border border-dashed border-white/10 flex flex-col items-center justify-center text-center min-h-[240px]">
                    <Sparkles size={22} className="text-[#f6e9c7]/60 mb-2" />
                    <p className="text-xs font-mono text-[#a8a29e] mb-3">
                      Generated names list is empty. Click the button to generate names for the first time!
                    </p>
                    <button
                      type="button"
                      onClick={() => setGeneratedCount(GENERATED_KAZAKH_BIGRAM_NAMES.length)}
                      className="px-4 py-2 rounded-xl bg-[#f6e9c7] text-[#1a1813] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdfbf7] transition-all cursor-pointer shadow"
                    >
                      <Sparkles size={14} />
                      <span>Generate 50 Kazakh Bi-Gram Names</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#0f0f11] border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto font-mono text-xs">
                    {GENERATED_KAZAKH_BIGRAM_NAMES.slice(0, generatedCount).map((genName, idx) => {
                      const isSelected = inspectedGenerated === genName
                      return (
                        <button
                          key={genName}
                          type="button"
                          onClick={() => {
                            setInspectedGenerated(genName)
                            const first = Array.from(genName)[0]
                            if (first) setSelectedChar(first)
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50 font-bold'
                              : 'bg-[#18181b] text-[#fdfbf7] hover:bg-[#22211d] border-white/5'
                          }`}
                        >
                          <span className="truncate">{genName}</span>
                          <span className="text-[10px] text-[#71717a] ml-1">#{idx + 1}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-[#a8a29e] flex items-center justify-between">
                <span>
                  Click any generated name above to trace its character-by-character bi-gram transitions on the left.
                </span>
                <span className="font-mono text-[#10b981]">2-gram Markov Chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition line between the first two interactive windows */}
      <p className="my-8 text-base font-semibold leading-relaxed text-[#fdfbf7]">
        Let&apos;s build Kazakh names generator together!
      </p>

      {/* 4-Step Start-to-End MLP / Bi-gram Generator Walkthrough with Editable Text & Code Cells */}
      <KazakhMLPGeneratorSteps />

      {/* Takeaway after finishing all 4 steps */}
      <div className="my-6 p-4 rounded-xl bg-[rgba(246,233,199,0.08)] border-l-4 border-[#f6e9c7] text-sm leading-relaxed text-[#e7e5e4]">
        As you can see, the results are not perfect — the model is still too simple and acts like a robot without memory, only looking at a single character at a time. We will make it much better in the next lesson!
      </div>
    </div>
  )
}

const LOGIT_CANDIDATES = [
  { word: 'sat', rawScore: 2.8 },
  { word: 'ate', rawScore: 1.9 },
  { word: 'saw', rawScore: 1.3 },
  { word: 'slept', rawScore: 0.7 },
  { word: 'jumped', rawScore: 0.1 },
  { word: 'flew', rawScore: -0.8 },
]

export function NGramTemperatureSampler() {
  const [temperature, setTemperature] = useState(0.8)
  const [, setHistory] = useState<string[]>(['the', 'cat'])
  const [lastPicked, setLastPicked] = useState<string | null>(null)

  const distribution = useMemo(() => {
    const t = Math.max(0.05, temperature)
    const scaled = LOGIT_CANDIDATES.map((c) => c.rawScore / t)
    const maxS = Math.max(...scaled)
    const exps = scaled.map((s) => Math.exp(s - maxS))
    const sum = exps.reduce((a, b) => a + b, 0)
    return LOGIT_CANDIDATES.map((c, i) => ({
      ...c,
      prob: exps[i] / sum,
    }))
  }, [temperature])

  // Entropy in bits for intuition
  const entropy = useMemo(() => {
    return -distribution.reduce((acc, d) => {
      if (d.prob <= 1e-9) return acc
      return acc + d.prob * Math.log2(d.prob)
    }, 0)
  }, [distribution])

  const sampleOnce = () => {
    const r = Math.random()
    let cum = 0
    let chosen = distribution[0].word
    for (const item of distribution) {
      cum += item.prob
      if (r <= cum) {
        chosen = item.word
        break
      }
    }
    setLastPicked(chosen)
    setHistory((prev) =>
      [...prev.slice(-14), chosen, 'on', 'the', 'mat', '.', 'the', 'cat'].slice(0, 14)
    )
  }

  return (
    <div className="my-6 rounded-2xl border border-[#f6e9c7]/25 bg-[#141416] text-[#fdfbf7] overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#1a1916] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f6e9c7]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#f6e9c7]">
            Interactive · Temperature & Sampling loop
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#a8a29e]">
          Context: "the cat ___" · Uncertainty: {entropy.toFixed(2)} bits
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Temperature Slider */}
        <div className="p-4 rounded-xl bg-[#1b1a17] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#fdfbf7]">
              Temperature (
              <span className="font-mono text-[#f6e9c7]">T = {temperature.toFixed(2)}</span>)
            </label>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#25231e] text-[#f6e9c7] border border-[#f6e9c7]/30">
              {temperature <= 0.35
                ? 'Nearly Greedy (Safe & Repetitive)'
                : temperature <= 1.05
                ? 'Balanced (Natural Variety)'
                : 'High Temperature (Flat & Wild)'}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={2.4}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-[#f6e9c7] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#a8a29e] mt-1">
            <span>0.10 (Sharpest peak)</span>
            <span>1.00 (Unscaled odds)</span>
            <span>2.40 (Flattened odds)</span>
          </div>
        </div>

        {/* Candidate Bars */}
        <div className="space-y-2.5">
          {distribution.map((item) => {
            const isPicked = lastPicked === item.word
            return (
              <div
                key={item.word}
                className={`p-2.5 rounded-xl border transition-all ${
                  isPicked
                    ? 'bg-[#10b981]/10 border-[#10b981]/50'
                    : 'bg-[#1b1a17] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#fdfbf7] w-16">"{item.word}"</span>
                    <span className="text-[11px] text-[#a8a29e]">
                      raw score: {item.rawScore >= 0 ? `+${item.rawScore}` : item.rawScore}
                    </span>
                    {isPicked && (
                      <span className="px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] text-[10px] font-bold">
                        SAMPLED!
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#f6e9c7]">
                    {(item.prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#111113] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.max(2, item.prob * 100)}%`,
                      backgroundColor: isPicked ? '#10b981' : '#f6e9c7',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Bar & Sampled Output */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={sampleOnce}
              className="px-3.5 py-2 rounded-xl bg-[#f6e9c7] text-[#1a1813] font-bold text-xs flex items-center gap-1.5 hover:bg-[#fdfbf7] transition-all cursor-pointer shadow-sm"
            >
              <Dices size={14} />
              <span>Roll Weighted Die for Next Word</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLastPicked(null)
                setHistory(['the', 'cat'])
              }}
              className="px-3 py-2 rounded-xl bg-[#1b1a17] text-[#d6d3d1] hover:text-white text-xs border border-white/10 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          <div className="text-xs font-mono bg-[#0f0f11] px-3.5 py-2 rounded-xl border border-white/10">
            <span className="text-[#a8a29e]">Prompt: </span>
            <span className="text-[#fdfbf7]">the cat </span>
            {lastPicked ? (
              <span className="text-[#10b981] font-bold underline decoration-[#10b981]">
                {lastPicked}
              </span>
            ) : (
              <span className="text-[#f6e9c7] animate-pulse">___</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LMBNGramPlayground() {
  return (
    <div className="space-y-6">
      <NGramCountTrainer />
      <NGramTemperatureSampler />
    </div>
  )
}
