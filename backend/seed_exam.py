"""
Run once to populate exam_questions:
    python seed_exam.py
"""
import asyncio
from sqlalchemy import select
from app.database import engine, SessionLocal, Base
from app.models.models import ExamQuestion

QUESTIONS = [
    # ══════════════════════════════════════════════════════════════════
    # SECTION 1 — VERBAL ABILITY (24 questions)
    # ══════════════════════════════════════════════════════════════════

    # Reading Comprehension (5)
    {
        "section": "verbal", "topic": "Reading Comprehension", "difficulty": "medium", "time_limit": 90,
        "question_text": (
            "Passage: 'The industrial revolution transformed agrarian societies into manufacturing powerhouses. "
            "Urbanisation accelerated as workers migrated to cities seeking factory employment. However, this "
            "rapid change also brought overcrowding, pollution, and poor working conditions.'\n\n"
            "What is the central theme of the passage?"
        ),
        "options": ["A) Benefits of urbanisation", "B) Dual impact of industrialisation", "C) Migration patterns in the 18th century", "D) Decline of agriculture"],
        "correct_answer": "B",
        "explanation": "The passage discusses both positive (manufacturing growth) and negative (overcrowding, pollution) effects of industrialisation.",
    },
    {
        "section": "verbal", "topic": "Reading Comprehension", "difficulty": "medium", "time_limit": 90,
        "question_text": (
            "Passage: 'Artificial intelligence permeates everyday life — from recommendation engines to medical "
            "diagnostics. Yet ethical concerns around bias, privacy, and accountability remain largely unresolved.'\n\n"
            "According to the passage, which aspect of AI is still a challenge?"
        ),
        "options": ["A) Speed of computation", "B) Integration into daily life", "C) Ethical concerns", "D) Medical applications"],
        "correct_answer": "C",
        "explanation": "The passage explicitly states ethical concerns are 'largely unresolved'.",
    },
    {
        "section": "verbal", "topic": "Reading Comprehension", "difficulty": "easy", "time_limit": 75,
        "question_text": (
            "Passage: 'Rainforests cover only 6% of Earth's surface yet house more than half of the world's "
            "plant and animal species. Deforestation threatens this biodiversity at an alarming rate.'\n\n"
            "What inference can be drawn from the passage?"
        ),
        "options": ["A) Rainforests are the largest biome", "B) Biodiversity is evenly distributed", "C) Rainforests are disproportionately rich in biodiversity", "D) Deforestation affects only animals"],
        "correct_answer": "C",
        "explanation": "6% area but >50% species indicates disproportionate biodiversity richness.",
    },
    {
        "section": "verbal", "topic": "Reading Comprehension", "difficulty": "medium", "time_limit": 90,
        "question_text": (
            "Passage: 'Remote work has blurred the boundary between professional and personal life. "
            "While employees enjoy flexibility, many report difficulty disconnecting, leading to burnout.'\n\n"
            "What is a negative consequence of remote work?"
        ),
        "options": ["A) Reduced productivity", "B) Burnout due to inability to disconnect", "C) Lack of flexibility", "D) Increased commute time"],
        "correct_answer": "B",
        "explanation": "The passage directly states difficulty disconnecting leads to burnout.",
    },
    {
        "section": "verbal", "topic": "Reading Comprehension", "difficulty": "hard", "time_limit": 100,
        "question_text": (
            "Passage: 'Keynesian economics advocates government intervention during recessions. Critics argue "
            "this leads to long-term debt. Proponents counter that short-term deficits prevent deeper crises.'\n\n"
            "What is the author's stance?"
        ),
        "options": ["A) Supports Keynesian economics", "B) Opposes government intervention", "C) Presents both sides without bias", "D) Advocates austerity"],
        "correct_answer": "C",
        "explanation": "The passage presents arguments from both critics and proponents without taking a position.",
    },

    # Fill in the Blanks (5)
    {
        "section": "verbal", "topic": "Fill in the Blanks", "difficulty": "easy", "time_limit": 60,
        "question_text": "The scientist was ______ by the unexpected results and decided to repeat the experiment.",
        "options": ["A) elated", "B) perplexed", "C) indifferent", "D) relieved"],
        "correct_answer": "B",
        "explanation": "'Perplexed' means puzzled/confused — fitting when results are unexpected.",
    },
    {
        "section": "verbal", "topic": "Fill in the Blanks", "difficulty": "medium", "time_limit": 60,
        "question_text": "Her speech was so ______ that even the most disengaged audience members paid attention.",
        "options": ["A) mundane", "B) verbose", "C) compelling", "D) ambiguous"],
        "correct_answer": "C",
        "explanation": "'Compelling' means powerfully engaging — explains why people paid attention.",
    },
    {
        "section": "verbal", "topic": "Fill in the Blanks", "difficulty": "medium", "time_limit": 60,
        "question_text": "The treaty was ______ after both nations failed to agree on the key terms.",
        "options": ["A) ratified", "B) nullified", "C) expedited", "D) enforced"],
        "correct_answer": "B",
        "explanation": "'Nullified' means made invalid — consistent with failure to agree.",
    },
    {
        "section": "verbal", "topic": "Fill in the Blanks", "difficulty": "easy", "time_limit": 60,
        "question_text": "Despite the heavy rain, the event proceeded ______ as planned.",
        "options": ["A) haphazardly", "B) reluctantly", "C) smoothly", "D) abruptly"],
        "correct_answer": "C",
        "explanation": "'Smoothly as planned' indicates everything went well despite the rain.",
    },
    {
        "section": "verbal", "topic": "Fill in the Blanks", "difficulty": "hard", "time_limit": 75,
        "question_text": "The politician's ______ remarks caused a significant uproar among the opposition.",
        "options": ["A) conciliatory", "B) incendiary", "C) judicious", "D) placid"],
        "correct_answer": "B",
        "explanation": "'Incendiary' means tending to cause controversy — fitting here.",
    },

    # Sentence Correction (5)
    {
        "section": "verbal", "topic": "Sentence Correction", "difficulty": "medium", "time_limit": 75,
        "question_text": "Choose the grammatically correct sentence:",
        "options": [
            "A) Neither the manager nor the employees was present.",
            "B) Neither the manager nor the employees were present.",
            "C) Neither the manager nor the employees is present.",
            "D) Neither the manager or the employees were present.",
        ],
        "correct_answer": "B",
        "explanation": "With 'neither…nor', the verb agrees with the closer subject ('employees' — plural → 'were').",
    },
    {
        "section": "verbal", "topic": "Sentence Correction", "difficulty": "easy", "time_limit": 60,
        "question_text": "Identify the correct sentence:",
        "options": ["A) She has went to the market.", "B) She have gone to the market.", "C) She has gone to the market.", "D) She is go to the market."],
        "correct_answer": "C",
        "explanation": "'Has gone' is the correct present perfect form.",
    },
    {
        "section": "verbal", "topic": "Sentence Correction", "difficulty": "medium", "time_limit": 75,
        "question_text": "Which sentence uses the correct tense?",
        "options": [
            "A) By next year, she will complete her degree.",
            "B) By next year, she will have completed her degree.",
            "C) By next year, she completed her degree.",
            "D) By next year, she has completed her degree.",
        ],
        "correct_answer": "B",
        "explanation": "'Will have completed' is future perfect — used for actions finished before a future point.",
    },
    {
        "section": "verbal", "topic": "Sentence Correction", "difficulty": "medium", "time_limit": 75,
        "question_text": "Choose the sentence with correct subject-verb agreement:",
        "options": [
            "A) A series of lectures were scheduled.",
            "B) A series of lectures was scheduled.",
            "C) A series of lectures are scheduled.",
            "D) A series of lecture were scheduled.",
        ],
        "correct_answer": "B",
        "explanation": "'A series' is singular — 'was scheduled' is correct.",
    },
    {
        "section": "verbal", "topic": "Sentence Correction", "difficulty": "hard", "time_limit": 90,
        "question_text": "Identify the correct sentence:",
        "options": [
            "A) He is one of those managers who takes all decisions.",
            "B) He is one of those managers who take all decisions.",
            "C) He is one of those managers who are taking all decisions.",
            "D) He is one of those managers which takes all decisions.",
        ],
        "correct_answer": "B",
        "explanation": "The antecedent of 'who' is 'managers' (plural) — 'take' is correct.",
    },

    # Error Identification (5)
    {
        "section": "verbal", "topic": "Error Identification", "difficulty": "medium", "time_limit": 75,
        "question_text": "Find the error: 'The committee have decided to postpone the meeting.'",
        "options": ["A) The committee", "B) have decided", "C) to postpone", "D) the meeting"],
        "correct_answer": "B",
        "explanation": "'Committee' is a collective noun — singular in formal writing. 'Has decided' is correct.",
    },
    {
        "section": "verbal", "topic": "Error Identification", "difficulty": "easy", "time_limit": 60,
        "question_text": "Spot the error: 'She denied to have taken the money.'",
        "options": ["A) She denied", "B) to have taken", "C) the money", "D) No error"],
        "correct_answer": "B",
        "explanation": "'Deny' takes a gerund, not an infinitive: 'denied having taken' is correct.",
    },
    {
        "section": "verbal", "topic": "Error Identification", "difficulty": "hard", "time_limit": 90,
        "question_text": "Find the error: 'Between you and I, the project is behind schedule.'",
        "options": ["A) Between you and I", "B) the project", "C) is behind", "D) No error"],
        "correct_answer": "A",
        "explanation": "'Between' is a preposition requiring objective case — 'between you and me' is correct.",
    },
    {
        "section": "verbal", "topic": "Error Identification", "difficulty": "medium", "time_limit": 75,
        "question_text": "Identify the error: 'Less students attended the seminar than expected.'",
        "options": ["A) Less students", "B) attended", "C) the seminar", "D) than expected"],
        "correct_answer": "A",
        "explanation": "'Students' is countable — 'fewer students' is correct.",
    },
    {
        "section": "verbal", "topic": "Error Identification", "difficulty": "medium", "time_limit": 75,
        "question_text": "Find the error: 'The news are shocking and require immediate action.'",
        "options": ["A) The news", "B) are shocking", "C) require", "D) immediate action"],
        "correct_answer": "B",
        "explanation": "'News' is uncountable/singular — 'is shocking' is correct.",
    },

    # Vocabulary (4)
    {
        "section": "verbal", "topic": "Vocabulary", "difficulty": "easy", "time_limit": 45,
        "question_text": "Choose the synonym of BENEVOLENT:",
        "options": ["A) Malicious", "B) Charitable", "C) Indifferent", "D) Strict"],
        "correct_answer": "B",
        "explanation": "'Benevolent' means well-meaning and charitable.",
    },
    {
        "section": "verbal", "topic": "Vocabulary", "difficulty": "medium", "time_limit": 45,
        "question_text": "Choose the antonym of VERBOSE:",
        "options": ["A) Wordy", "B) Eloquent", "C) Concise", "D) Fluent"],
        "correct_answer": "C",
        "explanation": "'Verbose' means using excessive words; 'concise' is the opposite.",
    },
    {
        "section": "verbal", "topic": "Vocabulary", "difficulty": "medium", "time_limit": 45,
        "question_text": "Choose the synonym of EPHEMERAL:",
        "options": ["A) Eternal", "B) Transient", "C) Robust", "D) Profound"],
        "correct_answer": "B",
        "explanation": "'Ephemeral' means lasting a very short time — synonym: transient.",
    },
    {
        "section": "verbal", "topic": "Vocabulary", "difficulty": "hard", "time_limit": 60,
        "question_text": "Choose the antonym of LACONIC:",
        "options": ["A) Brief", "B) Terse", "C) Verbose", "D) Cryptic"],
        "correct_answer": "C",
        "explanation": "'Laconic' means using very few words; 'verbose' (using many words) is its antonym.",
    },

    # ══════════════════════════════════════════════════════════════════
    # SECTION 2 — REASONING ABILITY (30 questions)
    # ══════════════════════════════════════════════════════════════════

    # Blood Relations (5)
    {
        "section": "reasoning", "topic": "Blood Relations", "difficulty": "easy", "time_limit": 75,
        "question_text": "Pointing to a girl, Rahul says 'She is the daughter of my grandfather's only son.' How is the girl related to Rahul?",
        "options": ["A) Sister", "B) Cousin", "C) Niece", "D) Daughter"],
        "correct_answer": "A",
        "explanation": "Grandfather's only son = Rahul's father. Girl is Rahul's father's daughter = Rahul's sister.",
    },
    {
        "section": "reasoning", "topic": "Blood Relations", "difficulty": "medium", "time_limit": 90,
        "question_text": "A is B's sister. C is B's mother. D is C's father. How is A related to D?",
        "options": ["A) Granddaughter", "B) Daughter", "C) Great-granddaughter", "D) Niece"],
        "correct_answer": "A",
        "explanation": "A and B are siblings, B is C's child, C is D's child. So A is D's granddaughter.",
    },
    {
        "section": "reasoning", "topic": "Blood Relations", "difficulty": "medium", "time_limit": 90,
        "question_text": "If P is the brother of Q, Q is the sister of R, and R is the son of S, how is P related to S?",
        "options": ["A) Son", "B) Daughter", "C) Nephew", "D) Brother"],
        "correct_answer": "A",
        "explanation": "R is S's son. P and Q are R's siblings. P is also S's son.",
    },
    {
        "section": "reasoning", "topic": "Blood Relations", "difficulty": "hard", "time_limit": 100,
        "question_text": "Introducing a man, a woman says 'His mother is the only daughter of my mother.' How is the woman related to the man?",
        "options": ["A) Aunt", "B) Sister", "C) Mother", "D) Grandmother"],
        "correct_answer": "C",
        "explanation": "Only daughter of the woman's mother = the woman herself. The man's mother = the woman.",
    },
    {
        "section": "reasoning", "topic": "Blood Relations", "difficulty": "medium", "time_limit": 90,
        "question_text": "X is Y's brother. Y is Z's sister. Z's mother is W. How is X related to W?",
        "options": ["A) Son", "B) Daughter", "C) Nephew", "D) Brother"],
        "correct_answer": "A",
        "explanation": "Z is W's child. Y and Z are siblings (also W's children). X is Y's brother — X is W's son.",
    },

    # Seating Arrangement (5)
    {
        "section": "reasoning", "topic": "Seating Arrangement", "difficulty": "easy", "time_limit": 75,
        "question_text": "5 people A, B, C, D, E sit in a row. A is at the extreme left. E is at the extreme right. B sits between A and C. D sits between C and E. Who is in the middle?",
        "options": ["A) A", "B) B", "C) C", "D) D"],
        "correct_answer": "C",
        "explanation": "Order: A-B-C-D-E. C is in the middle (position 3).",
    },
    {
        "section": "reasoning", "topic": "Seating Arrangement", "difficulty": "medium", "time_limit": 100,
        "question_text": "6 people sit in a circle. P sits 2nd to the right of Q. R sits opposite P. S sits between Q and R. Who sits opposite Q?",
        "options": ["A) P", "B) R", "C) S", "D) Cannot be determined"],
        "correct_answer": "D",
        "explanation": "With the given constraints, the seat opposite Q cannot be uniquely determined.",
    },
    {
        "section": "reasoning", "topic": "Seating Arrangement", "difficulty": "medium", "time_limit": 100,
        "question_text": "In a row of 7, Aryan is 3rd from the left. Priya is 2nd from the right. How many students are between them?",
        "options": ["A) 1", "B) 2", "C) 3", "D) 4"],
        "correct_answer": "B",
        "explanation": "Aryan is at position 3, Priya at position 6. Positions 4 and 5 are between them = 2 students.",
    },
    {
        "section": "reasoning", "topic": "Seating Arrangement", "difficulty": "hard", "time_limit": 120,
        "question_text": "A, B, C, D, E face north in a row. B is immediately right of A. C is at extreme right. D is between B and C. Who is at extreme left?",
        "options": ["A) A", "B) B", "C) E", "D) D"],
        "correct_answer": "C",
        "explanation": "Order: E-A-B-D-C. E is at the extreme left.",
    },
    {
        "section": "reasoning", "topic": "Seating Arrangement", "difficulty": "medium", "time_limit": 100,
        "question_text": "Four people P, Q, R, S sit around a square table, one on each side, facing centre. P sits to the left of Q. R sits opposite P. Who sits to the right of R?",
        "options": ["A) P", "B) Q", "C) S", "D) Cannot determine"],
        "correct_answer": "B",
        "explanation": "P-Q-R(opposite P)-S. To the right of R (facing centre) is Q.",
    },

    # Syllogism (5)
    {
        "section": "reasoning", "topic": "Syllogism", "difficulty": "easy", "time_limit": 75,
        "question_text": "Statements: All cats are animals. All animals are living beings.\nConclusion: All cats are living beings.",
        "options": ["A) Follows", "B) Does not follow", "C) Partially follows", "D) Cannot determine"],
        "correct_answer": "A",
        "explanation": "Transitive rule: All cats → animals → living beings. Conclusion follows.",
    },
    {
        "section": "reasoning", "topic": "Syllogism", "difficulty": "medium", "time_limit": 90,
        "question_text": "Statements: Some dogs are pets. All pets are friendly.\nConclusion I: Some dogs are friendly.\nConclusion II: All dogs are friendly.",
        "options": ["A) Only I follows", "B) Only II follows", "C) Both follow", "D) Neither follows"],
        "correct_answer": "A",
        "explanation": "Some dogs are pets → those pets are friendly → some dogs are friendly. Not ALL dogs are pets.",
    },
    {
        "section": "reasoning", "topic": "Syllogism", "difficulty": "hard", "time_limit": 100,
        "question_text": "Statements: No teacher is a student. Some students are intelligent.\nConclusion: No teacher is intelligent.",
        "options": ["A) Follows", "B) Does not follow", "C) Partially follows", "D) Cannot determine"],
        "correct_answer": "B",
        "explanation": "We cannot conclude about teachers' intelligence from the given statements.",
    },
    {
        "section": "reasoning", "topic": "Syllogism", "difficulty": "medium", "time_limit": 90,
        "question_text": "Statements: All birds can fly. Penguins are birds.\nConclusion: Penguins can fly.\n(Note: Answer based solely on given statements, not real-world knowledge)",
        "options": ["A) Valid based on given statements", "B) Invalid", "C) Partially valid", "D) Ambiguous"],
        "correct_answer": "A",
        "explanation": "In syllogism, we apply given premises. Both premises are true → conclusion is valid logically.",
    },
    {
        "section": "reasoning", "topic": "Syllogism", "difficulty": "medium", "time_limit": 90,
        "question_text": "Statements: All managers are leaders. No leader is a failure.\nConclusion: No manager is a failure.",
        "options": ["A) Follows", "B) Does not follow", "C) Partially follows", "D) Cannot determine"],
        "correct_answer": "A",
        "explanation": "All managers → leaders → not failures. Conclusion follows.",
    },

    # Number Series (5)
    {
        "section": "reasoning", "topic": "Number Series", "difficulty": "easy", "time_limit": 60,
        "question_text": "Find the next number: 2, 6, 12, 20, 30, ?",
        "options": ["A) 40", "B) 42", "C) 44", "D) 48"],
        "correct_answer": "B",
        "explanation": "Differences: 4,6,8,10,12 → 30+12 = 42.",
    },
    {
        "section": "reasoning", "topic": "Number Series", "difficulty": "medium", "time_limit": 75,
        "question_text": "Find the missing number: 3, 9, 27, ?, 243",
        "options": ["A) 54", "B) 72", "C) 81", "D) 108"],
        "correct_answer": "C",
        "explanation": "Each term × 3: 27×3 = 81.",
    },
    {
        "section": "reasoning", "topic": "Number Series", "difficulty": "medium", "time_limit": 75,
        "question_text": "Find the odd one out: 1, 4, 9, 16, 20, 25",
        "options": ["A) 4", "B) 9", "C) 20", "D) 25"],
        "correct_answer": "C",
        "explanation": "All others are perfect squares. 20 is not a perfect square.",
    },
    {
        "section": "reasoning", "topic": "Number Series", "difficulty": "hard", "time_limit": 90,
        "question_text": "Find the next: 1, 1, 2, 3, 5, 8, 13, ?",
        "options": ["A) 18", "B) 20", "C) 21", "D) 24"],
        "correct_answer": "C",
        "explanation": "Fibonacci sequence: each term = sum of two previous. 8+13 = 21.",
    },
    {
        "section": "reasoning", "topic": "Number Series", "difficulty": "medium", "time_limit": 75,
        "question_text": "Find the next: 5, 11, 23, 47, ?",
        "options": ["A) 89", "B) 94", "C) 95", "D) 96"],
        "correct_answer": "C",
        "explanation": "Pattern ×2+1: 5→11→23→47→95.",
    },

    # Coding-Decoding (5)
    {
        "section": "reasoning", "topic": "Coding-Decoding", "difficulty": "easy", "time_limit": 75,
        "question_text": "If APPLE is coded as BQQMF, how is MANGO coded?",
        "options": ["A) NBNHP", "B) NBOIP", "C) NBOHP", "D) NBOOP"],
        "correct_answer": "C",
        "explanation": "Each letter +1: M→N, A→B, N→O, G→H, O→P → NBOHP.",
    },
    {
        "section": "reasoning", "topic": "Coding-Decoding", "difficulty": "medium", "time_limit": 90,
        "question_text": "In a code, MONITOR is written as ROTINOM. How is KEYBOARD written?",
        "options": ["A) DRAOYEBK", "B) DRAOEYBK", "C) DRAYOEBK", "D) BORADEYK"],
        "correct_answer": "A",
        "explanation": "The word is reversed: KEYBOARD → DRAOYEBK.",
    },
    {
        "section": "reasoning", "topic": "Coding-Decoding", "difficulty": "medium", "time_limit": 90,
        "question_text": "If 1=A, 2=B, 3=C…26=Z, what does 20-5-1-13 represent?",
        "options": ["A) TAME", "B) TEAM", "C) MEAT", "D) META"],
        "correct_answer": "B",
        "explanation": "20=T, 5=E, 1=A, 13=M → TEAM.",
    },
    {
        "section": "reasoning", "topic": "Coding-Decoding", "difficulty": "hard", "time_limit": 100,
        "question_text": "If FRIEND is coded as HUMJTK (each letter +2), how is CANDLE coded?",
        "options": ["A) EDRIRL", "B) EDRIRN", "C) ECPFNG", "D) EDRJRL"],
        "correct_answer": "C",
        "explanation": "Each letter +2: C→E, A→C, N→P, D→F, L→N, E→G → ECPFNG.",
    },
    {
        "section": "reasoning", "topic": "Coding-Decoding", "difficulty": "medium", "time_limit": 90,
        "question_text": "If WATER is coded as XBUFS, what is the code for FIRE?",
        "options": ["A) GJSF", "B) GISF", "C) GHSF", "D) GJRF"],
        "correct_answer": "A",
        "explanation": "Each letter +1: F→G, I→J, R→S, E→F → GJSF.",
    },

    # Data Interpretation (5)
    {
        "section": "reasoning", "topic": "Data Interpretation", "difficulty": "medium", "time_limit": 100,
        "question_text": (
            "Sales (units) — Product A: Q1=100, Q2=120, Q3=140, Q4=160. "
            "Product B: Q1=80, Q2=100, Q3=120, Q4=140.\n\n"
            "What is the total annual sales of Product A?"
        ),
        "options": ["A) 480", "B) 500", "C) 520", "D) 540"],
        "correct_answer": "C",
        "explanation": "100+120+140+160 = 520 units.",
    },
    {
        "section": "reasoning", "topic": "Data Interpretation", "difficulty": "medium", "time_limit": 100,
        "question_text": (
            "City temperatures (°C): Mumbai=35, Delhi=42, Chennai=38, Kolkata=33.\n\n"
            "What is the average temperature across all cities?"
        ),
        "options": ["A) 36", "B) 37", "C) 38", "D) 37.5"],
        "correct_answer": "B",
        "explanation": "(35+42+38+33)/4 = 148/4 = 37.",
    },
    {
        "section": "reasoning", "topic": "Data Interpretation", "difficulty": "hard", "time_limit": 120,
        "question_text": (
            "Company budget ₹80 lakhs: Salaries=40%, Rent=20%, Marketing=25%, Others=15%.\n\n"
            "How much is spent on Marketing?"
        ),
        "options": ["A) ₹16 lakhs", "B) ₹18 lakhs", "C) ₹20 lakhs", "D) ₹22 lakhs"],
        "correct_answer": "C",
        "explanation": "25% of 80 = ₹20 lakhs.",
    },
    {
        "section": "reasoning", "topic": "Data Interpretation", "difficulty": "medium", "time_limit": 100,
        "question_text": (
            "Students enrolled: 2019=500, 2020=550, 2021=600, 2022=700, 2023=750.\n\n"
            "What is the percentage increase from 2019 to 2023?"
        ),
        "options": ["A) 40%", "B) 45%", "C) 50%", "D) 55%"],
        "correct_answer": "C",
        "explanation": "(750-500)/500 × 100 = 50%.",
    },
    {
        "section": "reasoning", "topic": "Data Interpretation", "difficulty": "hard", "time_limit": 120,
        "question_text": (
            "Year | Revenue (Cr) | Expenses (Cr)\n"
            "2021 | 120          | 90\n"
            "2022 | 150          | 110\n"
            "2023 | 180          | 130\n\n"
            "In which year was the profit percentage (profit/revenue) highest?"
        ),
        "options": ["A) 2021", "B) 2022", "C) 2023", "D) Same in all years"],
        "correct_answer": "C",
        "explanation": "2021: 30/120=25%, 2022: 40/150=26.7%, 2023: 50/180=27.8%. Highest in 2023.",
    },

    # ══════════════════════════════════════════════════════════════════
    # SECTION 3 — QUANTITATIVE APTITUDE (20 questions)
    # ══════════════════════════════════════════════════════════════════

    # Profit & Loss (4)
    {
        "section": "aptitude", "topic": "Profit & Loss", "difficulty": "easy", "time_limit": 90,
        "question_text": "A shopkeeper buys an item for ₹500 and sells it for ₹625. What is the profit percentage?",
        "options": ["A) 20%", "B) 25%", "C) 30%", "D) 15%"],
        "correct_answer": "B",
        "explanation": "Profit = 125. Profit% = (125/500) × 100 = 25%.",
    },
    {
        "section": "aptitude", "topic": "Profit & Loss", "difficulty": "medium", "time_limit": 100,
        "question_text": "An article is sold at a 20% loss. If the selling price is ₹640, what is the cost price?",
        "options": ["A) ₹750", "B) ₹780", "C) ₹800", "D) ₹820"],
        "correct_answer": "C",
        "explanation": "CP × 0.8 = 640 → CP = 800.",
    },
    {
        "section": "aptitude", "topic": "Profit & Loss", "difficulty": "medium", "time_limit": 100,
        "question_text": "A trader marks goods 40% above cost price and gives a 10% discount. What is the profit percentage?",
        "options": ["A) 26%", "B) 28%", "C) 30%", "D) 32%"],
        "correct_answer": "A",
        "explanation": "SP = 0.9 × 1.4 × CP = 1.26 × CP → 26% profit.",
    },
    {
        "section": "aptitude", "topic": "Profit & Loss", "difficulty": "hard", "time_limit": 120,
        "question_text": "By selling 12 pens for ₹120, a shopkeeper loses 20%. How many pens should he sell for ₹120 to gain 20%?",
        "options": ["A) 6", "B) 7", "C) 8", "D) 9"],
        "correct_answer": "C",
        "explanation": "CP of 12 pens = 120/0.8 = ₹150. CP/pen = ₹12.5. For 20% gain, SP/pen = ₹15. Pens for ₹120 = 120/15 = 8.",
    },

    # Time Speed Distance (4)
    {
        "section": "aptitude", "topic": "Time Speed Distance", "difficulty": "easy", "time_limit": 90,
        "question_text": "A car travels 240 km in 4 hours. What is its average speed?",
        "options": ["A) 50 km/h", "B) 55 km/h", "C) 60 km/h", "D) 65 km/h"],
        "correct_answer": "C",
        "explanation": "Speed = Distance / Time = 240 / 4 = 60 km/h.",
    },
    {
        "section": "aptitude", "topic": "Time Speed Distance", "difficulty": "medium", "time_limit": 100,
        "question_text": "Two trains 180m and 120m long cross each other in 15 seconds running in opposite directions. What is their combined speed?",
        "options": ["A) 18 m/s", "B) 20 m/s", "C) 22 m/s", "D) 24 m/s"],
        "correct_answer": "B",
        "explanation": "Total distance = 300 m. Combined speed = 300/15 = 20 m/s.",
    },
    {
        "section": "aptitude", "topic": "Time Speed Distance", "difficulty": "medium", "time_limit": 100,
        "question_text": "A person walks at 4 km/h and runs at 8 km/h. He covers 24 km in 4 hours. How many km did he run?",
        "options": ["A) 12 km", "B) 14 km", "C) 16 km", "D) 18 km"],
        "correct_answer": "C",
        "explanation": "Let walk=w, run=r. w+r=24 and w/4+r/8=4 → 2w+r=32 → w=8, r=16.",
    },
    {
        "section": "aptitude", "topic": "Time Speed Distance", "difficulty": "hard", "time_limit": 120,
        "question_text": "A boat goes upstream at 10 km/h and downstream at 14 km/h. What is the speed of the current?",
        "options": ["A) 1 km/h", "B) 2 km/h", "C) 3 km/h", "D) 4 km/h"],
        "correct_answer": "B",
        "explanation": "Current = (downstream − upstream) / 2 = (14−10) / 2 = 2 km/h.",
    },

    # Percentages (3)
    {
        "section": "aptitude", "topic": "Percentages", "difficulty": "easy", "time_limit": 75,
        "question_text": "What is 35% of 480?",
        "options": ["A) 156", "B) 162", "C) 168", "D) 172"],
        "correct_answer": "C",
        "explanation": "0.35 × 480 = 168.",
    },
    {
        "section": "aptitude", "topic": "Percentages", "difficulty": "medium", "time_limit": 90,
        "question_text": "A number is increased by 20% then decreased by 20%. What is the net change?",
        "options": ["A) No change", "B) 4% decrease", "C) 4% increase", "D) 2% decrease"],
        "correct_answer": "B",
        "explanation": "Net factor = 1.2 × 0.8 = 0.96 → 4% decrease.",
    },
    {
        "section": "aptitude", "topic": "Percentages", "difficulty": "hard", "time_limit": 100,
        "question_text": "In an election, candidate A gets 55% votes and wins by 6000 votes. What is the total number of votes?",
        "options": ["A) 55000", "B) 60000", "C) 65000", "D) 70000"],
        "correct_answer": "B",
        "explanation": "Margin = (55%−45%) = 10% = 6000 → Total = 60000.",
    },

    # Ages (3)
    {
        "section": "aptitude", "topic": "Ages", "difficulty": "easy", "time_limit": 90,
        "question_text": "The ratio of ages of A and B is 3:5. After 6 years the ratio becomes 3:4. Find A's current age.",
        "options": ["A) 3", "B) 6", "C) 9", "D) 12"],
        "correct_answer": "B",
        "explanation": "(3x+6)/(5x+6)=3/4 → 12x+24=15x+18 → 3x=6 → x=2 → A=3×2=6.",
    },
    {
        "section": "aptitude", "topic": "Ages", "difficulty": "medium", "time_limit": 100,
        "question_text": "A father is 30 years older than his son. 5 years hence, he will be 3 times as old as his son. Find the father's current age.",
        "options": ["A) 35", "B) 40", "C) 42", "D) 45"],
        "correct_answer": "B",
        "explanation": "F=S+30. F+5=3(S+5) → S+35=3S+15 → S=10 → F=40.",
    },
    {
        "section": "aptitude", "topic": "Ages", "difficulty": "hard", "time_limit": 120,
        "question_text": "The average age of a group of 5 students is 20. When a teacher joins, the average becomes 24. What is the teacher's age?",
        "options": ["A) 40", "B) 42", "C) 44", "D) 46"],
        "correct_answer": "C",
        "explanation": "Sum of 5 students = 100. Sum of 6 = 24×6=144. Teacher age = 44.",
    },

    # Probability (3)
    {
        "section": "aptitude", "topic": "Probability", "difficulty": "easy", "time_limit": 90,
        "question_text": "A bag contains 3 red, 4 blue, and 5 green balls. A ball is drawn at random. What is the probability it is blue?",
        "options": ["A) 1/3", "B) 1/4", "C) 1/2", "D) 5/12"],
        "correct_answer": "A",
        "explanation": "P(blue) = 4/12 = 1/3.",
    },
    {
        "section": "aptitude", "topic": "Probability", "difficulty": "medium", "time_limit": 100,
        "question_text": "Two dice are rolled. What is the probability of getting a sum of 7?",
        "options": ["A) 1/6", "B) 1/8", "C) 5/36", "D) 7/36"],
        "correct_answer": "A",
        "explanation": "Favourable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6.",
    },
    {
        "section": "aptitude", "topic": "Probability", "difficulty": "hard", "time_limit": 120,
        "question_text": "A card is drawn from a deck of 52. What is the probability it is a face card or a heart?",
        "options": ["A) 11/26", "B) 22/52", "C) 25/52", "D) 11/52"],
        "correct_answer": "A",
        "explanation": "Face cards=12, Hearts=13, Face+Heart overlap=3. (12+13−3)/52=22/52=11/26.",
    },

    # Mensuration (3)
    {
        "section": "aptitude", "topic": "Mensuration", "difficulty": "easy", "time_limit": 90,
        "question_text": "The area of a rectangle is 48 sq cm and its length is 8 cm. What is its perimeter?",
        "options": ["A) 24 cm", "B) 28 cm", "C) 30 cm", "D) 32 cm"],
        "correct_answer": "B",
        "explanation": "Breadth = 48/8 = 6 cm. Perimeter = 2(8+6) = 28 cm.",
    },
    {
        "section": "aptitude", "topic": "Mensuration", "difficulty": "medium", "time_limit": 100,
        "question_text": "The radius of a circle is 7 cm. What is its area? (π = 22/7)",
        "options": ["A) 144 sq cm", "B) 148 sq cm", "C) 154 sq cm", "D) 162 sq cm"],
        "correct_answer": "C",
        "explanation": "Area = πr² = (22/7) × 49 = 154 sq cm.",
    },
    {
        "section": "aptitude", "topic": "Mensuration", "difficulty": "hard", "time_limit": 120,
        "question_text": "A cylindrical tank has radius 3.5 m and height 10 m. What is its volume? (π = 22/7)",
        "options": ["A) 365 m³", "B) 385 m³", "C) 395 m³", "D) 405 m³"],
        "correct_answer": "B",
        "explanation": "V = πr²h = (22/7) × 12.25 × 10 = 385 m³.",
    },

    # ══════════════════════════════════════════════════════════════════
    # SECTION 4 — CODING (2 conceptual MCQs)
    # ══════════════════════════════════════════════════════════════════
    {
        "section": "coding", "topic": "Arrays / Strings", "difficulty": "easy", "time_limit": 1800,
        "question_text": (
            "Given an array of integers, return indices of the two numbers that add up to a target.\n\n"
            "Example: nums=[2,7,11,15], target=9 → Output: [0,1]\n\n"
            "Which approach gives O(n) time complexity?"
        ),
        "options": [
            "A) Nested loop — check all pairs O(n²)",
            "B) Sort then use two pointers O(n log n)",
            "C) Use a hash map to store complements O(n)",
            "D) Binary search for each element O(n log n)",
        ],
        "correct_answer": "C",
        "explanation": "A hash map stores seen values and their indices. For each element, check if complement exists — O(n) time, O(n) space.",
    },
    {
        "section": "coding", "topic": "Dynamic Programming", "difficulty": "medium", "time_limit": 2700,
        "question_text": (
            "Find the length of the longest palindromic subsequence in a string.\n\n"
            "Example: s='bbbab' → Output: 4\n\n"
            "Which recurrence is correct? (dp[i][j] = LPS length for s[i..j])"
        ),
        "options": [
            "A) dp[i][j] = dp[i+1][j-1]+2 if s[i]==s[j], else max(dp[i+1][j], dp[i][j-1])",
            "B) dp[i][j] = dp[i-1][j] + dp[i][j-1]",
            "C) dp[i][j] = 1 + dp[i+1][j-1] always",
            "D) dp[i][j] = min(dp[i+1][j], dp[i][j-1])",
        ],
        "correct_answer": "A",
        "explanation": "If characters match, they extend the inner palindrome by 2. Otherwise take the best from excluding either end.",
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        result = await db.execute(select(ExamQuestion).limit(1))
        if result.scalar_one_or_none():
            print("Exam questions already seeded — skipping.")
            return

        for q in QUESTIONS:
            db.add(ExamQuestion(**q))
        await db.commit()
        print(f"Seeded {len(QUESTIONS)} exam questions.")


if __name__ == "__main__":
    asyncio.run(seed())
